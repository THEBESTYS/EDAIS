// audio-processor.js - Web Audio API 기반 음성 처리 엔진

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordingStartTime = 0;
        this.analyser = null;
        this.dataArray = null;
        this.audioBuffer = null;
        
        // 오디오 설정
        this.audioConstraints = {
            audio: {
                channelCount: 1,
                sampleRate: 44100,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };
        
        // 녹음 설정
        this.recordingOptions = {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 128000
        };
        
        // 분석 설정
        this.fftSize = 2048;
        this.bufferLength = 0;
        
        // 실시간 시각화를 위한 변수
        this.volumeHistory = [];
        this.maxHistoryLength = 60;
        
        // 오디오 품질 기준
        this.qualityThresholds = {
            minVolume: -40,    // dB
            maxVolume: -5,     // dB
            maxNoise: 50,      // dB
            minDuration: 0.5,  // 초
            maxDuration: 10    // 초
        };
    }

    // 오디오 컨텍스트 초기화
    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();
        }
        return this.audioContext;
    }

    // 마이크 접근 및 스트림 얻기
    async getMicrophoneStream() {
        try {
            if (!this.audioStream) {
                this.audioStream = await navigator.mediaDevices.getUserMedia(this.audioConstraints);
            }
            return this.audioStream;
        } catch (error) {
            console.error('마이크 접근 실패:', error);
            throw new Error(`마이크 접근 실패: ${error.message}`);
        }
    }

    // 캘리브레이션: 음량 및 소음 분석
    async calibrateMicrophone() {
        try {
            const stream = await this.getMicrophoneStream();
            const audioContext = await this.initAudioContext();
            
            // 분석 노드 설정
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            
            source.connect(analyser);
            
            // 데이터 배열
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            // 1초간 샘플 수집
            return new Promise((resolve) => {
                let samples = [];
                let sampleCount = 0;
                const maxSamples = 30; // 약 1초 (30프레임)
                
                const analyzeFrame = () => {
                    analyser.getByteFrequencyData(dataArray);
                    
                    // 볼륨 계산 (RMS)
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i] * dataArray[i];
                    }
                    const rms = Math.sqrt(sum / dataArray.length);
                    const db = 20 * Math.log10(rms / 255);
                    
                    samples.push(db);
                    sampleCount++;
                    
                    if (sampleCount < maxSamples) {
                        requestAnimationFrame(analyzeFrame);
                    } else {
                        // 평균 및 표준편차 계산
                        const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
                        
                        // 표준편차 계산 (소음 수준 추정)
                        const squaredDiffs = samples.map(sample => Math.pow(sample - avg, 2));
                        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
                        const stdDev = Math.sqrt(variance);
                        
                        // 배경 소음 추정 (저주파 대역 평균)
                        const lowFreqAvg = Array.from(dataArray.slice(0, 10))
                            .reduce((a, b) => a + b, 0) / 10;
                        const noiseLevel = 20 * Math.log10(lowFreqAvg / 255);
                        
                        resolve({
                            volume: avg,
                            noise: noiseLevel,
                            stdDev: stdDev,
                            isValid: avg > this.qualityThresholds.minVolume && 
                                    noiseLevel < this.qualityThresholds.maxNoise
                        });
                    }
                };
                
                analyzeFrame();
            });
            
        } catch (error) {
            console.error('캘리브레이션 실패:', error);
            throw error;
        }
    }

    // 녹음 시작
    async startRecording() {
        try {
            const stream = await this.getMicrophoneStream();
            await this.initAudioContext();
            
            // MediaRecorder 초기화
            if (MediaRecorder.isTypeSupported(this.recordingOptions.mimeType)) {
                this.mediaRecorder = new MediaRecorder(stream, this.recordingOptions);
            } else {
                this.mediaRecorder = new MediaRecorder(stream);
            }
            
            this.audioChunks = [];
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // 데이터 수집 이벤트 리스너
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            // 녹음 시작
            this.mediaRecorder.start(100); // 100ms 단위로 데이터 수집
            
            return true;
            
        } catch (error) {
            console.error('녹음 시작 실패:', error);
            this.isRecording = false;
            throw error;
        }
    }

    // 녹음 정지
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('녹음이 진행중이지 않습니다.'));
                return;
            }
            
            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;
                const duration = (Date.now() - this.recordingStartTime) / 1000;
                
                try {
                    // 오디오 Blob 생성
                    const audioBlob = new Blob(this.audioChunks, { 
                        type: this.mediaRecorder.mimeType 
                    });
                    
                    // 오디오 버퍼로 변환
                    const audioBuffer = await this.blobToAudioBuffer(audioBlob);
                    
                    // 기본 품질 검사
                    const qualityCheck = this.checkAudioQuality(audioBuffer, duration);
                    
                    if (!qualityCheck.isValid) {
                        reject(new Error(qualityCheck.message));
                        return;
                    }
                    
                    resolve({
                        blob: audioBlob,
                        buffer: audioBuffer,
                        duration: duration,
                        sampleRate: audioBuffer.sampleRate,
                        quality: qualityCheck
                    });
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            this.mediaRecorder.stop();
        });
    }

    // Blob을 AudioBuffer로 변환
    async blobToAudioBuffer(blob) {
        return new Promise(async (resolve, reject) => {
            try {
                const arrayBuffer = await blob.arrayBuffer();
                const audioContext = await this.initAudioContext();
                
                audioContext.decodeAudioData(arrayBuffer, resolve, reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 오디오 품질 검사
    checkAudioQuality(audioBuffer, duration) {
        const issues = [];
        
        // 1. 길이 검사
        if (duration < this.qualityThresholds.minDuration) {
            issues.push('녹음 시간이 너무 짧습니다.');
        }
        if (duration > this.qualityThresholds.maxDuration) {
            issues.push('녹음 시간이 너무 깁니다.');
        }
        
        // 2. 음량 분석
        const channelData = audioBuffer.getChannelData(0);
        const { rms, peak, min } = this.analyzeVolume(channelData);
        
        const avgDb = 20 * Math.log10(rms);
        const peakDb = 20 * Math.log10(Math.abs(peak));
        
        if (avgDb < this.qualityThresholds.minVolume) {
            issues.push('음량이 너무 작습니다.');
        }
        if (peakDb > this.qualityThresholds.maxVolume) {
            issues.push('음량이 너무 큽니다 (클리핑).');
        }
        
        // 3. 무음 검출
        const silencePercentage = this.detectSilence(channelData, audioBuffer.sampleRate);
        if (silencePercentage > 50) {
            issues.push('무음 구간이 너무 많습니다.');
        }
        
        // 4. 소음 검출 (저주파 에너지 비율)
        const noiseLevel = this.analyzeNoise(channelData, audioBuffer.sampleRate);
        if (noiseLevel > this.qualityThresholds.maxNoise) {
            issues.push('배경 소음이 너무 많습니다.');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            metrics: {
                duration: duration,
                avgVolume: avgDb,
                peakVolume: peakDb,
                minVolume: 20 * Math.log10(Math.abs(min)),
                silencePercentage: silencePercentage,
                noiseLevel: noiseLevel,
                rms: rms,
                peak: peak
            }
        };
    }

    // 음량 분석 (RMS, Peak)
    analyzeVolume(channelData) {
        let sum = 0;
        let peak = 0;
        let min = 0;
        
        for (let i = 0; i < channelData.length; i++) {
            const value = channelData[i];
            sum += value * value;
            
            if (Math.abs(value) > Math.abs(peak)) {
                peak = value;
            }
            if (Math.abs(value) < Math.abs(min)) {
                min = value;
            }
        }
        
        const rms = Math.sqrt(sum / channelData.length);
        return { rms, peak, min };
    }

    // 무음 구간 검출
    detectSilence(channelData, sampleRate, threshold = 0.01) {
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms window
        let silentFrames = 0;
        let totalFrames = 0;
        
        for (let i = 0; i < channelData.length; i += windowSize) {
            const frame = channelData.slice(i, i + windowSize);
            const frameRms = Math.sqrt(
                frame.reduce((sum, val) => sum + val * val, 0) / frame.length
            );
            
            if (frameRms < threshold) {
                silentFrames++;
            }
            totalFrames++;
        }
        
        return (silentFrames / totalFrames) * 100;
    }

    // 소음 분석 (저주파 대역 에너지)
    analyzeNoise(channelData, sampleRate) {
        // 간단한 저주파 에너지 계산 (0-500Hz)
        const fftSize = 1024;
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        
        const bufferSource = this.audioContext.createBufferSource();
        const audioBuffer = this.audioContext.createBuffer(1, channelData.length, sampleRate);
        audioBuffer.getChannelData(0).set(channelData);
        bufferSource.buffer = audioBuffer;
        
        bufferSource.connect(analyser);
        bufferSource.start();
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // 저주파 대역 평균 (0-500Hz)
        const lowFreqBin = Math.floor(500 * fftSize / sampleRate);
        let lowFreqSum = 0;
        for (let i = 0; i < lowFreqBin; i++) {
            lowFreqSum += dataArray[i];
        }
        const lowFreqAvg = lowFreqSum / lowFreqBin;
        
        return 20 * Math.log10(lowFreqAvg / 255);
    }

    // 발음 명료도 분석 (간소화된 버전)
    analyzePronunciation(userBuffer, referenceText) {
        // 실제 구현에서는 MFCC, DTW 등 복잡한 알고리즘 필요
        // 여기서는 단순화된 특징 추출과 비교
        
        const features = this.extractAudioFeatures(userBuffer);
        const referenceFeatures = this.getReferenceFeatures(referenceText);
        
        // 특징 비교 (유사도 계산)
        const similarity = this.calculateSimilarity(features, referenceFeatures);
        
        // 음소별 분석
        const phonemeAnalysis = this.analyzePhonemes(userBuffer, referenceText);
        
        return {
            clarityScore: Math.min(100, Math.max(0, similarity * 100)),
            features: features,
            phonemeAnalysis: phonemeAnalysis,
            feedback: this.generatePronunciationFeedback(similarity, phonemeAnalysis)
        };
    }

    // 오디오 특징 추출
    extractAudioFeatures(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        // 1. 기본 통계
        const { rms, peak } = this.analyzeVolume(channelData);
        
        // 2. 제로 크로싱 레이트 (발음 명료도 지표)
        const zcr = this.calculateZeroCrossingRate(channelData);
        
        // 3. 스펙트럼 중심 (spectral centroid) - 음색 특징
        const centroid = this.calculateSpectralCentroid(channelData, sampleRate);
        
        // 4. 포먼트 주파수 추정 (단순화)
        const formants = this.estimateFormants(channelData, sampleRate);
        
        // 5. 발화 속도 (음절 수 추정)
        const speechRate = this.estimateSpeechRate(channelData, sampleRate);
        
        return {
            duration: audioBuffer.duration,
            rms: rms,
            peak: peak,
            zcr: zcr,
            centroid: centroid,
            formants: formants,
            speechRate: speechRate,
            sampleRate: sampleRate
        };
    }

    // 제로 크로싱 레이트 계산
    calculateZeroCrossingRate(channelData) {
        let crossings = 0;
        for (let i = 1; i < channelData.length; i++) {
            if ((channelData[i-1] >= 0 && channelData[i] < 0) || 
                (channelData[i-1] < 0 && channelData[i] >= 0)) {
                crossings++;
            }
        }
        return crossings / channelData.length;
    }

    // 스펙트럼 중심 계산
    calculateSpectralCentroid(channelData, sampleRate) {
        const fftSize = 2048;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        
        const bufferSource = audioContext.createBufferSource();
        const audioBuffer = audioContext.createBuffer(1, channelData.length, sampleRate);
        audioBuffer.getChannelData(0).set(channelData);
        bufferSource.buffer = audioBuffer;
        
        bufferSource.connect(analyser);
        bufferSource.start();
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        let total = 0;
        let weightedTotal = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            const value = dataArray[i];
            total += value;
            weightedTotal += value * i;
        }
        
        const centroid = total > 0 ? (weightedTotal / total) * (sampleRate / 2) / dataArray.length : 0;
        audioContext.close();
        
        return centroid;
    }

    // 포먼트 주파수 추정 (단순화)
    estimateFormants(channelData, sampleRate) {
        // 실제 포먼트 분석은 LPC 등 복잡한 알고리즘 필요
        // 여기서는 스펙트럼 피크로 대체
        const fftSize = 4096;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        
        const bufferSource = audioContext.createBufferSource();
        const audioBuffer = audioContext.createBuffer(1, channelData.length, sampleRate);
        audioBuffer.getChannelData(0).set(channelData);
        bufferSource.buffer = audioBuffer;
        
        bufferSource.connect(analyser);
        bufferSource.start();
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // 상위 3개 피크 찾기
        const peaks = [];
        for (let i = 1; i < dataArray.length - 1; i++) {
            if (dataArray[i] > dataArray[i-1] && dataArray[i] > dataArray[i+1]) {
                peaks.push({
                    frequency: i * (sampleRate / 2) / dataArray.length,
                    magnitude: dataArray[i]
                });
            }
        }
        
        peaks.sort((a, b) => b.magnitude - a.magnitude);
        audioContext.close();
        
        return peaks.slice(0, 3).map(p => p.frequency);
    }

    // 발화 속도 추정
    estimateSpeechRate(channelData, sampleRate) {
        // 음절 수 추정 (에너지 피크 기반)
        const windowSize = Math.floor(sampleRate * 0.03); // 30ms
        const threshold = 0.02;
        let syllableCount = 0;
        let inSyllable = false;
        
        for (let i = 0; i < channelData.length; i += windowSize) {
            const frame = channelData.slice(i, i + windowSize);
            const frameEnergy = Math.sqrt(
                frame.reduce((sum, val) => sum + val * val, 0) / frame.length
            );
            
            if (frameEnergy > threshold && !inSyllable) {
                syllableCount++;
                inSyllable = true;
            } else if (frameEnergy <= threshold) {
                inSyllable = false;
            }
        }
        
        const duration = channelData.length / sampleRate;
        return syllableCount / duration; // 초당 음절 수
    }

    // 참조 특징 가져오기 (실제로는 DB에서)
    getReferenceFeatures(referenceText) {
        // 간단한 해시 기반 가상 특징
        const textHash = this.hashString(referenceText);
        
        return {
            idealZcr: 0.15 + (textHash % 100) / 1000,
            idealCentroid: 1000 + (textHash % 1000),
            idealSpeechRate: 4 + (textHash % 100) / 50
        };
    }

    // 유사도 계산
    calculateSimilarity(features, referenceFeatures) {
        // 각 특징별 가중치
        const weights = {
            zcr: 0.3,
            centroid: 0.4,
            speechRate: 0.3
        };
        
        // 정규화된 차이 계산
        const zcrDiff = Math.abs(features.zcr - referenceFeatures.idealZcr) / 0.1;
        const centroidDiff = Math.abs(features.centroid - referenceFeatures.idealCentroid) / 500;
        const speechRateDiff = Math.abs(features.speechRate - referenceFeatures.idealSpeechRate) / 2;
        
        // 유사도 점수 (1 - 평균 차이)
        const avgDiff = (
            zcrDiff * weights.zcr + 
            centroidDiff * weights.centroid + 
            speechRateDiff * weights.speechRate
        ) / 3;
        
        return Math.max(0, 1 - avgDiff);
    }

    // 음소 분석 (단순화)
    analyzePhonemes(audioBuffer, referenceText) {
        // 실제로는 음소 인식 모델 필요
        // 여기서는 예시 데이터 반환
        const commonIssues = [
            { phoneme: 'L/R', accuracy: 85, issue: 'R 발음이 L처럼 들림' },
            { phoneme: 'TH', accuracy: 70, issue: 'θ가 s처럼 발음됨' },
            { phoneme: 'Vowels', accuracy: 90, issue: '모음 길이 일관성 필요' }
        ];
        
        return commonIssues;
    }

    // 발음 피드백 생성
    generatePronunciationFeedback(similarity, phonemeAnalysis) {
        const feedback = [];
        
        if (similarity < 0.5) {
            feedback.push('전체적인 발음 명료도를 높일 필요가 있습니다.');
        } else if (similarity < 0.7) {
            feedback.push('괜찮은 발음이지만 개선의 여지가 있습니다.');
        } else if (similarity < 0.9) {
            feedback.push('매우 좋은 발음입니다!');
        } else {
            feedback.push('완벽에 가까운 발음입니다!');
        }
        
        phonemeAnalysis.forEach(analysis => {
            if (analysis.accuracy < 70) {
                feedback.push(`${analysis.phoneme}: ${analysis.issue}`);
            }
        });
        
        return feedback;
    }

    // 문자열 해시 함수
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // 실시간 볼륨 미터를 위한 데이터 가져오기
    getVolumeData() {
        if (!this.analyser || !this.dataArray) {
            return { volume: 0, frequencyData: [] };
        }
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // 평균 볼륨 계산
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const avgVolume = sum / this.dataArray.length;
        
        // 볼륨 기록 업데이트
        this.volumeHistory.push(avgVolume);
        if (this.volumeHistory.length > this.maxHistoryLength) {
            this.volumeHistory.shift();
        }
        
        return {
            volume: avgVolume,
            volumeHistory: [...this.volumeHistory],
            frequencyData: Array.from(this.dataArray)
        };
    }

    // 리소스 정리
    cleanup() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isRecording = false;
        this.audioChunks = [];
        this.volumeHistory = [];
    }
}

// 글로벌에서 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.AudioProcessor = AudioProcessor;
}

// CommonJS 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioProcessor;
}
