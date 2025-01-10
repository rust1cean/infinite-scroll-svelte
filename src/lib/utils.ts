import { ONE_SECOND } from './constants.js';

export const genRandomId = (): string => Math.round(Math.random() * 10_000).toString();

export const promiseWithTimeout = (fn: () => Promise<any>, timeoutFailSecs: number) => {
	return new Promise((res, rej) => {
		const finalTimeout = timeoutFailSecs * ONE_SECOND;
		const timer = setTimeout(() => {
			rej(new Error(`Promise timed out after ${timeoutFailSecs} second(s).\n${fn}`));
		}, finalTimeout);

		fn()
			.then(res)
			.finally(() => clearTimeout(timer));
	});
};
