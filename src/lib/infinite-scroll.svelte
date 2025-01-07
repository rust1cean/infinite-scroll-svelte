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
		thresholdBack = 100, // in px
		thresholdNext = 100, // in px
		throttleMs = 250, // in ms
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
		className?: string;
	} & HTMLAttributes<any> = $props();

	const scrollByXStyle = scrollX ? 'overflow-x-scroll' : '';
	const scrollByYStyle = scrollY ? 'overflow-y-scroll' : '';
	const scrollStyle = `${scrollByXStyle} ${scrollByYStyle}`;

	type AbstractScrollDirection = 'back' | 'stay' | 'next';

	let nextUpdateTime: number = 0;
	let lastScrollPosition: number = 0;
	let scrollHandlerBlock: boolean = false;
	let rootEl: HTMLElement | undefined;

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
		const { currentScrollTop, currentScrollBot } = getCurrentScroll(target);
		const { scrollTopMax, scrollBotMax } = getMaxScroll(target);

		const scrollDirection = getAbstractScrollDirection(currentScrollTop);

		if (scrollDirection === 'back' && currentScrollTop <= scrollTopMax) {
			const firstElChild = rootEl?.firstElementChild as HTMLElement | undefined;
			const tmpId = genRandomId();

			if (firstElChild) {
				setElementDataId(firstElChild, tmpId);
			}

			blockScrollHandler();
			await onPrevChunk();

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
			blockScrollHandler();
			await onNextChunk();
		}

		unlockScrollHandler();
		lastScrollPosition = currentScrollTop;
	};

	const getCurrentScroll = (
		target: HTMLElement
	): {
		currentScrollTop: number;
		currentScrollBot: number;
	} => {
		const currentScrollTop = target.scrollTop;
		const currentScrollBot = target.scrollTop + target.offsetHeight;

		return { currentScrollTop, currentScrollBot };
	};

	const getMaxScroll = (target: HTMLElement): { scrollTopMax: number; scrollBotMax: number } => {
		const scrollTopMax = thresholdBack;
		const scrollBotMax = target.scrollHeight - target.clientHeight - thresholdNext;

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
</script>

<div class="{scrollStyle} {props?.className}" {...props} onscroll={handleScroll} bind:this={rootEl}>
	{@render children()}
</div>
