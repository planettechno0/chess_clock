// Contents of timer.ts (compiled and adapted)
class Timer {
    constructor(initialTimeSeconds) {
        this.initialTimeMs = initialTimeSeconds * 1000;
        this.remainingTime = this.initialTimeMs;
        this.isRunning = false;
        this.lastStartTime = null;
    }
    start() {
        if (!this.isRunning) {
            this.lastStartTime = Date.now();
            this.isRunning = true;
        }
    }
    stop() {
        if (this.isRunning && this.lastStartTime !== null) {
            const elapsed = Date.now() - this.lastStartTime;
            this.remainingTime -= elapsed;
            if (this.remainingTime < 0) {
                this.remainingTime = 0;
            }
            this.lastStartTime = null;
            this.isRunning = false;
        }
    }
    getRemainingTime() {
        if (this.isRunning && this.lastStartTime !== null) {
            const elapsed = Date.now() - this.lastStartTime;
            const currentRemaining = this.remainingTime - elapsed;
            return Math.max(0, currentRemaining);
        }
        return Math.max(0, this.remainingTime);
    }
    addTime(amountSeconds) {
        if (this.remainingTime > 0) {
            this.remainingTime += amountSeconds * 1000;
        }
    }
    reset(newInitialTimeSeconds) {
        if (newInitialTimeSeconds !== undefined) {
            this.initialTimeMs = newInitialTimeSeconds * 1000;
        }
        this.remainingTime = this.initialTimeMs;
        this.isRunning = false;
        this.lastStartTime = null;
    }
}

// Contents of settings.ts (compiled and adapted)
const Settings = {
    INITIAL_TIME_KEY: "chessClock.initialTimeMinutes",
    INCREMENT_KEY: "chessClock.incrementSeconds",
    DEFAULT_INITIAL_TIME_MINUTES: 10,
    DEFAULT_INCREMENT_SECONDS: 0,

    getInitialTimeMinutes() {
        const storedValue = localStorage.getItem(this.INITIAL_TIME_KEY);
        if (storedValue !== null) {
            const parsedValue = parseInt(storedValue, 10);
            return !isNaN(parsedValue) ? parsedValue : this.DEFAULT_INITIAL_TIME_MINUTES;
        }
        return this.DEFAULT_INITIAL_TIME_MINUTES;
    },
    getIncrementSeconds() {
        const storedValue = localStorage.getItem(this.INCREMENT_KEY);
        if (storedValue !== null) {
            const parsedValue = parseInt(storedValue, 10);
            return !isNaN(parsedValue) ? parsedValue : this.DEFAULT_INCREMENT_SECONDS;
        }
        return this.DEFAULT_INCREMENT_SECONDS;
    },
    saveSettings(initialTimeMinutes, incrementSeconds) {
        localStorage.setItem(this.INITIAL_TIME_KEY, initialTimeMinutes.toString());
        localStorage.setItem(this.INCREMENT_KEY, incrementSeconds.toString());
    }
};

// Contents of app.ts (compiled and adapted, using the Timer and Settings above)
class ChessClockApp {
    constructor() {
        this.activePlayer = null;
        this.isPaused = false;
        this.gameIntervalId = null;
        this.player1Timer = new Timer(Settings.getInitialTimeMinutes() * 60);
        this.player2Timer = new Timer(Settings.getInitialTimeMinutes() * 60);
        this.player1Display = document.getElementById('player1Display');
        this.player1TimeElement = document.getElementById('player1Time');
        this.player2Display = document.getElementById('player2Display');
        this.player2TimeElement = document.getElementById('player2Time');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.resetButton = document.getElementById('resetButton');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.initialTimeInput = document.getElementById('initialTimeInput');
        this.incrementInput = document.getElementById('incrementInput');
        this.saveSettingsButton = document.getElementById('saveSettingsButton');
        this.closeSettingsButton = document.getElementById('closeSettingsButton');
        this.loadSettings();
        this.bindEvents();
        this.updateDisplay();
        this.registerServiceWorker();
    }
    loadSettings() {
        const initialTime = Settings.getInitialTimeMinutes();
        const increment = Settings.getIncrementSeconds();
        if (this.initialTimeInput)
            this.initialTimeInput.value = initialTime.toString();
        if (this.incrementInput)
            this.incrementInput.value = increment.toString();
        this.player1Timer.reset(initialTime * 60);
        this.player2Timer.reset(initialTime * 60);
        this.updateDisplay();
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        (_a = this.startButton) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.handleStartClick());
        (_b = this.pauseButton) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => this.handlePauseClick());
        (_c = this.resetButton) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.handleResetClick());
        (_d = this.player1Display) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => this.handleTimerClick(1));
        (_e = this.player1Display) === null || _e === void 0 ? void 0 : _e.addEventListener('touchstart', (event) => { event.preventDefault(); this.handleTimerClick(1); });
        (_f = this.player2Display) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => this.handleTimerClick(2));
        (_g = this.player2Display) === null || _g === void 0 ? void 0 : _g.addEventListener('touchstart', (event) => { event.preventDefault(); this.handleTimerClick(2); });
        (_h = this.settingsButton) === null || _h === void 0 ? void 0 : _h.addEventListener('click', () => this.openSettingsModal());
        (_j = this.saveSettingsButton) === null || _j === void 0 ? void 0 : _j.addEventListener('click', () => this.handleSaveSettings());
        (_k = this.closeSettingsButton) === null || _k === void 0 ? void 0 : _k.addEventListener('click', () => this.closeSettingsModal());
    }
    formatTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    updateDisplay() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (this.player1TimeElement) {
            this.player1TimeElement.textContent = this.formatTime(this.player1Timer.getRemainingTime());
        }
        if (this.player2TimeElement) {
            this.player2TimeElement.textContent = this.formatTime(this.player2Timer.getRemainingTime());
        }
        (_a = this.player1Display) === null || _a === void 0 ? void 0 : _a.classList.remove('bg-yellow-300', 'bg-gray-200', 'bg-red-500');
        (_b = this.player2Display) === null || _b === void 0 ? void 0 : _b.classList.remove('bg-yellow-300', 'bg-gray-300', 'bg-red-500');
        if (this.player1Timer.getRemainingTime() === 0) {
            (_c = this.player1Display) === null || _c === void 0 ? void 0 : _c.classList.add('bg-red-500');
            (_d = this.player2Display) === null || _d === void 0 ? void 0 : _d.classList.add('bg-gray-300');
        }
        else if (this.player2Timer.getRemainingTime() === 0) {
            (_e = this.player2Display) === null || _e === void 0 ? void 0 : _e.classList.add('bg-red-500');
            (_f = this.player1Display) === null || _f === void 0 ? void 0 : _f.classList.add('bg-gray-200');
        }
        else if (this.activePlayer === 1) {
            (_g = this.player1Display) === null || _g === void 0 ? void 0 : _g.classList.add('bg-yellow-300');
            (_h = this.player2Display) === null || _h === void 0 ? void 0 : _h.classList.add('bg-gray-300');
        }
        else if (this.activePlayer === 2) {
            (_j = this.player2Display) === null || _j === void 0 ? void 0 : _j.classList.add('bg-yellow-300');
            (_k = this.player1Display) === null || _k === void 0 ? void 0 : _k.classList.add('bg-gray-200');
        }
        else {
            this.player1Display === null || this.player1Display === void 0 ? void 0 : this.player1Display.classList.add('bg-gray-200');
            this.player2Display === null || this.player2Display === void 0 ? void 0 : this.player2Display.classList.add('bg-gray-300');
        }
        if (this.startButton)
            this.startButton.ariaDisabled = (this.activePlayer !== null && !this.isPaused).toString();
        if (this.pauseButton)
            this.pauseButton.ariaDisabled = (this.activePlayer === null || this.isPaused).toString();
    }
    handleStartClick() {
        if (this.activePlayer === null) {
            this.activePlayer = 1;
            this.isPaused = false;
            this.player1Timer.start();
            this.startGameInterval();
            this.updateButtonStates();
        }
        else if (this.isPaused) {
            this.isPaused = false;
            if (this.activePlayer === 1)
                this.player1Timer.start();
            else
                this.player2Timer.start();
            this.startGameInterval();
            this.updateButtonStates();
        }
    }
    handlePauseClick() {
        if (this.activePlayer !== null && !this.isPaused) {
            this.isPaused = true;
            if (this.activePlayer === 1)
                this.player1Timer.stop();
            else
                this.player2Timer.stop();
            if (this.gameIntervalId !== null) {
                clearInterval(this.gameIntervalId);
                this.gameIntervalId = null;
            }
            this.updateButtonStates();
            this.updateDisplay(); 
        }
    }
    updateButtonStates() {
        if (this.startButton) {
            this.startButton.textContent = (this.activePlayer !== null && !this.isPaused) ? 'Resume' : 'Start';
            if (this.activePlayer !== null && !this.isPaused) {
                this.startButton.classList.remove('bg-green-500', 'hover:bg-green-700');
                this.startButton.classList.add('bg-orange-500', 'hover:bg-orange-700');
            }
            else {
                this.startButton.classList.remove('bg-orange-500', 'hover:bg-orange-700');
                this.startButton.classList.add('bg-green-500', 'hover:bg-green-700');
            }
        }
    }
    handleResetClick() {
        this.player1Timer.stop();
        this.player2Timer.stop();
        const initialTime = Settings.getInitialTimeMinutes();
        this.player1Timer.reset(initialTime * 60);
        this.player2Timer.reset(initialTime * 60);
        this.activePlayer = null;
        this.isPaused = false;
        if (this.gameIntervalId !== null) {
            clearInterval(this.gameIntervalId);
            this.gameIntervalId = null;
        }
        this.updateDisplay();
        this.updateButtonStates();
    }
    handleTimerClick(playerNumber) {
        if (this.activePlayer === playerNumber && !this.isPaused) {
            const increment = Settings.getIncrementSeconds();
            if (this.activePlayer === 1) {
                this.player1Timer.stop();
                if (this.player1Timer.getRemainingTime() > 0) {
                    this.player1Timer.addTime(increment);
                }
                this.activePlayer = 2;
                this.player2Timer.start();
            }
            else {
                this.player2Timer.stop();
                if (this.player2Timer.getRemainingTime() > 0) {
                    this.player2Timer.addTime(increment);
                }
                this.activePlayer = 1;
                this.player1Timer.start();
            }
            if (!this.gameIntervalId && (this.player1Timer.getRemainingTime() > 0 && this.player2Timer.getRemainingTime() > 0)) {
                this.startGameInterval();
            }
        }
        this.updateDisplay();
    }
    startGameInterval() {
        if (this.gameIntervalId !== null) {
            clearInterval(this.gameIntervalId);
        }
        this.gameIntervalId = window.setInterval(() => {
            this.updateDisplay();
            if (this.player1Timer.getRemainingTime() === 0 || this.player2Timer.getRemainingTime() === 0) {
                if (this.gameIntervalId !== null)
                    clearInterval(this.gameIntervalId);
                this.gameIntervalId = null;
                this.activePlayer = null; 
                this.isPaused = true; 
                this.updateDisplay();
                this.updateButtonStates();
            }
        }, 100);
    }
    openSettingsModal() {
        var _a, _b;
        if (this.settingsModal)
            this.settingsModal.classList.add('flex');
        if (this.initialTimeInput)
            this.initialTimeInput.value = Settings.getInitialTimeMinutes().toString();
        if (this.incrementInput)
            this.incrementInput.value = Settings.getIncrementSeconds().toString();
    }
    closeSettingsModal() {
        if (this.settingsModal)
            this.settingsModal.classList.remove('flex');
    }
    handleSaveSettings() {
        var _a, _b;
        const initialTime = parseInt(((_a = this.initialTimeInput) === null || _a === void 0 ? void 0 : _a.value) || '10', 10);
        const increment = parseInt(((_b = this.incrementInput) === null || _b === void 0 ? void 0 : _b.value) || '0', 10);
        if (!isNaN(initialTime) && !isNaN(increment) && initialTime > 0) {
            Settings.saveSettings(initialTime, increment);
            this.closeSettingsModal();
            this.handleResetClick();
            alert('Settings saved. The clock has been reset with the new settings.');
        }
        else {
            alert('Invalid settings. Please enter valid numbers (initial time > 0).');
        }
    }
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                    .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
            });
        }
    }
}
new ChessClockApp();
//# sourceMappingURL=app.js.map
// The above sourceMappingURL is optional but good practice if actual .map files were generated.
// For this simulation, it's just a comment.
