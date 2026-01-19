// ui-manager/ui-elements.js

import { CONSTANTS, DIFFICULTY_LABELS } from './constants.js';
import { adjustColor } from './utils.js';

export class UIElementsManager {
    constructor() {
        this.elements = {};
        this.screens = {};
        this.eventListeners = new Map();
    }

    initialize() {
        this.cacheElements();
        this.setupEventDelegation();
        this.injectToastStyles();
        return this;
    }

    cacheElements() {
        // 화면 요소
        this.screens = {
            startScreen: document.getElementById('startScreen'),
            calibrationScreen: document.getElementById('calibrationScreen'),
            testScreen: document.getElementById('testScreen'),
            resultScreen: document.getElementById('resultScreen')
        };

        // 버튼 요소
        this.elements = {
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
            practiceList: document.getElementById('practiceList'),
            
            // 모달 및 로딩
            infoModal: document.getElementById('infoModal'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            modalClose: document.querySelector('.modal-close')
        };
    }

    setupEventDelegation() {
        // 데이터 속성을 통한 이벤트 위임
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (target) {
                const action = target.dataset.action;
                this.emit('action', { action, element: target, event: e });
            }
        });

        // 엘리먼트 이벤트 저장을 위한 구조
        this.eventListeners.set('action', []);
    }

    on(event, callback) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.push(callback);
        this.eventListeners.set(event, listeners);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }

    updateElement(id, updates) {
        const element = typeof id === 'string' ? this.elements[id] : id;
        if (!element) return false;

        if (updates.text !== undefined) {
            element.textContent = updates.text;
        }
        if (updates.html !== undefined) {
            element.innerHTML = updates.html;
        }
        if (updates.className !== undefined) {
            element.className = updates.className;
        }
        if (updates.style !== undefined) {
            Object.assign(element.style, updates.style);
        }
        if (updates.disabled !== undefined) {
            element.disabled = updates.disabled;
        }
        if (updates.hidden !== undefined) {
            element.classList.toggle('hidden', updates.hidden);
        }

        return true;
    }

    updateDifficultyBadge(difficulty) {
        const badge = this.elements.difficultyBadge;
        if (!badge) return;

        const label = DIFFICULTY_LABELS[difficulty] || difficulty;
        this.updateElement(badge, {
            text: label,
            className: `difficulty-badge ${difficulty}`
        });
    }

    updatePhonemeTags(phonemeTags) {
        const container = this.elements.phonemeTags;
        if (!container) return;

        container.innerHTML = '';
        
        phonemeTags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'phoneme-tag';
            span.textContent = tag.name;
            span.style.backgroundColor = tag.color + '20';
            span.style.color = tag.color;
            span.style.border = `1px solid ${tag.color}`;
            span.title = tag.description;
            
            container.appendChild(span);
        });
    }

    updateProgress(current, total) {
        const progress = ((current) / total) * 100;
        const progressFill = this.elements.progressFill;
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    updateLevelBadge(level) {
        const badge = this.elements.currentLevel;
        if (badge) {
            const levelNumber = level.replace('S', '');
            badge.innerHTML = `<span>S${levelNumber}</span>`;
        }
    }

    updateRecordingUI(isRecording) {
        const statusIndicator = document.querySelector('.status-indicator');
        
        this.updateElement(this.elements.startRecordingBtn, {
            hidden: isRecording
        });
        
        this.updateElement(this.elements.stopRecordingBtn, {
            hidden: !isRecording
        });
        
        if (statusIndicator) {
            statusIndicator.classList.toggle('recording', isRecording);
            const span = statusIndicator.querySelector('span');
            if (span) {
                span.textContent = isRecording ? '녹음 중' : '준비';
            }
        }
    }

    drawVolumeMeter(volume, noise) {
        const canvas = this.elements.volumeMeter;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // 배경 지우기
        ctx.clearRect(0, 0, width, height);

        // 그라데이션 배경
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#F44336');
        gradient.addColorStop(0.4, '#FF9800');
        gradient.addColorStop(0.6, '#FFC107');
        gradient.addColorStop(0.8, '#8BC34A');
        gradient.addColorStop(1, '#4CAF50');

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

    injectToastStyles() {
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

    destroy() {
        // 모든 이벤트 리스너 제거
        this.eventListeners.clear();
        
        // 참조 해제
        this.elements = null;
        this.screens = null;
    }
}
