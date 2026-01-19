// 전역 변수
let currentStep = 1;
let uploadedFile = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;
let isRecording = false;
let hasAgreedToDisclaimer = false;

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 모바일 환경 감지 및 최적화
    optimizeForMobile();
    
    // 파일 업로드 이벤트 리스너
    setupFileUpload();
    
    // 직접 녹음 기능 설정
    setupDirectRecording();
    
    // 페이지 로드 시 첫 번째 단계 활성화
    goToStep(1);
    
    // 버튼 호버 효과
    setupButtonEffects();
    
    // 디스클레이머 동의 체크
    setupDisclaimerAgreement();
    
    // FAQ 토글 기능
    setupFaqToggle();
});

// FAQ 토글 설정
function setupFaqToggle() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
}

// 모바일 환경 최적화
function optimizeForMobile() {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('모바일 환경 감지, 최적화 적용');
        
        // 모바일에서는 직접 녹음을 기본 옵션으로 표시
        document.getElementById('directRecordingSection').style.display = 'block';
        document.getElementById('fileUploadSection').style.display = 'none';
        
        // 모바일 가이드 표시
        const mobileGuide = document.getElementById('mobileGuide');
        if (mobileGuide) mobileGuide.style.display = 'block';
        
        // 터치 이벤트 최적화
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
                btn.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                const btn = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
                btn.classList.remove('touch-active');
            }
        }, { passive: true });
    }
}

// 디스클레이머 동의 설정
function setupDisclaimerAgreement() {
    const disclaimerCheckbox = document.getElementById('disclaimerAgree');
    const startTestBtn = document.getElementById('startTestBtn');
    
    if (disclaimerCheckbox && startTestBtn) {
        disclaimerCheckbox.addEventListener('change', function() {
            hasAgreedToDisclaimer = this.checked;
            startTestBtn.disabled = !this.checked;
            
            if (this.checked) {
                startTestBtn.classList.add('active');
                startTestBtn.classList.remove('disabled');
            } else {
                startTestBtn.classList.remove('active');
                startTestBtn.classList.add('disabled');
            }
        });
    }
}

// 버튼 효과 설정
function setupButtonEffects() {
    // 모든 버튼에 호버 효과 추가
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('hover-effect');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('hover-effect');
        });
    });
}

// 단계 이동 함수
function goToStep(stepNumber) {
    // 현재 활성화된 단계 비활성화
    const currentActive = document.querySelector('.step-content.active');
    if (currentActive) {
        currentActive.classList.remove('active');
        currentActive.classList.add('fade-out');
        
        setTimeout(() => {
            currentActive.classList.remove('fade-out');
        }, 300);
    }
    
    const currentStepElement = document.querySelector(`.step[data-step="${currentStep}"]`);
    if (currentStepElement) {
        currentStepElement.classList.remove('active');
    }
    
    // 새로운 단계 활성화
    const newStep = document.getElementById(`step-${stepNumber}`);
    if (newStep) {
        newStep.classList.add('fade-in');
        setTimeout(() => {
            newStep.classList.remove('fade-in');
            newStep.classList.add('active');
        }, 50);
    }
    
    const newStepElement = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (newStepElement) {
        newStepElement.classList.add('active');
    }
    
    // Step 4(분석)로 이동할 때 AI 분석 시뮬레이션 시작
    if (stepNumber === 4 && uploadedFile) {
        setTimeout(() => {
            simulateAnalysis();
        }, 500);
    }
    
    // Step 5로 이동할 때 결과 표시
    if (stepNumber === 5) {
        setTimeout(() => {
            displayFinalResults();
        }, 500);
    }
    
    currentStep = stepNumber;
    scrollToTop();
    
    // 시각적 효과: 단계 변경 시 하이라이트
    highlightCurrentStep();
    
    // Step 3에 도달하면 디스클레이머 확인
    if (stepNumber === 3 && !hasAgreedToDisclaimer) {
        showDisclaimerReminder();
    }
}

// 디스클레이머 리마인더 표시
function showDisclaimerReminder() {
    const disclaimerReminder = document.getElementById('disclaimerReminder');
    if (disclaimerReminder) {
        disclaimerReminder.style.display = 'block';
        disclaimerReminder.classList.add('reminder-show');
        
        // 5초 후 자동 숨김
        setTimeout(() => {
            disclaimerReminder.classList.remove('reminder-show');
            setTimeout(() => {
                disclaimerReminder.style.display = 'none';
            }, 300);
        }, 5000);
    }
}

// 현재 단계 하이라이트
function highlightCurrentStep() {
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => {
        content.classList.remove('highlighted');
    });
    
    const currentContent = document.getElementById(`step-${currentStep}`);
    if (currentContent) {
        setTimeout(() => {
            currentContent.classList.add('highlighted');
            setTimeout(() => {
                currentContent.classList.remove('highlighted');
            }, 1000);
        }, 300);
    }
}

// 파일 업로드 설정
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('audioFile');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    
    // 파일 선택 버튼 클릭
    if (fileSelectBtn) {
        fileSelectBtn.addEventListener('click', function() {
            fileInput.click();
            
            // 시각적 효과
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    }
    
    // 파일 선택 시
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }
    
    // 드래그 앤 드롭 (PC용)
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
            this.classList.add('drag-highlight');
        });
        
        uploadArea.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
            this.classList.remove('drag-highlight');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            this.classList.remove('drag-highlight');
            this.classList.add('drop-success');
            
            setTimeout(() => {
                this.classList.remove('drop-success');
            }, 1000);
            
            if (e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }
    
    // 파일 선택 처리 함수
    function handleFileSelection(file) {
        // 파일 유효성 검사
        const validation = validateAudioFile(file);
        
        if (!validation.valid) {
            showFileError(validation.error);
            
            // 오류 시 시각적 효과
            if (uploadArea) {
                uploadArea.classList.add('shake-error');
                setTimeout(() => {
                    uploadArea.classList.remove('shake-error');
                }, 500);
            }
            
            return;
        }
        
        // 파일 처리
        processAudioFile(file).then(processedFile => {
            uploadedFile = processedFile;
            
            // 파일 정보 표시
            showFileSuccess(processedFile);
            
            // 분석 버튼 활성화
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.classList.add('ready-to-analyze');
                analyzeBtn.innerHTML = `
                    <div class="btn-content">
                        <div class="btn-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="btn-text">
                            <div class="btn-title">AI 분석 시작</div>
                            <div class="btn-subtitle">${processedFile.name}</div>
                        </div>
                    </div>
                `;
                
                // 성공 시 시각적 효과
                analyzeBtn.classList.add('pulse-success');
                setTimeout(() => {
                    analyzeBtn.classList.remove('pulse-success');
                }, 1500);
            }
            
            // 업로드 영역 성공 효과
            if (uploadArea) {
                uploadArea.classList.add('upload-success');
                setTimeout(() => {
                    uploadArea.classList.remove('upload-success');
                }, 2000);
            }
            
        }).catch(error => {
            showFileError(`파일 처리 오류: ${error.message}`);
        });
    }
}

// 파일 유효성 검사
function validateAudioFile(file) {
    // 기본 검사
    if (!file || !file.name || file.size === undefined) {
        return { valid: false, error: '잘못된 파일입니다.' };
    }
    
    // 파일 크기 검사
    const maxSize = 50 * 1024 * 1024; // 50MB
    const minSize = 1024; // 1KB
    
    if (file.size < minSize) {
        return { valid: false, error: '파일 크기가 너무 작습니다. (최소 1KB)' };
    }
    
    if (file.size > maxSize) {
        const maxSizeMB = Math.floor(maxSize / 1024 / 1024);
        return { valid: false, error: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)` };
    }
    
    // 확장자 검사
    const extension = file.name.toLowerCase().split('.').pop();
    const validExtensions = [
        'mp3', 'm4a', 'wav', 'aac', 'ogg', 'webm', 
        'opus', 'amr', '3gp', 'flac', 'm4b', 'mp4'
    ];
    
    // MIME 타입 검사
    const validMimeTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/mpg',
        'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/x-aac',
        'audio/wav', 'audio/x-wav', 'audio/wave',
        'audio/ogg', 'audio/webm', 'audio/opus',
        'audio/amr', 'audio/3gpp', 'audio/3gpp2',
        'audio/flac', 'audio/x-flac'
    ];
    
    // 확장자 또는 MIME 타입 확인
    const isValidExtension = validExtensions.includes(extension);
    const isValidMimeType = file.type ? validMimeTypes.includes(file.type) : false;
    
    if (!isValidExtension && !isValidMimeType) {
        return { 
            valid: false, 
            error: `지원되지 않는 파일 형식입니다.<br>파일명: ${file.name}<br>형식: ${file.type || '알 수 없음'}<br><br>지원 형식: MP3, M4A, WAV, AAC, OGG` 
        };
    }
    
    return { valid: true, error: null };
}

// 파일 처리 (필요시 변환)
function processAudioFile(file) {
    return new Promise((resolve, reject) => {
        // iOS Voice Memo 파일 처리 (.m4a but 실제 AAC)
        if (file.name.toLowerCase().endsWith('.m4a') && file.type === '') {
            console.log('iOS 녹음 파일 감지, MIME 타입 보정 중...');
            const blob = file.slice(0, file.size, 'audio/mp4');
            const processedFile = new File([blob], file.name, { 
                type: 'audio/mp4',
                lastModified: file.lastModified
            });
            resolve(processedFile);
        }
        // 파일명에 확장자가 있지만 MIME 타입이 없는 경우
        else if (!file.type && file.name.includes('.')) {
            const extension = file.name.toLowerCase().split('.').pop();
            let mimeType = '';
            
            switch(extension) {
                case 'mp3': mimeType = 'audio/mpeg'; break;
                case 'm4a': mimeType = 'audio/mp4'; break;
                case 'wav': mimeType = 'audio/wav'; break;
                case 'ogg': mimeType = 'audio/ogg'; break;
                default: mimeType = 'audio/*';
            }
            
            if (mimeType !== 'audio/*') {
                const blob = file.slice(0, file.size, mimeType);
                const processedFile = new File([blob], file.name, { 
                    type: mimeType,
                    lastModified: file.lastModified
                });
                resolve(processedFile);
            } else {
                resolve(file); // 변환 불가능하면 원본 반환
            }
        }
        // 일반적인 경우
        else {
            resolve(file);
        }
    });
}

// 파일 성공 처리
function showFileSuccess(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = file.type ? file.type.split('/')[1].toUpperCase() : file.name.split('.').pop().toUpperCase();
    
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="file-success">
                <div class="file-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${fileSizeMB} MB</span>
                        <span class="file-type">${fileType}</span>
                        <span class="file-status">✓ 업로드 준비 완료</span>
                    </div>
                </div>
                <button onclick="removeFile()" class="btn-remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileInfo.classList.add('show');
        fileInfo.classList.add('success-animation');
        
        setTimeout(() => {
            fileInfo.classList.remove('success-animation');
        }, 1000);
    }
    
    // 오류 메시지 숨기기
    const errorDiv = document.getElementById('fileError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// 파일 오류 표시
function showFileError(message) {
    const errorDiv = document.getElementById('fileError');
    if (!errorDiv) return;
    
    errorDiv.innerHTML = `
        <div class="error-content">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-text">
                <h4>파일 업로드 실패</h4>
                <div class="error-message">${message}</div>
                <div class="error-solutions">
                    <h5>해결 방법:</h5>
                    <ul>
                        <li>파일 형식을 <strong>MP3</strong>로 변환해보세요</li>
                        <li>파일명을 <strong>영어테스트.mp3</strong>로 변경해보세요</li>
                        <li>파일 크기를 <strong>30MB 이하</strong>로 줄이세요</li>
                        <li>아래 "웹에서 직접 녹음" 기능을 사용해보세요</li>
                    </ul>
                    <div class="conversion-links">
                        <p>온라인 변환기:</p>
                        <a href="https://online-audio-converter.com" target="_blank">online-audio-converter.com</a>
                        <a href="https://cloudconvert.com" target="_blank">cloudconvert.com</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    errorDiv.style.display = 'block';
    errorDiv.classList.add('error-animation');
    
    setTimeout(() => {
        errorDiv.classList.remove('error-animation');
    }, 500);
    
    // 파일 정보 숨기기
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.classList.remove('show');
    }
    
    // 분석 버튼 비활성화
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.classList.remove('ready-to-analyze');
    }
}

// 직접 녹음 기능 설정
function setupDirectRecording() {
    const startBtn = document.getElementById('startRecordingBtn');
    const stopBtn = document.getElementById('stopRecordingBtn');
    const recordTimer = document.getElementById('recordTimer');
    const recordingStatus = document.getElementById('recordingStatus');
    const recordingIndicator = document.querySelector('.recording-indicator');
    
    if (!startBtn) return;
    
    // 마이크 상태 확인 애니메이션
    startBtn.addEventListener('mouseenter', function() {
        if (!isRecording) {
            this.classList.add('mic-ready');
        }
    });
    
    startBtn.addEventListener('mouseleave', function() {
        this.classList.remove('mic-ready');
    });
    
    startBtn.addEventListener('click', async function() {
        if (isRecording) return;
        
        // 디스클레이머 동의 확인
        if (!hasAgreedToDisclaimer) {
            showDisclaimerAlert();
            return;
        }
        
        // 시각적 효과
        this.classList.add('recording-clicked');
        setTimeout(() => {
            this.classList.remove('recording-clicked');
        }, 300);
        
        try {
            // 마이크 권한 요청
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 44100,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            // MediaRecorder 설정
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            audioChunks = [];
            recordingSeconds = 0;
            isRecording = true;
            
            // 데이터 수집
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            // 녹음 완료
            mediaRecorder.onstop = () => {
                isRecording = false;
                saveRecording();
                
                // 스트림 해제
                stream.getTracks().forEach(track => track.stop());
                
                // 녹음 완료 효과
                if (recordingIndicator) {
                    recordingIndicator.classList.remove('recording-active');
                }
            };
            
            // 녹음 시작
            mediaRecorder.start();
            
            // UI 업데이트
            startBtn.style.display = 'none';
            if (recordingStatus) {
                recordingStatus.style.display = 'flex';
                recordingStatus.classList.add('recording-active');
            }
            
            // 녹음 인디케이터 활성화
            if (recordingIndicator) {
                recordingIndicator.classList.add('recording-active');
            }
            
            // 타이머 시작
            if (recordTimer) {
                recordTimer.textContent = '00:00';
                recordTimer.classList.add('timer-active');
            }
            
            recordingTimer = setInterval(() => {
                recordingSeconds++;
                const minutes = Math.floor(recordingSeconds / 60);
                const seconds = recordingSeconds % 60;
                if (recordTimer) {
                    recordTimer.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    // 10초마다 시각적 효과
                    if (recordingSeconds % 10 === 0) {
                        recordTimer.classList.add('timer-pulse');
                        setTimeout(() => {
                            recordTimer.classList.remove('timer-pulse');
                        }, 500);
                    }
                }
            }, 1000);
            
        } catch (error) {
            console.error('녹음 오류:', error);
            isRecording = false;
            
            let errorMessage = '마이크 접근 권한이 필요합니다.';
            if (error.name === 'NotAllowedError') {
                errorMessage = '마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.';
            }
            
            // 오류 시 시각적 효과
            startBtn.classList.add('recording-error');
            setTimeout(() => {
                startBtn.classList.remove('recording-error');
            }, 1000);
            
            showFileError(errorMessage);
        }
    });
    
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                
                // 시각적 효과
                this.classList.add('stop-clicked');
                setTimeout(() => {
                    this.classList.remove('stop-clicked');
                }, 300);
                
                // UI 업데이트
                if (startBtn) startBtn.style.display = 'block';
                if (recordingStatus) {
                    recordingStatus.style.display = 'none';
                    recordingStatus.classList.remove('recording-active');
                }
                
                // 타이머 정지
                if (recordingTimer) {
                    clearInterval(recordingTimer);
                }
                
                // 타이머 비활성화
                if (recordTimer) {
                    recordTimer.classList.remove('timer-active');
                }
            }
        });
    }
}

// 디스클레이머 알림 표시
function showDisclaimerAlert() {
    const alertDiv = document.getElementById('disclaimerAlert');
    if (alertDiv) {
        alertDiv.style.display = 'block';
        alertDiv.classList.add('alert-show');
        
        // 3초 후 자동 숨김
        setTimeout(() => {
            alertDiv.classList.remove('alert-show');
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// 녹음 파일 저장
function saveRecording() {
    if (audioChunks.length === 0) {
        showFileError('녹음된 내용이 없습니다.');
        return;
    }
    
    const audioBlob = new Blob(audioChunks, { 
        type: 'audio/webm;codecs=opus' 
    });
    
    const fileName = `ed_레벨테스트_${new Date().toISOString().slice(0,10)}.webm`;
    const file = new File([audioBlob], fileName, { 
        type: 'audio/webm;codecs=opus'
    });
    
    uploadedFile = file;
    showFileSuccess(file);
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.add('ready-to-analyze');
        analyzeBtn.innerHTML = `
            <div class="btn-content">
                <div class="btn-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="btn-text">
                    <div class="btn-title">AI 분석 시작</div>
                    <div class="btn-subtitle">녹음 파일 분석</div>
                </div>
            </div>
        `;
        
        analyzeBtn.classList.add('pulse-success');
        setTimeout(() => {
            analyzeBtn.classList.remove('pulse-success');
        }, 1500);
    }
    
    const recordingControls = document.querySelector('.recording-controls');
    if (recordingControls) {
        recordingControls.classList.add('recording-success');
        setTimeout(() => {
            recordingControls.classList.remove('recording-success');
        }, 2000);
    }
}

// 파일 제거 함수
function removeFile() {
    uploadedFile = null;
    
    const fileInput = document.getElementById('audioFile');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.classList.remove('show');
        fileInfo.classList.add('fade-out');
        setTimeout(() => {
            fileInfo.classList.remove('fade-out');
            fileInfo.innerHTML = '';
        }, 300);
    }
    
    const errorDiv = document.getElementById('fileError');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.classList.remove('ready-to-analyze');
        analyzeBtn.innerHTML = `
            <div class="btn-content">
                <div class="btn-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="btn-text">
                    <div class="btn-title">AI 분석 시작</div>
                    <div class="btn-subtitle">파일을 먼저 업로드해주세요</div>
                </div>
            </div>
        `;
    }
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.classList.add('file-removed');
        setTimeout(() => {
            uploadArea.classList.remove('file-removed');
        }, 1000);
    }
}

// AI 분석 시뮬레이션 - 개선된 버전 (언어 감지 포함)
function simulateAnalysis() {
    const analysisProgress = document.getElementById('analysisProgress');
    const analysisResult = document.getElementById('analysisResult');
    const progressFill = document.getElementById('progressFill');
    const nextToStep5 = document.getElementById('nextToStep5');
    const progressContainer = document.querySelector('.progress-bar');
    const languageDetection = document.getElementById('languageDetection');
    
    // 언어 감지 표시
    if (languageDetection) {
        languageDetection.style.display = 'block';
        languageDetection.classList.add('detection-show');
        
        // 언어 감지 시뮬레이션
        simulateLanguageDetection();
    }
    
    // 시각적 효과: 분석 시작
    if (analysisProgress) {
        analysisProgress.classList.add('analysis-start');
    }
    
    if (progressContainer) {
        progressContainer.classList.add('progress-active');
    }
    
    // 진행 상태 업데이트 함수들
    const statElements = {
        fluency: document.getElementById('fluencyStat'),
        accuracy: document.getElementById('accuracyStat')
    };
    
    // 분석 시작 (3초 동안 진행)
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
            
            if (progress % 20 === 0) {
                progressFill.classList.add('progress-pulse');
                setTimeout(() => {
                    progressFill.classList.remove('progress-pulse');
                }, 200);
            }
        }
        
        // 각 분석 항목별 진행률 업데이트
        if (progress <= 50) {
            if (statElements.fluency) {
                statElements.fluency.textContent = `${progress * 2}%`;
                statElements.fluency.classList.add('stat-updating');
                setTimeout(() => {
                    statElements.fluency.classList.remove('stat-updating');
                }, 100);
            }
        } else {
            if (statElements.accuracy) {
                statElements.accuracy.textContent = `${(progress - 50) * 2}%`;
                statElements.accuracy.classList.add('stat-updating');
                setTimeout(() => {
                    statElements.accuracy.classList.remove('stat-updating');
                }, 100);
            }
        }
        
        // 완료 시
        if (progress >= 100) {
            clearInterval(interval);
            
            if (progressFill) {
                progressFill.classList.add('progress-complete');
            }
            
            // 약간의 지연 후 결과 표시
            setTimeout(() => {
                if (analysisProgress) {
                    analysisProgress.style.display = 'none';
                    analysisProgress.classList.remove('analysis-start');
                }
                
                if (languageDetection) {
                    languageDetection.style.display = 'none';
                }
                
                if (analysisResult) {
                    analysisResult.style.display = 'block';
                    analysisResult.classList.add('result-appear');
                    
                    setTimeout(() => {
                        analysisResult.classList.remove('result-appear');
                    }, 1000);
                }
                
                if (nextToStep5) {
                    nextToStep5.style.display = 'inline-flex';
                    nextToStep5.classList.add('next-pulse');
                    
                    setTimeout(() => {
                        nextToStep5.classList.remove('next-pulse');
                    }, 2000);
                }
                
                // 랜덤 결과 생성 (언어 감지 포함)
                generateResultsWithLanguageDetection();
                
                setTimeout(() => {
                    const resultCard = document.querySelector('.result-card');
                    if (resultCard) {
                        resultCard.classList.add('result-highlight');
                        setTimeout(() => {
                            resultCard.classList.remove('result-highlight');
                        }, 1500);
                    }
                }, 300);
                
            }, 800);
        }
    }, 30);
}

// 언어 감지 시뮬레이션
function simulateLanguageDetection() {
    const detectionBar = document.getElementById('detectionBar');
    const detectionConfidence = document.getElementById('detectionConfidence');
    const detectedLanguage = document.getElementById('detectedLanguage');
    
    if (!detectionBar || !detectionConfidence || !detectedLanguage) return;
    
    let detectionProgress = 0;
    const detectionInterval = setInterval(() => {
        detectionProgress += 2;
        
        if (detectionProgress <= 100) {
            detectionBar.style.width = `${detectionProgress}%`;
            detectionConfidence.textContent = `${detectionProgress}%`;
            
            if (detectionProgress < 30) {
                detectedLanguage.textContent = '음성 분석 중...';
            } else if (detectionProgress < 70) {
                detectedLanguage.textContent = '언어 패턴 분석 중...';
            } else {
                detectedLanguage.textContent = '영어 감지 완료';
            }
        } else {
            clearInterval(detectionInterval);
        }
    }, 30);
}

// 결과 생성 (언어 감지 로직 포함)
function generateResultsWithLanguageDetection() {
    // 파일명 기반 언어 감지 (간단한 버전)
    let isEnglish = true;
    if (uploadedFile) {
        const fileName = uploadedFile.name.toLowerCase();
        
        // 한국어 관련 키워드가 있으면 비영어로 간주
        const koreanKeywords = [
            'korean', 'korea', '한국', '한글', '조선', 
            'k-pop', 'kdrama', '안녕', '감사합니다',
            'test_kr', 'ko_', '_ko', 'kor_'
        ];
        
        // 다른 언어 키워드도 추가 가능
        const nonEnglishKeywords = [
            'chinese', 'china', '중국', '中国',
            'japanese', 'japan', '일본', '日本',
            'spanish', 'español', 'espanol',
            'french', 'français', 'francais',
            'german', 'deutsch',
            'russian', 'русский'
        ];
        
        const isKorean = koreanKeywords.some(keyword => fileName.includes(keyword));
        const isNonEnglish = nonEnglishKeywords.some(keyword => fileName.includes(keyword));
        
        isEnglish = !(isKorean || isNonEnglish);
        
        // 랜덤으로 10% 확률로 비영어로 감지 (데모용)
        if (Math.random() < 0.1) {
            isEnglish = false;
        }
    }
    
    if (!isEnglish) {
        // 비영어 음성 처리
        showNonEnglishResult();
        return;
    }
    
    // 영어 음성 처리
    generateEnglishResults();
}

// 비영어 결과 표시
function showNonEnglishResult() {
    const nonEnglishAlert = document.getElementById('nonEnglishAlert');
    const edLevelBadge = document.getElementById('edLevelBadge');
    const fluencyScore = document.getElementById('fluencyScore');
    const accuracyScore = document.getElementById('accuracyScore');
    const totalScore = document.getElementById('totalScore');
    const fluencyFill = document.getElementById('fluencyFill');
    const accuracyFill = document.getElementById('accuracyFill');
    const cefrLevel = document.getElementById('cefrLevel');
    const toeicScore = document.getElementById('toeicScore');
    const ieltsScore = document.getElementById('ieltsScore');
    
    // 비영어 알림 표시
    if (nonEnglishAlert) {
        nonEnglishAlert.style.display = 'block';
        nonEnglishAlert.classList.add('alert-appear');
    }
    
    // 0점 설정
    if (edLevelBadge) {
        edLevelBadge.innerHTML = `
            <span class="level-name">Non-English</span>
            <span class="level-desc">비영어 음성</span>
        `;
        edLevelBadge.classList.add('badge-error');
    }
    
    if (fluencyScore) fluencyScore.textContent = '0%';
    if (accuracyScore) accuracyScore.textContent = '0%';
    if (totalScore) totalScore.textContent = '0점';
    if (fluencyFill) fluencyFill.style.width = '0%';
    if (accuracyFill) accuracyFill.style.width = '0%';
    if (cefrLevel) {
        cefrLevel.textContent = 'N/A';
        cefrLevel.className = 'result-value cefr-na';
    }
    if (toeicScore) toeicScore.textContent = 'N/A';
    if (ieltsScore) ieltsScore.textContent = 'N/A';
    
    // 로컬 스토리지에 결과 저장
    localStorage.setItem('edDiagnosisResult', JSON.stringify({
        edLevel: 'Non-English',
        recommendedCourse: 'Basic Course',
        courseDuration: '10주 과정',
        cefr: 'N/A',
        toeic: 'N/A',
        ielts: 'N/A',
        levelDesc: '비영어 음성',
        isNonEnglish: true,
        fluencyScore: 0,
        accuracyScore: 0,
        totalScore: 0
    }));
}

// 영어 결과 생성
function generateEnglishResults() {
    // ED 레벨 후보들
    const edLevels = [
        { name: "Pre-Basic", desc: "입문자", cefr: "A1", toeic: "10-119", ielts: "1.0-1.5", fluencyWeight: 0.3, accuracyWeight: 0.2 },
        { name: "Basic 3", desc: "초급", cefr: "A1", toeic: "120-224", ielts: "2.0-2.5", fluencyWeight: 0.4, accuracyWeight: 0.3 },
        { name: "Basic 2", desc: "초중급", cefr: "A2", toeic: "225-549", ielts: "3.0-3.5", fluencyWeight: 0.5, accuracyWeight: 0.4 },
        { name: "Basic 1", desc: "초중급", cefr: "A2", toeic: "225-549", ielts: "3.0-3.5", fluencyWeight: 0.6, accuracyWeight: 0.5 },
        { name: "Intermediate 1", desc: "중급", cefr: "B1", toeic: "550-650", ielts: "4.0-4.5", fluencyWeight: 0.7, accuracyWeight: 0.6 },
        { name: "Intermediate 2", desc: "중급", cefr: "B1", toeic: "650-720", ielts: "4.5-5.0", fluencyWeight: 0.75, accuracyWeight: 0.65 },
        { name: "Intermediate 3", desc: "중상급", cefr: "B2", toeic: "720-784", ielts: "5.0-5.5", fluencyWeight: 0.8, accuracyWeight: 0.7 },
        { name: "Advanced 1", desc: "중상급", cefr: "B2", toeic: "785-850", ielts: "5.5-6.0", fluencyWeight: 0.85, accuracyWeight: 0.75 },
        { name: "Advanced 2", desc: "고급", cefr: "C1", toeic: "945-990", ielts: "7.0-7.5", fluencyWeight: 0.9, accuracyWeight: 0.85 },
        { name: "Advanced 3", desc: "고급", cefr: "C1", toeic: "945-990", ielts: "7.5-8.0", fluencyWeight: 0.95, accuracyWeight: 0.9 }
    ];
    
    // 레벨 선택 (중간 레벨에 가중치)
    const weights = [1, 2, 3, 4, 6, 7, 6, 4, 2, 1];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            selectedIndex = i;
            break;
        }
    }
    
    const result = edLevels[selectedIndex];
    
    // 점수 계산 (레벨별 가중치에 약간의 변동 추가)
    const fluencyScore = Math.round((result.fluencyWeight + (Math.random() * 0.2 - 0.1)) * 100);
    const accuracyScore = Math.round((result.accuracyWeight + (Math.random() * 0.2 - 0.1)) * 100);
    const totalScore = ((fluencyScore + accuracyScore) / 2).toFixed(1);
    
    // 결과 표시
    const edLevelBadge = document.getElementById('edLevelBadge');
    if (edLevelBadge) {
        edLevelBadge.innerHTML = `
            <span class="level-name">${result.name}</span>
            <span class="level-desc">${result.desc}</span>
        `;
        edLevelBadge.classList.add('badge-appear');
        
        setTimeout(() => {
            edLevelBadge.classList.remove('badge-appear');
        }, 1000);
    }
    
    // 점수 표시
    const fluencyScoreElement = document.getElementById('fluencyScore');
    const accuracyScoreElement = document.getElementById('accuracyScore');
    const totalScoreElement = document.getElementById('totalScore');
    const fluencyFill = document.getElementById('fluencyFill');
    const accuracyFill = document.getElementById('accuracyFill');
    
    if (fluencyScoreElement) fluencyScoreElement.textContent = `${fluencyScore}%`;
    if (accuracyScoreElement) accuracyScoreElement.textContent = `${accuracyScore}%`;
    if (totalScoreElement) totalScoreElement.textContent = `${totalScore}점`;
    if (fluencyFill) fluencyFill.style.width = `${fluencyScore}%`;
    if (accuracyFill) accuracyFill.style.width = `${accuracyScore}%`;
    
    const cefrLevel = document.getElementById('cefrLevel');
    if (cefrLevel) {
        cefrLevel.textContent = result.cefr;
        cefrLevel.className = `result-value cefr-${result.cefr.toLowerCase()} cefr-appear`;
        
        setTimeout(() => {
            cefrLevel.classList.remove('cefr-appear');
        }, 1000);
    }
    
    const toeicScore = document.getElementById('toeicScore');
    if (toeicScore) {
        toeicScore.textContent = result.toeic;
        toeicScore.classList.add('score-appear');
        
        setTimeout(() => {
            toeicScore.classList.remove('score-appear');
        }, 1200);
    }
    
    const ieltsScore = document.getElementById('ieltsScore');
    if (ieltsScore) {
        ieltsScore.textContent = result.ielts;
        ieltsScore.classList.add('score-appear');
        
        setTimeout(() => {
            ieltsScore.classList.remove('score-appear');
        }, 1400);
    }
    
    // Step 5에서 사용할 추천 코스 설정
    let recommendedCourse = "";
    let courseDuration = "";
    
    if (result.name.includes("Basic")) {
        recommendedCourse = "Basic Course";
        courseDuration = "10주 과정";
    } else if (result.name.includes("Intermediate")) {
        recommendedCourse = "Intermediate Course";
        courseDuration = "12주 과정";
    } else {
        recommendedCourse = "Advanced Course";
        courseDuration = "16주 과정";
    }
    
    // 로컬 스토리지에 결과 저장
    localStorage.setItem('edDiagnosisResult', JSON.stringify({
        edLevel: result.name,
        recommendedCourse: recommendedCourse,
        courseDuration: courseDuration,
        cefr: result.cefr,
        toeic: result.toeic,
        ielts: result.ielts,
        levelDesc: result.desc,
        isNonEnglish: false,
        fluencyScore: fluencyScore,
        accuracyScore: accuracyScore,
        totalScore: totalScore
    }));
}

// Step 5에서 최종 결과 표시
function displayFinalResults() {
    const storedResult = localStorage.getItem('edDiagnosisResult');
    
    if (storedResult) {
        const result = JSON.parse(storedResult);
        const courseBadge = document.getElementById('recommendedCourse');
        
        if (courseBadge) {
            courseBadge.innerHTML = `
                <span class="course-name">${result.recommendedCourse}</span>
                <span class="course-duration">${result.courseDuration}</span>
            `;
            
            courseBadge.classList.add('course-badge-appear');
            
            setTimeout(() => {
                courseBadge.classList.remove('course-badge-appear');
            }, 1000);
        }
        
        // CTA 버튼 애니메이션
        setTimeout(() => {
            const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
            ctaButtons.forEach((btn, index) => {
                setTimeout(() => {
                    btn.classList.add('cta-appear');
                    
                    setTimeout(() => {
                        btn.classList.remove('cta-appear');
                    }, 1000);
                }, index * 300);
            });
        }, 500);
    }
}

// 호환성 차트 아코디언 토글
function toggleAccordion() {
    const content = document.getElementById('accordionContent');
    const icon = document.getElementById('accordionIcon');
    
    if (content && icon) {
        content.classList.toggle('expanded');
        icon.textContent = content.classList.contains('expanded') ? '−' : '+';
        
        // 애니메이션 효과
        if (content.classList.contains('expanded')) {
            content.classList.add('accordion-expand');
            setTimeout(() => {
                content.classList.remove('accordion-expand');
            }, 500);
        } else {
            content.classList.add('accordion-collapse');
            setTimeout(() => {
                content.classList.remove('accordion-collapse');
            }, 500);
        }
    }
}

// 진단 다시 시작
function restartDiagnosis() {
    // 모든 상태 초기화
    currentStep = 1;
    uploadedFile = null;
    hasAgreedToDisclaimer = false;
    
    // 디스클레이머 체크박스 초기화
    const disclaimerCheckbox = document.getElementById('disclaimerAgree');
    if (disclaimerCheckbox) {
        disclaimerCheckbox.checked = false;
    }
    
    // 녹음 관련 초기화
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    audioChunks = [];
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }
    isRecording = false;
    
    // 파일 업로드 초기화
    removeFile();
    
    // 분석 결과 초기화
    const analysisProgress = document.getElementById('analysisProgress');
    const analysisResult = document.getElementById('analysisResult');
    const nextToStep5 = document.getElementById('nextToStep5');
    const progressFill = document.getElementById('progressFill');
    const nonEnglishAlert = document.getElementById('nonEnglishAlert');
    const languageDetection = document.getElementById('languageDetection');
    
    if (analysisProgress) {
        analysisProgress.style.display = 'block';
        analysisProgress.classList.remove('analysis-start');
    }
    
    if (analysisResult) {
        analysisResult.style.display = 'none';
        analysisResult.classList.remove('result-appear');
    }
    
    if (nextToStep5) {
        nextToStep5.style.display = 'none';
        nextToStep5.classList.remove('next-pulse');
    }
    
    if (progressFill) {
        progressFill.style.width = '0%';
        progressFill.classList.remove('progress-complete', 'progress-pulse');
    }
    
    if (nonEnglishAlert) {
        nonEnglishAlert.style.display = 'none';
        nonEnglishAlert.classList.remove('alert-appear');
    }
    
    if (languageDetection) {
        languageDetection.style.display = 'none';
        languageDetection.classList.remove('detection-show');
    }
    
    // 프로그레스 바 비활성화
    const progressContainer = document.querySelector('.progress-bar');
    if (progressContainer) {
        progressContainer.classList.remove('progress-active');
    }
    
    // 첫 번째 단계로 이동
    setTimeout(() => {
        goToStep(1);
    }, 300);
    
    // 재시작 시각적 효과
    const restartBtn = event?.target;
    if (restartBtn) {
        restartBtn.classList.add('restart-clicked');
        setTimeout(() => {
            restartBtn.classList.remove('restart-clicked');
        }, 300);
    }
}

// 페이지 상단으로 스크롤
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 파일 전송 방법 선택
function selectUploadMethod(method) {
    const fileUploadSection = document.getElementById('fileUploadSection');
    const directRecordingSection = document.getElementById('directRecordingSection');
    const fileMethodBtn = document.getElementById('fileMethodBtn');
    const recordMethodBtn = document.getElementById('recordMethodBtn');
    
    if (method === 'file') {
        if (fileUploadSection) {
            fileUploadSection.style.display = 'block';
            fileUploadSection.classList.add('section-appear');
            
            setTimeout(() => {
                fileUploadSection.classList.remove('section-appear');
            }, 500);
        }
        if (directRecordingSection) {
            directRecordingSection.style.display = 'none';
        }
        if (fileMethodBtn) {
            fileMethodBtn.classList.add('active');
            fileMethodBtn.classList.add('tab-active-animation');
            
            setTimeout(() => {
                fileMethodBtn.classList.remove('tab-active-animation');
            }, 300);
        }
        if (recordMethodBtn) {
            recordMethodBtn.classList.remove('active');
        }
    } else if (method === 'record') {
        if (fileUploadSection) {
            fileUploadSection.style.display = 'none';
        }
        if (directRecordingSection) {
            directRecordingSection.style.display = 'block';
            directRecordingSection.classList.add('section-appear');
            
            setTimeout(() => {
                directRecordingSection.classList.remove('section-appear');
            }, 500);
        }
        if (fileMethodBtn) {
            fileMethodBtn.classList.remove('active');
        }
        if (recordMethodBtn) {
            recordMethodBtn.classList.add('active');
            recordMethodBtn.classList.add('tab-active-animation');
            
            setTimeout(() => {
                recordMethodBtn.classList.remove('tab-active-animation');
            }, 300);
        }
    }
}

// 테스트 시작 (디스클레이머 동의 후)
function startTestAfterAgreement() {
    if (!hasAgreedToDisclaimer) {
        showDisclaimerReminder();
        return;
    }
    
    // 디스클레이머 숨기기
    const disclaimer = document.getElementById('evaluationDisclaimer');
    if (disclaimer) {
        disclaimer.style.display = 'none';
    }
    
    // 시각적 효과
    const startBtn = document.getElementById('startTestBtn');
    if (startBtn) {
        startBtn.classList.add('started');
        setTimeout(() => {
            startBtn.classList.remove('started');
        }, 1000);
    }
}

// 사용자 피드백 제출 함수
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value;
    const feedbackRating = document.querySelector('input[name="feedbackRating"]:checked');
    
    if (!feedbackText.trim()) {
        alert('피드백 내용을 입력해주세요.');
        return;
    }
    
    // 피드백 데이터 준비
    const feedbackData = {
        text: feedbackText,
        rating: feedbackRating ? feedbackRating.value : 'neutral',
        timestamp: new Date().toISOString(),
        currentLevel: localStorage.getItem('edDiagnosisResult') ? JSON.parse(localStorage.getItem('edDiagnosisResult')).edLevel : 'unknown'
    };
    
    // 실제 서비스에서는 서버로 전송
    console.log('피드백 제출:', feedbackData);
    
    // 시각적 효과
    const feedbackBtn = document.getElementById('submitFeedbackBtn');
    if (feedbackBtn) {
        feedbackBtn.innerHTML = '<i class="fas fa-check"></i> 제출 완료';
        feedbackBtn.classList.add('submitted');
        feedbackBtn.disabled = true;
        
        setTimeout(() => {
            feedbackBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 피드백 제출';
            feedbackBtn.classList.remove('submitted');
            feedbackBtn.disabled = false;
            
            // 폼 초기화
            document.getElementById('feedbackText').value = '';
            const feedbackForm = document.getElementById('feedbackForm');
            if (feedbackForm) {
                feedbackForm.reset();
            }
            
            // 감사 메시지
            alert('소중한 피드백 감사합니다! 시스템 개선에 참고하겠습니다.');
        }, 2000);
    }
}

// 결과 공유 함수
function shareResult() {
    const result = localStorage.getItem('edDiagnosisResult');
    if (!result) return;
    
    const resultData = JSON.parse(result);
    
    let shareText = '';
    
    if (resultData.isNonEnglish) {
        shareText = `❌ 영어 레벨 진단 결과: 비영어 음성 감지\n\n📊 점수: 0점\n\n※ 영어 음성만 평가가 가능합니다.\n\n#EnglishDiscoveries #영어레벨진단`;
    } else {
        shareText = `🎯 영어 레벨 진단 결과: ${resultData.edLevel} (CEFR ${resultData.cefr})\n\n📊 점수 분석:\n• 유창성: ${resultData.fluencyScore}%\n• 정확성: ${resultData.accuracyScore}%\n• 종합: ${resultData.totalScore}점\n\n📚 추천 과정: ${resultData.recommendedCourse}\n\n#EnglishDiscoveries #영어레벨진단`;
    }
    
    // 클립보드에 복사
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            // 대체 방법
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('결과가 클립보드에 복사되었습니다!');
        });
    } else {
        // 대체 방법
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('결과가 클립보드에 복사되었습니다!');
    }
}

// FAQ 토글 함수
function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    element.classList.toggle('active');
    
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        icon.className = 'fas fa-chevron-down';
    } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        icon.className = 'fas fa-chevron-up';
    }
}
