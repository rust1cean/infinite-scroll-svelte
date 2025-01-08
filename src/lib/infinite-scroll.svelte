<!-- TODO: Scroll by X -->
<!-- TODO: Unlock if tasks take a long time to complete -->

<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const {
		children,
		onPrevChunk = async () => {},
		onNextChunk = async () => {},
		scrollX = false,
		scrollY = true,
		thresholdBack = 120, // in px
		thresholdNext = 120, // in px
		throttleMs = 150, // in ms
		timeoutFailSecs = 5, // in secs
		onError = () => {},
		onFinally = () => {},
		...props
	}: {
		children: Snippet;

		// IMPORTANT
		/**
		 * The scroll event will be blocked
		 * until one of the methods is executed.
		 */
		onPrevChunk?: () => Promise<any>;
		onNextChunk?: () => Promise<any>;
		// IMPORTANT

		scrollX?: boolean;
		scrollY?: boolean;
		thresholdBack?: number;
		thresholdNext?: number;
		throttleMs?: number;
		timeoutFailSecs?: number;
		onError?: (error: Error) => any;
		onFinally?: () => any;
	} & HTMLAttributes<any> = $props();

	const ONE_SECOND: number = 1000;

	type AbstractScrollDirection = 'back' | 'stay' | 'next';

	let nextUpdateTime: number = 0;
	let lastScrollPosition: number = 0;
	let scrollHandlerBlock: boolean = false;
	let rootEl: HTMLElement | undefined;
	let scrollDepth: number = 0;

	const decreaseScrollDepth = () => (scrollDepth -= 1);
	const increaseScrollDepth = () => (scrollDepth += 1);

	const handleScroll = (event: Event) => {
		const nextThrottleUntil = getMaybeNextThrottle(nextUpdateTime);
		if (!nextThrottleUntil || scrollHandlerBlock) return;
		nextUpdateTime = nextThrottleUntil;

		const target = event.target as HTMLElement;

		possibleCallAtThreshold(target).catch(console.error);
	};

	const getMaybeNextThrottle = (until: number): number | null => {
		const curr = performance.now();
		const mustThrottle = curr < until;

		if (mustThrottle) return null;

		const throttleUntil = curr + throttleMs;
		return throttleUntil;
	};

	const possibleCallAtThreshold = async (target: HTMLElement) => {
		try {
			const { currentScrollTop, currentScrollBot } = getCurrentScroll(target);
			const { scrollTopMax, scrollBotMax } = getMaxScroll(target);

			const scrollDirection = getAbstractScrollDirection(currentScrollTop);

			if (scrollDirection === 'back' && currentScrollTop <= scrollTopMax && scrollDepth > 0) {
				decreaseScrollDepth();

				const firstElChild = rootEl?.firstElementChild as HTMLElement | undefined;
				const tmpId = genRandomId();

				if (firstElChild) {
					setElementDataId(firstElChild, tmpId);
				}

				blockScrollHandler();
				await callWithTimeoutFailWrapper(onPrevChunk);

				const currfirstElChild = rootEl?.firstElementChild as HTMLElement | undefined;
				if (rootEl && firstElChild && currfirstElChild) {
					const prevfirstElChild = getElementByDataId(tmpId) as HTMLElement;
					const prevOffsetTop = prevfirstElChild.offsetTop;
					const currOffsetTop = currfirstElChild.offsetTop;

					rootEl.scrollTo({
						top: prevOffsetTop - currOffsetTop
					});

					removeElementDataId(firstElChild);
				}
			}
			if (scrollDirection === 'next' && currentScrollBot >= scrollBotMax) {
				increaseScrollDepth();

				blockScrollHandler();
				await callWithTimeoutFailWrapper(onNextChunk);
			}

			lastScrollPosition = currentScrollTop;
		} catch (error) {
			console.error(error);
			onError(error as Error);
		} finally {
			unlockScrollHandler();
			onFinally();
		}
	};

	const getCurrentScroll = (
		target: HTMLElement
	): {
		currentScrollTop: number;
		currentScrollBot: number;
	} => {
		const currentScrollTop = target.scrollTop;
		const currentScrollBot = target.scrollTop + target.clientHeight;

		return { currentScrollTop, currentScrollBot };
	};

	const getMaxScroll = (target: HTMLElement): { scrollTopMax: number; scrollBotMax: number } => {
		const scrollTopMax = thresholdBack;
		const scrollBotMax = target.scrollHeight - thresholdNext;

		return { scrollTopMax, scrollBotMax };
	};

	const getAbstractScrollDirection = (currentScrollTop: number): AbstractScrollDirection => {
		if (currentScrollTop < lastScrollPosition) return 'back';
		if (currentScrollTop > lastScrollPosition) return 'next';
		return 'stay';
	};

	const setElementDataId = (element: HTMLElement, id: string) => {
		element.dataset.lazyScrollId = id;
	};
	const getElementByDataId = (id: string) =>
		document.querySelector(`[data-lazy-scroll-id="${id}"]`);
	const removeElementDataId = (element: HTMLElement) => delete element.dataset.lazyScrollId;

	const genRandomId = (): string => Math.round(Math.random() * 10_000).toString();

	const blockScrollHandler = () => (scrollHandlerBlock = true);
	const unlockScrollHandler = () => (scrollHandlerBlock = false);

	const callWithTimeoutFailWrapper = (fn: () => Promise<any>) => {
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
</script>

<div
	{...props}
	class={props?.class}
	class:overflow-x-scroll={scrollX}
	class:overflow-y-scroll={scrollY}
	onscroll={handleScroll}
	bind:this={rootEl}
>
	{@render children()}
</div>
