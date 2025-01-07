<script lang="ts">
	import { InfiniteScroll } from '$lib/index.js';

	const genRange = (to: number, from = 0, plus = true) => [
		...Array(to)
			.keys()
			.map((i) => (plus ? from + i : from - i))
	];
	const items = $state<number[]>(genRange(24));
	const count = 8;

	const handlePrev = async () => {
		const first = items[0];
		if (first <= 0) return;
		items.splice(items.length - count, items.length);
		items.unshift(...genRange(count, first - 1, false).reverse());
	};

	const handleNext = async () => {
		items.splice(0, count);
		items.push(...genRange(count, items[items.length - 1] + 1));
	};
</script>

<InfiniteScroll
	class="brder-gray-200 grid size-full grid-cols-4 justify-items-center gap-4 rounded-3xl border-2 p-2"
	onPrevChunk={handlePrev}
	onNextChunk={handleNext}
>
	{#each items as item (item)}
		<div
			class="text-bold flex size-full h-[40vh] select-none items-center justify-center rounded-3xl border-2 border-gray-300 text-3xl duration-150 ease-in-out hover:shadow-xl"
		>
			{item}
		</div>
	{/each}
</InfiniteScroll>
