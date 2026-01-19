// ui-manager.js - UI 상태 관리 및 화면 전환 관리자

class UIManager {
    constructor() {
        this.currentScreen = 'startScreen';
        this.currentSentenceIndex = 0;
        this.currentRoundIndex = 0;
        this.testStartTime = null;
        this.testTimer = null;
        this.recordingTimer = null;
        
        // UI 요소 캐시
        this.uiElements = {};
        this.screens = {};
        
        // 상태 관리
        this.appState = {
            isCalibrated: false,
            isRecording: false,
            isPlayingReference: false,
            isTestInProgress: false,
            calibrationData: null,
            testData: {
                sentences: [],
                scores: [],
                startTime: null,
                endTime: null
            },
            settings: {
                autoPlayReference: true,
                showLiveFeedback: true,
                enableSoundEffects: true,
                language: 'ko'
            }
        };
        
        // 초기화
        this.initializeUIElements();
        this.bindEvents();
        this.loadSettings();
    }

    // UI 요소 초기화
    initializeUIElements() {
        // 화면 요소
        this.screens = {
            startScreen: document.getElementById('startScreen'),
            calibrationScreen: document.getElementById('calibrationScreen'),
            testScreen: document.getElementById('testScreen'),
            resultScreen: document.getElementById('resultScreen')
        };

        // 버튼 요소
        this.uiElements = {
            // 시작 화면
            startBtn: document.getElementById('startBtn'),
            
            // 캘리브레이션 화면
            recordCalibrationBtn: document.getElementById('recordCalibrationBtn'),
            playCalibrationBtn: document.getElementById('playCalibrationBtn'),
            backToStartBtn: document.getElementById('backToStartBtn'),
            proceedToTestBtn: document.getElementById('proceedToTestBtn'),
            
            // 테스트 화면
            playReferenceBtn: document.getElementById('playReferenceBtn'),
            startRecordingBtn: document.getElementById('startRecordingBtn'),
            stopRecordingBtn: document.getElementById('stopRecordingBtn'),
            playRecordingBtn: document.getElementById('playRecordingBtn'),
            reRecordBtn: document.getElementById('reRecordBtn'),
            nextSentenceBtn: document.getElementById('nextSentenceBtn'),
            skipSentenceBtn: document.getElementById('skipSentenceBtn'),
            
            // 결과 화면
            retakeTestBtn: document.getElementById('retakeTestBtn'),
            shareResultBtn: document.getElementById('shareResultBtn'),
            downloadReportBtn: document.getElementById('downloadReportBtn'),
            
            // 공통
            volumeMeter: document.getElementById('volumeMeter'),
            waveformCanvas: document.getElementById('waveformCanvas'),
            currentLevel: document.getElementById('currentLevel'),
            
            // 진행 상태
            progressFill: document.getElementById('progressFill'),
            currentSentence: document.getElementById('currentSentence'),
            totalSentences: document.getElementById('totalSentences'),
            testTimer: document.getElementById('testTimer'),
            recordingTimer: document.getElementById('recordingTimer'),
            
            // 문장 정보
            currentSentenceText: document.getElementById('currentSentenceText'),
            difficultyBadge: document.getElementById('difficultyBadge'),
            phonemeTags: document.getElementById('phonemeTags'),
            
            // 실시간 피드백
            liveFeedback: document.getElementById('liveFeedback'),
            clarityScore: document.getElementById('clarityScore'),
            clarityBar: document.getElementById('clarityBar'),
            speedValue: document.getElementById('speedValue'),
            
            // 결과 화면 요소들
            finalLevelBadge: document.getElementById('finalLevelBadge'),
            levelTitle: document.getElementById('levelTitle'),
            levelDescription: document.getElementById('levelDescription'),
            overallScore: document.getElementById('overallScore'),
            phonemeGrid: document.getElementById('phonemeGrid'),
            strengthList: document.getElementById('strengthList'),
            improvementList: document.getElementById('improvementList'),
            practiceList: document.getElementById('practiceList')
        };

        // 모달 및 로딩
        this.uiElements.infoModal = document.getElementById('infoModal');
        this.uiElements.loadingOverlay = document.getElementById('loadingOverlay');
        this.uiElements.modalClose = document.querySelector('.modal-close');
    }

    // 이벤트 바인딩
    bindEvents() {
        // 시작 화면
        this.uiElements.startBtn?.addEventListener('click', () => this.showScreen('calibrationScreen'));
        
        // 캘리브레이션 화면
        this.uiElements.backToStartBtn?.addEventListener('click', () => this.showScreen('startScreen'));
        this.uiElements.proceedToTestBtn?.addEventListener('click', () => this.startTest());
        
        // 테스트 화면
        this.uiElements.playReferenceBtn?.addEventListener('click', () => this.playReferenceAudio());
        this.uiElements.startRecordingBtn?.addEventListener('click', () => this.startRecording());
        this.uiElements.stopRecordingBtn?.addEventListener('click', () => this.stopRecording());
        this.uiElements.playRecordingBtn?.addEventListener('click', () => this.playRecording());
        this.uiElements.reRecordBtn?.addEventListener('click', () => this.resetRecording());
        this.uiElements.nextSentenceBtn?.addEventListener('click', () => this.nextSentence());
        this.uiElements.skipSentenceBtn?.addEventListener('click', () => this.skipSentence());
        
        // 결과 화면
        this.uiElements.retakeTestBtn?.addEventListener('click', () => this.retakeTest());
        this.uiElements.shareResultBtn?.addEventListener('click', () => this.shareResult());
        this.uiElements.downloadReportBtn?.addEventListener('click', () => this.downloadReport());
        
        // 모달
        this.uiElements.modalClose?.addEventListener('click', () => this.hideModal());
        
        // 정보 링크
        document.getElementById('aboutLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    // 화면 전환
    showScreen(screenId) {
        // 현재 화면 숨기기
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 새 화면 표시
        const targetScreen = this.screens[screenId];
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // 화면별 초기화
            this.initializeScreen(screenId);
        }
    }

    // 화면별 초기화
    initializeScreen(screenId) {
        switch(screenId) {
            case 'startScreen':
                this.initializeStartScreen();
                break;
            case 'calibrationScreen':
                this.initializeCalibrationScreen();
                break;
            case 'testScreen':
                this.initializeTestScreen();
                break;
            case 'resultScreen':
                this.initializeResultScreen();
                break;
        }
    }

    // 시작 화면 초기화
    initializeStartScreen() {
        // 레벨 배지 업데이트 (이전 결과가 있으면)
        const previousLevel = localStorage.getItem('previousSLevel');
        if (previousLevel) {
            this.updateLevelBadge(previousLevel);
        }
    }

    // 캘리브레이션 화면 초기화
    initializeCalibrationScreen() {
        this.updateStepIndicator(1);
        this.resetCalibrationUI();
    }

    // 테스트 화면 초기화
    initializeTestScreen() {
        if (!this.appState.isCalibrated) {
            this.showScreen('calibrationScreen');
            return;
        }
        
        this.currentSentenceIndex = 0;
        this.currentRoundIndex = 0;
        this.appState.testData = {
            sentences: [],
            scores: [],
            startTime: new Date(),
            endTime: null
        };
        
        this.updateProgress();
        this.loadCurrentSentence();
        this.startTestTimer();
    }

    // 결과 화면 초기화
    initializeResultScreen() {
        // 결과 데이터 로드 및 표시
        this.displayResults();
    }

    // 테스트 시작
    async startTest() {
        if (!this.appState.calibrationData?.isValid) {
            this.showToast('마이크 캘리브레이션을 먼저 완료해주세요.', 'error');
            return;
        }
        
        this.showScreen('testScreen');
        this.appState.isTestInProgress = true;
    }

    // 문장 로드
    loadCurrentSentence() {
        const sentences = SentenceBank.getAllSentences();
        if (this.currentSentenceIndex >= sentences.length) {
            this.completeTest();
            return;
        }
        
        const sentence = sentences[this.currentSentenceIndex];
        const analysis = SentenceBank.getSentenceAnalysis(sentence.id);
        
        // UI 업데이트
        this.uiElements.currentSentenceText.textContent = sentence.text;
        this.uiElements.currentSentence.textContent = this.currentSentenceIndex + 1;
        this.uiElements.totalSentences.textContent = sentences.length;
        
        // 난이도 배지 업데이트
        this.updateDifficultyBadge(sentence.difficulty);
        
        // 음소 태그 업데이트
        this.updatePhonemeTags(analysis.phonemeTags);
        
        // 라운드 배지 업데이트
        this.updateRoundBadge(sentence.roundName);
        
        // 녹음 상태 초기화
        this.resetRecordingUI();
        
        // 참조 음성 재생 횟수 초기화
        this.referencePlayCount = 0;
        this.updatePlayCount();
        
        // 자동 재생 설정
        if (this.appState.settings.autoPlayReference) {
            setTimeout(() => this.playReferenceAudio(), 500);
        }
    }

    // 난이도 배지 업데이트
    updateDifficultyBadge(difficulty) {
        const badge = this.uiElements.difficultyBadge;
        if (!badge) return;
        
        badge.textContent = difficulty === 'easy' ? '초급' : 
                           difficulty === 'medium' ? '중급' : '고급';
        
        badge.className = 'difficulty-badge';
        badge.classList.add(difficulty);
    }

    // 음소 태그 업데이트
    updatePhonemeTags(phonemeTags) {
        const container = this.uiElements.phonemeTags;
        if (!container) return;
        
        container.innerHTML = '';
        
        phonemeTags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'phoneme-tag';
            span.textContent = tag.name;
            span.style.backgroundColor = tag.color + '20';
            span.style.color = tag.color;
            span.style.border = `1px solid ${tag.color}`;
            
            // 툴팁 추가
            span.title = tag.description;
            
            container.appendChild(span);
        });
    }

    // 라운드 배지 업데이트
    updateRoundBadge(roundName) {
        const badge = document.getElementById('currentRound');
        if (badge) {
            badge.textContent = roundName;
        }
    }

    // 레벨 배지 업데이트
    updateLevelBadge(level) {
        const badge = this.uiElements.currentLevel;
        if (badge) {
            const levelNumber = level.replace('S', '');
            badge.innerHTML = `<span>S${levelNumber}</span>`;
        }
    }

    // 진행 상태 업데이트
    updateProgress() {
        const sentences = SentenceBank.getAllSentences();
        const progress = ((this.currentSentenceIndex) / sentences.length) * 100;
        
        if (this.uiElements.progressFill) {
            this.uiElements.progressFill.style.width = `${progress}%`;
        }
    }

    // 참조 음성 재생
    async playReferenceAudio() {
        if (this.referencePlayCount >= 3) {
            this.showToast('참조 음성은 최대 3번까지 재생할 수 있습니다.', 'warning');
            return;
        }
        
        try {
            this.appState.isPlayingReference = true;
            this.uiElements.playReferenceBtn.disabled = true;
            this.uiElements.playReferenceBtn.innerHTML = '<i class="fas fa-volume-up"></i> 재생 중...';
            
            // 음성 재생 로직 (실제 구현 필요)
            // 임시로 텍스트 음성 변환 사용
            this.speakText(this.uiElements.currentSentenceText.textContent);
            
            this.referencePlayCount++;
            this.updatePlayCount();
            
            setTimeout(() => {
                this.appState.isPlayingReference = false;
                this.uiElements.playReferenceBtn.disabled = false;
                this.uiElements.playReferenceBtn.innerHTML = '<i class="fas fa-volume-up"></i> 원어민 발음 듣기';
            }, 2000);
            
        } catch (error) {
            console.error('참조 음성 재생 실패:', error);
            this.showToast('참조 음성 재생에 실패했습니다.', 'error');
        }
    }

    // 재생 횟수 업데이트
    updatePlayCount() {
        const countElement = document.getElementById('playCount');
        if (countElement) {
            countElement.textContent = 3 - this.referencePlayCount;
        }
    }

    // 텍스트 음성 변환 (간단한 구현)
    speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    // 녹음 시작
    async startRecording() {
        try {
            this.appState.isRecording = true;
            this.updateRecordingUI(true);
            
            // 녹음 시작 로직
            if (window.audioProcessor) {
                await window.audioProcessor.startRecording();
                this.startRecordingTimer();
            }
            
        } catch (error) {
            console.error('녹음 시작 실패:', error);
            this.showToast('녹음 시작에 실패했습니다.', 'error');
            this.resetRecordingUI();
        }
    }

    // 녹음 정지
    async stopRecording() {
        try {
            this.appState.isRecording = false;
            this.stopRecordingTimer();
            this.updateRecordingUI(false);
            
            if (window.audioProcessor) {
                const recording = await window.audioProcessor.stopRecording();
                
                // 녹음 분석
                this.analyzeRecording(recording);
            }
            
        } catch (error) {
            console.error('녹음 정지 실패:', error);
            this.showToast('녹음 정지에 실패했습니다.', 'error');
        }
    }

    // 녹음 분석
    async analyzeRecording(recording) {
        this.showLoading('음성 분석 중...');
        
        try {
            const sentence = SentenceBank.getAllSentences()[this.currentSentenceIndex];
            const analysis = await window.audioProcessor.analyzePronunciation(
                recording.buffer, 
                sentence.text
            );
            
            // 점수 계산
            const score = window.scoringEngine?.calculateSentenceScore(analysis, sentence);
            
            // 결과 저장
            this.appState.testData.sentences.push(sentence.id);
            this.appState.testData.scores.push(score);
            
            // 실시간 피드백 표시
            this.showLiveFeedback(analysis, score);
            
            // 다음 버튼 활성화
            this.uiElements.nextSentenceBtn.disabled = false;
            this.uiElements.reRecordBtn.disabled = false;
            this.uiElements.playRecordingBtn.disabled = false;
            
            this.hideLoading();
            
        } catch (error) {
            console.error('분석 실패:', error);
            this.showToast('음성 분석에 실패했습니다.', 'error');
            this.hideLoading();
        }
    }

    // 녹음 재생
    async playRecording() {
        // 녹음 재생 로직 구현
        this.showToast('녹음 재생 기능은 준비 중입니다.', 'info');
    }

    // 녹음 초기화
    resetRecording() {
        this.resetRecordingUI();
        this.hideLiveFeedback();
    }

    // 다음 문장으로 이동
    nextSentence() {
        this.currentSentenceIndex++;
        this.updateProgress();
        
        if (this.currentSentenceIndex >= SentenceBank.getTotalSentenceCount()) {
            this.completeTest();
        } else {
            this.loadCurrentSentence();
        }
    }

    // 문장 건너뛰기
    skipSentence() {
        if (confirm('이 문장을 건너뛰시겠습니까? 건너뛴 문장은 평가에 포함되지 않습니다.')) {
            this.nextSentence();
        }
    }

    // 테스트 완료
    completeTest() {
        this.stopTestTimer();
        this.appState.isTestInProgress = false;
        this.appState.testData.endTime = new Date();
        
        // 결과 계산 및 표시
        this.calculateResults();
        this.showScreen('resultScreen');
    }

    // 결과 계산
    calculateResults() {
        const scoringEngine = window.scoringEngine;
        const feedbackGenerator = window.feedbackGenerator;
        
        if (!scoringEngine || !feedbackGenerator) {
            console.error('스코어링 엔진 또는 피드백 생성기를 찾을 수 없습니다.');
            return;
        }
        
        // 라운드별 점수 계산
        const roundScores = scoringEngine.calculateRoundScores(
            this.appState.testData.scores.map((score, index) => ({
                ...score,
                sentenceId: this.appState.testData.sentences[index],
                roundName: this.getRoundNameForSentence(this.appState.testData.sentences[index])
            }))
        );
        
        // 전체 점수 계산
        const overallScore = scoringEngine.calculateOverallScore(roundScores, SentenceBank);
        
        // S레벨 계산
        const sLevel = scoringEngine.calculateSLevel(
            overallScore.score, 
            overallScore.reliability
        );
        
        // 음소 분석
        const phonemeAnalysis = scoringEngine.analyzePhonemeDetails(
            this.appState.testData.scores.map((score, index) => ({
                ...score,
                sentenceId: this.appState.testData.sentences[index],
                phonemeAnalysis: score.breakdown?.phoneme || []
            }))
        );
        
        // 강점 및 개선점 분석
        const strengths = scoringEngine.identifyStrengths(phonemeAnalysis, roundScores);
        const improvements = scoringEngine.identifyImprovements(phonemeAnalysis, roundScores);
        
        // 세션 데이터 저장
        this.sessionData = {
            sLevel: sLevel.level,
            overallScore: overallScore.score,
            reliabilityScore: overallScore.reliability,
            confidence: overallScore.confidence,
            roundScores: roundScores,
            phonemeAnalysis: phonemeAnalysis,
            strengths: strengths,
            improvements: improvements,
            timestamp: new Date().toISOString(),
            duration: this.calculateTestDuration(),
            sentencesCompleted: this.appState.testData.sentences.length
        };
        
        // 로컬 스토리지에 저장
        this.saveTestResults();
    }

    // 테스트 소요 시간 계산
    calculateTestDuration() {
        if (this.appState.testData.startTime && this.appState.testData.endTime) {
            const duration = this.appState.testData.endTime - this.appState.testData.startTime;
            return Math.round(duration / 1000); // 초 단위
        }
        return 0;
    }

    // 결과 표시
    displayResults() {
        if (!this.sessionData) return;
        
        const { sLevel, overallScore, roundScores, phonemeAnalysis, strengths, improvements } = this.sessionData;
        
        // 레벨 표시
        this.uiElements.levelTitle.textContent = sLevel;
        this.uiElements.levelDescription.textContent = 
            SentenceBank.calculateSLevel(overallScore).description;
        
        // 레벨 배지 업데이트
        this.updateFinalLevelBadge(sLevel);
        
        // 전체 점수 표시
        this.uiElements.overallScore.textContent = `${overallScore}%`;
        
        // 음소별 분석 표시
        this.displayPhonemeAnalysis(phonemeAnalysis);
        
        // 강점 표시
        this.displayStrengths(strengths);
        
        // 개선점 표시
        this.displayImprovements(improvements);
        
        // 연습 추천 표시
        this.displayPracticeRecommendations(improvements);
        
        // 원형 프로그레스 바 업데이트
        this.updateCircularProgress(overallScore);
    }

    // 최종 레벨 배지 업데이트
    updateFinalLevelBadge(level) {
        const badge = this.uiElements.finalLevelBadge;
        if (!badge) return;
        
        const levelNumber = level.replace('S', '');
        const levelLetter = badge.querySelector('.level-letter');
        const levelNumberEl = badge.querySelector('.level-number');
        
        if (levelLetter) levelLetter.textContent = 'S';
        if (levelNumberEl) levelNumberEl.textContent = levelNumber;
        
        // 레벨별 색상 적용
        const sLevelData = SentenceBank.calculateSLevel(parseInt(levelNumber) * 10);
        if (sLevelData && sLevelData.color) {
            badge.style.background = `linear-gradient(135deg, ${sLevelData.color}, ${this.adjustColor(sLevelData.color, -20)})`;
        }
    }

    // 색상 조정
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

    // 원형 프로그레스 바 업데이트
    updateCircularProgress(score) {
        const circle = document.querySelector('.progress-fill');
        if (circle) {
            const circumference = 2 * Math.PI * 35; // 반지름 35
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    // 음소 분석 표시
    displayPhonemeAnalysis(phonemeAnalysis) {
        const grid = this.uiElements.phonemeGrid;
        if (!grid) return;
        
        grid.innerHTML = '';
        
        phonemeAnalysis.forEach(phoneme => {
            const item = document.createElement('div');
            item.className = 'phoneme-item';
            
            // 점수별 색상
            let scoreColor = '#4CAF50'; // 좋음
            if (phoneme.average < 70) scoreColor = '#FF9800'; // 보통
            if (phoneme.average < 60) scoreColor = '#F44336'; // 개선 필요
            
            item.innerHTML = `
                <div class="phoneme-label">${phoneme.phoneme}</div>
                <div class="phoneme-score" style="color: ${scoreColor}">${phoneme.average}%</div>
                <div class="phoneme-category">${phoneme.category}</div>
            `;
            
            grid.appendChild(item);
        });
    }

    // 강점 표시
    displayStrengths(strengths) {
        const list = this.uiElements.strengthList;
        if (!list) return;
        
        list.innerHTML = '';
        
        strengths.forEach(strength => {
            const li = document.createElement('li');
            li.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span><strong>${strength.name}</strong>: ${strength.description}</span>
            `;
            list.appendChild(li);
        });
        
        if (strengths.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<i class="fas fa-info-circle"></i> 아직 발견된 강점이 없습니다. 계속 연습해보세요!';
            list.appendChild(li);
        }
    }

    // 개선점 표시
    displayImprovements(improvements) {
        const list = this.uiElements.improvementList;
        if (!list) return;
        
        list.innerHTML = '';
        
        improvements.forEach(improvement => {
            const li = document.createElement('li');
            const priorityIcon = improvement.priority === 'high' ? 'fa-exclamation-circle' : 
                               improvement.priority === 'medium' ? 'fa-info-circle' : 'fa-flag';
            
            li.innerHTML = `
                <i class="fas ${priorityIcon}"></i>
                <span><strong>${improvement.name}</strong> (${improvement.score}%): ${improvement.description}</span>
            `;
            list.appendChild(li);
        });
        
        if (improvements.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<i class="fas fa-check-circle"></i> 모든 영역에서 좋은 성과를 보였습니다!';
            list.appendChild(li);
        }
    }

    // 연습 추천 표시
    displayPracticeRecommendations(improvements) {
        const list = this.uiElements.practiceList;
        if (!list) return;
        
        list.innerHTML = '';
        
        const recommendations = [
            {
                title: "매일 10분 발음 연습",
                description: "기본 음소와 일상 표현 집중 연습",
                icon: "fa-calendar-day"
            },
            {
                title: "약점 음소 특별 연습",
                description: "개별 음소별 입모양과 혀 위치 연습",
                icon: "fa-dumbbell"
            },
            {
                title: "원어민 발음 모방",
                description: "영상이나 음원을 보며 따라 말하기",
                icon: "fa-headphones"
            }
        ];
        
        if (improvements.length > 0) {
            const topImprovement = improvements[0];
            recommendations.unshift({
                title: `'${topImprovement.name}' 집중 훈련`,
                description: "가장 개선이 필요한 부분에 대한 특별 연습",
                icon: "fa-bullseye"
            });
        }
        
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.innerHTML = `
                <i class="fas ${rec.icon}"></i>
                <div>
                    <strong>${rec.title}</strong>
                    <p>${rec.description}</p>
                </div>
            `;
            list.appendChild(li);
        });
    }

    // 테스트 재시작
    retakeTest() {
        if (confirm('테스트를 다시 시작하시겠습니까? 현재 진행 상황은 저장되지 않습니다.')) {
            this.resetTest();
            this.showScreen('calibrationScreen');
        }
    }

    // 결과 공유
    shareResult() {
        if (!this.sessionData) return;
        
        const text = `발음 명료도 테스트 결과: ${this.sessionData.sLevel} 레벨 (${this.sessionData.overallScore}점)\n\nPronunciation Master로 테스트해보세요!`;
        
        if (navigator.share) {
            navigator.share({
                title: '발음 명료도 테스트 결과',
                text: text,
                url: window.location.href
            });
        } else {
            // 클립보드에 복사
            navigator.clipboard.writeText(text)
                .then(() => this.showToast('결과가 클립보드에 복사되었습니다.', 'success'))
                .catch(() => this.showToast('결과 복사에 실패했습니다.', 'error'));
        }
    }

    // 리포트 다운로드
    downloadReport() {
        if (!this.sessionData) return;
        
        const feedbackGenerator = window.feedbackGenerator;
        if (!feedbackGenerator) {
            this.showToast('리포트 생성 기능을 사용할 수 없습니다.', 'error');
            return;
        }
        
        const report = feedbackGenerator.generateDetailedReport(this.sessionData);
        const reportText = JSON.stringify(report, null, 2);
        const blob = new Blob([reportText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `발음테스트_결과_${this.sessionData.sLevel}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('리포트가 다운로드되었습니다.', 'success');
    }

    // 실시간 피드백 표시
    showLiveFeedback(analysis, score) {
        const feedback = this.uiElements.liveFeedback;
        if (!feedback || !this.appState.settings.showLiveFeedback) return;
        
        feedback.classList.remove('hidden');
        
        // 명료도 점수 표시
        this.uiElements.clarityScore.textContent = `${Math.round(analysis.clarityScore)}%`;
        this.uiElements.clarityBar.style.width = `${analysis.clarityScore}%`;
        
        // 속도 평가
        const speed = analysis.features?.speechRate || 0;
        let speedText = '적정';
        let speedClass = '';
        
        if (speed < 3) {
            speedText = '느림';
            speedClass = 'slow';
        } else if (speed > 6) {
            speedText = '빠름';
            speedClass = 'fast';
        }
        
        this.uiElements.speedValue.textContent = speedText;
        this.uiElements.speedValue.className = `speed-value ${speedClass}`;
        
        // 점수 색상 업데이트
        const scoreColor = this.getScoreColor(analysis.clarityScore);
        this.uiElements.clarityBar.style.background = `linear-gradient(90deg, ${scoreColor.start}, ${scoreColor.end})`;
    }

    // 실시간 피드백 숨기기
    hideLiveFeedback() {
        const feedback = this.uiElements.liveFeedback;
        if (feedback) {
            feedback.classList.add('hidden');
        }
    }

    // 점수별 색상
    getScoreColor(score) {
        if (score >= 80) return { start: '#4CAF50', end: '#8BC34A' };
        if (score >= 60) return { start: '#FF9800', end: '#FFC107' };
        return { start: '#F44336', end: '#FF5252' };
    }

    // 녹음 UI 업데이트
    updateRecordingUI(isRecording) {
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (isRecording) {
            // 녹음 중 상태
            this.uiElements.startRecordingBtn.classList.add('hidden');
            this.uiElements.stopRecordingBtn.classList.remove('hidden');
            statusIndicator?.classList.add('recording');
            statusIndicator?.querySelector('span').textContent = '녹음 중';
        } else {
            // 대기 상태
            this.uiElements.startRecordingBtn.classList.remove('hidden');
            this.uiElements.stopRecordingBtn.classList.add('hidden');
            statusIndicator?.classList.remove('recording');
            statusIndicator?.querySelector('span').textContent = '준비';
        }
    }

    // 녹음 UI 초기화
    resetRecordingUI() {
        this.updateRecordingUI(false);
        this.uiElements.nextSentenceBtn.disabled = true;
        this.uiElements.reRecordBtn.disabled = true;
        this.uiElements.playRecordingBtn.disabled = true;
        this.hideLiveFeedback();
    }

    // 캘리브레이션 UI 초기화
    resetCalibrationUI() {
        // 볼륨 미터 초기화
        this.drawVolumeMeter(0, 0);
        
        // 결과 숨기기
        const results = document.getElementById('calibrationResults');
        if (results) {
            results.classList.add('hidden');
        }
        
        // 버튼 상태 초기화
        this.uiElements.proceedToTestBtn.disabled = true;
    }

    // 볼륨 미터 그리기
    drawVolumeMeter(volume, noise) {
        const canvas = this.uiElements.volumeMeter;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // 배경 지우기
        ctx.clearRect(0, 0, width, height);
        
        // 그라데이션 배경
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#F44336');   // 빨강: 너무 낮음
        gradient.addColorStop(0.4, '#FF9800'); // 주황: 낮음
        gradient.addColorStop(0.6, '#FFC107'); // 노랑: 보통
        gradient.addColorStop(0.8, '#8BC34A'); // 연두: 좋음
        gradient.addColorStop(1, '#4CAF50');   // 초록: 매우 좋음
        
        // 볼륨 바
        const volumeWidth = Math.min(Math.max(volume + 60, 0), 60) * (width / 60);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height * 0.3, volumeWidth, height * 0.4);
        
        // 소음 표시기
        const noiseX = Math.min(Math.max(noise + 60, 0), 60) * (width / 60);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(noiseX - 2, 0, 4, height);
        
        // 눈금 표시
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 60; i += 10) {
            const x = i * (width / 60);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    // 테스트 타이머 시작
    startTestTimer() {
        this.testStartTime = new Date();
        this.testTimer = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.testStartTime) / 1000);
            const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
            const seconds = (diff % 60).toString().padStart(2, '0');
            
            if (this.uiElements.testTimer) {
                this.uiElements.testTimer.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // 테스트 타이머 정지
    stopTestTimer() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
            this.testTimer = null;
        }
    }

    // 녹음 타이머 시작
    startRecordingTimer() {
        let seconds = 0;
        this.recordingTimer = setInterval(() => {
            seconds++;
            const displaySeconds = seconds % 60;
            const minutes = Math.floor(seconds / 60);
            
            if (this.uiElements.recordingTimer) {
                this.uiElements.recordingTimer.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
            }
            
            // 최대 녹음 시간 (30초)
            if (seconds >= 30) {
                this.stopRecording();
            }
        }, 1000);
    }

    // 녹음 타이머 정지
    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    // 단계 표시기 업데이트
    updateStepIndicator(step) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((s, index) => {
            if (index + 1 <= step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }

    // 문장의 라운드 이름 가져오기
    getRoundNameForSentence(sentenceId) {
        const sentences = SentenceBank.getAllSentences();
        const sentence = sentences.find(s => s.id === sentenceId);
        return sentence?.roundName || '기타';
    }

    // 테스트 상태 초기화
    resetTest() {
        this.currentSentenceIndex = 0;
        this.currentRoundIndex = 0;
        this.appState.isTestInProgress = false;
        this.appState.testData = {
            sentences: [],
            scores: [],
            startTime: null,
            endTime: null
        };
        
        this.stopTestTimer();
        this.stopRecordingTimer();
        
        if (window.scoringEngine) {
            window.scoringEngine.reset();
        }
    }

    // 설정 로드
    loadSettings() {
        const saved = localStorage.getItem('pronunciationMasterSettings');
        if (saved) {
            this.appState.settings = { ...this.appState.settings, ...JSON.parse(saved) };
        }
    }

    // 설정 저장
    saveSettings() {
        localStorage.setItem('pronunciationMasterSettings', JSON.stringify(this.appState.settings));
    }

    // 테스트 결과 저장
    saveTestResults() {
        if (!this.sessionData) return;
        
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        history.push({
            ...this.sessionData,
            id: Date.now()
        });
        
        // 최대 10개만 저장
        if (history.length > 10) {
            history.shift();
        }
        
        localStorage.setItem('testHistory', JSON.stringify(history));
        localStorage.setItem('previousSLevel', this.sessionData.sLevel);
        
        // 레벨 배지 업데이트
        this.updateLevelBadge(this.sessionData.sLevel);
    }

    // 모달 표시
    showModal() {
        if (this.uiElements.infoModal) {
            this.uiElements.infoModal.classList.remove('hidden');
        }
    }

    // 모달 숨기기
    hideModal() {
        if (this.uiElements.infoModal) {
            this.uiElements.infoModal.classList.add('hidden');
        }
    }

    // 로딩 표시
    showLoading(message = '처리 중...') {
        if (this.uiElements.loadingOverlay) {
            const messageEl = this.uiElements.loadingOverlay.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            this.uiElements.loadingOverlay.classList.remove('hidden');
        }
    }

    // 로딩 숨기기
    hideLoading() {
        if (this.uiElements.loadingOverlay) {
            this.uiElements.loadingOverlay.classList.add('hidden');
        }
    }

    // 토스트 메시지 표시
    showToast(message, type = 'info') {
        // 기존 토스트 제거
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas ${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // 애니메이션
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 자동 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 토스트 아이콘
    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // 키보드 입력 처리
    handleKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.currentScreen === 'testScreen') {
                    if (this.appState.isRecording) {
                        this.stopRecording();
                    } else {
                        this.startRecording();
                    }
                }
                break;
            case 'Enter':
                if (this.currentScreen === 'testScreen' && !this.uiElements.nextSentenceBtn.disabled) {
                    this.nextSentence();
                }
                break;
            case 'Escape':
                if (this.currentScreen === 'calibrationScreen') {
                    this.showScreen('startScreen');
                }
                break;
        }
    }

    // 리소스 정리
    cleanup() {
        this.stopTestTimer();
        this.stopRecordingTimer();
        
        if (window.audioProcessor) {
            window.audioProcessor.cleanup();
        }
        
        // 음성 합성 정지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

// 글로벌에서 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}

// 토스트 스타일 동적 추가
(function() {
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
})();
