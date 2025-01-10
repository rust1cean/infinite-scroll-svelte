<!-- TODO: Scroll by X -->
<!-- TODO: Main scroll direction -->

<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { genRandomId, promiseWithRejectTimeout } from './utils.js';
	import { Throttle } from './throttle.js';
	import { Locker } from './locker.js';

	const {
		children,
		onPrev = async () => {},
		onNext = async () => {},
		scrollX = false,
		scrollY = true,
		thresholdPrev = 120, // in px
		thresholdNext = 120, // in px
		throttleInMs = 150,
		promiseRejctTimeoutInSecs = 5,
		onError = () => {},
		onFinally = () => {},
		...props
	}: {
		children: Snippet;
		throttleInMs?: number;
		promiseRejctTimeoutInSecs?: number;

		// IMPORTANT
		/**
		 * The scroll event will be blocked
		 * until one of the methods is executed.
		 */
		onPrev?: () => Promise<any>;
		onNext?: () => Promise<any>;
		// IMPORTANT

		onError?: (error: Error) => any;
		onFinally?: () => any;
		scrollX?: boolean;
		scrollY?: boolean;
		thresholdPrev?: number;
		thresholdNext?: number;
	} & HTMLAttributes<any> = $props();

	type AbstractScrollDirection = 'back' | 'stay' | 'next';

	let throttle = new Throttle(throttleInMs);
	let scrollHandlerLock = new Locker(false);
	let lastScrollTopPosition: number = 0;
	let rootEl: HTMLElement | undefined;

	let scrollDepth: number = 0;
	const decreaseScrollDepth = () => (scrollDepth -= 1);
	const increaseScrollDepth = () => (scrollDepth += 1);

	const handleScroll = (event: Event) => {
		if (throttle.isThrottling || scrollHandlerLock.isLocked) return;

		scrollHandlerLock.lock();
		possibleCallAtThreshold(event.target as HTMLElement)
			.catch((error) => {
				console.error(error);
				onError(error as Error);
			})
			.finally(() => {
				scrollHandlerLock.unlock();
				onFinally();
			});
	};

	const possibleCallAtThreshold = async (target: HTMLElement) => {
		const { currentScrollTop, currentScrollBot } = getCurrentScroll(target);
		const { scrollTopMax, scrollBotMax } = getMaxScroll(target);

		const scrollDirection = getAbstractScrollDirection(currentScrollTop);

		if (scrollDirection === 'back' && currentScrollTop <= scrollTopMax && scrollDepth > 0) {
			await onthresholdPrev();
		}
		if (scrollDirection === 'next' && currentScrollBot >= scrollBotMax) {
			await onThresholdNext();
		}

		lastScrollTopPosition = currentScrollTop;
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
		const scrollTopMax = thresholdPrev;
		const scrollBotMax = target.scrollHeight - thresholdNext;

		return { scrollTopMax, scrollBotMax };
	};

	const onthresholdPrev = async () => {
		decreaseScrollDepth();

		const prevChild = rootEl?.firstElementChild as HTMLElement | undefined;
		const childId = prevChild == null ? null : markElementByRandomId(prevChild);

		await promiseWithRejectTimeout(onPrev, promiseRejctTimeoutInSecs);

		const currChild = rootEl?.firstElementChild as HTMLElement | undefined;
		if (rootEl && prevChild && childId && currChild) {
			const prevfirstElChild = getElementByDataId(childId) as HTMLElement;
			const prevOffsetTop = prevfirstElChild.offsetTop;
			const currOffsetTop = currChild.offsetTop;

			rootEl.scrollTo({
				top: prevOffsetTop - currOffsetTop
			});

			removeElementDataId(prevChild);
		}
	};

	const onThresholdNext = async () => {
		increaseScrollDepth();

		await promiseWithRejectTimeout(onNext, promiseRejctTimeoutInSecs);
	};

	const getAbstractScrollDirection = (currentScrollTop: number): AbstractScrollDirection => {
		if (currentScrollTop < lastScrollTopPosition) return 'back';
		if (currentScrollTop > lastScrollTopPosition) return 'next';
		return 'stay';
	};

	const markElementByRandomId = (element: HTMLElement) => {
		const id = genRandomId();
		setElementDataId(element, id);
		return id;
	};

	const setElementDataId = (element: HTMLElement, id: string) => {
		element.dataset.infiniteScrollId = id;
	};
	const getElementByDataId = (id: string) =>
		document.querySelector(`[data-infinite-scroll-id="${id}"]`);
	const removeElementDataId = (element: HTMLElement) => delete element.dataset.infiniteScrollId;
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
