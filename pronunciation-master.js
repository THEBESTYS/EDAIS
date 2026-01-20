// pronunciation-master.js - 모든 기능 통합 (단순화 버전)

// ===== 1. GLOBAL CONSTANTS =====
const CONSTANTS = {
    MAX_RECORDING_TIME: 30,
    MAX_REFERENCE_PLAYS: 3,
    SCREENS: {
        START: 'startScreen',
        CALIBRATION: 'calibrationScreen',
        TEST: 'testScreen',
        RESULT: 'resultScreen'
    },
    COLORS: {
        SUCCESS: '#4CAF50',
        WARNING: '#FF9800',
        ERROR: '#F44336',
        INFO: '#2196F3'
    }
};

// ===== 2. SENTENCE BANK (단순화) =====
const SentenceBank = {
    rounds: [
        {
            name: "기초 명료도",
            sentences: [
                { id: 1, text: "Hello, how are you doing today?", difficulty: "easy" },
                { id: 2, text: "I need to go to the supermarket later.", difficulty: "easy" },
                { id: 3, text: "Could you please repeat that more slowly?", difficulty: "easy" }
            ]
        },
        {
            name: "음소 구분", 
            sentences: [
                { id: 4, text: "Red lorry, yellow lorry.", difficulty: "medium" },
                { id: 5, text: "Peter Piper picked a peck of pickled peppers.", difficulty: "hard" }
            ]
        }
    ],
    
    getTotalSentences() {
        return this.rounds.reduce((total, round) => total + round.sentences.length, 0);
    },
    
    getSentence(index) {
        let count = 0;
        for (const round of this.rounds) {
            for (const sentence of round.sentences) {
                if (count === index) {
                    return {
                        ...sentence,
                        roundName: round.name
                    };
                }
                count++;
            }
        }
        return null;
    }
};

// ===== 3. SIMPLE AUDIO PROCESSOR =====
class SimpleAudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.audioChunks = [];
    }
    
    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    async startRecording() {
        try {
            await this.init();
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true 
                } 
            });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.isRecording = true;
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('녹음 시작 실패:', error);
            return false;
        }
    }
    
    async stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(null);
                return;
            }
            
            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                resolve(audioBlob);
            };
            
            this.mediaRecorder.stop();
        });
    }
    
    async playAudio(blob) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        await audio.play();
    }
}

// ===== 4. SIMPLE UI MANAGER =====
class SimpleUIManager {
    constructor() {
        this.currentScreen = CONSTANTS.SCREENS.START;
        this.currentSentenceIndex = 0;
        this.totalSentences = SentenceBank.getTotalSentences();
        this.audioProcessor = new SimpleAudioProcessor();
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.showScreen(CONSTANTS.SCREENS.START);
        this.updateProgress();
    }
    
    cacheElements() {
        this.elements = {
            // 화면
            startScreen: document.getElementById('startScreen'),
            calibrationScreen: document.getElementById('calibrationScreen'),
            testScreen: document.getElementById('testScreen'),
            resultScreen: document.getElementById('resultScreen'),
            
            // 버튼
            startBtn: document.getElementById('startBtn'),
            recordCalibrationBtn: document.getElementById('recordCalibrationBtn'),
            backToStartBtn: document.getElementById('backToStartBtn'),
            proceedToTestBtn: document.getElementById('proceedToTestBtn'),
            startRecordingBtn: document.getElementById('startRecordingBtn'),
            stopRecordingBtn: document.getElementById('stopRecordingBtn'),
            nextSentenceBtn: document.getElementById('nextSentenceBtn'),
            retakeTestBtn: document.getElementById('retakeTestBtn'),
            
            // 진행 상태
            progressFill: document.getElementById('progressFill'),
            currentSentence: document.getElementById('currentSentence'),
            totalSentences: document.getElementById('totalSentences'),
            currentSentenceText: document.getElementById('currentSentenceText'),
            difficultyBadge: document.getElementById('difficultyBadge'),
            currentRound: document.getElementById('currentRound')
        };
    }
    
    setupEventListeners() {
        // 시작 버튼
        this.elements.startBtn?.addEventListener('click', () => {
            this.showScreen(CONSTANTS.SCREENS.CALIBRATION);
        });
        
        // 캘리브레이션 화면
        this.elements.backToStartBtn?.addEventListener('click', () => {
            this.showScreen(CONSTANTS.SCREENS.START);
        });
        
        this.elements.proceedToTestBtn?.addEventListener('click', () => {
            this.showScreen(CONSTANTS.SCREENS.TEST);
            this.loadCurrentSentence();
        });
        
        // 녹음 버튼
        this.elements.startRecordingBtn?.addEventListener('click', async () => {
            await this.startRecording();
        });
        
        this.elements.stopRecordingBtn?.addEventListener('click', async () => {
            await this.stopRecording();
        });
        
        // 다음 문장
        this.elements.nextSentenceBtn?.addEventListener('click', () => {
            this.nextSentence();
        });
        
        // 다시 테스트
        this.elements.retakeTestBtn?.addEventListener('click', () => {
            this.resetTest();
        });
        
        // 캘리브레이션 녹음
        this.elements.recordCalibrationBtn?.addEventListener('click', async () => {
            const success = await this.audioProcessor.startRecording();
            if (success) {
                setTimeout(async () => {
                    const blob = await this.audioProcessor.stopRecording();
                    if (blob) {
                        this.showToast('마이크 캘리브레이션 완료!', 'success');
                        this.elements.proceedToTestBtn.disabled = false;
                    }
                }, 3000);
            }
        });
    }
    
    showScreen(screenId) {
        // 모든 화면 숨기기
        Object.values(this.elements).forEach(element => {
            if (element?.classList?.contains('screen')) {
                element.classList.remove('active');
            }
        });
        
        // 선택한 화면 표시
        const screen = this.elements[screenId];
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }
    
    updateProgress() {
        const progress = ((this.currentSentenceIndex) / this.totalSentences) * 100;
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        if (this.elements.currentSentence) {
            this.elements.currentSentence.textContent = this.currentSentenceIndex + 1;
        }
        
        if (this.elements.totalSentences) {
            this.elements.totalSentences.textContent = this.totalSentences;
        }
    }
    
    loadCurrentSentence() {
        const sentence = SentenceBank.getSentence(this.currentSentenceIndex);
        if (!sentence) return;
        
        if (this.elements.currentSentenceText) {
            this.elements.currentSentenceText.textContent = sentence.text;
        }
        
        if (this.elements.difficultyBadge) {
            this.elements.difficultyBadge.textContent = 
                sentence.difficulty === 'easy' ? '초급' : 
                sentence.difficulty === 'medium' ? '중급' : '고급';
            this.elements.difficultyBadge.className = `difficulty-badge ${sentence.difficulty}`;
        }
        
        if (this.elements.currentRound) {
            this.elements.currentRound.textContent = sentence.roundName;
        }
        
        this.updateProgress();
    }
    
    async startRecording() {
        const success = await this.audioProcessor.startRecording();
        if (success) {
            this.updateRecordingUI(true);
            this.showToast('녹음이 시작되었습니다.', 'info');
        }
    }
    
    async stopRecording() {
        const blob = await this.audioProcessor.stopRecording();
        if (blob) {
            this.updateRecordingUI(false);
            this.showToast('녹음이 완료되었습니다.', 'success');
            
            // 간단한 점수 계산 (더미)
            const score = Math.floor(Math.random() * 30) + 70;
            this.showToast(`예상 점수: ${score}점`, 'info');
            
            this.elements.nextSentenceBtn.disabled = false;
        }
    }
    
    updateRecordingUI(isRecording) {
        if (this.elements.startRecordingBtn) {
            this.elements.startRecordingBtn.classList.toggle('hidden', isRecording);
        }
        if (this.elements.stopRecordingBtn) {
            this.elements.stopRecordingBtn.classList.toggle('hidden', !isRecording);
        }
    }
    
    nextSentence() {
        this.currentSentenceIndex++;
        
        if (this.currentSentenceIndex >= this.totalSentences) {
            // 테스트 완료
            this.showScreen(CONSTANTS.SCREENS.RESULT);
            this.displayResults();
        } else {
            // 다음 문장 로드
            this.loadCurrentSentence();
            this.elements.nextSentenceBtn.disabled = true;
        }
    }
    
    displayResults() {
        // 더미 결과 표시
        const level = Math.floor(Math.random() * 10) + 1;
        const score = Math.floor(Math.random() * 30) + 70;
        
        const levelTitle = document.getElementById('levelTitle');
        const overallScore = document.getElementById('overallScore');
        const finalLevelNumber = document.getElementById('finalLevelNumber');
        
        if (levelTitle) levelTitle.textContent = `S${level}`;
        if (overallScore) overallScore.textContent = `${score}%`;
        if (finalLevelNumber) finalLevelNumber.textContent = level;
    }
    
    resetTest() {
        this.currentSentenceIndex = 0;
        this.showScreen(CONSTANTS.SCREENS.START);
        this.updateProgress();
    }
    
    showToast(message, type = 'info') {
        // 간단한 토스트 메시지
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 시각적 토스트 (선택사항)
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            border-left: 4px solid ${CONSTANTS.COLORS[type.toUpperCase()] || CONSTANTS.COLORS.INFO};
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// ===== 5. APP INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pronunciation Master 로딩 중...');
    
    try {
        // 앱 인스턴스 생성
        const app = new SimpleUIManager();
        window.app = app; // 디버깅용
        
        console.log('Pronunciation Master 준비 완료!');
        
        // 콘솔 배너
        console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🎤 Pronunciation Master v1.0.0          ║
║   발음 명료도 평가 시스템                 ║
║                                           ║
║   • 단순화된 테스트 구조                  ║
║   • 기본 녹음 기능                       ║
║   • S레벨 평가 시스템                     ║
║                                           ║
╚═══════════════════════════════════════════╝
        `);
        
    } catch (error) {
        console.error('앱 초기화 실패:', error);
        
        // 에러 메시지 표시
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
