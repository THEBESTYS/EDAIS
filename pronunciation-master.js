// ===== CORE 5 SENTENCES PRONUNCIATION TEST =====

const CORE_SENTENCES = [
    {
        id: 1,
        text: "She sells seashells by the seashore.",
        focus: ["/ʃ/", "/s/", "/l/"],
        difficulty: 7
    },
    {
        id: 2,
        text: "How now brown cow?",
        focus: ["/aʊ/", "/aʊ/", "/aʊ/"],
        difficulty: 5
    },
    {
        id: 3,
        text: "Three free throws through the hoop.",
        focus: ["/θ/", "/r/", "/uː/"],
        difficulty: 8
    },
    {
        id: 4,
        text: "Very brave veterans validate victory.",
        focus: ["/v/", "/b/", "/r/"],
        difficulty: 6
    },
    {
        id: 5,
        text: "Lily really rarely replies early.",
        focus: ["/l/", "/r/", "/ɪ/"],
        difficulty: 9
    }
];

class Core5Evaluator {
    constructor() {
        this.scores = [];
        this.recordings = [];
    }
    
    // 평가 시작
    async evaluateAll() {
        this.scores = [];
        this.recordings = [];
        
        for (let i = 0; i < CORE_SENTENCES.length; i++) {
            const score = await this.evaluateSentence(i);
            this.scores.push(score);
        }
        
        return this.calculateFinalScore();
    }
    
    // 개별 문장 평가
    async evaluateSentence(index) {
        const sentence = CORE_SENTENCES[index];
        
        // 1. 녹음 시도
        const recording = await this.recordSentence(sentence.text);
        if (!recording || recording.duration < 1) {
            return {
                sentenceId: sentence.id,
                score: 0,
                reason: "녹음 없음 또는 너무 짧음"
            };
        }
        
        // 2. 실제 발음 분석 (간소화된 버전)
        const pronunciationScore = this.analyzePronunciation(recording.audioData, sentence);
        
        // 3. 최종 점수 계산
        const finalScore = Math.floor(
            pronunciationScore * (sentence.difficulty / 10) * 0.8 + 
            Math.random() * 20  // 실제 데이터가 없으므로 랜덤 요소
        );
        
        return {
            sentenceId: sentence.id,
            text: sentence.text,
            score: Math.min(100, Math.max(0, finalScore)),
            focus: sentence.focus
        };
    }
    
    // 간단한 녹음 함수
    async recordSentence(text) {
        return new Promise((resolve) => {
            // 실제 구현에서는 MediaRecorder 사용
            setTimeout(() => {
                resolve({
                    audioData: "fake_audio_data",
                    duration: 3 + Math.random() * 2,
                    timestamp: Date.now()
                });
            }, 1000);
        });
    }
    
    // 발음 분석 (실제 구현은 음성 인식 API 필요)
    analyzePronunciation(audioData, sentence) {
        // 여기에 실제 음성 분석 로직
        // 현재는 더미 데이터 반환
        return 60 + Math.random() * 30;
    }
    
    // 최종 점수 계산
    calculateFinalScore() {
        if (this.scores.length === 0) return 0;
        
        // 모든 문장 점수 평균
        const total = this.scores.reduce((sum, item) => sum + item.score, 0);
        const average = total / this.scores.length;
        
        // S레벨 매핑 (기존 기준 유지)
        const sLevel = this.getSLevel(average);
        
        return {
            totalScore: Math.round(average),
            sLevel: sLevel.level,
            levelDescription: sLevel.description,
            breakdown: this.scores,
            timestamp: new Date().toISOString()
        };
    }
    
    // 기존 S레벨 기준 적용
    getSLevel(score) {
        const thresholds = [
            { level: 1, min: 0, max: 20, desc: "기본 발음 연습 필요" },
            { level: 2, min: 21, max: 35, desc: "초보자 수준" },
            { level: 3, min: 36, max: 50, desc: "기본 의사소통 가능" },
            { level: 4, min: 51, max: 60, desc: "일상 대화 가능" },
            { level: 5, min: 61, max: 70, desc: "평균 이상" },
            { level: 6, min: 71, max: 80, desc: "원활한 의사소통" },
            { level: 7, min: 81, max: 88, desc: "우수한 발음" },
            { level: 8, min: 89, max: 93, desc: "원어민에 가까움" },
            { level: 9, min: 94, max: 97, desc: "완벽에 가까움" },
            { level: 10, min: 98, max: 100, desc: "완벽" }
        ];
        
        for (const threshold of thresholds) {
            if (score >= threshold.min && score <= threshold.max) {
                return {
                    level: threshold.level,
                    description: threshold.desc
                };
            }
        }
        
        return { level: 1, description: "평가 불가" };
    }
}

// ===== 실행 예제 =====
async function runCore5Test() {
    console.log("🎤 코어 5문장 발음 평가 시작");
    console.log("=" .repeat(50));
    
    const evaluator = new Core5Evaluator();
    const result = await evaluator.evaluateAll();
    
    // 결과 출력
    console.log(`\n📊 최종 결과:`);
    console.log(`총점: ${result.totalScore}점`);
    console.log(`S레벨: S${result.sLevel}`);
    console.log(`평가: ${result.levelDescription}`);
    
    console.log("\n📝 문장별 점수:");
    result.breakdown.forEach(item => {
        console.log(`  ${item.text.substring(0, 30)}... : ${item.score}점`);
    });
    
    console.log("\n✅ 평가 완료!");
    return result;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.createElement('button');
    startButton.textContent = "🎤 5문장 발음 평가 시작";
    startButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 30px;
        background: linear-gradient(135deg, #4361ee, #3a56d4);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);
        z-index: 9999;
    `;
    
    startButton.onclick = runCore5Test;
    document.body.appendChild(startButton);
});
