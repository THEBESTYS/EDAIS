// sentences.js - 발음 평가 문장 데이터베이스

const SentenceBank = {
    // 평가 라운드 구성
    rounds: [
        {
            id: 1,
            name: "기초 명료도",
            weight: 0.4,  // 전체 점수에서 40%
            description: "일상 표현 발음 명료도 측정",
            sentences: [
                {
                    id: 1,
                    text: "Hello, how are you doing today?",
                    difficulty: "easy",
                    targetPhonemes: ["h", "aʊ", "ɑː", "d", "ɪ", "ŋ"],
                    focus: "기본 인사, 연음 현상",
                    referenceDuration: 1.8,
                    idealDuration: 2.0,
                    phonemeTags: ["인사말", "연음"]
                },
                {
                    id: 2,
                    text: "I need to go to the supermarket later.",
                    difficulty: "easy",
                    targetPhonemes: ["aɪ", "iː", "d", "t", "g", "əʊ", "ð", "s", "l", "eɪ"],
                    focus: "정중 표현, 일상 대화",
                    referenceDuration: 2.5,
                    idealDuration: 2.8,
                    phonemeTags: ["일상", "연음"]
                },
                {
                    id: 3,
                    text: "Could you please repeat that more slowly?",
                    difficulty: "easy",
                    targetPhonemes: ["k", "ʊ", "d", "j", "uː", "p", "l", "iː", "z", "r", "ɪ", "t", "æ", "m", "ɔː", "sl", "əʊ", "l", "iː"],
                    focus: "의문문 억양, 정중 표현",
                    referenceDuration: 2.8,
                    idealDuration: 3.2,
                    phonemeTags: ["의문문", "정중표현"]
                },
                {
                    id: 4,
                    text: "The meeting has been postponed until Friday.",
                    difficulty: "medium",
                    targetPhonemes: ["ð", "iː", "m", "t", "ɪ", "ŋ", "h", "æ", "z", "b", "ɪː", "n", "p", "əʊ", "s", "t", "p", "əʊ", "n", "d", "ʌ", "n", "t", "ɪ", "l", "f", "r", "aɪ", "d", "eɪ"],
                    focus: "비즈니스 표현, 복합 자음",
                    referenceDuration: 3.2,
                    idealDuration: 3.5,
                    phonemeTags: ["비즈니스", "복합자음"]
                },
                {
                    id: 5,
                    text: "She's studying computer science at university.",
                    difficulty: "medium",
                    targetPhonemes: ["ʃ", "iː", "z", "s", "t", "ʌ", "d", "iː", "ɪ", "ŋ", "k", "ə", "m", "p", "j", "uː", "t", "ə", "s", "aɪ", "ə", "n", "s", "æ", "t", "j", "uː", "n", "ɪ", "v", "ɜː", "s", "ɪ", "t", "iː"],
                    focus: "학문적 표현, sibilant 연속",
                    referenceDuration: 3.5,
                    idealDuration: 3.8,
                    phonemeTags: ["학문", "S음"]
                },
                {
                    id: 6,
                    text: "Would you like some water or coffee?",
                    difficulty: "easy",
                    targetPhonemes: ["w", "ʊ", "d", "j", "uː", "l", "aɪ", "k", "s", "ʌ", "m", "w", "ɔː", "t", "ə", "ɔː", "k", "ɒ", "f", "iː"],
                    focus: "제안 표현, 선택 질문",
                    referenceDuration: 2.3,
                    idealDuration: 2.6,
                    phonemeTags: ["제안", "선택문"]
                },
                {
                    id: 7,
                    text: "It's much warmer than I expected.",
                    difficulty: "medium",
                    targetPhonemes: ["ɪ", "t", "s", "m", "ʌ", "tʃ", "w", "ɔː", "m", "ə", "ð", "æ", "n", "aɪ", "ɪ", "k", "s", "p", "e", "k", "t", "ɪ", "d"],
                    focus: "비교 표현, th 발음",
                    referenceDuration: 2.7,
                    idealDuration: 3.0,
                    phonemeTags: ["비교", "TH발음"]
                }
            ]
        },
        {
            id: 2,
            name: "음소 구분",
            weight: 0.3,  // 전체 점수에서 30%
            description: "L/R, P/F, 장단모음 구분 능력 측정",
            sentences: [
                {
                    id: 8,
                    text: "Red lorry, yellow lorry, red lorry, yellow lorry.",
                    difficulty: "hard",
                    targetPhonemes: ["r", "e", "d", "l", "ɒ", "r", "iː", "j", "e", "l", "əʊ", "l", "ɒ", "r", "iː"],
                    focus: "L/R 구분, 혀 위치",
                    referenceDuration: 3.0,
                    idealDuration: 3.5,
                    phonemeTags: ["L/R", "혀꼬임"]
                },
                {
                    id: 9,
                    text: "The librarian collected rare literary relics regularly.",
                    difficulty: "hard",
                    targetPhonemes: ["ð", "l", "aɪ", "b", "r", "eə", "r", "iː", "ə", "n", "k", "ə", "l", "e", "k", "t", "ɪ", "d", "r", "eə", "l", "ɪ", "t", "ə", "r", "ə", "r", "iː", "r", "e", "l", "ɪ", "k", "s", "r", "e", "g", "j", "ə", "l", "ə", "l", "iː"],
                    focus: "L/R 혼합, 복합 단어",
                    referenceDuration: 4.0,
                    idealDuration: 4.5,
                    phonemeTags: ["L/R", "복합음"]
                },
                {
                    id: 10,
                    text: "Flying rabbits are really rather ridiculous.",
                    difficulty: "medium",
                    targetPhonemes: ["f", "l", "aɪ", "ɪ", "ŋ", "r", "æ", "b", "ɪ", "t", "s", "ɑː", "r", "ɪ", "ə", "l", "iː", "r", "æ", "ð", "ə", "r", "ɪ", "d", "ɪ", "k", "j", "ə", "l", "ə", "s"],
                    focus: "R 연속 발음, 억양",
                    referenceDuration: 3.2,
                    idealDuration: 3.7,
                    phonemeTags: ["R음", "억양"]
                },
                {
                    id: 11,
                    text: "Peter Piper picked a peck of pickled peppers.",
                    difficulty: "hard",
                    targetPhonemes: ["p", "iː", "t", "ə", "p", "aɪ", "p", "ə", "p", "ɪ", "k", "t", "ə", "p", "e", "k", "ɒ", "v", "p", "ɪ", "k", "ə", "l", "d", "p", "e", "p", "ə", "z"],
                    focus: "P/F 구분, 입술 파열음",
                    referenceDuration: 3.0,
                    idealDuration: 3.4,
                    phonemeTags: ["P음", "파열음"]
                },
                {
                    id: 12,
                    text: "Five fluffy foxes fled from four fierce frogs.",
                    difficulty: "hard",
                    targetPhonemes: ["f", "aɪ", "v", "f", "l", "ʌ", "f", "iː", "f", "ɒ", "k", "s", "ɪ", "z", "f", "l", "e", "d", "f", "r", "ɒ", "m", "f", "ɔː", "f", "ɪə", "s", "f", "r", "ɒ", "g", "z"],
                    focus: "F 발음 집중, 치순 마찰음",
                    referenceDuration: 3.5,
                    idealDuration: 4.0,
                    phonemeTags: ["F음", "마찰음"]
                },
                {
                    id: 13,
                    text: "Sheep should sleep in sheets, not ships.",
                    difficulty: "medium",
                    targetPhonemes: ["ʃ", "iː", "p", "ʃ", "ʊ", "d", "sl", "iː", "p", "ɪ", "n", "ʃ", "iː", "t", "s", "n", "ɒ", "t", "ʃ", "ɪ", "p", "s"],
                    focus: "장모음(/iː/) vs 단모음(/ɪ/)",
                    referenceDuration: 3.0,
                    idealDuration: 3.3,
                    phonemeTags: ["장단모음", "S음"]
                },
                {
                    id: 14,
                    text: "The cook took a good look at the full book.",
                    difficulty: "medium",
                    targetPhonemes: ["ð", "k", "ʊ", "k", "t", "ʊ", "k", "ə", "g", "ʊ", "d", "l", "ʊ", "k", "æ", "t", "ð", "f", "ʊ", "l", "b", "ʊ", "k"],
                    focus: "/ʊ/ vs /uː/ 구분",
                    referenceDuration: 3.2,
                    idealDuration: 3.6,
                    phonemeTags: ["모음길이", "U음"]
                }
            ]
        },
        {
            id: 3,
            name: "억양 리듬",
            weight: 0.3,  // 전체 점수에서 30%
            description: "억양, 리듬, 속도 조절 능력 측정",
            sentences: [
                {
                    id: 15,
                    text: "Despite the incredibly complicated circumstances, we eventually succeeded.",
                    difficulty: "hard",
                    targetPhonemes: ["d", "ɪ", "s", "p", "aɪ", "t", "ð", "ɪ", "n", "k", "r", "e", "d", "ɪ", "b", "l", "iː", "k", "ɒ", "m", "p", "l", "ɪ", "k", "eɪ", "t", "ɪ", "d", "s", "ɜː", "k", "ə", "m", "s", "t", "æ", "n", "s", "ɪ", "z", "w", "iː", "ɪ", "v", "e", "n", "tʃ", "uː", "ə", "l", "iː", "s", "ə", "k", "s", "iː", "d", "ɪ", "d"],
                    focus: "긴 문장, 호흡 컨트롤",
                    referenceDuration: 5.0,
                    idealDuration: 5.5,
                    phonemeTags: ["긴문장", "호흡"]
                },
                {
                    id: 16,
                    text: "I didn't say he stole the money.",
                    difficulty: "medium",
                    targetPhonemes: ["aɪ", "d", "ɪ", "d", "n", "t", "s", "eɪ", "h", "iː", "s", "t", "əʊ", "l", "d", "ð", "m", "ʌ", "n", "iː"],
                    focus: "강세 위치에 따른 의미 변화",
                    referenceDuration: 2.5,
                    idealDuration: 3.0,
                    instructions: "각 단어에 강세를 다르게 주어 말해보세요",
                    phonemeTags: ["강세", "의미변화"]
                },
                {
                    id: 17,
                    text: "You want me to do what, when, where, and why?",
                    difficulty: "medium",
                    targetPhonemes: ["j", "uː", "w", "ɒ", "n", "t", "m", "iː", "t", "ə", "d", "uː", "w", "ɒ", "t", "w", "e", "n", "w", "eə", "æ", "n", "d", "w", "aɪ"],
                    focus: "의문사 억양 변화",
                    referenceDuration: 3.0,
                    idealDuration: 3.5,
                    phonemeTags: ["의문사", "억양변화"]
                },
                {
                    id: 18,
                    text: "Well, to be perfectly honest, I'm not entirely sure, but maybe...",
                    difficulty: "medium",
                    targetPhonemes: ["w", "e", "l", "t", "ə", "b", "iː", "p", "ɜː", "f", "ɪ", "k", "t", "l", "iː", "ɒ", "n", "ɪ", "s", "t", "aɪ", "m", "n", "ɒ", "t", "ɪ", "n", "t", "aɪ", "ə", "l", "iː", "ʃ", "ɔː", "b", "ʌ", "t", "m", "eɪ", "b", "iː"],
                    focus: "회화적 리듬, 필러 표현",
                    referenceDuration: 4.0,
                    idealDuration: 4.5,
                    phonemeTags: ["회화", "리듬"]
                },
                {
                    id: 19,
                    text: "How now brown cow? The rain in Spain stays mainly in the plain.",
                    difficulty: "hard",
                    targetPhonemes: ["h", "aʊ", "n", "aʊ", "b", "r", "aʊ", "n", "k", "aʊ", "ð", "r", "eɪ", "n", "ɪ", "n", "s", "p", "eɪ", "n", "s", "t", "eɪ", "z", "m", "eɪ", "n", "l", "iː", "ɪ", "n", "ð", "p", "l", "eɪ", "n"],
                    focus: "모음 이중모음, 운율",
                    referenceDuration: 4.5,
                    idealDuration: 5.0,
                    phonemeTags: ["이중모음", "운율"]
                },
                {
                    id: 20,
                    text: "Unique New York, you need New York, you know you need unique New York.",
                    difficulty: "hard",
                    targetPhonemes: ["j", "uː", "n", "iː", "k", "n", "j", "uː", "j", "ɔː", "k", "j", "uː", "n", "iː", "d", "n", "j", "uː", "j", "ɔː", "k", "j", "uː", "n", "əʊ", "j", "uː", "n", "iː", "d", "j", "uː", "n", "iː", "k", "n", "j", "uː", "j", "ɔː", "k"],
                    focus: "속도와 명료도 균형, 반복 발음",
                    referenceDuration: 4.0,
                    idealDuration: 4.8,
                    phonemeTags: ["속도", "반복발음"]
                }
            ]
        }
    ],

    // 난이도별 색상 매핑
    difficultyColors: {
        easy: "#4CAF50",      // 녹색
        medium: "#FF9800",    // 주황색
        hard: "#F44336"       // 빨간색
    },

    // 음소별 카테고리
    phonemeCategories: {
        "L/R": { color: "#2196F3", description: "L과 R 발음 구분" },
        "P/F": { color: "#9C27B0", description: "P와 F 발음 구분" },
        "장단모음": { color: "#FF9800", description: "모음 길이 차이" },
        "TH발음": { color: "#4CAF50", description: "θ와 ð 발음" },
        "S음": { color: "#795548", description: "S, Sh, Ch 발음" },
        "억양": { color: "#00BCD4", description: "억양과 인토네이션" },
        "강세": { color: "#E91E63", description: "단어 강세 위치" },
        "속도": { color: "#607D8B", description: "말하기 속도 조절" },
        "연음": { color: "#8BC34A", description: "단어 연결 발음" }
    },

    // S레벨 기준표
    sLevelCriteria: [
        {
            level: "S1",
            minScore: 0,
            maxScore: 20,
            title: "입문 단계",
            description: "기본 음소 발음부터 연습이 필요합니다.",
            feedback: "각 음소의 입모양과 혀 위치부터 연습해보세요.",
            color: "#FF5252"
        },
        {
            level: "S2",
            minScore: 21,
            maxScore: 35,
            title: "초급",
            description: "일부 단어만 식별 가능합니다.",
            feedback: "모음 길이에 집중해 'sheep'과 'ship'을 구분해보세요.",
            color: "#FF9800"
        },
        {
            level: "S3",
            minScore: 36,
            maxScore: 50,
            title: "초중급",
            description: "간단한 문장은 맥락으로 이해 가능합니다.",
            feedback: "단어 끝 소리를 완성하는 연습이 필요합니다.",
            color: "#FFC107"
        },
        {
            level: "S4",
            minScore: 51,
            maxScore: 60,
            title: "중급",
            description: "기본적인 의사소통이 가능하지만 자주 반복이 필요합니다.",
            feedback: "강세 위치를 정확히 파악해보세요.",
            color: "#8BC34A"
        },
        {
            level: "S5",
            minScore: 61,
            maxScore: 70,
            title: "중상급",
            description: "일상 대화의 대부분을 이해할 수 있습니다.",
            feedback: "단어 연결 시 연음 현상을 의식해보세요.",
            color: "#4CAF50"
        },
        {
            level: "S6",
            minScore: 71,
            maxScore: 80,
            title: "상급",
            description: "원활한 의사소통이 가능합니다.",
            feedback: "억양 곡선을 부드럽게 만드는 연습이 필요합니다.",
            color: "#2196F3"
        },
        {
            level: "S7",
            minScore: 81,
            maxScore: 88,
            title: "고급",
            description: "매우 명확한 발음, 가끔 억양이 부자연스러울 수 있습니다.",
            feedback: "속도 변화를 자연스럽게 조절해보세요.",
            color: "#3F51B5"
        },
        {
            level: "S8",
            minScore: 89,
            maxScore: 93,
            title: "원어민 수준",
            description: "원어민에 매우 가까운 발음입니다.",
            feedback: "지역별 억양 차이에 주의해보세요.",
            color: "#673AB7"
        },
        {
            level: "S9",
            minScore: 94,
            maxScore: 97,
            title: "전문가 수준",
            description: "사실상 원어민과 구분하기 어렵습니다.",
            feedback: "특정 관용구 발음만 교정이 필요합니다.",
            color: "#9C27B0"
        },
        {
            level: "S10",
            minScore: 98,
            maxScore: 100,
            title: "마스터",
            description: "완벽한 발음 명료도입니다.",
            feedback: "축하합니다! 전문 발음 코치 수준입니다.",
            color: "#E91E63"
        }
    ],

    // 음소별 분석 기준
    phonemeAnalysis: {
        "L/R": {
            description: "L과 R 발음 구분 정확도",
            improvementTips: [
                "L 발음: 혀끝을 윗니 뒤쪽에 댄 상태로 발음",
                "R 발음: 혀를 뒤로 말아 올린 상태로 발음",
                "미러 앞에서 입모양 관찰하기"
            ]
        },
        "P/F": {
            description: "입술 파열음(P)과 치순 마찰음(F) 구분",
            improvementTips: [
                "P 발음: 입술을 딱 붙였다가 터트리기",
                "F 발음: 윗니를 아랫입술에 대고 공기 내보내기",
                "종이 조각을 입 앞에 대고 연습하기"
            ]
        },
        "장단모음": {
            description: "모음 길이 차이 인지 및 발음",
            improvementTips: [
                "장모음: 입모양을 오래 유지하며 발음",
                "단모음: 짧고 경쾌하게 발음",
                "beat(장) vs bit(단) 비교 연습"
            ]
        },
        "TH발음": {
            description: "θ(무성 치 마찰음)와 ð(유성 치 마찰음) 발음",
            improvementTips: [
                "혀를 윗니와 아랫니 사이에 살짝 끼우기",
                "θ(thin): 무성음, ð(this): 유성음 구분",
                "거울 보며 혀 위치 확인하기"
            ]
        },
        "억양": {
            description: "문장의 음높이 변화와 리듬",
            improvementTips: [
                "의문문은 끝을 올려서 말하기",
                "강조할 단어는 음높이 높이기",
                "원어민 발음을 따라 말하며 리듬 익히기"
            ]
        }
    },

    // 개선을 위한 추천 연습
    practiceRecommendations: {
        beginner: [
            {
                title: "기본 음소 연습",
                duration: "10분/일",
                description: "L, R, P, F, TH 등 기본 음소 발음 연습",
                exercises: ["미러 앞에서 입모양 확인", "느리게 정확하게 발음하기"]
            },
            {
                title: "모음 길이 연습",
                duration: "5분/일",
                description: "장모음과 단모음 구분 연습",
                exercises: ["sheep vs ship", "pool vs pull"]
            }
        ],
        intermediate: [
            {
                title: "연음 연습",
                duration: "15분/일",
                description: "단어 연결 시 자연스러운 발음 연습",
                exercises: ["not at all → 'no-ta-tall'", "could you → 'could-ja'"]
            },
            {
                title: "억양 패턴 연습",
                duration: "10분/일",
                description: "문장 종류별 억양 연습",
                exercises: ["의문문 끝 올리기", "강조할 단어 찾기"]
            }
        ],
        advanced: [
            {
                title: "속도 변화 연습",
                duration: "20분/일",
                description: "빠르고 느린 부분 조절 연습",
                exercises: ["중요한 부분은 천천히", "부가정보는 빠르게"]
            },
            {
                title: "자연스러운 리듬 연습",
                duration: "15분/일",
                description: "원어민처럼 자연스러운 리듬 만들기",
                exercises: ["스트레스-타임 리듬 패턴", "음절 강세 연습"]
            }
        ]
    },

    // 메서드: 모든 문장 가져오기
    getAllSentences() {
        const allSentences = [];
        this.rounds.forEach(round => {
            round.sentences.forEach(sentence => {
                allSentences.push({
                    ...sentence,
                    roundName: round.name,
                    roundWeight: round.weight
                });
            });
        });
        return allSentences;
    },

    // 메서드: 총 문장 수
    getTotalSentenceCount() {
        return this.rounds.reduce((total, round) => total + round.sentences.length, 0);
    },

    // 메서드: S레벨 계산
    calculateSLevel(score) {
        const level = this.sLevelCriteria.find(
            criteria => score >= criteria.minScore && score <= criteria.maxScore
        );
        return level || this.sLevelCriteria[0];
    },

    // 메서드: 난이도별 색상
    getDifficultyColor(difficulty) {
        return this.difficultyColors[difficulty] || "#757575";
    },

    // 메서드: 음소 태그 생성
    generatePhonemeTags(phonemeTags) {
        if (!phonemeTags || !Array.isArray(phonemeTags)) return [];
        
        return phonemeTags.map(tag => {
            const category = this.phonemeCategories[tag];
            return {
                name: tag,
                color: category ? category.color : "#757575",
                description: category ? category.description : ""
            };
        });
    },

    // 메서드: 문장별 분석 기준 가져오기
    getSentenceAnalysis(sentenceId) {
        let targetSentence = null;
        let roundInfo = null;
        
        for (const round of this.rounds) {
            const found = round.sentences.find(s => s.id === sentenceId);
            if (found) {
                targetSentence = found;
                roundInfo = round;
                break;
            }
        }
        
        if (!targetSentence) return null;
        
        return {
            sentence: targetSentence,
            round: roundInfo,
            phonemeTags: this.generatePhonemeTags(targetSentence.phonemeTags)
        };
    }
};

// 글로벌에서 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.SentenceBank = SentenceBank;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SentenceBank;
}
