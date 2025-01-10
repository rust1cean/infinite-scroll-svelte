export class Locker {
	constructor(private locked: boolean) {}

	get isLocked(): boolean {
		return this.locked;
	}

	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}
}
