<!-- TODO: Scroll by X -->
<!-- TODO: Main scroll direction -->

<script lang="ts">
	import { type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { genRandomId, promiseWithTimeout } from './utils.js';
	import { Throttle } from './throttle.js';
	import { Locker } from './locker.js';
	import type {
		InfiniteScrollEvents,
		InfiniteScrollScrollBars,
		InfiniteScrollThreshold
	} from './types/events.js';

	const {
		children,
		onPrevChunk = async () => {},
		onNextChunk = async () => {},
		scrollX = false,
		scrollY = true,
		thresholdPrev = 120, // in px
		thresholdNext = 120, // in px
		throttleMs = 150, // in ms
		promiseTimeoutInSecs = 5, // in secs
		onError = () => {},
		onFinally = () => {},
		...props
	}: {
		children: Snippet;
		throttleMs?: number;
		promiseTimeoutInSecs?: number;
	} & InfiniteScrollEvents &
		InfiniteScrollScrollBars &
		InfiniteScrollThreshold &
		HTMLAttributes<any> = $props();

	type AbstractScrollDirection = 'back' | 'stay' | 'next';

	let throttle = new Throttle(throttleMs);
	let scrollHandlerLock = new Locker(false);
	let lastScrollTopPosition: number = 0;
	let rootEl: HTMLElement | undefined;

	let scrollDepth: number = 0;
	const decreaseScrollDepth = () => (scrollDepth -= 1);
	const increaseScrollDepth = () => (scrollDepth += 1);

	const handleScroll = (event: Event) => {
		if (throttle.throttling || scrollHandlerLock.isLocked) return;

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
			scrollHandlerLock.lock();
			await onThresholdPrev();
		}
		if (scrollDirection === 'next' && currentScrollBot >= scrollBotMax) {
			scrollHandlerLock.lock();
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

	const onThresholdPrev = async () => {
		decreaseScrollDepth();

		const prevChild = rootEl?.firstElementChild as HTMLElement | undefined;
		const childId = prevChild == null ? null : markElementByRandomId(prevChild);

		await promiseWithTimeout(onPrevChunk, promiseTimeoutInSecs);

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

		await promiseWithTimeout(onNextChunk, promiseTimeoutInSecs);
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
		element.dataset.lazyScrollId = id;
	};
	const getElementByDataId = (id: string) =>
		document.querySelector(`[data-lazy-scroll-id="${id}"]`);
	const removeElementDataId = (element: HTMLElement) => delete element.dataset.lazyScrollId;
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
