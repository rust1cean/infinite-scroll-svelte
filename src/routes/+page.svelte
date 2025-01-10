<script lang="ts">
	import { InfiniteScroll } from '$lib/index.js';

	const genRange = (to: number, from = 0, plus = true) => [
		...Array(to)
			.keys()
			.map((i) => (plus ? from + i : from - i))
	];
	const items = $state<number[]>(genRange(24));
	const COUNT = 8;
	const MAX_TIMEOUT = 7_000;

	let loading = $state(false);
	const onLoading = () => (loading = true);
	const onLoadEnd = () => (loading = false);

	const handlePrev = async () => {
		onLoading();
		return new Promise((res) => {
			const first = items[0];
			if (first <= 0) return;
			items.splice(items.length - COUNT, items.length);
			items.unshift(...genRange(COUNT, first - 1, false).reverse());
			res('ok');
		})
	};

	const handleNext = async () => {
		onLoading();
		return new Promise((res) => {
			setTimeout(() => {
				loading = false;
				items.splice(0, COUNT);
				items.push(...genRange(COUNT, items[items.length - 1] + 1));
				res('ok');
			}, Math.random() * MAX_TIMEOUT);
		})
	};

	const handleError = (_: Error) => {
		alert("Failed to load more.")
	}
</script>

<div class="relative size-full border-gray-200">
	{#if loading}
		<div
			class="pointer-events-none absolute z-20 flex size-full items-center justify-center bg-white/60"
		>
			<code class="animate-bounce text-[2vmax] text-black/80">Please wait😀</code>
		</div>
	{/if}
	<InfiniteScroll
		class="grid size-full grid-cols-4 justify-items-center gap-4 rounded-3xl border-2 p-2"
		onPrev={handlePrev}
		onNext={handleNext}
		onError={handleError}
		onUnlock={onLoadEnd}
		throttleInMs={15}
	>
		{#each items as item (item)}
			<div
				class="text-bold flex size-full h-[40vh] select-none items-center justify-center rounded-3xl border-2 border-gray-300 text-3xl duration-150 ease-in-out hover:shadow-xl"
			>
				{item}
			</div>
		{/each}
	</InfiniteScroll>
</div>
