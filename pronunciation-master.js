// 마이크 권한을 위한 수정된 JavaScript 코드 (기존 코드 대체)

// ===== 마이크 권한 핸들러 =====
class MicrophoneHandler {
    constructor() {
        this.stream = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.permissionGranted = false;
    }

    // 사용자 상호작용으로 마이크 권한 요청
    async requestMicrophonePermission() {
        try {
            // 이미 권한이 있는지 먼저 확인
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
            
            if (permissionStatus.state === 'granted') {
                this.permissionGranted = true;
                return true;
            }
            
            // 사용자 상호작용이 필요 - 버튼 클릭으로만 가능
            return false;
            
        } catch (error) {
            console.log('Permission API not supported:', error);
            return false;
        }
    }

    // 녹음 시작 (사용자 상호작용 후 호출)
    async startRecording() {
        try {
            // 사용자 상호작용 후 바로 마이크 접근 시도
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1
                },
                video: false
            });
            
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start();
            this.permissionGranted = true;
            
            return true;
            
        } catch (error) {
            console.error('마이크 접근 실패:', error);
            
            let errorMessage = '마이크 접근에 실패했습니다.';
            if (error.name === 'NotAllowedError') {
                errorMessage = '마이크 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '마이크를 사용할 수 없습니다. 다른 프로그램이 마이크를 사용 중일 수 있습니다.';
            }
            
            throw new Error(errorMessage);
        }
    }

    async stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                
                // 스트림 정리
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }
                
                resolve({
                    blob: audioBlob,
                    duration: this.audioChunks.length * 100 // 가정된 지속 시간
                });
            };

            this.mediaRecorder.stop();
        });
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
    }
}

// ===== 수정된 이벤트 핸들러 =====
// 기존의 startRecording, stopRecording 함수를 대체합니다

// 새로운 이벤트 핸들러 추가
let microphoneHandler = null;

async function initializeMicrophone() {
    if (!microphoneHandler) {
        microphoneHandler = new MicrophoneHandler();
    }
    
    // 버튼 텍스트 변경
    const recordBtn = document.getElementById('startRecordingBtn');
    if (recordBtn) {
        recordBtn.innerHTML = '<i class="fas fa-microphone-alt"></i>';
        recordBtn.title = '마이크 권한 허용 후 녹음 시작';
    }
}

async function safeStartRecording() {
    try {
        if (!microphoneHandler) {
            await initializeMicrophone();
        }
        
        // 마이크 권한 확인 메시지
        showMessage('마이크 권한 요청 중...', 'info');
        
        await microphoneHandler.startRecording();
        
        // 녹음 UI 업데이트
        updateRecordingUI(true);
        
        showMessage('녹음이 시작되었습니다. 문장을 말씀해주세요.', 'success');
        
    } catch (error) {
        showDetailedError(error.message);
        return false;
    }
    return true;
}

async function safeStopRecording() {
    if (!microphoneHandler) return null;
    
    try {
        const result = await microphoneHandler.stopRecording();
        
        if (result) {
            updateRecordingUI(false);
            
            // 점수 계산 (시뮬레이션)
            const score = calculateSimulatedScore();
            
            // 다음 버튼 활성화
            elements.buttons.nextSentence.disabled = false;
            
            showMessage(`녹음 완료! 예상 점수: ${score}점`, 'success');
            
            return score;
        }
    } catch (error) {
        showMessage('녹음 중 오류가 발생했습니다.', 'error');
    }
    
    return null;
}

function calculateSimulatedScore() {
    // 실제 음성 분석이 없으므로 시뮬레이션 점수
    const baseScores = [65, 72, 58, 80, 68, 75, 85, 78, 82, 70];
    const randomIndex = Math.floor(Math.random() * baseScores.length);
    return baseScores[randomIndex];
}

// ===== 상세 오류 메시지 표시 =====
function showDetailedError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'detailed-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 500px;
        width: 90%;
        text-align: center;
    `;
    
    errorDiv.innerHTML = `
        <h3 style="color: #f44336; margin-bottom: 20px;">
            <i class="fas fa-exclamation-triangle"></i> 마이크 오류
        </h3>
        <p style="margin-bottom: 20px; line-height: 1.5;">${message}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
            <p style="font-weight: bold; margin-bottom: 10px;">해결 방법:</p>
            <ol style="margin-left: 20px;">
                <li>브라우저 주소창의 🔒 아이콘 클릭</li>
                <li>"사이트 설정" 또는 "권한" 선택</li>
                <li>마이크 권한을 "허용"으로 변경</li>
                <li>페이지 새로고침 후 다시 시도</li>
            </ol>
        </div>
        <button onclick="this.parentNode.remove()" 
                style="background: #4361ee; color: white; border: none; padding: 10px 30px; 
                       border-radius: 5px; cursor: pointer; font-weight: bold;">
            확인
        </button>
        <button onclick="location.reload()" 
                style="background: #f8f9fa; color: #333; border: 1px solid #ddd; padding: 10px 30px; 
                       border-radius: 5px; cursor: pointer; margin-left: 10px;">
            페이지 새로고침
        </button>
    `;
    
    document.body.appendChild(errorDiv);
}

// ===== 초기화 시 마이크 상태 확인 =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('마이크 시스템 초기화 중...');
    
    // 시작 버튼에 마이크 테스트 기능 추가
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        const originalClick = startBtn.onclick;
        startBtn.onclick = async function(e) {
            // 마이크 권한 테스트
            try {
                showMessage('마이크 접근 권한 확인 중...', 'info');
                
                // 간단한 권한 확인
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasMicrophone = devices.some(device => 
                    device.kind === 'audioinput' && device.deviceId !== ''
                );
                
                if (hasMicrophone) {
                    console.log('마이크가 감지되었습니다.');
                    showMessage('마이크가 준비되었습니다.', 'success');
                    if (originalClick) originalClick.call(this, e);
                } else {
                    showMessage('마이크를 찾을 수 없습니다.', 'warning');
                    // 그래도 진행 가능
                    if (originalClick) originalClick.call(this, e);
                }
                
            } catch (error) {
                console.log('마이크 확인 중 오류:', error);
                // 오류가 발생해도 테스트 진행
                showMessage('마이크 확인 중 오류가 발생했습니다. 테스트는 진행됩니다.', 'warning');
                if (originalClick) originalClick.call(this, e);
            }
        };
    }
    
    // 테스트 화면으로 이동 시 마이크 핸들러 초기화
    const originalShowScreen = window.showScreen;
    window.showScreen = function(screenName) {
        if (screenName === 'test') {
            initializeMicrophone();
        }
        if (originalShowScreen) originalShowScreen(screenName);
    };
});
