// ui-manager/feedback-manager.js

import { CONSTANTS, SCORE_COLOR_MAP } from './constants.js';
import { formatDuration, adjustColor } from './utils.js';

export class FeedbackManager {
    constructor(uiElements) {
        this.uiElements = uiElements;
        this.toastQueue = [];
        this.isShowingToast = false;
    }

    showToast(message, type = 'info') {
        // 큐에 추가
        this.toastQueue.push({ message, type, timestamp: Date.now() });
        
        // 이미 표시 중이 아니면 처리 시작
        if (!this.isShowingToast) {
            this.processToastQueue();
        }
    }

    async processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isShowingToast = false;
            return;
        }

        this.isShowingToast = true;
        const { message, type } = this.toastQueue.shift();
        
        await this.displayToast(message, type);
        
        // 지연 후 다음 토스트 처리
        setTimeout(() => {
            this.processToastQueue();
        }, CONSTANTS.ANIMATION_DURATION.TOAST);
    }

    displayToast(message, type) {
        return new Promise((resolve) => {
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
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                    resolve();
                }, 300);
            }, CONSTANTS.ANIMATION_DURATION.TOAST - 300);
        });
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

    showLoading(message = '처리 중...') {
        const loadingOverlay = this.uiElements.elements.loadingOverlay;
        if (!loadingOverlay) return;

        const messageEl = loadingOverlay.querySelector('p');
        if (messageEl) {
            messageEl.textContent = message;
        }
        loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        const loadingOverlay = this.uiElements.elements.loadingOverlay;
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    showModal(modalId = 'infoModal') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId = 'infoModal') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showLiveFeedback(analysis, score) {
        const feedback = this.uiElements.elements.liveFeedback;
        if (!feedback) return;

        feedback.classList.remove('hidden');

        // 명료도 점수 표시
        const clarityScore = Math.round(analysis.clarityScore);
        this.uiElements.updateElement('clarityScore', {
            text: `${clarityScore}%`
        });

        this.uiElements.updateElement('clarityBar', {
            style: {
                width: `${clarityScore}%`,
                background: this.getScoreGradient(clarityScore)
            }
        });

        // 속도 평가
        const speed = analysis.features?.speechRate || 0;
        const { text: speedText, className: speedClass } = this.getSpeedFeedback(speed);
        
        this.uiElements.updateElement('speedValue', {
            text: speedText,
            className: `speed-value ${speedClass}`
        });
    }

    hideLiveFeedback() {
        const feedback = this.uiElements.elements.liveFeedback;
        if (feedback) {
            feedback.classList.add('hidden');
        }
    }

    getScoreGradient(score) {
        let startColor, endColor;
        
        if (score >= 80) {
            startColor = CONSTANTS.COLORS.SUCCESS.start;
            endColor = CONSTANTS.COLORS.SUCCESS.end;
        } else if (score >= 60) {
            startColor = CONSTANTS.COLORS.WARNING.start;
            endColor = CONSTANTS.COLORS.WARNING.end;
        } else {
            startColor = CONSTANTS.COLORS.ERROR.start;
            endColor = CONSTANTS.COLORS.ERROR.end;
        }
        
        return `linear-gradient(90deg, ${startColor}, ${endColor})`;
    }

    getSpeedFeedback(speed) {
        if (speed < 3) return { text: '느림', className: 'slow' };
        if (speed > 6) return { text: '빠름', className: 'fast' };
        return { text: '적정', className: 'normal' };
    }

    displayResults(sessionData) {
        if (!sessionData) return;

        const { sLevel, overallScore, roundScores, phonemeAnalysis, strengths, improvements } = sessionData;

        // 레벨 표시
        this.uiElements.updateElement('levelTitle', { text: sLevel });
        
        // 레벨 배지 업데이트
        this.updateFinalLevelBadge(sLevel);
        
        // 전체 점수 표시
        this.uiElements.updateElement('overallScore', { text: `${overallScore}%` });
        
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

    updateFinalLevelBadge(level) {
        const badge = this.uiElements.elements.finalLevelBadge;
        if (!badge) return;

        const levelNumber = level.replace('S', '');
        const levelLetter = badge.querySelector('.level-letter');
        const levelNumberEl = badge.querySelector('.level-number');

        if (levelLetter) levelLetter.textContent = 'S';
        if (levelNumberEl) levelNumberEl.textContent = levelNumber;

        // 색상 적용
        const sLevelData = this.getSLevelData(parseInt(levelNumber));
        if (sLevelData?.color) {
            badge.style.background = `linear-gradient(135deg, ${sLevelData.color}, ${adjustColor(sLevelData.color, -20)})`;
        }
    }

    getSLevelData(level) {
        // 레벨 데이터 매핑 (실제 구현에서는 SentenceBank에서 가져옴)
        const levels = {
            1: { color: '#4CAF50', description: '초보자' },
            2: { color: '#8BC34A', description: '초급자' },
            3: { color: '#FFC107', description: '중급자' },
            4: { color: '#FF9800', description: '상급자' },
            5: { color: '#F44336', description: '전문가' }
        };
        
        return levels[level] || { color: '#9E9E9E', description: '미분류' };
    }

    updateCircularProgress(score) {
        const circle = document.querySelector('.progress-fill');
        if (circle) {
            const circumference = 2 * Math.PI * 35;
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    displayPhonemeAnalysis(phonemeAnalysis) {
        const grid = this.uiElements.elements.phonemeGrid;
        if (!grid) return;

        grid.innerHTML = '';

        phonemeAnalysis.forEach(phoneme => {
            const item = document.createElement('div');
            item.className = 'phoneme-item';
            
            // 점수별 색상
            let scoreColor = '#4CAF50';
            if (phoneme.average < 70) scoreColor = '#FF9800';
            if (phoneme.average < 60) scoreColor = '#F44336';
            
            item.innerHTML = `
                <div class="phoneme-label">${phoneme.phoneme}</div>
                <div class="phoneme-score" style="color: ${scoreColor}">${phoneme.average}%</div>
                <div class="phoneme-category">${phoneme.category}</div>
            `;
            
            grid.appendChild(item);
        });
    }

    displayStrengths(strengths) {
        const list = this.uiElements.elements.strengthList;
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

    displayImprovements(improvements) {
        const list = this.uiElements.elements.improvementList;
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

    displayPracticeRecommendations(improvements) {
        const list = this.uiElements.elements.practiceList;
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

    clearAll() {
        this.toastQueue = [];
        this.isShowingToast = false;
    }
}
