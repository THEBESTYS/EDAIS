// ui-manager/constants.js

export const CONSTANTS = {
    // 테스트 설정
    MAX_RECORDING_TIME: 30, // 초
    MAX_REFERENCE_PLAYS: 3,
    MAX_HISTORY_ITEMS: 10,
    
    // 점수 기준
    SCORE_THRESHOLDS: {
        EXCELLENT: 90,
        GOOD: 80,
        AVERAGE: 60,
        POOR: 40
    },
    
    // 색상
    COLORS: {
        SUCCESS: { start: '#4CAF50', end: '#8BC34A' },
        WARNING: { start: '#FF9800', end: '#FFC107' },
        ERROR: { start: '#F44336', end: '#FF5252' },
        INFO: { start: '#2196F3', end: '#64B5F6' }
    },
    
    // 화면 ID
    SCREENS: {
        START: 'startScreen',
        CALIBRATION: 'calibrationScreen',
        TEST: 'testScreen',
        RESULT: 'resultScreen'
    },
    
    // 로컬 스토리지 키
    STORAGE_KEYS: {
        SETTINGS: 'pronunciationMasterSettings',
        HISTORY: 'testHistory',
        PREVIOUS_LEVEL: 'previousSLevel'
    },
    
    // 애니메이션 지속 시간
    ANIMATION_DURATION: {
        TOAST: 3000,
        TRANSITION: 300,
        LOADING: 500
    }
};

export const DEFAULT_SETTINGS = {
    autoPlayReference: true,
    showLiveFeedback: true,
    enableSoundEffects: true,
    language: 'ko'
};

export const SCORE_COLOR_MAP = {
    90: CONSTANTS.COLORS.SUCCESS,
    80: CONSTANTS.COLORS.WARNING,
    60: CONSTANTS.COLORS.ERROR
};

export const DIFFICULTY_LABELS = {
    easy: '초급',
    medium: '중급', 
    hard: '고급'
};
