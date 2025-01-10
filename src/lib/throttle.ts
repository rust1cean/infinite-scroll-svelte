export class Throttle {
	constructor(
		private throttleIntervalMs: number,
		private nextThrottleTime: number = performance.now()
	) {}

	get throttling(): boolean {
		const currentTime = performance.now();
		const mustThrottle = currentTime < this.nextThrottleTime;

        if (mustThrottle === false) {
            this.nextThrottleTime = currentTime + this.throttleIntervalMs;
        }

        return mustThrottle;
	}
}
