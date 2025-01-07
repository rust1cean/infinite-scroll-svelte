<script lang="ts">
	import LazyScroll from '$lib/lazy-scroll.svelte';
	import { createReactiveQueue } from '$lib/reactive-queue-store.svelte.js';

	const SIZE: number = 100;
	const CHUNK_SIZE: number = 60;

	const queue = createReactiveQueue<number>(SIZE);
	queue.pushBack(...[...Array(SIZE).keys()]);

	const handleScrollBack = async () => {
		return new Promise((res) => {
			const firstEl = queue.items[0];
			if (firstEl <= 0) return res("fail");
			queue.pushBack(
				...[
					...Array(CHUNK_SIZE)
						.keys()
						.map((i) => firstEl - i - 1)
				].reverse()
			);
			res('ok');
		});
	};

	const handleScrollNext = async () => {
		return new Promise((res) => {
			const lastEl = queue.items[queue.len - 1];
			queue.pushFront(
				...[
					...Array(CHUNK_SIZE)
						.keys()
						.map((i) => i + lastEl + 1)
				]
			);
			res('ok');
		});
	};
</script>

<LazyScroll
	className="size-[50vmin] border-2 border-current flex flex-col items-center"
	onScrollBack={handleScrollBack}
	onScrollNext={handleScrollNext}
>
	{#each queue.items as item (item)}
		<div>{item}</div>
	{/each}
</LazyScroll>
