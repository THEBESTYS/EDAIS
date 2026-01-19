// ui-manager/utils.js

export class AsyncQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    addTask(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const { task, resolve, reject } = this.queue.shift();

        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.processQueue();
        }
    }

    clear() {
        this.queue = [];
    }
}

export class SafeExecutor {
    constructor(maxRetries = 3) {
        this.maxRetries = maxRetries;
    }

    async execute(operation, fallback = null) {
        let lastError;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt + 1} failed:`, error);
                
                if (attempt < this.maxRetries - 1) {
                    await this.delay(Math.pow(2, attempt) * 100); // 지수 백오프
                }
            }
        }
        
        console.error('All attempts failed:', lastError);
        return fallback ? await fallback() : null;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export class PerformanceTracker {
    constructor() {
        this.marks = new Map();
        this.measurements = [];
    }

    mark(name) {
        this.marks.set(name, performance.now());
    }

    measure(startName, endName, measurementName) {
        const start = this.marks.get(startName);
        const end = this.marks.get(endName);
        
        if (start && end) {
            const duration = end - start;
            this.measurements.push({
                name: measurementName || `${startName}-${endName}`,
                duration,
                timestamp: new Date().toISOString()
            });
            
            // 최근 100개만 유지
            if (this.measurements.length > 100) {
                this.measurements.shift();
            }
            
            return duration;
        }
        return null;
    }

    getStats() {
        return this.measurements;
    }
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function adjustColor(color, amount) {
    let usePound = false;
    
    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }
    
    const num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;
    
    return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
}
