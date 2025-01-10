import { ONE_SECOND } from './constants.js';

export const genRandomId = (): string => Math.round(Math.random() * 10_000).toString();

export const promiseWithTimeout = (fn: () => Promise<any>, timeoutFailInSecs: number) => {
	return new Promise((res, rej) => {
		const finalTimeout = timeoutFailInSecs * ONE_SECOND;
		const timer = setTimeout(() => {
			rej(new Error(`Promise timed out after ${timeoutFailInSecs} second(s).\n${fn}`));
		}, finalTimeout);

		fn()
			.then(res)
			.finally(() => clearTimeout(timer));
	});
};
