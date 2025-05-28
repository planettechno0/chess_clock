export namespace Settings {
    const INITIAL_TIME_KEY = "chessClock.initialTimeMinutes";
    const INCREMENT_KEY = "chessClock.incrementSeconds";

    const DEFAULT_INITIAL_TIME_MINUTES = 10;
    const DEFAULT_INCREMENT_SECONDS = 0;

    export function getInitialTimeMinutes(): number {
        const storedValue = localStorage.getItem(INITIAL_TIME_KEY);
        if (storedValue !== null) {
            const parsedValue = parseInt(storedValue, 10);
            return !isNaN(parsedValue) ? parsedValue : DEFAULT_INITIAL_TIME_MINUTES;
        }
        return DEFAULT_INITIAL_TIME_MINUTES;
    }

    export function getIncrementSeconds(): number {
        const storedValue = localStorage.getItem(INCREMENT_KEY);
        if (storedValue !== null) {
            const parsedValue = parseInt(storedValue, 10);
            return !isNaN(parsedValue) ? parsedValue : DEFAULT_INCREMENT_SECONDS;
        }
        return DEFAULT_INCREMENT_SECONDS;
    }

    export function saveSettings(initialTimeMinutes: number, incrementSeconds: number): void {
        localStorage.setItem(INITIAL_TIME_KEY, initialTimeMinutes.toString());
        localStorage.setItem(INCREMENT_KEY, incrementSeconds.toString());
    }
}
