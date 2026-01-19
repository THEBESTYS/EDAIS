// scoring-engine.js - 발음 명료도 점수 계산 및 S레벨 평가 엔진

class ScoringEngine {
    constructor() {
        // 점수 가중치 설정
        this.weights = {
            clarity: 0.6,      // 명료도 기본 점수
            consistency: 0.2,  // 일관성
            speed: 0.1,        // 속도 적절성
            completeness: 0.1   // 완전성 (무음 제외)
        };

        // 문장 난이도 보정 계수
        this.difficultyMultipliers = {
            easy: 1.0,
            medium: 1.1,
            hard: 1.2
        };

        // 음소별 가중치
        this.phonemeWeights = {
            'L/R': 0.15,
            'P/F': 0.10,
            'TH': 0.15,
            'S/Z': 0.10,
            'Vowels': 0.20,
            'Consonants': 0.10,
            'Intonation': 0.10,
            'Rhythm': 0.10
        };

        // 평가 기준
        this.thresholds = {
            excellent: 85,
            good: 70,
            fair: 50,
            poor: 30
        };

        // 캐싱을 위한 저장소
        this.scoreCache = new Map();
        this.sLevelCache = new Map();
    }

    // 문장별 점수 계산
    calculateSentenceScore(audioAnalysis, sentenceInfo) {
        const cacheKey = `${sentenceInfo.id}_${audioAnalysis.duration}`;
        
        if (this.scoreCache.has(cacheKey)) {
            return this.scoreCache.get(cacheKey);
        }

        const { clarityScore, features, phonemeAnalysis } = audioAnalysis;
        const { difficulty, targetPhonemes, idealDuration } = sentenceInfo;

        // 1. 기본 명료도 점수
        const baseScore = clarityScore;

        // 2. 속도 적절성 점수
        const speedScore = this.calculateSpeedScore(features.duration, idealDuration);

        // 3. 일관성 점수 (볼륨 변화)
        const consistencyScore = this.calculateConsistencyScore(features);

        // 4. 완전성 점수 (무음 비율 반영)
        const completenessScore = this.calculateCompletenessScore(features);

        // 5. 음소 정확도 점수
        const phonemeScore = this.calculatePhonemeScore(phonemeAnalysis, targetPhonemes);

        // 종합 점수 계산
        const weightedScore = (
            baseScore * this.weights.clarity +
            speedScore * this.weights.speed +
            consistencyScore * this.weights.consistency +
            completenessScore * this.weights.completeness
        ) * this.difficultyMultipliers[difficulty] + phonemeScore * 0.2;

        // 최종 점수 (0-100)
        const finalScore = Math.min(100, Math.max(0, weightedScore));

        const result = {
            score: Math.round(finalScore),
            breakdown: {
                base: Math.round(baseScore),
                speed: Math.round(speedScore),
                consistency: Math.round(consistencyScore),
                completeness: Math.round(completenessScore),
                phoneme: Math.round(phonemeScore)
            },
            category: this.getScoreCategory(finalScore),
            difficultyMultiplier: this.difficultyMultipliers[difficulty]
        };

        this.scoreCache.set(cacheKey, result);
        return result;
    }

    // 속도 점수 계산
    calculateSpeedScore(actualDuration, idealDuration) {
        const ratio = actualDuration / idealDuration;
        
        if (ratio >= 0.8 && ratio <= 1.2) {
            return 100; // 이상적
        } else if (ratio >= 0.6 && ratio <= 1.4) {
            return 80;  // 양호
        } else if (ratio >= 0.4 && ratio <= 1.6) {
            return 60;  // 보통
        } else if (ratio >= 0.2 && ratio <= 1.8) {
            return 40;  // 개선 필요
        } else {
            return 20;  // 크게 벗어남
        }
    }

    // 일관성 점수 계산 (볼륨 변화량)
    calculateConsistencyScore(features) {
        // RMS의 표준편차를 기준으로 일관성 평가
        // 값이 작을수록 일관적임
        const consistency = Math.max(0, 100 - (features.zcr * 500));
        return Math.min(100, Math.max(0, consistency));
    }

    // 완전성 점수 계산
    calculateCompletenessScore(features) {
        // 음성 신호의 연속성을 평가
        // 제로크로싱 레이트가 너무 높으면 단절된 발음
        const completeness = 100 - (features.zcr * 300);
        return Math.min(100, Math.max(0, completeness));
    }

    // 음소 정확도 점수
    calculatePhonemeScore(phonemeAnalysis, targetPhonemes) {
        if (!phonemeAnalysis || phonemeAnalysis.length === 0) {
            return 75; // 기본 점수
        }

        let totalWeight = 0;
        let weightedSum = 0;

        phonemeAnalysis.forEach(analysis => {
            const weight = this.phonemeWeights[analysis.phoneme] || 0.05;
            totalWeight += weight;
            weightedSum += analysis.accuracy * weight;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 75;
    }

    // 점수 카테고리 판정
    getScoreCategory(score) {
        if (score >= this.thresholds.excellent) return 'excellent';
        if (score >= this.thresholds.good) return 'good';
        if (score >= this.thresholds.fair) return 'fair';
        return 'poor';
    }

    // 라운드별 점수 집계
    calculateRoundScores(sentenceScores) {
        const roundScores = {
            '기초 명료도': { total: 0, count: 0, weighted: 0 },
            '음소 구분': { total: 0, count: 0, weighted: 0 },
            '억양 리듬': { total: 0, count: 0, weighted: 0 }
        };

        sentenceScores.forEach((scoreData, index) => {
            const roundName = scoreData.roundName;
            const weight = scoreData.roundWeight;
            const score = scoreData.score;
            
            if (roundScores[roundName]) {
                roundScores[roundName].total += score;
                roundScores[roundName].count++;
                roundScores[roundName].weighted += score * weight;
            }
        });

        // 평균 및 가중 평균 계산
        const results = {};
        Object.keys(roundScores).forEach(round => {
            const data = roundScores[round];
            if (data.count > 0) {
                results[round] = {
                    average: Math.round(data.total / data.count),
                    weighted: Math.round(data.weighted / data.count * 10) / 10,
                    count: data.count
                };
            }
        });

        return results;
    }

    // 전체 종합 점수 계산
    calculateOverallScore(roundScores, sentenceBank) {
        let totalWeightedScore = 0;
        let totalWeight = 0;

        sentenceBank.rounds.forEach(round => {
            const roundScore = roundScores[round.name];
            if (roundScore) {
                totalWeightedScore += roundScore.weighted * round.weight;
                totalWeight += round.weight;
            }
        });

        const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        
        // 신뢰도 점수 계산 (일관성 반영)
        const reliabilityScore = this.calculateReliabilityScore(roundScores);

        return {
            score: Math.round(overallScore),
            reliability: Math.round(reliabilityScore),
            confidence: this.getConfidenceLevel(reliabilityScore)
        };
    }

    // 신뢰도 점수 계산
    calculateReliabilityScore(roundScores) {
        const scores = Object.values(roundScores).map(r => r.average);
        
        if (scores.length === 0) return 0;

        // 평균
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // 표준편차 (낮을수록 일관적)
        const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
        const stdDev = Math.sqrt(variance);

        // 표준편차가 작을수록 높은 신뢰도
        const reliability = Math.max(0, 100 - (stdDev * 2));
        return reliability;
    }

    // 신뢰도 수준 판정
    getConfidenceLevel(reliabilityScore) {
        if (reliabilityScore >= 90) return 'very-high';
        if (reliabilityScore >= 80) return 'high';
        if (reliabilityScore >= 70) return 'medium';
        if (reliabilityScore >= 60) return 'low';
        return 'very-low';
    }

    // S레벨 계산
    calculateSLevel(overallScore, reliabilityScore) {
        const cacheKey = `${overallScore}_${reliabilityScore}`;
        
        if (this.sLevelCache.has(cacheKey)) {
            return this.sLevelCache.get(cacheKey);
        }

        // 신뢰도 보정 적용
        const adjustedScore = this.adjustScoreByReliability(overallScore, reliabilityScore);
        
        // SentenceBank의 S레벨 기준 사용
        const sLevelData = SentenceBank.calculateSLevel(adjustedScore);
        
        // 신뢰도 정보 추가
        const result = {
            level: sLevelData.level,
            score: adjustedScore,
            rawScore: overallScore,
            reliability: reliabilityScore,
            title: sLevelData.title,
            description: sLevelData.description,
            feedback: sLevelData.feedback,
            color: sLevelData.color,
            range: {
                min: sLevelData.minScore,
                max: sLevelData.maxScore
            }
        };

        this.sLevelCache.set(cacheKey, result);
        return result;
    }

    // 신뢰도에 따른 점수 보정
    adjustScoreByReliability(score, reliability) {
        if (reliability >= 80) {
            return score; // 신뢰도 높음 → 점수 변경 없음
        } else if (reliability >= 60) {
            return score * 0.95; // 약간 보수적으로 조정
        } else {
            return score * 0.9; // 신뢰도 낮음 → 보수적 조정
        }
    }

    // 음소별 상세 분석
    analyzePhonemeDetails(sentenceAnalyses) {
        const phonemeStats = {};
        const totalSentences = sentenceAnalyses.length;

        // 음소별 통계 수집
        sentenceAnalyses.forEach(analysis => {
            if (analysis.phonemeAnalysis) {
                analysis.phonemeAnalysis.forEach(phoneme => {
                    if (!phonemeStats[phoneme.phoneme]) {
                        phonemeStats[phoneme.phoneme] = {
                            total: 0,
                            count: 0,
                            issues: [],
                            sentenceIds: []
                        };
                    }
                    
                    phonemeStats[phoneme.phoneme].total += phoneme.accuracy;
                    phonemeStats[phoneme.phoneme].count++;
                    
                    if (phoneme.accuracy < 70) {
                        phonemeStats[phoneme.phoneme].issues.push(phoneme.issue);
                        phonemeStats[phoneme.phoneme].sentenceIds.push(analysis.sentenceId);
                    }
                });
            }
        });

        // 평균 및 평가 생성
        const results = [];
        Object.keys(phonemeStats).forEach(phoneme => {
            const stats = phonemeStats[phoneme];
            const average = stats.count > 0 ? Math.round(stats.total / stats.count) : 0;
            
            results.push({
                phoneme: phoneme,
                average: average,
                count: stats.count,
                issueCount: stats.issues.length,
                mainIssues: this.getMostCommonIssues(stats.issues),
                weakSentences: stats.sentenceIds.slice(0, 3),
                category: this.getPhonemeCategory(phoneme),
                evaluation: this.evaluatePhonemePerformance(average)
            });
        });

        // 평균 점수 기준 정렬
        return results.sort((a, b) => a.average - b.average);
    }

    // 가장 흔한 이슈 찾기
    getMostCommonIssues(issues) {
        const issueCounts = {};
        issues.forEach(issue => {
            issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        });

        return Object.entries(issueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([issue, count]) => ({ issue, count }));
    }

    // 음소 카테고리 판별
    getPhonemeCategory(phoneme) {
        const categories = {
            'L/R': '자음구분',
            'P/F': '자음구분',
            'TH': '특수자음',
            'S/Z': '치경음',
            'Vowels': '모음',
            'Consonants': '자음',
            'Intonation': '억양',
            'Rhythm': '리듬'
        };

        return categories[phoneme] || '기타';
    }

    // 음소 성능 평가
    evaluatePhonemePerformance(average) {
        if (average >= 90) return 'excellent';
        if (average >= 80) return 'good';
        if (average >= 70) return 'fair';
        if (average >= 60) return 'needs-improvement';
        return 'poor';
    }

    // 강점 분석
    identifyStrengths(phonemeAnalysis, roundScores) {
        const strengths = [];

        // 음소별 강점
        phonemeAnalysis.forEach(phoneme => {
            if (phoneme.average >= 85) {
                strengths.push({
                    type: 'phoneme',
                    name: phoneme.phoneme,
                    score: phoneme.average,
                    description: `${phoneme.phoneme} 발음이 매우 정확합니다.`
                });
            }
        });

        // 라운드별 강점
        Object.entries(roundScores).forEach(([round, data]) => {
            if (data.average >= 80) {
                strengths.push({
                    type: 'round',
                    name: round,
                    score: data.average,
                    description: `${round} 영역에서 뛰어난 성과를 보였습니다.`
                });
            }
        });

        return strengths.slice(0, 5); // 상위 5개만 반환
    }

    // 개선 필요 항목 분석
    identifyImprovements(phonemeAnalysis, roundScores) {
        const improvements = [];

        // 음소별 개선점
        phonemeAnalysis.forEach(phoneme => {
            if (phoneme.average < 70) {
                improvements.push({
                    type: 'phoneme',
                    name: phoneme.phoneme,
                    score: phoneme.average,
                    priority: phoneme.average < 60 ? 'high' : 'medium',
                    description: this.getImprovementDescription(phoneme),
                    exercises: this.getRecommendedExercises(phoneme.phoneme)
                });
            }
        });

        // 라운드별 개선점
        Object.entries(roundScores).forEach(([round, data]) => {
            if (data.average < 70) {
                improvements.push({
                    type: 'round',
                    name: round,
                    score: data.average,
                    priority: data.average < 60 ? 'high' : 'medium',
                    description: `${round} 영역에서 추가 연습이 필요합니다.`,
                    exercises: this.getRoundExercises(round)
                });
            }
        });

        // 우선순위별 정렬 (높은 우선순위 먼저)
        return improvements.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }).slice(0, 5); // 상위 5개만 반환
    }

    // 개선 설명 생성
    getImprovementDescription(phoneme) {
        const descriptions = {
            'L/R': 'L과 R 발음을 구분하는 데 어려움이 있습니다.',
            'P/F': 'P와 F 발음의 차이를 명확히 하세요.',
            'TH': 'TH 발음 시 혀의 위치에 주의하세요.',
            'Vowels': '모음의 길이와 입모양에 더 집중하세요.',
            'Intonation': '문장의 억양 패턴을 연습하세요.'
        };

        return descriptions[phoneme.phoneme] || `${phoneme.phoneme} 발음을 개선할 필요가 있습니다.`;
    }

    // 추천 연습 방법
    getRecommendedExercises(phoneme) {
        const exercises = {
            'L/R': [
                '미러 앞에서 L과 R의 혀 위치 차이 확인',
                'red lorry, yellow lorry 반복 연습',
                '혀 꼬기 운동으로 혀 근육 강화'
            ],
            'P/F': [
                '종이 조각을 입 앞에 대고 P 발음 연습',
                '윗니와 아랫입술을 이용한 F 발음 연습',
                'Peter Piper picked a peck... 문장 반복'
            ],
            'TH': [
                '혀를 이빨 사이에 살짝 끼우는 연습',
                'thin과 sin의 차이 구분하기',
                'this와 dis 비교 연습'
            ],
            'Vowels': [
                'sheep과 ship의 모음 길이 차이 연습',
                'pool과 pull 비교 발음',
                '모음 차트를 보며 입모양 연습'
            ],
            'Intonation': [
                '의문문과 평서문의 억양 차이 연습',
                '중요 단어 강조 연습',
                '원어민 발음 따라하기'
            ]
        };

        return exercises[phoneme] || [
            '원어민 발음을 듣고 따라하기',
            '느리게 정확하게 발음 연습',
            '녹음해서 자신의 발음 확인하기'
        ];
    }

    // 라운드별 연습 방법
    getRoundExercises(round) {
        const roundExercises = {
            '기초 명료도': [
                '일상 표현 반복 연습',
                '천천히 정확하게 발음하기',
                '단어 연결 시 연음 연습'
            ],
            '음소 구분': [
                '혀 꼬임 문장 연습',
                '비슷한 음소 비교 연습',
                '입모양 거울 보며 확인'
            ],
            '억양 리듬': [
                '문장 강세 패턴 연습',
                '리듬 카드를 이용한 연습',
                '노래 따라 부르며 리듬 감각 기르기'
            ]
        };

        return roundExercises[round] || ['기본 발음 연습', '원어민 발음 모방'];
    }

    // 진행 상황 추적 (세션 간 비교용)
    trackProgress(currentSession, previousSession) {
        if (!previousSession) return null;

        const changes = {
            overall: currentSession.overallScore - previousSession.overallScore,
            rounds: {},
            phonemes: {}
        };

        // 라운드별 변화
        Object.keys(currentSession.roundScores).forEach(round => {
            if (previousSession.roundScores[round]) {
                changes.rounds[round] = {
                    change: currentSession.roundScores[round].average - 
                           previousSession.roundScores[round].average,
                    percentage: ((currentSession.roundScores[round].average / 
                                 previousSession.roundScores[round].average) - 1) * 100
                };
            }
        });

        // 음소별 변화
        currentSession.phonemeAnalysis.forEach(currentPhoneme => {
            const previousPhoneme = previousSession.phonemeAnalysis?.find(
                p => p.phoneme === currentPhoneme.phoneme
            );
            
            if (previousPhoneme) {
                changes.phonemes[currentPhoneme.phoneme] = {
                    change: currentPhoneme.average - previousPhoneme.average,
                    percentage: ((currentPhoneme.average / previousPhoneme.average) - 1) * 100
                };
            }
        });

        return changes;
    }

    // 리포트 생성
    generateReport(sessionData) {
        const timestamp = new Date().toISOString();
        const reportId = `report_${timestamp.replace(/[^0-9]/g, '')}`;
        
        return {
            id: reportId,
            timestamp: timestamp,
            session: sessionData,
            summary: {
                overall: sessionData.overallScore,
                sLevel: sessionData.sLevel,
                reliability: sessionData.reliabilityScore,
                strengths: sessionData.strengths.length,
                improvements: sessionData.improvements.length
            },
            exportable: true
        };
    }

    // 점수 초기화
    reset() {
        this.scoreCache.clear();
        this.sLevelCache.clear();
    }
}

// 글로벌에서 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.ScoringEngine = ScoringEngine;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoringEngine;
}
