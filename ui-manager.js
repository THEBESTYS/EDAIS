// ui-manager/ui-manager.js

import { CONSTANTS, DEFAULT_SETTINGS } from './constants.js';
import { AsyncQueue, SafeExecutor, PerformanceTracker, formatDuration } from './utils.js';
import { UIElementsManager } from './ui-elements.js';
import { ScreenManager } from './screen-manager.js';
import { FeedbackManager } from './feedback-manager.js';

export class UIManager {
    constructor(dependencies = {}) {
        // 의존성 주입
        this.audioProcessor = dependencies.audioProcessor || window.audioProcessor;
        this.scoringEngine = dependencies.scoringEngine || window.scoringEngine;
        this.feedbackGenerator = dependencies.feedbackGenerator || window.feedbackGenerator;
        this.sentenceBank = dependencies.sentenceBank || window.SentenceBank;

        // 모듈 초기화
        this.ui = new UIElementsManager().initialize();
        this.screen = new ScreenManager(this.ui);
        this.feedback = new FeedbackManager(this.ui);
        
        // 상태 관리
        this.state = {
            currentSentenceIndex: 0,
            currentRoundIndex: 0,
            isCalibrated: false,
            isRecording: false,
            isPlayingReference: false,
            isTestInProgress: false,
            referencePlayCount: 0,
            calibrationData: null,
            testData: {
                sentences: [],
                scores: [],
                startTime: null,
                endTime: null
            },
            settings: { ...DEFAULT_SETTINGS }
        };
        
        // 유틸리티
        this.asyncQueue = new AsyncQueue();
        this.safeExecutor = new SafeExecutor();
        this.performanceTracker = new PerformanceTracker();
        
        // 타이머
        this.timers = {
            testTimer: null,
            recordingTimer: null,
            recordingSeconds: 0
        };
        
        // 세션 데이터
        this.sessionData = null;
        
        // 초기화
        this.initialize();
    }

    async initialize() {
        await this.bindEvents();
        await this.loadSettings();
        await this.loadPreviousResults();
        
        this.ui.emit('initialized', { timestamp: new Date() });
    }

    async bindEvents() {
        // UI 요소 이벤트 위임 처리
        const unbind = this.ui.on('action', async (data) => {
            await this.handleAction(data.action, data.element, data.event);
        });

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // 이벤트 언바인드 함수 저장
        this.unbindEvents = unbind;
    }

    async handleAction(action, element, event) {
        event?.preventDefault();
        
        this.performanceTracker.mark(`action_${action}_start`);
        
        try {
            switch(action) {
                case 'start':
                    await this.startTestFlow();
                    break;
                case 'back':
                    await this.goBack();
                    break;
                case 'record':
                    await this.toggleRecording();
                    break;
                case 'playReference':
                    await this.playReferenceAudio();
                    break;
                case 'nextSentence':
                    await this.nextSentence();
                    break;
                case 'skipSentence':
                    await this.skipSentence();
                    break;
                case 'retakeTest':
                    await this.retakeTest();
                    break;
                case 'shareResult':
                    await this.shareResult();
                    break;
                case 'downloadReport':
                    await this.downloadReport();
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Action ${action} failed:`, error);
            this.feedback.showToast(`${action} 작업 중 오류가 발생했습니다.`, 'error');
        } finally {
            this.performanceTracker.measure(
                `action_${action}_start`,
                `action_${action}_end`,
                action
            );
        }
    }

    async startTestFlow() {
        if (!this.state.isCalibrated) {
            this.screen.showScreen(CONSTANTS.SCREENS.CALIBRATION);
            this.screen.updateStepIndicator(1);
        } else {
            await this.startTest();
        }
    }

    async startTest() {
        if (!this.state.calibrationData?.isValid) {
            this.feedback.showToast('마이크 캘리브레이션을 먼저 완료해주세요.', 'error');
            return;
        }

        this.state.currentSentenceIndex = 0;
        this.state.testData = {
            sentences: [],
            scores: [],
            startTime: new Date(),
            endTime: null
        };

        this.state.isTestInProgress = true;
        this.screen.showScreen(CONSTANTS.SCREENS.TEST);
        
        await this.loadCurrentSentence();
        this.startTestTimer();
    }

    async loadCurrentSentence() {
        const sentences = this.sentenceBank?.getAllSentences();
        if (!sentences || this.state.currentSentenceIndex >= sentences.length) {
            await this.completeTest();
            return;
        }

        const sentence = sentences[this.state.currentSentenceIndex];
        const analysis = this.sentenceBank?.getSentenceAnalysis(sentence.id);

        // UI 업데이트
        this.ui.updateElement('currentSentenceText', { text: sentence.text });
        this.ui.updateElement('currentSentence', { text: this.state.currentSentenceIndex + 1 });
        this.ui.updateElement('totalSentences', { text: sentences.length });
        
        this.ui.updateDifficultyBadge(sentence.difficulty);
        
        if (analysis?.phonemeTags) {
            this.ui.updatePhonemeTags(analysis.phonemeTags);
        }

        // 진행 상태 업데이트
        this.ui.updateProgress(this.state.currentSentenceIndex, sentences.length);

        // 녹음 상태 초기화
        this.resetRecording();

        // 참조 음성 재생 횟수 초기화
        this.state.referencePlayCount = 0;
        this.updatePlayCount();

        // 자동 재생 설정
        if (this.state.settings.autoPlayReference) {
            setTimeout(() => this.playReferenceAudio(), 500);
        }
    }

    async playReferenceAudio() {
        if (this.state.referencePlayCount >= CONSTANTS.MAX_REFERENCE_PLAYS) {
            this.feedback.showToast('참조 음성은 최대 3번까지 재생할 수 있습니다.', 'warning');
            return;
        }

        try {
            this.state.isPlayingReference = true;
            this.ui.updateElement('playReferenceBtn', {
                disabled: true,
                html: '<i class="fas fa-volume-up"></i> 재생 중...'
            });

            // 음성 재생 로직
            await this.speakText(this.ui.elements.currentSentenceText.textContent);

            this.state.referencePlayCount++;
            this.updatePlayCount();

            setTimeout(() => {
                this.state.isPlayingReference = false;
                this.ui.updateElement('playReferenceBtn', {
                    disabled: false,
                    html: '<i class="fas fa-volume-up"></i> 원어민 발음 듣기'
                });
            }, 2000);

        } catch (error) {
            console.error('참조 음성 재생 실패:', error);
            this.feedback.showToast('참조 음성 재생에 실패했습니다.', 'error');
        }
    }

    updatePlayCount() {
        const countElement = document.getElementById('playCount');
        if (countElement) {
            countElement.textContent = CONSTANTS.MAX_REFERENCE_PLAYS - this.state.referencePlayCount;
        }
    }

    async speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            return new Promise((resolve, reject) => {
                utterance.onend = resolve;
                utterance.onerror = reject;
                window.speechSynthesis.speak(utterance);
            });
        }
        return Promise.resolve();
    }

    async toggleRecording() {
        if (this.state.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            this.state.isRecording = true;
            this.ui.updateRecordingUI(true);

            if (this.audioProcessor) {
                await this.audioProcessor.startRecording();
                this.startRecordingTimer();
            }

        } catch (error) {
            console.error('녹음 시작 실패:', error);
            this.feedback.showToast('녹음 시작에 실패했습니다.', 'error');
            this.resetRecording();
        }
    }

    async stopRecording() {
        try {
            this.state.isRecording = false;
            this.stopRecordingTimer();
            this.ui.updateRecordingUI(false);

            if (this.audioProcessor) {
                const recording = await this.audioProcessor.stopRecording();
                await this.analyzeRecording(recording);
            }

        } catch (error) {
            console.error('녹음 정지 실패:', error);
            this.feedback.showToast('녹음 정지에 실패했습니다.', 'error');
        }
    }

    async analyzeRecording(recording) {
        this.feedback.showLoading('음성 분석 중...');

        try {
            const sentences = this.sentenceBank?.getAllSentences();
            const sentence = sentences[this.state.currentSentenceIndex];
            
            const analysis = await this.audioProcessor.analyzePronunciation(
                recording.buffer, 
                sentence.text
            );

            // 점수 계산
            const score = this.scoringEngine?.calculateSentenceScore(analysis, sentence);

            // 결과 저장
            this.state.testData.sentences.push(sentence.id);
            this.state.testData.scores.push(score);

            // 피드백 표시
            this.feedback.showLiveFeedback(analysis, score);

            // 버튼 활성화
            this.ui.updateElement('nextSentenceBtn', { disabled: false });
            this.ui.updateElement('reRecordBtn', { disabled: false });
            this.ui.updateElement('playRecordingBtn', { disabled: false });

        } catch (error) {
            console.error('분석 실패:', error);
            this.feedback.showToast('음성 분석에 실패했습니다.', 'error');
        } finally {
            this.feedback.hideLoading();
        }
    }

    async nextSentence() {
        this.state.currentSentenceIndex++;
        const sentences = this.sentenceBank?.getAllSentences();
        
        this.ui.updateProgress(this.state.currentSentenceIndex, sentences.length);

        if (this.state.currentSentenceIndex >= sentences.length) {
            await this.completeTest();
        } else {
            await this.loadCurrentSentence();
        }
    }

    async skipSentence() {
        if (confirm('이 문장을 건너뛰시겠습니까? 건너뛴 문장은 평가에 포함되지 않습니다.')) {
            await this.nextSentence();
        }
    }

    resetRecording() {
        this.ui.updateRecordingUI(false);
        this.ui.updateElement('nextSentenceBtn', { disabled: true });
        this.ui.updateElement('reRecordBtn', { disabled: true });
        this.ui.updateElement('playRecordingBtn', { disabled: true });
        this.feedback.hideLiveFeedback();
        this.timers.recordingSeconds = 0;
    }

    async completeTest() {
        this.stopTestTimer();
        this.state.isTestInProgress = false;
        this.state.testData.endTime = new Date();

        // 결과 계산
        await this.calculateResults();
        
        // 결과 화면 표시
        this.screen.showScreen(CONSTANTS.SCREENS.RESULT);
        this.feedback.displayResults(this.sessionData);
    }

    async calculateResults() {
        if (!this.scoringEngine || !this.feedbackGenerator) {
            console.error('스코어링 엔진 또는 피드백 생성기를 찾을 수 없습니다.');
            return;
        }

        // 라운드별 점수 계산
        const roundScores = this.scoringEngine.calculateRoundScores(
            this.state.testData.scores.map((score, index) => ({
                ...score,
                sentenceId: this.state.testData.sentences[index],
                roundName: this.getRoundNameForSentence(this.state.testData.sentences[index])
            }))
        );

        // 전체 점수 계산
        const overallScore = this.scoringEngine.calculateOverallScore(roundScores, this.sentenceBank);

        // S레벨 계산
        const sLevel = this.scoringEngine.calculateSLevel(
            overallScore.score, 
            overallScore.reliability
        );

        // 음소 분석
        const phonemeAnalysis = this.scoringEngine.analyzePhonemeDetails(
            this.state.testData.scores.map((score, index) => ({
                ...score,
                sentenceId: this.state.testData.sentences[index],
                phonemeAnalysis: score.breakdown?.phoneme || []
            }))
        );

        // 강점 및 개선점 분석
        const strengths = this.scoringEngine.identifyStrengths(phonemeAnalysis, roundScores);
        const improvements = this.scoringEngine.identifyImprovements(phonemeAnalysis, roundScores);

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
            sentencesCompleted: this.state.testData.sentences.length
        };

        // 저장
        await this.saveTestResults();
    }

    calculateTestDuration() {
        if (this.state.testData.startTime && this.state.testData.endTime) {
            const duration = this.state.testData.endTime - this.state.testData.startTime;
            return Math.round(duration / 1000);
        }
        return 0;
    }

    getRoundNameForSentence(sentenceId) {
        const sentences = this.sentenceBank?.getAllSentences();
        const sentence = sentences?.find(s => s.id === sentenceId);
        return sentence?.roundName || '기타';
    }

    startTestTimer() {
        this.timers.testStartTime = new Date();
        this.timers.testTimer = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.timers.testStartTime) / 1000);
            
            if (this.ui.elements.testTimer) {
                this.ui.elements.testTimer.textContent = formatDuration(diff);
            }
        }, 1000);
    }

    stopTestTimer() {
        if (this.timers.testTimer) {
            clearInterval(this.timers.testTimer);
            this.timers.testTimer = null;
        }
    }

    startRecordingTimer() {
        this.timers.recordingSeconds = 0;
        this.timers.recordingTimer = setInterval(() => {
            this.timers.recordingSeconds++;
            
            if (this.ui.elements.recordingTimer) {
                this.ui.elements.recordingTimer.textContent = 
                    formatDuration(this.timers.recordingSeconds);
            }

            // 최대 녹음 시간
            if (this.timers.recordingSeconds >= CONSTANTS.MAX_RECORDING_TIME) {
                this.stopRecording();
            }
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.timers.recordingTimer) {
            clearInterval(this.timers.recordingTimer);
            this.timers.recordingTimer = null;
        }
    }

    async loadSettings() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEYS.SETTINGS);
            if (saved) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('설정 로드 실패:', error);
        }
    }

    async saveSettings() {
        try {
            localStorage.setItem(
                CONSTANTS.STORAGE_KEYS.SETTINGS,
                JSON.stringify(this.state.settings)
            );
        } catch (error) {
            console.error('설정 저장 실패:', error);
        }
    }

    async loadPreviousResults() {
        try {
            const previousLevel = localStorage.getItem(CONSTANTS.STORAGE_KEYS.PREVIOUS_LEVEL);
            if (previousLevel) {
                this.ui.updateLevelBadge(previousLevel);
            }
        } catch (error) {
            console.error('이전 결과 로드 실패:', error);
        }
    }

    async saveTestResults() {
        if (!this.sessionData) return;

        try {
            const history = JSON.parse(
                localStorage.getItem(CONSTANTS.STORAGE_KEYS.HISTORY) || '[]'
            );
            
            history.push({
                ...this.sessionData,
                id: Date.now()
            });

            // 최대 개수 유지
            if (history.length > CONSTANTS.MAX_HISTORY_ITEMS) {
                history.shift();
            }

            localStorage.setItem(CONSTANTS.STORAGE_KEYS.HISTORY, JSON.stringify(history));
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.PREVIOUS_LEVEL, this.sessionData.sLevel);

            this.ui.updateLevelBadge(this.sessionData.sLevel);

        } catch (error) {
            console.error('테스트 결과 저장 실패:', error);
        }
    }

    async retakeTest() {
        if (confirm('테스트를 다시 시작하시겠습니까? 현재 진행 상황은 저장되지 않습니다.')) {
            this.resetTest();
            this.screen.showScreen(CONSTANTS.SCREENS.CALIBRATION);
        }
    }

    async shareResult() {
        if (!this.sessionData) return;

        const text = `발음 명료도 테스트 결과: ${this.sessionData.sLevel} 레벨 (${this.sessionData.overallScore}점)\n\nPronunciation Master로 테스트해보세요!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '발음 명료도 테스트 결과',
                    text: text,
                    url: window.location.href
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    await this.copyToClipboard(text);
                }
            }
        } else {
            await this.copyToClipboard(text);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.feedback.showToast('결과가 클립보드에 복사되었습니다.', 'success');
        } catch (error) {
            this.feedback.showToast('결과 복사에 실패했습니다.', 'error');
        }
    }

    async downloadReport() {
        if (!this.sessionData || !this.feedbackGenerator) {
            this.feedback.showToast('리포트 생성 기능을 사용할 수 없습니다.', 'error');
            return;
        }

        try {
            const report = this.feedbackGenerator.generateDetailedReport(this.sessionData);
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

            this.feedback.showToast('리포트가 다운로드되었습니다.', 'success');
        } catch (error) {
            console.error('리포트 다운로드 실패:', error);
            this.feedback.showToast('리포트 다운로드에 실패했습니다.', 'error');
        }
    }

    async goBack() {
        if (this.screen.currentScreen === CONSTANTS.SCREENS.CALIBRATION) {
            this.screen.showScreen(CONSTANTS.SCREENS.START);
        }
    }

    handleKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (this.screen.currentScreen === CONSTANTS.SCREENS.TEST) {
                    this.toggleRecording();
                }
                break;
            case 'Enter':
                if (this.screen.currentScreen === CONSTANTS.SCREENS.TEST && 
                    !this.ui.elements.nextSentenceBtn.disabled) {
                    this.nextSentence();
                }
                break;
            case 'Escape':
                if (this.screen.currentScreen === CONSTANTS.SCREENS.CALIBRATION) {
                    this.screen.showScreen(CONSTANTS.SCREENS.START);
                }
                break;
        }
    }

    resetTest() {
        this.state.currentSentenceIndex = 0;
        this.state.currentRoundIndex = 0;
        this.state.isTestInProgress = false;
        this.state.testData = {
            sentences: [],
            scores: [],
            startTime: null,
            endTime: null
        };

        this.stopTestTimer();
        this.stopRecordingTimer();

        if (this.scoringEngine) {
            this.scoringEngine.reset();
        }
    }

    cleanup() {
        // 타이머 정리
        this.stopTestTimer();
        this.stopRecordingTimer();

        // 이벤트 리스너 정리
        if (this.unbindEvents) {
            this.unbindEvents();
        }

        // 모듈 정리
        this.ui.destroy();
        this.feedback.clearAll();

        // 오디오 정리
        if (this.audioProcessor) {
            this.audioProcessor.cleanup();
        }

        // 음성 합성 정지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // 성능 데이터 로깅 (선택 사항)
        const stats = this.performanceTracker.getStats();
        if (stats.length > 0) {
            console.log('Performance stats:', stats);
        }
    }

    // 공개 메서드
    getState() {
        return { ...this.state };
    }

    getSessionData() {
        return this.sessionData ? { ...this.sessionData } : null;
    }

    updateSetting(key, value) {
        if (key in this.state.settings) {
            this.state.settings[key] = value;
            this.saveSettings();
            return true;
        }
        return false;
    }

    showScreen(screenId) {
        return this.screen.showScreen(screenId);
    }

    showToast(message, type = 'info') {
        return this.feedback.showToast(message, type);
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
