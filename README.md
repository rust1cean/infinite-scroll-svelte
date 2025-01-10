# infinite-scroll-svelte

Wrapper that fires events when the user has scrolled it to the beginning or end

## Working conditions

- All keys must be unique

## Important

The `onPrevChunk` and `onNextChunk` scroll events will be blocked until the previous ones are executed.

Also: the first and last elements are temporarily marked with \[data-infinite-scroll-xxxxx\] identifiers for internal work, so **only sequence elements should be inside** `<InfiniteScroll />`:

### Incorrect usage
```svelte
<InfiniteScroll>
	<h1>Title</h1>
	{#each items as item (item)}
		{item}
	{/each}
</InfiniteScroll>
```

### Correct usage
```svelte
<SomeWrapper>
	<h1>Title</h1>
	<InfiniteScroll>
		{#each items as item (item)}
			{item}
		{/each}
	</InfiniteScroll>
</SomeWrapper>
```

## Props

| Property                        | Type                     | Default     | Description                                                                                                                           |
| ------------------------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `children`                      | `Snippet`                |             |                                                                                                                                       |
| `onPrevChunk?`                  | `async fn()`             | `() => {}`  | Occurs when the user scrolls the container to the top                                                                                 |
| `onNextChunk?`                  | `async fn()`             | `() => {}`  | Occurs when the user scrolls to the end of the container                                                                              |
| `scrollX?`                      | `boolean`                | `false`     | Horizontal scrolling                                                                                                                  |
| `scrollY?`                      | `boolean`                | `true`      | Vertical scrolling                                                                                                                    |
| `thresholdPrev?` (in pixels)    | `number`                 | `120`       | Container start threshold for calling `onPrevChunk`                                                                                   |
| `thresholdNext?` (in pixels)    | `number`                 | `120`       | Container end threshold for calling `onNextChunk`                                                                                     |
| `throttleMs?` (in milliseconds) | `number`                 | `150`       | Interval between `onscroll` event calls                                                                                               |
| `promiseTimeoutInSecs?` (in seconds) | `number`                 | `5`         | Tthe maximum time to wait for the `onPrevChunk` and `onNextChunk` functions, if the timeout is exceeded, the onError event will occur |
| `onError?`                      | `(error: Error) => void` | `() => {}`  | Fires when one of the `onPrevChunk` or `onNextChunk` functions fails                                                                  |
| `onFinally?`                    | `() => void`             | `() => {}`  | Fires when one of the `onPrevChunk` or `onNextChunk` functions completes (good tone for hiding the loading)                           |
| `...props?`                     | `HTMLAttributes`         | `undefined` | HTML element attributes                                                                                                               |

## Example

```svelte
<script lang="ts">
	import { InfiniteScroll } from 'infinite-scroll-svelte';

	const items = $state<number[]>([...Array(100).keys()]);
	const handleNext = async () => items.push(Math.random());
</script>

<InfiniteScroll
	class="size-64 border-2 border-current"
	throttleMs={50}
	onNextChunk={handleNext}
>
	{#each items as item (item)}
		<div>{item}</div>
	{/each}
</InfiniteScroll>
```
