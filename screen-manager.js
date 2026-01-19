// ui-manager/screen-manager.js

import { CONSTANTS } from './constants.js';

export class ScreenManager {
    constructor(uiElements) {
        this.uiElements = uiElements;
        this.currentScreen = CONSTANTS.SCREENS.START;
        this.previousScreen = null;
        this.transitions = new Map();
    }

    showScreen(screenId) {
        // 현재 화면 저장
        this.previousScreen = this.currentScreen;
        
        // 현재 화면 숨기기
        Object.values(this.uiElements.screens).forEach(screen => {
            screen?.classList.remove('active');
        });
        
        // 새 화면 표시
        const targetScreen = this.uiElements.screens[screenId];
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            
            // 전환 효과 (있는 경우)
            this.executeTransition(screenId);
            
            // 화면 변경 이벤트 발생
            this.uiElements.emit('screenChange', {
                from: this.previousScreen,
                to: screenId
            });
        }
        
        return screenId;
    }

    executeTransition(screenId) {
        const transition = this.transitions.get(screenId);
        if (transition && typeof transition === 'function') {
            transition();
        }
    }

    registerTransition(screenId, transitionFn) {
        this.transitions.set(screenId, transitionFn);
    }

    goBack() {
        if (this.previousScreen) {
            return this.showScreen(this.previousScreen);
        }
        return this.currentScreen;
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    getScreenElement(screenId) {
        return this.uiElements.screens[screenId];
    }

    isScreenActive(screenId) {
        const screen = this.uiElements.screens[screenId];
        return screen ? screen.classList.contains('active') : false;
    }

    updateStepIndicator(step) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((s, index) => {
            s.classList.toggle('active', index + 1 <= step);
        });
    }

    showOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    }

    hideOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
}
