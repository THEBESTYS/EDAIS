<!-- 기존의 녹음 컨트롤 부분을 이렇게 수정하세요 -->
<div class="recording-controls text-center">
    <div style="margin-bottom: 30px;">
        <button id="startRecordingBtn" class="record-btn" onclick="safeStartRecording()">
            <i class="fas fa-microphone-alt"></i>
        </button>
        <button id="stopRecordingBtn" class="stop-btn hidden" onclick="safeStopRecording()">
            <i class="fas fa-stop"></i>
        </button>
    </div>
    
    <div class="btn-label" id="recordingStatus">
        <div style="margin-bottom: 10px;">
            <i class="fas fa-info-circle" style="color: #4361ee;"></i>
            녹음 버튼을 클릭하면 마이크 권한 요청이 표시됩니다.
        </div>
    </div>
    
    <!-- 데모 모드 버튼 추가 -->
    <div id="demoMode" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <p style="margin-bottom: 10px; color: #666;">
            <i class="fas fa-exclamation-triangle"></i>
            마이크 문제가 있나요?
        </p>
        <button id="demoButton" class="btn-secondary" 
                style="padding: 10px 20px; font-size: 0.9rem;"
                onclick="useDemoMode()">
            <i class="fas fa-play-circle"></i> 데모 모드로 계속하기
        </button>
    </div>
    
    <button id="nextSentenceBtn" class="next-btn" disabled onclick="nextSentence()">
        다음 문장 진행하기 <i class="fas fa-arrow-right"></i>
    </button>
</div>

<!-- CSS에 추가 -->
<style>
    .detailed-error {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translate(-50%, -40%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
    
    .demo-active {
        border: 2px solid #ff9800 !important;
        background: #fff8e1 !important;
    }
</style>

<!-- JavaScript에 데모 모드 함수 추가 -->
<script>
    // 데모 모드 함수
    function useDemoMode() {
        // 데모 모드 활성화
        window.isDemoMode = true;
        
        // UI 업데이트
        document.getElementById('demoMode').innerHTML = `
            <p style="color: #ff9800; font-weight: bold;">
                <i class="fas fa-check-circle"></i> 데모 모드 활성화됨
            </p>
            <p style="color: #666; font-size: 0.9rem;">
                시뮬레이션된 점수로 테스트가 진행됩니다.
            </p>
        `;
        
        document.getElementById('demoMode').classList.add('demo-active');
        
        // 녹음 버튼을 데모 버튼으로 변경
        const recordBtn = document.getElementById('startRecordingBtn');
        if (recordBtn) {
            recordBtn.onclick = function() {
                // 데모 녹음 시뮬레이션
                updateRecordingUI(true);
                setTimeout(() => {
                    updateRecordingUI(false);
                    
                    // 데모 점수 생성
                    const score = calculateSimulatedScore();
                    sentenceScores.push({
                        sentenceId: CORE_SENTENCES[currentSentenceIndex].id,
                        text: CORE_SENTENCES[currentSentenceIndex].text,
                        score: score,
                        difficulty: CORE_SENTENCES[currentSentenceIndex].difficultyText,
                        isDemo: true
                    });
                    
                    // 다음 버튼 활성화
                    elements.buttons.nextSentence.disabled = false;
                    
                    showMessage(`데모 모드: 녹음 완료! 점수: ${score}점`, 'success');
                }, 2000);
            };
            recordBtn.innerHTML = '<i class="fas fa-play"></i>';
            recordBtn.title = '데모 녹음 시작';
        }
        
        showMessage('데모 모드가 활성화되었습니다. 실제 녹음 없이 테스트가 진행됩니다.', 'info');
    }
</script>
