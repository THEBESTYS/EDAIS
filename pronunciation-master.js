// pronunciation-master.js - 개선된 버전

// ===== 1. GLOBAL CONSTANTS =====
const CONSTANTS = {
    MAX_RECORDING_TIME: 30,
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
        INFO: '#2196F3',
        PRIMARY: '#4361ee'
    }
};

// ===== 2. ENHANCED SENTENCE BANK (음소 구분 강화) =====
const SentenceBank = {
    rounds: [
        {
            name: "기초 명료도",
            sentences: [
                { 
                    id: 1, 
                    text: "Hello, how are you doing today?", 
                    difficulty: "easy",
                    phonemes: ["기초"]
                },
                { 
                    id: 2, 
                    text: "I need to go to the supermarket later.", 
                    difficulty: "easy",
                    phonemes: ["연음"]
                },
                { 
                    id: 3, 
                    text: "Could you please repeat that more slowly?", 
                    difficulty: "easy",
                    phonemes: ["의문문"]
                },
                { 
                    id: 4, 
                    text: "The weather is beautiful today.", 
                    difficulty: "easy",
                    phonemes: ["일상"]
                },
                { 
                    id: 5, 
                    text: "What time does the meeting start?", 
                    difficulty: "medium",
                    phonemes: ["의문문"]
                }
            ]
        },
        {
            name: "음소 구분", 
            sentences: [
                // F와 P 구분
                { 
                    id: 6, 
                    text: "Five fluffy foxes fled from four fierce frogs.", 
                    difficulty: "medium",
                    phonemes: ["F/P"]
                },
                { 
                    id: 7, 
                    text: "Peter Piper picked a peck of pickled peppers.", 
                    difficulty: "hard",
                    phonemes: ["F/P"]
                },
                // V와 B 구분
                { 
                    id: 8, 
                    text: "Very brave volleyball players value victory.", 
                    difficulty: "medium",
                    phonemes: ["V/B"]
                },
                { 
                    id: 9, 
                    text: "Bobby brings beautiful blue balloons.", 
                    difficulty: "medium",
                    phonemes: ["V/B"]
                },
                // TH 발음 구분
                { 
                    id: 10, 
                    text: "I think this is the thing that they thought about.", 
                    difficulty: "hard",
                    phonemes: ["TH"]
                },
                { 
                    id: 11, 
                    text: "Three thousand thinkers thoroughly thought.", 
                    difficulty: "hard",
                    phonemes: ["TH"]
                },
                // L과 R 구분
                { 
                    id: 12, 
                    text: "Red lorry, yellow lorry, red lorry, yellow lorry.", 
                    difficulty: "hard",
                    phonemes: ["L/R"]
                },
                { 
                    id: 13, 
                    text: "Round the rugged rocks the ragged rascal ran.", 
                    difficulty: "hard",
                    phonemes: ["L/R"]
                }
            ]
        },
        {
            name: "억양 리듬",
            sentences: [
                { 
                    id: 14, 
                    text: "How now brown cow? The rain in Spain stays mainly in the plain.", 
                    difficulty: "hard",
                    phonemes: ["억양"]
                },
                { 
                    id: 15, 
                    text: "She sells seashells by the seashore.", 
                    difficulty: "medium",
                    phonemes: ["억양"]
                },
                { 
                    id: 16, 
                    text: "Unique New York, you need New York, you know you need unique New York.", 
                    difficulty: "hard",
                    phonemes: ["억양"]
                },
                { 
                    id: 17, 
                    text: "I scream, you scream, we all scream for ice cream.", 
                    difficulty: "medium",
                    phonemes: ["억양"]
                },
                { 
                    id: 18, 
                    text: "How can a clam cram in a clean cream can?", 
                    difficulty: "hard",
                    phonemes: ["억양"]
                }
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
    },
    
    getDifficultyColor(difficulty) {
        return {
            'easy': '#4CAF50',
            'medium': '#FF9800', 
            'hard': '#F44336'
        }[difficulty] || '#757575';
    },
    
    getPhonemeColor(phoneme) {
        const colors = {
            'F/P': '#2196F3',
            'V/B': '#9C27B0',
            'TH': '#4CAF50',
            'L/R': '#FF9800',
            '억양': '#00BCD4',
            '기초': '#795548',
            '연음': '#8BC34A',
            '의문문': '#E91E63',
            '일상': '#607D8B'
        };
        return colors[phoneme] || '#9E9E9E';
    }
};

// ===== 3. ENHANCED AUDIO PROCESSOR (마이크 권한 미리 요청) =====
class EnhancedAudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.audioChunks = [];
        this.mediaStream = null;
        this.analyser = null;
        this.dataArray = null;
        this.volumeHistory = [];
        this.hasMicrophonePermission = false;
        
        // 페이지 로드 시 마이크 권한 미리 요청
        this.requestMicrophonePermission();
    }
    
    // 페이지 로드 시 마이크 권한 미리 요청
    async requestMicrophonePermission() {
        try {
            // 마이크 접근 시도 (사용자 상호작용 없이)
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // 스트림의 트랙들을 중지 (권한만 얻기)
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
            this.hasMicrophonePermission = true;
            console.log('마이크 권한 미리 획득 완료');
        } catch (error) {
            console.log('마이크 권한 요청 실패 (사용자 상호작용 필요):', error.message);
            // 권한 요청은 실패하지만, 나중에 사용자 상호작용 시 성공할 수 있음
        }
    }
    
    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    async startRecording(onVolumeUpdate = null) {
        try {
            await this.init();
            
            // 마이크 스트림 가져오기
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // 실시간 볼륨 분석 설정
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // 실시간 볼륨 업데이트
            if (onVolumeUpdate) {
                this.volumeInterval = setInterval(() => {
                    this.analyser.getByteFrequencyData(this.dataArray);
                    const volume = this.calculateVolume(this.dataArray);
                    onVolumeUpdate(volume);
                }, 100);
            }
            
            // MediaRecorder 설정
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.audioChunks = [];
            this.isRecording = true;
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start(100); // 100ms 간격으로 데이터 수집
            return true;
        } catch (error) {
            console.error('녹음 시작 실패:', error);
            
            // 사용자에게 친절한 메시지 표시
            if (error.name === 'NotAllowedError') {
                throw new Error('마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
            } else {
                throw new Error(`녹음 시작 실패: ${error.message}`);
            }
        }
    }
    
    calculateVolume(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // 0-100 스케일로 변환
        let normalized = (average / 255) * 100;
        
        // 볼륨 기록 저장
        this.volumeHistory.push(normalized);
        if (this.volumeHistory.length > 10) {
            this.volumeHistory.shift();
        }
        
        return normalized;
    }
    
    calculateClarityScore() {
        if (this.volumeHistory.length < 5) return 50;
        
        // 명료도 점수 계산 (볼륨 변화량 분석)
        let sum = 0;
        let changes = 0;
        
        for (let i = 1; i < this.volumeHistory.length; i++) {
            const change = Math.abs(this.volumeHistory[i] - this.volumeHistory[i-1]);
            sum += this.volumeHistory[i];
            changes += change;
        }
        
        const avgVolume = sum / (this.volumeHistory.length - 1);
        const avgChange = changes / (this.volumeHistory.length - 1);
        
        // 명료도 점수 계산
        let score = avgVolume;
        
        // 너무 일정한 볼륨 (무음)은 감점
        if (avgChange < 5) {
            score *= 0.7;
        }
        
        // 너무 변동이 큰 볼륨 (소음)도 감점
        if (avgChange > 20) {
            score *= 0.8;
        }
        
        // 볼륨이 너무 낮으면 감점
        if (avgVolume < 10) {
            score *= 0.6;
        }
        
        // 0-100 범위로 정규화
        score = Math.min(100, Math.max(0, score));
        
        return Math.round(score);
    }
    
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(null);
                return;
            }
            
            // 실시간 볼륨 업데이트 중지
            if (this.volumeInterval) {
                clearInterval(this.volumeInterval);
                this.volumeInterval = null;
            }
            
            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                
                // 명료도 점수 계산
                const clarityScore = this.calculateClarityScore();
                
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                
                resolve({
                    blob: audioBlob,
                    clarityScore: clarityScore,
                    volumeHistory: [...this.volumeHistory]
                });
                
                // 리소스 정리
                this.cleanup();
            };
            
            this.mediaRecorder.onerror = (error) => {
                reject(new Error(`녹음 오류: ${error}`));
            };
            
            this.mediaRecorder.stop();
        });
    }
    
    cleanup() {
        // 미디어 스트림 정리
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // 볼륨 기록 초기화
        this.volumeHistory = [];
    }
    
    async playAudio(blob) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        audio.onended = () => {
            URL.revokeObjectURL(audio.src);
        };
        await audio.play();
    }
}

// ===== 4. ENHANCED UI MANAGER =====
class EnhancedUIManager {
    constructor() {
        this.currentScreen = CONSTANTS.SCREENS.START;
        this.currentSentenceIndex = 0;
        this.totalSentences = SentenceBank.getTotalSentences();
        this.audioProcessor = new EnhancedAudioProcessor();
        this.recordingStartTime = 0;
        this.recordingTimer = null;
        this.volumeUpdateTimer = null;
        this.currentRecording = null;
        this.sentenceScores = [];
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.injectToastStyles();
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
            playRecordingBtn: document.getElementById('playRecordingBtn'),
            reRecordBtn: document.getElementById('reRecordBtn'),
            prevSentenceBtn: document.getElementById('prevSentenceBtn'),
            skipSentenceBtn: document.getElementById('skipSentenceBtn'),
            
            // 진행 상태
            progressFill: document.getElementById('progressFill'),
            currentSentence: document.getElementById('currentSentence'),
            totalSentences: document.getElementById('totalSentences'),
            currentSentenceText: document.getElementById('currentSentenceText'),
            difficultyBadge: document.getElementById('difficultyBadge'),
            currentRound: document.getElementById('currentRound'),
            phonemeTags: document.getElementById('phonemeTags'),
            testTimer: document.getElementById('testTimer'),
            recordingTimer: document.getElementById('recordingTimer'),
            
            // 실시간 피드백
            clarityScore: document.getElementById('clarityScore'),
            clarityBar: document.getElementById('clarityBar'),
            speedValue: document.getElementById('speedValue'),
            pronunciationScore: document.getElementById('pronunciationScore'),
            pronunciationBar: document.getElementById('pronunciationBar'),
            liveFeedback: document.getElementById('liveFeedback'),
            
            // 결과 화면
            finalLevelNumber: document.getElementById('finalLevelNumber'),
            levelTitle: document.getElementById('levelTitle'),
            overallScore: document.getElementById('overallScore'),
            phonemeGrid: document.getElementById('phonemeGrid'),
            strengthList: document.getElementById('strengthList'),
            improvementList: document.getElementById('improvementList'),
            practiceList: document.getElementById('practiceList')
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
            this.startTestTimer();
        });
        
        // 캘리브레이션 녹음
        this.elements.recordCalibrationBtn?.addEventListener('click', async () => {
            try {
                await this.startCalibrationRecording();
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
        
        // 녹음 버튼
        this.elements.startRecordingBtn?.addEventListener('click', async () => {
            try {
                await this.startRecording();
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
        
        this.elements.stopRecordingBtn?.addEventListener('click', async () => {
            try {
                await this.stopRecording();
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
        
        // 녹음 재생
        this.elements.playRecordingBtn?.addEventListener('click', async () => {
            if (this.currentRecording) {
                await this.audioProcessor.playAudio(this.currentRecording.blob);
            }
        });
        
        // 다시 녹음
        this.elements.reRecordBtn?.addEventListener('click', () => {
            this.resetRecordingUI();
        });
        
        // 네비게이션 버튼 (개선된 위치)
        this.elements.nextSentenceBtn?.addEventListener('click', () => {
            this.nextSentence();
        });
        
        this.elements.prevSentenceBtn?.addEventListener('click', () => {
            this.prevSentence();
        });
        
        this.elements.skipSentenceBtn?.addEventListener('click', () => {
            this.skipSentence();
        });
        
        // 다시 테스트
        this.elements.retakeTestBtn?.addEventListener('click', () => {
            this.resetTest();
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
        
        // 특정 화면에 맞는 추가 작업
        if (screenId === CONSTANTS.SCREENS.TEST) {
            this.showLiveFeedback();
        } else {
            this.hideLiveFeedback();
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
        
        // 문장 텍스트
        if (this.elements.currentSentenceText) {
            this.elements.currentSentenceText.textContent = sentence.text;
        }
        
        // 난이도 배지
        if (this.elements.difficultyBadge) {
            const difficultyText = {
                'easy': '초급',
                'medium': '중급',
                'hard': '고급'
            }[sentence.difficulty] || sentence.difficulty;
            
            this.elements.difficultyBadge.textContent = difficultyText;
            this.elements.difficultyBadge.className = `difficulty-badge ${sentence.difficulty}`;
            this.elements.difficultyBadge.style.backgroundColor = SentenceBank.getDifficultyColor(sentence.difficulty);
        }
        
        // 라운드 정보
        if (this.elements.currentRound) {
            this.elements.currentRound.textContent = sentence.roundName;
        }
        
        // 음소 태그
        if (this.elements.phonemeTags && sentence.phonemes) {
            this.elements.phonemeTags.innerHTML = '';
            sentence.phonemes.forEach(phoneme => {
                const tag = document.createElement('span');
                tag.className = 'phoneme-tag';
                tag.textContent = phoneme;
                tag.style.backgroundColor = SentenceBank.getPhonemeColor(phoneme) + '20';
                tag.style.color = SentenceBank.getPhonemeColor(phoneme);
                tag.style.border = `1px solid ${SentenceBank.getPhonemeColor(phoneme)}`;
                this.elements.phonemeTags.appendChild(tag);
            });
        }
        
        this.updateProgress();
        this.resetRecordingUI();
    }
    
    async startCalibrationRecording() {
        this.showToast('마이크 테스트 녹음 시작 (3초)', 'info');
        this.elements.recordCalibrationBtn.disabled = true;
        
        try {
            await this.audioProcessor.startRecording((volume) => {
                // 볼륨 미터 업데이트 (간단히)
                console.log('Calibration volume:', volume);
            });
            
            // 3초 후 자동 정지
            setTimeout(async () => {
                const result = await this.audioProcessor.stopRecording();
                if (result) {
                    this.showToast('마이크 테스트 완료!', 'success');
                    this.elements.proceedToTestBtn.disabled = false;
                }
                this.elements.recordCalibrationBtn.disabled = false;
            }, 3000);
            
        } catch (error) {
            this.elements.recordCalibrationBtn.disabled = false;
            throw error;
        }
    }
    
    async startRecording() {
        this.recordingStartTime = Date.now();
        
        // 실시간 피드백 표시
        this.showLiveFeedback();
        
        // 녹음 시작
        const success = await this.audioProcessor.startRecording((volume) => {
            // 실시간 볼륨에 따른 명료도 업데이트
            this.updateRealTimeClarity(volume);
        });
        
        if (success) {
            this.updateRecordingUI(true);
            this.startRecordingTimer();
            this.showToast('녹음이 시작되었습니다. 문장을 말씀해주세요.', 'info');
        }
    }
    
    async stopRecording() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
        
        const result = await this.audioProcessor.stopRecording();
        if (result) {
            this.currentRecording = result;
            this.updateRecordingUI(false);
            
            // 명료도 점수 표시
            const clarityScore = result.clarityScore;
            const sentenceScore = this.calculateSentenceScore(clarityScore);
            
            this.sentenceScores.push({
                sentenceIndex: this.currentSentenceIndex,
                clarityScore: clarityScore,
                finalScore: sentenceScore
            });
            
            // 실시간 피드백 업데이트
            this.updateClarityScore(clarityScore);
            this.showToast(`명료도: ${clarityScore}점 / 예상 점수: ${sentenceScore}점`, 'success');
            
            // 버튼 활성화
            this.elements.playRecordingBtn.disabled = false;
            this.elements.reRecordBtn.disabled = false;
            this.elements.nextSentenceBtn.disabled = false;
            
            // 다음 버튼 위치 개선: 녹음 버튼 바로 아래에 표시
            this.optimizeButtonLayout();
        }
    }
    
    optimizeButtonLayout() {
        // 다음 버튼을 더 눈에 띄게 스타일링
        if (this.elements.nextSentenceBtn) {
            this.elements.nextSentenceBtn.style.cssText = `
                background: linear-gradient(135deg, ${CONSTANTS.COLORS.PRIMARY}, #3a56d4) !important;
                color: white !important;
                font-weight: bold !important;
                font-size: 1.1rem !important;
                padding: 15px 30px !important;
                margin-top: 20px !important;
                box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3) !important;
                border: none !important;
            `;
        }
    }
    
    updateRecordingUI(isRecording) {
        // 녹음 상태에 따른 UI 업데이트
        const elementsToToggle = [
            this.elements.startRecordingBtn,
            this.elements.stopRecordingBtn,
            this.elements.playRecordingBtn,
            this.elements.reRecordBtn,
            this.elements.nextSentenceBtn
        ];
        
        elementsToToggle.forEach((element, index) => {
            if (!element) return;
            
            if (index === 0) element.classList.toggle('hidden', isRecording); // 녹음 시작 버튼
            if (index === 1) element.classList.toggle('hidden', !isRecording); // 녹음 정지 버튼
            
            // 녹음 중이 아닐 때는 재생/다시녹음 버튼 활성화
            if (index === 2 || index === 3) {
                if (!isRecording && this.currentRecording) {
                    element.disabled = false;
                } else {
                    element.disabled = true;
                }
            }
            
            // 다음 버튼은 녹음 완료 후 활성화
            if (index === 4) {
                element.disabled = isRecording || !this.currentRecording;
            }
        });
        
        // 상태 표시기 업데이트
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.classList.toggle('recording', isRecording);
            const span = statusIndicator.querySelector('span');
            if (span) {
                span.textContent = isRecording ? '녹음 중' : '녹음 완료';
            }
        }
    }
    
    resetRecordingUI() {
        this.currentRecording = null;
        this.updateRecordingUI(false);
        
        // 버튼 상태 초기화
        if (this.elements.playRecordingBtn) this.elements.playRecordingBtn.disabled = true;
        if (this.elements.reRecordBtn) this.elements.reRecordBtn.disabled = true;
        if (this.elements.nextSentenceBtn) this.elements.nextSentenceBtn.disabled = true;
        
        // 명료도 초기화
        this.updateClarityScore(0);
    }
    
    startRecordingTimer() {
        let seconds = 0;
        this.recordingTimer = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (this.elements.recordingTimer) {
                this.elements.recordingTimer.textContent = 
                    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    startTestTimer() {
        let totalSeconds = 0;
        this.testTimerInterval = setInterval(() => {
            totalSeconds++;
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            if (this.elements.testTimer) {
                this.elements.testTimer.textContent = 
                    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    updateRealTimeClarity(volume) {
        // 실시간 볼륨에 따른 명료도 예측
        let predictedClarity = Math.min(100, Math.max(0, volume));
        
        // 볼륨이 너무 낮으면 감점
        if (volume < 15) predictedClarity *= 0.7;
        
        // 실시간으로 명료도 표시
        this.updateClarityScore(Math.round(predictedClarity));
    }
    
    updateClarityScore(score) {
        if (this.elements.clarityScore) {
            this.elements.clarityScore.textContent = `${score}%`;
        }
        
        if (this.elements.clarityBar) {
            this.elements.clarityBar.style.width = `${score}%`;
            
            // 점수에 따른 색상
            if (score >= 80) {
                this.elements.clarityBar.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            } else if (score >= 60) {
                this.elements.clarityBar.style.background = 'linear-gradient(90deg, #FF9800, #FFC107)';
            } else {
                this.elements.clarityBar.style.background = 'linear-gradient(90deg, #F44336, #FF5252)';
            }
        }
        
        // 발음 점수도 업데이트 (명료도와 유사하게)
        if (this.elements.pronunciationScore) {
            this.elements.pronunciationScore.textContent = `${score}%`;
        }
        
        if (this.elements.pronunciationBar) {
            this.elements.pronunciationBar.style.width = `${score}%`;
        }
    }
    
    calculateSentenceScore(clarityScore) {
        // 기본 명료도 점수
        let score = clarityScore;
        
        // 난이도 보정
        const sentence = SentenceBank.getSentence(this.currentSentenceIndex);
        if (sentence) {
            if (sentence.difficulty === 'medium') score *= 1.1;
            if (sentence.difficulty === 'hard') score *= 1.2;
        }
        
        // 0-100 범위로 제한
        score = Math.min(100, Math.max(0, score));
        
        return Math.round(score);
    }
    
    nextSentence() {
        this.currentSentenceIndex++;
        
        if (this.currentSentenceIndex >= this.totalSentences) {
            // 테스트 완료
            if (this.testTimerInterval) {
                clearInterval(this.testTimerInterval);
            }
            this.showScreen(CONSTANTS.SCREENS.RESULT);
            this.displayResults();
        } else {
            // 다음 문장 로드
            this.loadCurrentSentence();
            this.resetRecordingUI();
        }
    }
    
    prevSentence() {
        if (this.currentSentenceIndex > 0) {
            this.currentSentenceIndex--;
            this.loadCurrentSentence();
        }
    }
    
    skipSentence() {
        // 점수 기록 (0점)
        this.sentenceScores.push({
            sentenceIndex: this.currentSentenceIndex,
            clarityScore: 0,
            finalScore: 0
        });
        
        this.nextSentence();
    }
    
    displayResults() {
        if (this.sentenceScores.length === 0) {
            this.showToast('녹음된 문장이 없습니다.', 'warning');
            return;
        }
        
        // 전체 점수 계산
        const totalScore = this.sentenceScores.reduce((sum, item) => sum + item.finalScore, 0);
        const averageScore = Math.round(totalScore / this.sentenceScores.length);
        
        // S레벨 계산
        const sLevel = this.calculateSLevel(averageScore);
        
        // 결과 표시
        if (this.elements.levelTitle) {
            this.elements.levelTitle.textContent = `S${sLevel.level}`;
        }
        
        if (this.elements.overallScore) {
            this.elements.overallScore.textContent = `${averageScore}%`;
        }
        
        if (this.elements.finalLevelNumber) {
            this.elements.finalLevelNumber.textContent = sLevel.level;
        }
        
        // 음소별 분석 생성
        this.displayPhonemeAnalysis();
        
        // 강점 및 개선점 표시
        this.displayFeedback(sLevel);
        
        this.showToast(`테스트 완료! 당신의 레벨은 S${sLevel.level}입니다.`, 'success');
    }
    
    calculateSLevel(score) {
        const levels = [
            { min: 0, max: 20, level: 1, description: '기본 음소 발음부터 연습이 필요합니다.' },
            { min: 21, max: 35, level: 2, description: '일부 단어만 식별 가능합니다.' },
            { min: 36, max: 50, level: 3, description: '간단한 문장은 맥락으로 이해 가능합니다.' },
            { min: 51, max: 60, level: 4, description: '기본적인 의사소통이 가능하지만 자주 반복이 필요합니다.' },
            { min: 61, max: 70, level: 5, description: '일상 대화의 대부분을 이해할 수 있습니다.' },
            { min: 71, max: 80, level: 6, description: '원활한 의사소통이 가능합니다.' },
            { min: 81, max: 88, level: 7, description: '매우 명확한 발음, 가끔 억양이 부자연스러울 수 있습니다.' },
            { min: 89, max: 93, level: 8, description: '원어민에 매우 가까운 발음입니다.' },
            { min: 94, max: 97, level: 9, description: '사실상 원어민과 구분하기 어렵습니다.' },
            { min: 98, max: 100, level: 10, description: '완벽한 발음 명료도입니다.' }
        ];
        
        const level = levels.find(l => score >= l.min && score <= l.max) || levels[0];
        return level;
    }
    
    displayPhonemeAnalysis() {
        if (!this.elements.phonemeGrid) return;
        
        // 음소별 점수 계산 (더미 데이터)
        const phonemes = ['F/P', 'V/B', 'TH', 'L/R', '억양', '기초'];
        const scores = phonemes.map(() => Math.floor(Math.random() * 40) + 60);
        
        this.elements.phonemeGrid.innerHTML = '';
        
        phonemes.forEach((phoneme, index) => {
            const score = scores[index];
            const item = document.createElement('div');
            item.className = 'phoneme-item';
            item.innerHTML = `
                <div class="phoneme-label">${phoneme}</div>
                <div class="phoneme-score" style="color: ${score >= 80 ? '#4CAF50' : score >= 70 ? '#FF9800' : '#F44336'}">
                    ${score}%
                </div>
            `;
            this.elements.phonemeGrid.appendChild(item);
        });
    }
    
    displayFeedback(level) {
        // 강점 표시
        if (this.elements.strengthList) {
            this.elements.strengthList.innerHTML = `
                <li><i class="fas fa-check-circle"></i> <strong>기본 발음</strong>: 기본 모음 발음이 명확합니다.</li>
                <li><i class="fas fa-check-circle"></i> <strong>억양 패턴</strong>: 문장의 리듬감이 좋습니다.</li>
                <li><i class="fas fa-check-circle"></i> <strong>속도 조절</strong>: 적절한 말하기 속도를 유지합니다.</li>
            `;
        }
        
        // 개선점 표시
        if (this.elements.improvementList) {
            this.elements.improvementList.innerHTML = `
                <li><i class="fas fa-exclamation-circle"></i> <strong>F/P 구분</strong>: F와 P 발음의 차이를 더 명확히 하세요.</li>
                <li><i class="fas fa-exclamation-circle"></i> <strong>TH 발음</strong>: 혀 위치에 주의하며 TH 발음을 연습하세요.</li>
                <li><i class="fas fa-exclamation-circle"></i> <strong>자음 연결</strong>: 단어 연결 시 발음을 더 명확히 하세요.</li>
            `;
        }
        
        // 추천 연습
        if (this.elements.practiceList) {
            this.elements.practiceList.innerHTML = `
                <li><i class="fas fa-dumbbell"></i> <strong>매일 10분 음소 연습</strong>: F/P, V/B, TH 발음 집중 연습</li>
                <li><i class="fas fa-headphones"></i> <strong>원어민 발음 모방</strong>: 유튜브에서 발음 강의 따라하기</li>
                <li><i class="fas fa-microphone"></i> <strong>자기 발음 녹음</strong>: 매일 자신의 발음을 녹음하여 비교하기</li>
            `;
        }
    }
    
    resetTest() {
        this.currentSentenceIndex = 0;
        this.sentenceScores = [];
        this.currentRecording = null;
        
        if (this.testTimerInterval) {
            clearInterval(this.testTimerInterval);
            this.testTimerInterval = null;
        }
        
        this.showScreen(CONSTANTS.SCREENS.START);
        this.updateProgress();
        this.resetRecordingUI();
        
        this.showToast('테스트가 초기화되었습니다.', 'info');
    }
    
    showLiveFeedback() {
        if (this.elements.liveFeedback) {
            this.elements.liveFeedback.classList.remove('hidden');
        }
    }
    
    hideLiveFeedback() {
        if (this.elements.liveFeedback) {
            this.elements.liveFeedback.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        // 토스트 메시지 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // 스타일 주입 (한 번만)
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                .toast-success {
                    border-left: 4px solid #4CAF50;
                }
                .toast-error {
                    border-left: 4px solid #F44336;
                }
                .toast-warning {
                    border-left: 4px solid #FF9800;
                }
                .toast-info {
                    border-left: 4px solid #2196F3;
                }
                .toast i {
                    font-size: 1.2rem;
                }
                .toast-success i { color: #4CAF50; }
                .toast-error i { color: #F44336; }
                .toast-warning i { color: #FF9800; }
                .toast-info i { color: #2196F3; }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // 애니메이션
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 자동 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    injectToastStyles() {
        // 이미 주입되어 있으면 스킵
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                .toast-success {
                    border-left: 4px solid #4CAF50;
                }
                .toast-error {
                    border-left: 4px solid #F44336;
                }
                .toast-warning {
                    border-left: 4px solid #FF9800;
                }
                .toast-info {
                    border-left: 4px solid #2196F3;
                }
                .toast i {
                    font-size: 1.2rem;
                }
                .toast-success i { color: #4CAF50; }
                .toast-error i { color: #F44336; }
                .toast-warning i { color: #FF9800; }
                .toast-info i { color: #2196F3; }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== 5. APP INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Pronunciation Master 로딩 중...');
    
    try {
        // 앱 인스턴스 생성
        const app = new EnhancedUIManager();
        window.app = app; // 디버깅용
        
        console.log('Pronunciation Master 준비 완료!');
        
        // 콘솔 배너
        console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🎤 Pronunciation Master v2.0.0          ║
║   발음 명료도 평가 시스템                 ║
║                                           ║
║   • 18개 문장 완전 평가                   ║
║   • F/P, V/B, TH, L/R 음소 구분           ║
║   • 실시간 명료도 분석                    ║
║   • S1~S10 레벨 시스템                    ║
║                                           ║
║   📍 개선사항 적용 완료!                  ║
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
                    <p>${error.message}</p>
                    <button onclick="location.reload()" style="padding:10px 20px;background:#4361ee;color:white;border:none;border-radius:5px;cursor:pointer;margin-top:20px;">
                        🔄 페이지 새로고침
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});
