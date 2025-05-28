export class Timer {
    public remainingTime: number; // in milliseconds
    public isRunning: boolean;
    private lastStartTime: number | null;
    private initialTimeMs: number;

    constructor(initialTimeSeconds: number) {
        this.initialTimeMs = initialTimeSeconds * 1000;
        this.remainingTime = this.initialTimeMs;
        this.isRunning = false;
        this.lastStartTime = null;
    }

    start(): void {
        if (!this.isRunning) {
            this.lastStartTime = Date.now();
            this.isRunning = true;
        }
    }

    stop(): void {
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

    getRemainingTime(): number {
        if (this.isRunning && this.lastStartTime !== null) {
            const elapsed = Date.now() - this.lastStartTime;
            const currentRemaining = this.remainingTime - elapsed;
            return Math.max(0, currentRemaining);
        }
        return Math.max(0, this.remainingTime);
    }

    addTime(amountSeconds: number): void {
        if (this.remainingTime > 0) { // Only add increment if timer hasn't run out
            this.remainingTime += amountSeconds * 1000;
        }
    }

    reset(newInitialTimeSeconds?: number): void {
        if (newInitialTimeSeconds !== undefined) {
            this.initialTimeMs = newInitialTimeSeconds * 1000;
        }
        this.remainingTime = this.initialTimeMs;
        this.isRunning = false;
        this.lastStartTime = null;
    }
}
