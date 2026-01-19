// script.js - Pronunciation Master 메인 애플리케이션 (수정 완료판)

class PronunciationMaster {
    constructor() {
        this.audioProcessor = null;
        this.scoringEngine = null;
        this.feedbackGenerator = null;
        this.uiManager = null;
        
        this.isInitialized = false;
        this.appVersion = '1.0.0';
    }

    // 앱 초기화
    async init() {
        try {
            this.showSplashScreen();
            
            // DOM이 완전히 로드될 때까지 대기
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', resolve);
                    } else {
                        resolve();
                    }
                });
            }
            
            // 필수 모듈 존재 확인
            if (typeof SentenceBank === 'undefined') {
                throw new Error('SentenceBank 모듈을 찾을 수 없습니다. 파일 로딩 순서를 확인하세요.');
            }
            
            // 컴포넌트 초기화
            await this.initializeComponents();
            
            // UI 매니저 초기화
            this.uiManager = new UIManager();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 앱 준비 완료
            this.isInitialized = true;
            this.hideSplashScreen();
            
            // 초기 화면 설정
            this.initializeApp();
            
            console.log('Pronunciation Master initialized successfully!');
            
        } catch (error) {
            console.error('앱 초기화 실패:', error);
            this.showError('앱을 시작하는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
        }
    }

    // 컴포넌트 초기화
    async initializeComponents() {
        // 글로벌 객체에 컴포넌트 등록
        if (typeof AudioProcessor !== 'undefined') {
            this.audioProcessor = new AudioProcessor();
        } else {
            throw new Error('AudioProcessor 클래스를 찾을 수 없습니다.');
        }
        
        if (typeof ScoringEngine !== 'undefined') {
            this.scoringEngine = new ScoringEngine();
        } else {
            throw new Error('ScoringEngine 클래스를 찾을 수 없습니다.');
        }
        
        if (typeof FeedbackGenerator !== 'undefined') {
            this.feedbackGenerator = new FeedbackGenerator();
        } else {
            throw new Error('FeedbackGenerator 클래스를 찾을 수 없습니다.');
        }
        
        // 디버깅용 글로벌 객체
        window.app = window.app || {};
        window.app.audioProcessor = this.audioProcessor;
        window.app.scoringEngine = this.scoringEngine;
        window.app.feedbackGenerator = this.feedbackGenerator;
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 기본 이벤트는 UI 매니저에서 처리
        // 오프라인/온라인 이벤트
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // 페이지 표시 이벤트
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    // 앱 초기 설정
    initializeApp() {
        // 이전 테스트 결과 확인
        this.checkPreviousResults();
        
        // 사용자 환경 확인
        this.checkEnvironment();
        
        // 웰컴 메시지
        setTimeout(() => {
            if (this.uiManager) {
                this.uiManager.showToast('발음 명료도 테스트에 오신 것을 환영합니다!', 'info');
            }
        }, 1000);
    }

    // 이전 결과 확인
    checkPreviousResults() {
        try {
            const previousLevel = localStorage.getItem('previousSLevel');
            const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
            
            if (history.length > 0 && previousLevel) {
                const lastTest = history[history.length - 1];
                console.log('이전 테스트 결과:', lastTest);
                
                // 홈 화면에 마지막 결과 표시
                this.displayLastResultOnHome(lastTest);
            }
        } catch (e) {
            console.warn('이전 결과 로딩 실패:', e);
        }
    }

    // 홈 화면에 마지막 결과 표시
    displayLastResultOnHome(lastTest) {
        try {
            const levelBadge = document.querySelector('.level-badge span');
            if (levelBadge && lastTest.sLevel && SentenceBank) {
                levelBadge.textContent = lastTest.sLevel.replace('S', '');
                
                const sLevelData = SentenceBank.calculateSLevel(lastTest.overallScore || 0);
                if (sLevelData && sLevelData.color) {
                    document.querySelector('.level-badge').style.background = 
                        `linear-gradient(135deg, ${sLevelData.color}, ${this.adjustColor(sLevelData.color, -20)})`;
                }
            }
        } catch (e) {
            console.warn('마지막 결과 표시 실패:', e);
        }
    }

    // 사용자 환경 확인
    checkEnvironment() {
        try {
            // Web Audio API 지원 확인
            if (!window.AudioContext && !window.webkitAudioContext) {
                this.showToast('이 브라우저는 Web Audio API를 지원하지 않습니다.', 'warning');
            }
            
            // 마이크 접근 권한 확인
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showToast('마이크 접근이 지원되지 않습니다. HTTPS 연결을 사용해주세요.', 'warning');
            }
            
            // 로컬 스토리지 확인
            localStorage.setItem('__test__', 'test');
            localStorage.removeItem('__test__');
            
        } catch (e) {
            this.showToast('일부 기능이 제한될 수 있습니다.', 'warning');
        }
    }

    // 온라인 상태 처리
    handleOnlineStatus(isOnline) {
        if (this.uiManager) {
            this.uiManager.showToast(
                isOnline ? '인터넷 연결이 복구되었습니다.' : '인터넷 연결이 끊겼습니다.',
                isOnline ? 'success' : 'warning'
            );
        }
    }

    // 페이지 가시성 변경 처리
    handleVisibilityChange() {
        if (document.hidden) {
            if (this.audioProcessor && this.audioProcessor.isRecording) {
                this.audioProcessor.stopRecording().catch(console.error);
                this.showToast('페이지가 백그라운드로 전환되어 녹음이 중지되었습니다.', 'warning');
            }
            
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }
    }

    // 색상 조정 헬퍼 함수
    adjustColor(color, amount) {
        try {
            let usePound = false;
            
            if (color[0] === "#") {
                color = color.slice(1);
                usePound = true;
            }
            
            const num = parseInt(color, 16);
            let r = (num >> 16) + amount;
            let g = ((num >> 8) & 0x00FF) + amount;
            let b = (num & 0x0000FF) + amount;
            
            r = r < 0 ? 0 : r > 255 ? 255 : r;
            g = g < 0 ? 0 : g > 255 ? 255 : g;
            b = b < 0 ? 0 : b > 255 ? 255 : b;
            
            return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
        } catch (e) {
            return color;
        }
    }

    // 스플래시 스크린 표시
    showSplashScreen() {
        if (document.getElementById('splashScreen')) return;
        
        const splash = document.createElement('div');
        splash.id = 'splashScreen';
        splash.innerHTML = `
            <div class="splash-content">
                <div class="splash-logo">
                    <i class="fas fa-microphone-alt"></i>
                    <h1>Pronunciation Master</h1>
                </div>
                <div class="splash-spinner"></div>
                <p>앱을 불러오는 중...</p>
                <div class="splash-version">v${this.appVersion}</div>
            </div>
        `;
        
        splash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #4361ee 0%, #3a56d4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;
        
        document.body.appendChild(splash);
    }

    // 스플래시 스크린 숨기기
    hideSplashScreen() {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (splash.parentNode) {
                    splash.parentNode.removeChild(splash);
                }
            }, 500);
        }
    }

    // 에러 메시지 표시
    showError(message) {
        // 기존 에러 제거
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>오류 발생</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary">
                    <i class="fas fa-redo"></i>
                    페이지 새로고침
                </button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            text-align: center;
            padding: 20px;
        `;
        
        document.body.appendChild(errorDiv);
    }

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        if (this.uiManager) {
            this.uiManager.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // 앱 상태 정보
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            version: this.appVersion,
            components: {
                audioProcessor: !!this.audioProcessor,
                scoringEngine: !!this.scoringEngine,
                feedbackGenerator: !!this.feedbackGenerator,
                uiManager: !!this.uiManager,
                sentenceBank: typeof SentenceBank !== 'undefined'
            },
            state: this.uiManager ? this.uiManager.appState : null,
            environment: {
                online: navigator.onLine,
                webAudio: !!(window.AudioContext || window.webkitAudioContext),
                mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                speechSynthesis: !!window.speechSynthesis
            }
        };
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, 앱 시작 중...');
    
    // 앱 인스턴스 생성 및 초기화
    window.pronunciationMaster = new PronunciationMaster();
    window.pronunciationMaster.init().catch(error => {
        console.error('앱 초기화 실패:', error);
    });
    
    // 개발자 도구용 단축키
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (window.pronunciationMaster) {
                console.log('=== Pronunciation Master Debug Info ===');
                console.log('App Status:', window.pronunciationMaster.getAppStatus());
            }
        }
    });
});

// 기본 오류 핸들링
window.addEventListener('error', function(event) {
    console.error('글로벌 에러:', event.error);
    
    // 앱이 초기화되지 않았을 경우
    if (!window.pronunciationMaster?.isInitialized) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:black;color:white;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;z-index:9999;">
                <div>
                    <h2>⚠️ 오류 발생</h2>
                    <p>앱을 시작하는 중 오류가 발생했습니다.</p>
                    <button onclick="location.reload()" style="padding:10px 20px;background:#4361ee;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:20px;">
                        🔄 페이지 새로고침
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// 콘솔 배너
console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🎤 Pronunciation Master v1.0.0          ║
║   발음 명료도 평가 시스템                 ║
║                                           ║
║   • 20문장 완전 평가                      ║
║   • S1~S10 레벨 시스템                    ║
║   • 과학적 발음 분석                      ║
║                                           ║
║   Ctrl+Shift+D: 디버그 정보               ║
║                                           ║
╚═══════════════════════════════════════════╝
`);
