// feedback-generator.js - 상세 피드백 및 개선 추천 생성기

class FeedbackGenerator {
    constructor() {
        this.feedbackTemplates = {
            // S레벨별 메인 피드백
            sLevel: {
                S1: {
                    main: "기본 음소 발음부터 체계적으로 연습할 필요가 있습니다.",
                    encouragement: "처음에는 모두 어려워요. 한 단계씩 차근차근 연습해보세요!",
                    focus: "개별 음소의 입모양과 혀 위치에 집중하세요."
                },
                S2: {
                    main: "일부 단어만 명확하게 발음할 수 있습니다.",
                    encouragement: "이미 기본적인 발음을 할 수 있어요! 조금만 더 연습하면 좋아질 거예요.",
                    focus: "모음의 길이 차이를 인식하고 연습하세요."
                },
                S3: {
                    main: "간단한 문장은 맥락으로 이해할 수 있습니다.",
                    encouragement: "의사소통의 기초를 갖췄어요! 이제 더 자연스럽게 만들어봅시다.",
                    focus: "단어 끝 소리를 완성하는 데 집중하세요."
                },
                S4: {
                    main: "기본적인 의사소통이 가능하지만 자주 반복이 필요합니다.",
                    encouragement: "잘 하고 있어요! 이제 더 정확한 발음을 목표로 해보세요.",
                    focus: "단어의 강세 위치를 정확히 파악하세요."
                },
                S5: {
                    main: "일상 대화의 대부분을 이해할 수 있습니다.",
                    encouragement: "훌륭해요! 이제 더 자연스러운 발음을 위한 마지막 단계예요.",
                    focus: "단어 연결 시 연음 현상을 의식하세요."
                },
                S6: {
                    main: "원활한 의사소통이 가능한 수준입니다.",
                    encouragement: "정말 잘하고 있어요! 이제 마무리 다듬기 단계입니다.",
                    focus: "억양 곡선을 부드럽게 만드세요."
                },
                S7: {
                    main: "매우 명확한 발음, 가끔 억양이 부자연스러울 수 있습니다.",
                    encouragement: "원어민에 가까운 발음이에요! 마지막 세부 조정만 하면 됩니다.",
                    focus: "속도 변화를 자연스럽게 조절하세요."
                },
                S8: {
                    main: "원어민에 매우 가까운 발음입니다.",
                    encouragement: "놀라운 실력이에요! 전문가 수준의 발음을 하고 계세요.",
                    focus: "지역별 억양 차이에 주의하세요."
                },
                S9: {
                    main: "사실상 원어민과 구분하기 어려운 수준입니다.",
                    encouragement: "완벽에 가까운 발음이에요! 정말 대단합니다.",
                    focus: "특정 관용구 발음을 완벽하게 만들기"
                },
                S10: {
                    main: "완벽한 발음 명료도입니다.",
                    encouragement: "축하합니다! 당신은 발음 마스터입니다.",
                    focus: "다른 사람을 가르칠 수 있는 수준입니다."
                }
            },

            // 점수 범위별 피드백
            scoreRange: {
                excellent: {
                    title: "훌륭합니다!",
                    message: "거의 완벽한 발음이에요. 세부적인 부분만 조정하면 됩니다.",
                    icon: "🏆"
                },
                good: {
                    title: "잘 했어요!",
                    message: "좋은 발음이에요. 몇 가지 부분만 개선하면 더 좋아질 거예요.",
                    icon: "⭐"
                },
                fair: {
                    title: "괜찮아요",
                    message: "의사소통에는 문제가 없지만, 더 정확한 발음을 위해 연습이 필요해요.",
                    icon: "👍"
                },
                poor: {
                    title: "개선이 필요해요",
                    message: "기본적인 발음 연습부터 시작하는 것이 좋아요.",
                    icon: "💪"
                }
            },

            // 음소별 피드백
            phoneme: {
                'L/R': {
                    good: "L과 R 발음을 잘 구분하고 있어요!",
                    fair: "L과 R 발음이 가끔 혼동되네요.",
                    poor: "L과 R 발음을 구분하는 데 어려움이 있어요.",
                    tip: "L 발음은 혀끝을 윗니 뒤쪽에, R 발음은 혀를 뒤로 말아 올려보세요."
                },
                'P/F': {
                    good: "P와 F 발음이 매우 명확해요!",
                    fair: "P와 F 발음이 약간 모호할 때가 있어요.",
                    poor: "P와 F 발음의 차이를 명확히 해야 해요.",
                    tip: "P는 입술을 딱 붙였다가 터트리고, F는 윗니를 아랫입술에 대고 공기를 내보내세요."
                },
                'TH': {
                    good: "TH 발음이 완벽해요!",
                    fair: "TH 발음이 가끔 다른 소리로 들려요.",
                    poor: "TH 발음을 다른 소리로 대체하고 있어요.",
                    tip: "혀를 윗니와 아랫니 사이에 살짝 끼우고 발음해보세요."
                },
                'Vowels': {
                    good: "모음 발음이 매우 정확해요!",
                    fair: "모음의 길이 차이를 더 명확히 해야 해요.",
                    poor: "모음 발음에 집중이 필요해요.",
                    tip: "장모음은 입모양을 오래 유지하고, 단모음은 짧고 경쾌하게 발음하세요."
                },
                'Intonation': {
                    good: "억양이 매우 자연스러워요!",
                    fair: "억양이 가끔 부자연스러울 수 있어요.",
                    poor: "억양 패턴을 연습할 필요가 있어요.",
                    tip: "의문문은 끝을 올리고, 강조할 단어는 음높이를 높여보세요."
                }
            },

            // 라운드별 피드백
            round: {
                '기초 명료도': {
                    good: "일상 표현을 명확하게 전달할 수 있어요.",
                    fair: "일상 표현이 때때로 명확하지 않을 수 있어요.",
                    poor: "기본적인 발음부터 연습이 필요해요.",
                    tip: "천천히 정확하게 발음하는 연습을 해보세요."
                },
                '음소 구분': {
                    good: "비슷한 음소를 잘 구분하고 있어요.",
                    fair: "일부 음소 구분에 어려움이 있어요.",
                    poor: "음소 구분에 집중적인 연습이 필요해요.",
                    tip: "혀와 입술의 위치에 더 주의를 기울이세요."
                },
                '억양 리듬': {
                    good: "자연스러운 억양과 리듬을 가지고 있어요.",
                    fair: "억양과 리듬이 때때로 부자연스러울 수 있어요.",
                    poor: "억양과 리듬 패턴을 배울 필요가 있어요.",
                    tip: "원어민의 리듬 패턴을 따라 말해보세요."
                }
            }
        };

        // 연습 추천 템플릿
        this.practiceTemplates = {
            daily: [
                {
                    title: "아침 5분 발음 워밍업",
                    duration: "5분",
                    description: "기본 음소 발음과 입모양 연습",
                    exercises: [
                        "기본 모음 a, e, i, o, u 발음",
                        "L, R, P, F, TH 음소 연습",
                        "입모양 거울 보며 확인"
                    ]
                },
                {
                    title: "점심시간 문장 연습",
                    duration: "10분",
                    description: "짧은 문장으로 발음 정확도 향상",
                    exercises: [
                        "간단한 일상 표현 5문장",
                        "느리게 정확하게 발음하기",
                        "자신의 발음 녹음해서 확인"
                    ]
                },
                {
                    title: "저녁 복습 세션",
                    duration: "15분",
                    description: "하루 동안 배운 내용 복습 및 적용",
                    exercises: [
                        "약한 음소 집중 연습",
                        "긴 문장으로 호흡 컨트롤 연습",
                        "원어민 발음과 비교하기"
                    ]
                }
            ],

            weekly: [
                {
                    title: "월요일: 기본 음소 마스터",
                    focus: "L, R, P, F, TH 발음",
                    exercises: [
                        "각 음소별 입모양 연습 10회",
                        "혀 위치 확인 및 조정",
                        "비슷한 음소 비교 연습"
                    ]
                },
                {
                    title: "화요일: 모음 완벽히 하기",
                    focus: "장단모음 구분",
                    exercises: [
                        "sheep vs ship 반복 연습",
                        "pool vs pull 비교 발음",
                        "모음 차트 따라 발음하기"
                    ]
                },
                {
                    title: "수요일: 연음과 연결음",
                    focus: "자연스러운 단어 연결",
                    exercises: [
                        "not at all → 'no-ta-tall' 연습",
                        "could you → 'could-ja' 연습",
                        "문장 속 연음 패턴 찾기"
                    ]
                },
                {
                    title: "목요일: 억양 패턴",
                    focus: "문장 억양과 강세",
                    exercises: [
                        "의문문 억양 연습",
                        "중요 단어 강조하기",
                        "감정에 따른 억양 변화"
                    ]
                },
                {
                    title: "금요일: 속도와 리듬",
                    focus: "자연스러운 말하기 속도",
                    exercises: [
                        "빠른 부분과 느린 부분 조절",
                        "리듬 카드 활용 연습",
                        "노래 따라 부르기"
                    ]
                },
                {
                    title: "토요일: 종합 연습",
                    focus: "실전 대화 적용",
                    exercises: [
                        "짧은 대화 문장 연습",
                        "다양한 상황별 표현",
                        "자신의 발음 녹음 및 분석"
                    ]
                },
                {
                    title: "일요일: 휴식 및 복습",
                    focus: "주간 학습 정리",
                    exercises: [
                        "약점 부분만 간단히 복습",
                        "다음 주 목표 설정",
                        "진행 상황 기록"
                    ]
                }
            ],

            specific: {
                'L/R': [
                    "거울 앞에서 L과 R의 혀 위치 차이 확인 20회",
                    "red lorry, yellow lorry 10회 반복",
                    "라디오 진행자처럼 명확하게 발음 연습"
                ],
                'P/F': [
                    "종이 조각을 입 앞에 대고 P 발음으로 날리기",
                    "거울 보며 F 발음 때 입모양 확인",
                    "Peter Piper 문장 5회 천천히 말하기"
                ],
                'TH': [
                    "혀를 이빨 사이에 끼우는 연습 (안전하게!)",
                    "thin, thick, thought 10회 반복",
                    "this, that, these, those 문장 만들기"
                ],
                'Vowels': [
                    "모음 길이 차이 인지 훈련 (비트 사용)",
                    "입모양 카메라로 촬영하여 확인",
                    "모음 연쇄 발음 연습 (aeiou 순서로)"
                ]
            }
        };
    }

    // 종합 피드백 생성
    generateComprehensiveFeedback(sessionData) {
        const {
            sLevel,
            overallScore,
            roundScores,
            phonemeAnalysis,
            strengths,
            improvements
        } = sessionData;

        // S레벨 기반 메인 피드백
        const sLevelFeedback = this.feedbackTemplates.sLevel[sLevel.level] || 
                              this.feedbackTemplates.sLevel.S1;

        // 점수 범위 피드백
        const scoreCategory = this.getScoreCategory(overallScore);
        const scoreFeedback = this.feedbackTemplates.scoreRange[scoreCategory];

        // 라운드별 피드백 생성
        const roundFeedbacks = this.generateRoundFeedbacks(roundScores);

        // 음소별 피드백 생성
        const phonemeFeedbacks = this.generatePhonemeFeedbacks(phonemeAnalysis);

        // 강점 요약
        const strengthSummary = this.summarizeStrengths(strengths);

        // 개선점 요약
        const improvementSummary = this.summarizeImprovements(improvements);

        // 맞춤형 연습 계획
        const practicePlan = this.generatePracticePlan(improvements, sLevel.level);

        return {
            // 기본 정보
            timestamp: new Date().toISOString(),
            sLevel: sLevel.level,
            overallScore: overallScore,

            // 피드백 섹션
            mainFeedback: {
                title: `${sLevelFeedback.encouragement}`,
                message: `${scoreFeedback.message} ${sLevelFeedback.main}`,
                focus: sLevelFeedback.focus,
                icon: scoreFeedback.icon
            },

            // 상세 분석
            detailedFeedback: {
                rounds: roundFeedbacks,
                phonemes: phonemeFeedbacks
            },

            // 요약
            summary: {
                strengths: strengthSummary,
                improvements: improvementSummary,
                priority: this.determinePriority(improvements)
            },

            // 행동 계획
            actionPlan: {
                daily: practicePlan.daily,
                weekly: practicePlan.weekly,
                immediate: this.getImmediateActions(improvements)
            },

            // 동기부여 메시지
            motivation: this.getMotivationalMessage(sLevel.level, overallScore)
        };
    }

    // 점수 카테고리 판별
    getScoreCategory(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
    }

    // 라운드별 피드백 생성
    generateRoundFeedbacks(roundScores) {
        const feedbacks = [];

        Object.entries(roundScores).forEach(([roundName, data]) => {
            const category = this.getScoreCategory(data.average);
            const template = this.feedbackTemplates.round[roundName];

            if (template) {
                feedbacks.push({
                    round: roundName,
                    score: data.average,
                    category: category,
                    feedback: template[category] || template.fair,
                    tip: template.tip,
                    details: this.getRoundDetails(roundName, data.average)
                });
            }
        });

        return feedbacks;
    }

    // 라운드 상세 정보
    getRoundDetails(roundName, score) {
        const details = {
            '기초 명료도': {
                high: "일상 대화에서 거의 완벽한 명료도를 보여줍니다.",
                medium: "대부분의 일상 표현을 명확하게 전달할 수 있습니다.",
                low: "기본적인 발음에 더 집중할 필요가 있습니다."
            },
            '음소 구분': {
                high: "비슷한 음소를 정확하게 구분합니다.",
                medium: "대부분의 음소를 구분할 수 있지만, 가끔 혼동이 있습니다.",
                low: "음소 구분에 체계적인 연습이 필요합니다."
            },
            '억양 리듬': {
                high: "자연스러운 억양과 리듬을 가지고 있습니다.",
                medium: "기본적인 억양은 갖추었지만 더 자연스러워질 수 있습니다.",
                low: "억양과 리듬 패턴을 배워야 합니다."
            }
        };

        const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
        return details[roundName]?.[level] || "";
    }

    // 음소별 피드백 생성
    generatePhonemeFeedbacks(phonemeAnalysis) {
        const feedbacks = [];

        phonemeAnalysis.forEach(phoneme => {
            const category = this.evaluatePhonemeCategory(phoneme.average);
            const template = this.feedbackTemplates.phoneme[phoneme.phoneme];

            if (template) {
                feedbacks.push({
                    phoneme: phoneme.phoneme,
                    score: phoneme.average,
                    category: category,
                    feedback: template[category] || template.fair,
                    tip: template.tip,
                    issues: phoneme.mainIssues,
                    weakSentences: phoneme.weakSentences,
                    improvementPriority: this.getImprovementPriority(phoneme.average)
                });
            }
        });

        return feedbacks;
    }

    // 음소 평가 카테고리
    evaluatePhonemeCategory(score) {
        if (score >= 85) return 'good';
        if (score >= 70) return 'fair';
        return 'poor';
    }

    // 개선 우선순위
    getImprovementPriority(score) {
        if (score < 60) return 'high';
        if (score < 70) return 'medium';
        if (score < 80) return 'low';
        return 'none';
    }

    // 강점 요약
    summarizeStrengths(strengths) {
        if (strengths.length === 0) {
            return {
                count: 0,
                message: "아직 발견된 강점이 없습니다. 계속 연습해보세요!",
                list: []
            };
        }

        const topStrengths = strengths.slice(0, 3);
        let message = "";

        if (topStrengths.length === 1) {
            message = `'${topStrengths[0].name}'에서 뛰어난 강점을 보였습니다.`;
        } else {
            const names = topStrengths.map(s => `'${s.name}'`).join(', ');
            message = `${names} 영역에서 강점을 보였습니다.`;
        }

        return {
            count: strengths.length,
            message: message,
            list: topStrengths.map(s => ({
                area: s.name,
                score: s.score,
                description: s.description
            }))
        };
    }

    // 개선점 요약
    summarizeImprovements(improvements) {
        if (improvements.length === 0) {
            return {
                count: 0,
                message: "모든 영역에서 좋은 성과를 보였습니다!",
                list: []
            };
        }

        const highPriority = improvements.filter(i => i.priority === 'high');
        const mediumPriority = improvements.filter(i => i.priority === 'medium');

        let message = "";
        if (highPriority.length > 0) {
            message = `'${highPriority[0].name}'을 가장 먼저 개선하는 것이 좋습니다.`;
        } else if (mediumPriority.length > 0) {
            message = `'${mediumPriority[0].name}'부터 차근차근 개선해보세요.`;
        }

        return {
            count: improvements.length,
            highPriority: highPriority.length,
            mediumPriority: mediumPriority.length,
            message: message,
            list: improvements.slice(0, 3).map(i => ({
                area: i.name,
                score: i.score,
                priority: i.priority,
                description: i.description
            }))
        };
    }

    // 우선순위 결정
    determinePriority(improvements) {
        if (improvements.length === 0) return 'none';

        const hasHighPriority = improvements.some(i => i.priority === 'high');
        const hasMediumPriority = improvements.some(i => i.priority === 'medium');

        if (hasHighPriority) return 'high';
        if (hasMediumPriority) return 'medium';
        return 'low';
    }

    // 맞춤형 연습 계획 생성
    generatePracticePlan(improvements, sLevel) {
        const plan = {
            daily: [],
            weekly: []
        };

        // 가장 시급한 개선점 2개 선택
        const urgentImprovements = improvements
            .filter(i => i.priority === 'high')
            .slice(0, 2);

        if (urgentImprovements.length === 0) {
            urgentImprovements.push(
                ...improvements.filter(i => i.priority === 'medium').slice(0, 2)
            );
        }

        if (urgentImprovements.length === 0 && improvements.length > 0) {
            urgentImprovements.push(improvements[0]);
        }

        // 일일 연습 계획
        urgentImprovements.forEach(improvement => {
            if (improvement.type === 'phoneme') {
                const specificExercises = this.practiceTemplates.specific[improvement.name];
                if (specificExercises) {
                    plan.daily.push({
                        focus: improvement.name,
                        duration: "15분",
                        exercises: specificExercises.slice(0, 3)
                    });
                }
            }
        });

        // 기본 일일 연습 추가 (부족할 경우)
        if (plan.daily.length < 2) {
            plan.daily.push(...this.practiceTemplates.daily.slice(0, 2 - plan.daily.length));
        }

        // 주간 연습 계획 (S레벨에 맞게 조정)
        plan.weekly = this.getWeeklyPlanForLevel(sLevel);

        return plan;
    }

    // S레벨별 주간 계획
    getWeeklyPlanForLevel(sLevel) {
        const levelNum = parseInt(sLevel.replace('S', ''));
        
        if (levelNum <= 3) {
            // 초급자: 기초에 집중
            return this.practiceTemplates.weekly.slice(0, 4).map(day => ({
                ...day,
                focus: day.focus + " (기초)",
                exercises: day.exercises.slice(0, 2) // 간단한 연습만
            }));
        } else if (levelNum <= 6) {
            // 중급자: 종합 연습
            return this.practiceTemplates.weekly;
        } else {
            // 고급자: 세부 조정
            return this.practiceTemplates.weekly.map(day => ({
                ...day,
                focus: day.focus + " (고급)",
                exercises: [...day.exercises, "원어민과 비교 분석"] // 추가 연습
            }));
        }
    }

    // 즉시 실행할 액션
    getImmediateActions(improvements) {
        const actions = [];

        // 가장 시급한 개선점에 대한 즉시 액션
        const topImprovement = improvements[0];
        if (topImprovement) {
            actions.push({
                action: `'${topImprovement.name}' 집중 관찰`,
                description: "지금 바로 거울 앞에서 이 음소의 입모양을 확인해보세요.",
                duration: "5분",
                immediate: true
            });
        }

        // 일반적인 즉시 액션
        actions.push(
            {
                action: "오늘의 목표 설정",
                description: "오늘 중으로 달성할 작은 발음 목표를 정해보세요.",
                duration: "2분",
                immediate: true
            },
            {
                action: "녹음 준비",
                description: "스마트폰 녹음 앱을 준비해 자신의 발음을 기록해보세요.",
                duration: "3분",
                immediate: true
            }
        );

        return actions.slice(0, 3);
    }

    // 동기부여 메시지
    getMotivationalMessage(sLevel, score) {
        const levelNum = parseInt(sLevel.replace('S', ''));
        const messages = [
            {
                condition: levelNum <= 3,
                messages: [
                    "🚀 모든 여정은 첫 걸음부터 시작됩니다!",
                    "🌱 작은 씨앗이 큰 나무가 되듯, 작은 발음이 훌륭한 실력이 됩니다.",
                    "💪 오늘의 연습이 내일의 자신감이 됩니다!"
                ]
            },
            {
                condition: levelNum <= 6,
                messages: [
                    "⭐ 이미 많은 발전을 이루었어요! 계속 나아가세요.",
                    "📈 조금씩, 꾸준히가 가장 빠른 길입니다.",
                    "🎯 목표를 작게 나누어 하나씩 달성해보세요."
                ]
            },
            {
                condition: levelNum <= 8,
                messages: [
                    "🏆 원어민에 가까워지고 있어요! 정말 대단합니다.",
                    "✨ 세부적인 부분만 다듬으면 완벽에 가까워질 거예요.",
                    "🌟 당신의 노력이 빛을 발하고 있습니다."
                ]
            },
            {
                condition: levelNum >= 9,
                messages: [
                    "🎖️ 발음 마스터를 향한 여정, 거의 다 왔어요!",
                    "👑 이미 많은 사람들의 롤모델이 되고 계세요.",
                    "🚀 이 정도 실력이면 누구에게도 지지 않아요!"
                ]
            }
        ];

        const matchingGroup = messages.find(group => group.condition) || messages[0];
        const randomIndex = Math.floor(Math.random() * matchingGroup.messages.length);
        
        return matchingGroup.messages[randomIndex];
    }

    // 상세 보고서 생성
    generateDetailedReport(sessionData) {
        const comprehensiveFeedback = this.generateComprehensiveFeedback(sessionData);
        
        return {
            // 메타데이터
            reportId: `report_${Date.now()}`,
            generatedAt: new Date().toLocaleString('ko-KR'),
            version: "1.0",

            // 기본 정보
            overview: {
                sLevel: sessionData.sLevel,
                overallScore: sessionData.overallScore,
                testDate: sessionData.timestamp,
                duration: sessionData.duration,
                sentencesCompleted: sessionData.sentencesCompleted
            },

            // 피드백 섹션
            feedback: comprehensiveFeedback,

            // 통계
            statistics: {
                roundScores: sessionData.roundScores,
                phonemeStats: sessionData.phonemeAnalysis,
                strengthsCount: sessionData.strengths.length,
                improvementsCount: sessionData.improvements.length,
                reliability: sessionData.reliabilityScore
            },

            // 시각화 데이터
            visualization: {
                scoreDistribution: this.generateScoreDistribution(sessionData),
                progressTimeline: this.generateProgressTimeline(sessionData),
                phonemeRadar: this.generatePhonemeRadarData(sessionData.phonemeAnalysis)
            },

            // 추천 리소스
            resources: this.getRecommendedResources(sessionData.sLevel, sessionData.improvements),

            // 다음 테스트 예정일
            nextTest: {
                recommendedDate: this.getNextTestDate(sessionData.sLevel),
                preparation: this.getTestPreparationTips(sessionData.sLevel)
            }
        };
    }

    // 점수 분포 생성
    generateScoreDistribution(sessionData) {
        const distribution = {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0
        };

        // 라운드별 점수 분류
        Object.values(sessionData.roundScores).forEach(round => {
            const category = this.getScoreCategory(round.average);
            distribution[category]++;
        });

        return distribution;
    }

    // 진행 타임라인 생성
    generateProgressTimeline(sessionData) {
        // 실제로는 이전 세션 데이터가 필요함
        // 여기서는 예시 데이터 생성
        const timeline = [];
        const now = new Date();

        for (let i = 4; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 7); // 매주
            
            timeline.push({
                date: date.toLocaleDateString('ko-KR'),
                score: sessionData.overallScore - (i * 2) + Math.random() * 4,
                focus: i === 0 ? "현재 테스트" : "주간 연습"
            });
        }

        return timeline;
    }

    // 음소 레이더 차트 데이터
    generatePhonemeRadarData(phonemeAnalysis) {
        const data = {
            labels: [],
            datasets: [{
                label: '음소 정확도',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }]
        };

        phonemeAnalysis.forEach(phoneme => {
            data.labels.push(phoneme.phoneme);
            data.datasets[0].data.push(phoneme.average);
        });

        return data;
    }

    // 추천 학습 리소스
    getRecommendedResources(sLevel, improvements) {
        const resources = {
            apps: [],
            websites: [],
            youtube: [],
            books: []
        };

        const levelNum = parseInt(sLevel.replace('S', ''));

        // 앱 추천
        if (levelNum <= 5) {
            resources.apps.push(
                {
                    name: "엘사 스피크",
                    description: "기본 발음 연습에 좋은 앱",
                    url: "https://elsaspeak.com"
                },
                {
                    name: "듀오링고",
                    description: "재미있는 언어 학습 앱",
                    url: "https://duolingo.com"
                }
            );
        }

        // 웹사이트 추천
        resources.websites.push(
            {
                name: "Rachel's English",
                description: "영어 발음 전문 채널 자료",
                url: "https://rachelsenglish.com"
            },
            {
                name: "Forvo",
                description: "원어민 발음 데이터베이스",
                url: "https://forvo.com"
            }
        );

        // YouTube 채널 추천
        resources.youtube.push(
            {
                name: "mmmEnglish",
                description: "실용적인 영어 발음 강의",
                url: "https://youtube.com/mmmEnglish"
            },
            {
                name: "English with Lucy",
                description: "영국식 발음 전문",
                url: "https://youtube.com/EnglishwithLucy"
            }
        );

        // 개선점에 따른 맞춤형 리소스
        improvements.forEach(improvement => {
            if (improvement.name === 'L/R') {
                resources.youtube.push({
                    name: "L/R 발음 특강",
                    description: "L과 R 발음 완벽 마스터",
                    url: "https://youtube.com/search?q=L+R+pronunciation"
                });
            }
        });

        return resources;
    }

    // 다음 테스트 권장 날짜
    getNextTestDate(sLevel) {
        const levelNum = parseInt(sLevel.replace('S', ''));
        
        const nextDates = {
            1: 1,  // S1: 1일 후
            2: 2,  // S2: 2일 후
            3: 3,  // S3: 3일 후
            4: 4,  // S4: 4일 후
            5: 5,  // S5: 5일 후
            6: 7,  // S6: 1주 후
            7: 14, // S7: 2주 후
            8: 21, // S8: 3주 후
            9: 30, // S9: 1달 후
            10: 60 // S10: 2달 후
        };

        const days = nextDates[levelNum] || 7;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);

        return nextDate.toLocaleDateString('ko-KR');
    }

    // 테스트 준비 팁
    getTestPreparationTips(sLevel) {
        const tips = [
            "테스트 전날 충분한 휴식을 취하세요.",
            "테스트는 조용한 환경에서 진행하세요.",
            "헤드폰을 사용하면 더 정확한 평가가 가능합니다.",
            "마이크 테스트를 꼼꼼하게 진행하세요.",
            "편안한 마음으로 임하세요!"
        ];

        const levelNum = parseInt(sLevel.replace('S', ''));
        
        if (levelNum >= 7) {
            tips.push("고급 레벨에서는 억양과 리듬에 더 집중해보세요.");
        }

        return tips;
    }
}

// 글로벌에서 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.FeedbackGenerator = FeedbackGenerator;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackGenerator;
}
