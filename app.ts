import { Timer } from './timer';
import { Settings } from './settings';

class ChessClockApp {
    private player1Timer: Timer;
    private player2Timer: Timer;
    private activePlayer: 1 | 2 | null = null;
    private isPaused: boolean = false;
    private gameIntervalId: number | null = null;

    // UI Elements
    private player1Display: HTMLElement | null;
    private player1TimeElement: HTMLElement | null;
    private player2Display: HTMLElement | null;
    private player2TimeElement: HTMLElement | null;

    private startButton: HTMLElement | null;
    private pauseButton: HTMLElement | null;
    private resetButton: HTMLElement | null;
    private settingsButton: HTMLElement | null;

    private settingsModal: HTMLElement | null;
    private initialTimeInput: HTMLInputElement | null;
    private incrementInput: HTMLInputElement | null;
    private saveSettingsButton: HTMLElement | null;
    private closeSettingsButton: HTMLElement | null;

    constructor() {
        // Initialize Timers with default values, will be updated by settings
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
        this.initialTimeInput = document.getElementById('initialTimeInput') as HTMLInputElement;
        this.incrementInput = document.getElementById('incrementInput') as HTMLInputElement;
        this.saveSettingsButton = document.getElementById('saveSettingsButton');
        this.closeSettingsButton = document.getElementById('closeSettingsButton');

        this.loadSettings();
        this.bindEvents();
        this.updateDisplay(); // Initial display update
        this.registerServiceWorker();
    }

    private loadSettings(): void {
        const initialTime = Settings.getInitialTimeMinutes();
        const increment = Settings.getIncrementSeconds();

        if (this.initialTimeInput) this.initialTimeInput.value = initialTime.toString();
        if (this.incrementInput) this.incrementInput.value = increment.toString();
        
        this.player1Timer.reset(initialTime * 60);
        this.player2Timer.reset(initialTime * 60);
        this.updateDisplay();
    }

    private bindEvents(): void {
        this.startButton?.addEventListener('click', () => this.handleStartClick());
        this.pauseButton?.addEventListener('click', () => this.handlePauseClick());
        this.resetButton?.addEventListener('click', () => this.handleResetClick());
        
        this.player1Display?.addEventListener('click', () => this.handleTimerClick(1));
        this.player1Display?.addEventListener('touchstart', (event) => { event.preventDefault(); this.handleTimerClick(1); });
        this.player2Display?.addEventListener('click', () => this.handleTimerClick(2));
        this.player2Display?.addEventListener('touchstart', (event) => { event.preventDefault(); this.handleTimerClick(2); });

        this.settingsButton?.addEventListener('click', () => this.openSettingsModal());
        this.saveSettingsButton?.addEventListener('click', () => this.handleSaveSettings());
        this.closeSettingsButton?.addEventListener('click', () => this.closeSettingsModal());
    }

    private formatTime(milliseconds: number): string {
        const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private updateDisplay(): void {
        if (this.player1TimeElement) {
            this.player1TimeElement.textContent = this.formatTime(this.player1Timer.getRemainingTime());
        }
        if (this.player2TimeElement) {
            this.player2TimeElement.textContent = this.formatTime(this.player2Timer.getRemainingTime());
        }

        this.player1Display?.classList.remove('bg-yellow-300', 'bg-gray-200', 'bg-red-500');
        this.player2Display?.classList.remove('bg-yellow-300', 'bg-gray-300', 'bg-red-500');

        if (this.player1Timer.getRemainingTime() === 0) {
            this.player1Display?.classList.add('bg-red-500');
             this.player2Display?.classList.add('bg-gray-300');
        } else if (this.player2Timer.getRemainingTime() === 0) {
            this.player2Display?.classList.add('bg-red-500');
            this.player1Display?.classList.add('bg-gray-200');
        } else if (this.activePlayer === 1) {
            this.player1Display?.classList.add('bg-yellow-300');
            this.player2Display?.classList.add('bg-gray-300');
        } else if (this.activePlayer === 2) {
            this.player2Display?.classList.add('bg-yellow-300');
            this.player1Display?.classList.add('bg-gray-200');
        } else {
            this.player1Display?.classList.add('bg-gray-200');
            this.player2Display?.classList.add('bg-gray-300');
        }
        
        // Disable/Enable buttons based on state
        if(this.startButton) this.startButton.ariaDisabled = (this.activePlayer !== null && !this.isPaused).toString();
        if(this.pauseButton) this.pauseButton.ariaDisabled = (this.activePlayer === null || this.isPaused).toString();

    }

    private handleStartClick(): void {
        if (this.activePlayer === null) { // Start only if game hasn't started
            this.activePlayer = 1;
            this.isPaused = false;
            this.player1Timer.start();
            this.startGameInterval();
            this.updateButtonStates();
        } else if (this.isPaused) { // Resume
            this.isPaused = false;
            if (this.activePlayer === 1) this.player1Timer.start();
            else this.player2Timer.start();
            this.startGameInterval();
            this.updateButtonStates();
        }
    }

    private handlePauseClick(): void {
        if (this.activePlayer !== null && !this.isPaused) {
            this.isPaused = true;
            if (this.activePlayer === 1) this.player1Timer.stop();
            else this.player2Timer.stop();
            if (this.gameIntervalId !== null) {
                clearInterval(this.gameIntervalId);
                this.gameIntervalId = null;
            }
            this.updateButtonStates();
            this.updateDisplay(); // Update display to show paused state correctly
        }
    }
    
    private updateButtonStates(): void {
        if (this.startButton) {
            this.startButton.textContent = (this.activePlayer !== null && !this.isPaused) ? 'Resume' : 'Start';
             if (this.activePlayer !== null && !this.isPaused) {
                this.startButton.classList.remove('bg-green-500', 'hover:bg-green-700');
                this.startButton.classList.add('bg-orange-500', 'hover:bg-orange-700');
             } else {
                this.startButton.classList.remove('bg-orange-500', 'hover:bg-orange-700');
                this.startButton.classList.add('bg-green-500', 'hover:bg-green-700');
             }
        }
    }


    private handleResetClick(): void {
        this.player1Timer.stop();
        this.player2Timer.stop();
        
        const initialTime = Settings.getInitialTimeMinutes();
        const increment = Settings.getIncrementSeconds(); // Though increment is not directly used in reset, good to be aware
        
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

    private handleTimerClick(playerNumber: 1 | 2): void {
        if (this.activePlayer === playerNumber && !this.isPaused) {
            const increment = Settings.getIncrementSeconds();
            if (this.activePlayer === 1) {
                this.player1Timer.stop();
                if (this.player1Timer.getRemainingTime() > 0) { // only add increment if time > 0
                    this.player1Timer.addTime(increment);
                }
                this.activePlayer = 2;
                this.player2Timer.start();
            } else {
                this.player2Timer.stop();
                 if (this.player2Timer.getRemainingTime() > 0) { // only add increment if time > 0
                    this.player2Timer.addTime(increment);
                }
                this.activePlayer = 1;
                this.player1Timer.start();
            }
            // If game interval was cleared by timeout, restart it
            if (!this.gameIntervalId && (this.player1Timer.getRemainingTime() > 0 && this.player2Timer.getRemainingTime() > 0)) {
                this.startGameInterval();
            }
        }
        this.updateDisplay(); // Update display immediately on click
    }

    private startGameInterval(): void {
        if (this.gameIntervalId !== null) {
            clearInterval(this.gameIntervalId);
        }
        this.gameIntervalId = window.setInterval(() => {
            this.updateDisplay();
            if (this.player1Timer.getRemainingTime() === 0 || this.player2Timer.getRemainingTime() === 0) {
                if (this.gameIntervalId !== null) clearInterval(this.gameIntervalId);
                this.gameIntervalId = null;
                this.activePlayer = null; // Game over
                this.isPaused = true; // Effectively paused
                // Final update to show timeout color
                this.updateDisplay();
                this.updateButtonStates();
            }
        }, 100);
    }

    private openSettingsModal(): void {
        if (this.settingsModal) this.settingsModal.classList.add('flex');
        // Populate inputs with current settings when opening
        if (this.initialTimeInput) this.initialTimeInput.value = Settings.getInitialTimeMinutes().toString();
        if (this.incrementInput) this.incrementInput.value = Settings.getIncrementSeconds().toString();
    }

    private closeSettingsModal(): void {
        if (this.settingsModal) this.settingsModal.classList.remove('flex');
    }

    private handleSaveSettings(): void {
        const initialTime = parseInt(this.initialTimeInput?.value || '10', 10);
        const increment = parseInt(this.incrementInput?.value || '0', 10);

        if (!isNaN(initialTime) && !isNaN(increment) && initialTime > 0) {
            Settings.saveSettings(initialTime, increment);
            this.closeSettingsModal();
            // Optionally, alert user that settings will apply on reset, or apply immediately if desired.
            // For this spec, settings apply on next reset or new game.
            // We can also choose to apply them immediately by calling reset:
            this.handleResetClick(); 
            alert('Settings saved. The clock has been reset with the new settings.');
        } else {
            alert('Invalid settings. Please enter valid numbers (initial time > 0).');
        }
    }
    
    private registerServiceWorker(): void {
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

// Initialize the application
new ChessClockApp();
