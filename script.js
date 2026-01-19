// script.js - Pronunciation Master 메인 애플리케이션

class PronunciationMaster {
    constructor() {
        this.audioProcessor = null;
        this.scoringEngine = null;
        this.feedbackGenerator = null;
        this.uiManager = null;
        
        this.isInitialized = false;
        this.appVersion = '1.0.0';
        
        this.init();
    }

    // 앱 초기화
    async init() {
        try {
            this.showSplashScreen();
            
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
        // AudioProcessor 초기화
        this.audioProcessor = new AudioProcessor();
        
        // ScoringEngine 초기화
        this.scoringEngine = new ScoringEngine();
        
        // FeedbackGenerator 초기화
        this.feedbackGenerator = new FeedbackGenerator();
        
        // 글로벌 객체에 등록 (디버깅용)
        window.app = {
            audioProcessor: this.audioProcessor,
            scoringEngine: this.scoringEngine,
            feedbackGenerator: this.feedbackGenerator,
            uiManager: null // 나중에 할당
        };
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 캘리브레이션 버튼 이벤트
        this.setupCalibrationEvents();
        
        // 음성 녹음 이벤트
        this.setupRecordingEvents();
        
        // 설정 변경 이벤트
        this.setupSettingsEvents();
        
        // 오프라인/온라인 이벤트
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // 페이지 표시 이벤트
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    // 캘리브레이션 이벤트 설정
    setupCalibrationEvents() {
        const recordBtn = document.getElementById('recordCalibrationBtn');
        const playBtn = document.getElementById('playCalibrationBtn');
        
        if (recordBtn) {
            recordBtn.addEventListener('click', async () => {
                await this.performCalibration();
            });
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playCalibrationAudio();
            });
        }
    }

    // 음성 녹음 이벤트 설정
    setupRecordingEvents() {
        // 녹음 관련 이벤트는 UI 매니저에서 처리
        // 추가적인 사용자 정의 이벤트 필요 시 여기에 구현
    }

    // 설정 이벤트 설정
    setupSettingsEvents() {
        // 설정 패널이 있다면 여기에 구현
        // 예: 소리 효과, 자동 재생 등의 설정 변경
    }

    // 앱 초기 설정
    initializeApp() {
        // 이전 테스트 결과 확인
        this.checkPreviousResults();
        
        // 사용자 환경 확인
        this.checkEnvironment();
        
        // 웰컴 메시지
        setTimeout(() => {
            this.showToast('발음 명료도 테스트에 오신 것을 환영합니다!', 'info');
        }, 1000);
    }

    // 캘리브레이션 수행
    async performCalibration() {
        try {
            const recordBtn = document.getElementById('recordCalibrationBtn');
            const playBtn = document.getElementById('playCalibrationBtn');
            const resultsDiv = document.getElementById('calibrationResults');
            const proceedBtn = document.getElementById('proceedToTestBtn');
            
            // 버튼 상태 변경
            recordBtn.disabled = true;
            recordBtn.innerHTML = '<i class="fas fa-microphone-alt"></i> 측정 중...';
            
            // 3초간 녹음 및 분석
            await this.audioProcessor.startRecording();
            
            // 진행 표시
            let countdown = 3;
            const timerInterval = setInterval(() => {
                const timer = document.querySelector('.recording-timer');
                if (timer) {
                    timer.textContent = `00:0${countdown}`;
                }
                countdown--;
            }, 1000);
            
            // 3초 후 녹음 정지
            setTimeout(async () => {
                clearInterval(timerInterval);
                
                const recording = await this.audioProcessor.stopRecording();
                const calibration = await this.audioProcessor.calibrateMicrophone();
                
                // 결과 표시
                this.displayCalibrationResults(calibration);
                
                // 버튼 상태 복원
                recordBtn.disabled = false;
                recordBtn.innerHTML = '<i class="fas fa-circle"></i> 녹음 시작';
                
                // 재생 버튼 활성화
                playBtn.disabled = false;
                
                // 결과 표시
                if (resultsDiv) {
                    resultsDiv.classList.remove('hidden');
                }
                
                // 캘리브레이션 데이터 저장
                if (this.uiManager) {
                    this.uiManager.appState.calibrationData = calibration;
                    this.uiManager.appState.isCalibrated = calibration.isValid;
                    
                    // 다음 버튼 활성화/비활성화
                    if (proceedBtn) {
                        proceedBtn.disabled = !calibration.isValid;
                    }
                }
                
                // 볼륨 미터 업데이트
                this.updateVolumeMeter(calibration);
                
                // 캘리브레이션 피드백
                if (calibration.isValid) {
                    this.showToast('마이크 캘리브레이션이 완료되었습니다!', 'success');
                } else {
                    this.showToast('마이크 설정을 확인해주세요.', 'warning');
                }
                
            }, 3000);
            
        } catch (error) {
            console.error('캘리브레이션 실패:', error);
            this.showToast('캘리브레이션 중 오류가 발생했습니다.', 'error');
            
            // 버튼 상태 복원
            const recordBtn = document.getElementById('recordCalibrationBtn');
            if (recordBtn) {
                recordBtn.disabled = false;
                recordBtn.innerHTML = '<i class="fas fa-circle"></i> 녹음 시작';
            }
        }
    }

    // 캘리브레이션 결과 표시
    displayCalibrationResults(calibration) {
        const volumeValue = document.getElementById('volumeValue');
        const noiseValue = document.getElementById('noiseValue');
        const volumeBar = document.getElementById('volumeBar');
        const noiseBar = document.getElementById('noiseBar');
        const feedback = document.getElementById('calibrationFeedback');
        
        if (!volumeValue || !noiseValue || !volumeBar || !noiseBar || !feedback) return;
        
        // 값 표시
        volumeValue.textContent = `${calibration.volume.toFixed(1)} dB`;
        noiseValue.textContent = `${calibration.noise.toFixed(1)} dB`;
        
        // 바 길이 업데이트 (정규화: -60~0dB → 0~100%)
        const volumePercent = Math.min(Math.max((calibration.volume + 60) * 1.67, 0), 100);
        const noisePercent = Math.min(Math.max((calibration.noise + 60) * 1.67, 0), 100);
        
        volumeBar.style.width = `${volumePercent}%`;
        noiseBar.style.width = `${noisePercent}%`;
        
        // 피드백 메시지
        let message = '';
        let type = 'success';
        
        if (calibration.isValid) {
            message = '✅ 마이크 설정이 적절합니다. 테스트를 진행할 수 있습니다.';
        } else {
            type = 'error';
            if (calibration.volume <= -40) {
                message = '🔈 음량이 너무 작습니다. 마이크를 입에 더 가까이 가져가주세요.';
            } else if (calibration.noise >= 50) {
                message = '🔇 배경 소음이 많습니다. 조용한 환경에서 다시 시도해주세요.';
            } else {
                message = '⚠️ 마이크 설정에 문제가 있습니다. 장치를 확인해주세요.';
            }
        }
        
        feedback.textContent = message;
        feedback.className = `feedback-message ${type}`;
    }

    // 볼륨 미터 업데이트
    updateVolumeMeter(calibration) {
        if (this.uiManager) {
            this.uiManager.drawVolumeMeter(calibration.volume, calibration.noise);
        }
    }

    // 캘리브레이션 음성 재생
    playCalibrationAudio() {
        // 간단한 음성 재생 (웹 음성 API 사용)
        const utterance = new SpeechSynthesisUtterance("Test, one two three, microphone check");
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    // 이전 결과 확인
    checkPreviousResults() {
        const previousLevel = localStorage.getItem('previousSLevel');
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        
        if (history.length > 0) {
            const lastTest = history[history.length - 1];
            console.log('이전 테스트 결과:', lastTest);
            
            // 홈 화면에 마지막 결과 표시
            this.displayLastResultOnHome(lastTest);
        }
    }

    // 홈 화면에 마지막 결과 표시
    displayLastResultOnHome(lastTest) {
        const levelBadge = document.querySelector('.level-badge span');
        if (levelBadge && lastTest.sLevel) {
            levelBadge.textContent = lastTest.sLevel.replace('S', '');
            
            // 배지 색상 업데이트
            const sLevelData = SentenceBank.calculateSLevel(lastTest.overallScore);
            if (sLevelData && sLevelData.color) {
                document.querySelector('.level-badge').style.background = 
                    `linear-gradient(135deg, ${sLevelData.color}, ${this.adjustColor(sLevelData.color, -20)})`;
            }
        }
    }

    // 색상 조정 헬퍼 함수
    adjustColor(color, amount) {
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
    }

    // 사용자 환경 확인
    checkEnvironment() {
        // Web Audio API 지원 확인
        if (!window.AudioContext && !window.webkitAudioContext) {
            this.showError('이 브라우저는 Web Audio API를 지원하지 않습니다. Chrome, Firefox, Edge 최신 버전을 사용해주세요.');
            return;
        }
        
        // 마이크 접근 권한 확인
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('마이크 접근이 지원되지 않습니다. HTTPS 연결을 사용해주세요.');
            return;
        }
        
        // 로컬 스토리지 확인
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            this.showToast('로컬 스토리지 사용이 제한되어 있습니다. 테스트 기록이 저장되지 않을 수 있습니다.', 'warning');
        }
    }

    // 온라인 상태 처리
    handleOnlineStatus(isOnline) {
        if (isOnline) {
            this.showToast('인터넷 연결이 복구되었습니다.', 'success');
        } else {
            this.showToast('인터넷 연결이 끊겼습니다. 일부 기능이 제한될 수 있습니다.', 'warning');
        }
    }

    // 페이지 가시성 변경 처리
    handleVisibilityChange() {
        if (document.hidden) {
            // 페이지가 숨겨졌을 때
            if (this.audioProcessor && this.audioProcessor.isRecording) {
                this.audioProcessor.stopRecording();
                this.showToast('페이지가 백그라운드로 전환되어 녹음이 중지되었습니다.', 'warning');
            }
            
            // 음성 합성 정지
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }
    }

    // 스플래시 스크린 표시
    showSplashScreen() {
        // 스플래시 스크린이 없다면 생성
        if (!document.getElementById('splashScreen')) {
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
            
            // 스타일 추가
            const style = document.createElement('style');
            style.textContent = `
                #splashScreen {
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
                }
                .splash-content {
                    text-align: center;
                    animation: fadeIn 0.5s ease;
                }
                .splash-logo {
                    margin-bottom: 2rem;
                }
                .splash-logo i {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .splash-logo h1 {
                    font-size: 2rem;
                    margin: 0;
                }
                .splash-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .splash-version {
                    margin-top: 1rem;
                    opacity: 0.7;
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(splash);
        }
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
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .error-message {
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
            }
            .error-content {
                max-width: 500px;
                background: var(--gray-7);
                padding: 30px;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .error-content i {
                font-size: 3rem;
                color: var(--danger);
                margin-bottom: 1rem;
            }
            .error-content h3 {
                margin-bottom: 1rem;
                color: white;
            }
            .error-content p {
                margin-bottom: 2rem;
                color: var(--gray-3);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(errorDiv);
    }

    // 토스트 메시지 표시 (UI 매니저와 통합)
    showToast(message, type = 'info') {
        if (this.uiManager) {
            this.uiManager.showToast(message, type);
        } else {
            // 간단한 토스트 표시
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
                uiManager: !!this.uiManager
            },
            state: this.uiManager ? this.uiManager.appState : null,
            sentences: SentenceBank.getTotalSentenceCount(),
            environment: {
                online: navigator.onLine,
                webAudio: !!(window.AudioContext || window.webkitAudioContext),
                mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                speechSynthesis: !!window.speechSynthesis
            }
        };
    }

    // 디버그 정보 표시
    showDebugInfo() {
        const status = this.getAppStatus();
        console.log('=== Pronunciation Master Debug Info ===');
        console.log('App Status:', status);
        
        if (this.uiManager) {
            console.log('Current Screen:', this.uiManager.currentScreen);
            console.log('Test Progress:', this.uiManager.currentSentenceIndex, '/', SentenceBank.getTotalSentenceCount());
        }
    }

    // 앱 리셋
    resetApp() {
        if (confirm('앱을 완전히 초기화하시겠습니까? 모든 설정과 기록이 삭제됩니다.')) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    // 글로벌 앱 인스턴스 생성
    window.pronunciationMaster = new PronunciationMaster();
    
    // 개발자 도구용 단축키
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+D: 디버그 정보 표시
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (window.pronunciationMaster) {
                window.pronunciationMaster.showDebugInfo();
            }
        }
        
        // Ctrl+Shift+R: 앱 리셋
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (window.pronunciationMaster) {
                window.pronunciationMaster.resetApp();
            }
        }
    });
    
    // 서비스 워커 등록 (PWA 지원)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('Service Worker 등록 실패:', error);
            });
        });
    }
    
    // PWA 설치 프롬프트
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // 설치 버튼 표시 로직
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('사용자가 PWA 설치를 수락함');
                    }
                    deferredPrompt = null;
                });
            });
        }
    });
});

// 글로벌 헬퍼 함수
window.pronunciationHelpers = {
    // 문장 음성 합성
    speakSentence: function(text, lang = 'en-US') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
            return true;
        }
        return false;
    },
    
    // 로컬 스토리지 관리
    storage: {
        saveTestResult: function(result) {
            try {
                const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
                history.push({
                    ...result,
                    id: Date.now(),
                    timestamp: new Date().toISOString()
                });
                
                if (history.length > 10) history.shift();
                localStorage.setItem('testHistory', JSON.stringify(history));
                return true;
            } catch (e) {
                console.error('테스트 결과 저장 실패:', e);
                return false;
            }
        },
        
        getTestHistory: function() {
            try {
                return JSON.parse(localStorage.getItem('testHistory') || '[]');
            } catch (e) {
                return [];
            }
        },
        
        clearHistory: function() {
            localStorage.removeItem('testHistory');
            localStorage.removeItem('previousSLevel');
        }
    },
    
    // 음소 분석 도우미
    phonemeHelper: {
        getPhonemeDescription: function(phoneme) {
            const descriptions = {
                'L': '혀끝을 윗니 뒤쪽에 댄 상태로 발음',
                'R': '혀를 뒤로 말아 올린 상태로 발음',
                'P': '입술을 딱 붙였다가 터트리기',
                'F': '윗니를 아랫입술에 대고 공기 내보내기',
                'TH': '혀를 윗니와 아랫니 사이에 살짝 끼우기',
                'S': '혀끝을 윗니 뒤쪽에 대고 공기 내보내기',
                'SH': '입술을 동그랗게 만들고 혀를 살짝 올리기'
            };
            return descriptions[phoneme] || '기본 발음';
        },
        
        getPracticeWords: function(phoneme) {
            const words = {
                'L/R': ['red lorry', 'yellow lorry', 'really rare'],
                'P/F': ['Peter Piper', 'fluffy fox', 'perfect pronunciation'],
                'TH': ['thirty-three', 'this and that', 'thoughtful thinking'],
                'S/SH': ['she sells seashells', 'sunshine shower', 'special session']
            };
            return words[phoneme] || ['practice', 'pronunciation', 'perfect'];
        }
    },
    
    // 점수 변환
    convertScoreToLevel: function(score) {
        const sLevelData = SentenceBank.calculateSLevel(score);
        return {
            level: sLevelData.level,
            title: sLevelData.title,
            description: sLevelData.description,
            color: sLevelData.color
        };
    },
    
    // URL 공유
    shareResultUrl: function(level, score) {
        const url = new URL(window.location.href);
        url.searchParams.set('result', `${level}-${score}`);
        return url.toString();
    }
};

// 오프라인 지원을 위한 기본 서비스 워커
if ('serviceWorker' in navigator) {
    const swContent = `
        self.addEventListener('install', (event) => {
            event.waitUntil(
                caches.open('pronunciation-master-v1').then((cache) => {
                    return cache.addAll([
                        '/',
                        '/index.html',
                        '/style.css',
                        '/script.js',
                        '/sentences.js',
                        '/audio-processor.js',
                        '/scoring-engine.js',
                        '/feedback-generator.js',
                        '/ui-manager.js'
                    ]);
                })
            );
        });
        
        self.addEventListener('fetch', (event) => {
            event.respondWith(
                caches.match(event.request).then((response) => {
                    return response || fetch(event.request);
                })
            );
        });
    `;
    
    // 개발 중에는 서비스 워커를 등록하지 않음
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        navigator.serviceWorker.register('data:text/javascript,' + encodeURIComponent(swContent))
            .catch(console.error);
    }
}

// 추가 CSS (동적 생성)
const additionalStyles = `
    /* 애니메이션 */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    /* 반응형 추가 */
    @media (max-width: 480px) {
        .sentence-text {
            font-size: 1.2rem !important;
            padding: 15px !important;
        }
        
        .level-badge-large {
            width: 120px !important;
            height: 120px !important;
        }
        
        .level-letter {
            font-size: 2.5rem !important;
        }
        
        .level-number {
            font-size: 3rem !important;
        }
    }
    
    /* 접근성 */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    /* 다크 모드 지원 */
    @media (prefers-color-scheme: dark) {
        :root {
            --bg-primary: #121212;
            --bg-secondary: #1e1e1e;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --border-color: #333333;
        }
        
        .welcome-card, .calibration-card, .sentence-card, .result-container {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }
        
        .feature {
            background: #2a2a2a;
        }
    }
    
    /* 인쇄 스타일 */
    @media print {
        .header, .footer, .navigation-buttons, .test-navigation, .result-actions {
            display: none !important;
        }
        
        .result-container {
            box-shadow: none !important;
            padding: 0 !important;
        }
        
        .level-badge-large {
            border: 2px solid #000 !important;
        }
    }
`;

// 스타일 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

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
║   Ctrl+Shift+R: 앱 리셋                   ║
║                                           ║
╚═══════════════════════════════════════════╝
`);
