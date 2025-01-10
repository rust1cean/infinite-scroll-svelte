# infinite-scroll-svelte

Wrapper that fires events when the user has scrolled it to the beginning or end

## Important

- All set keys inside `<InfiniteScroll />` must be unique, otherwise auto-scrolling will not work

- `onPrev` and `onNext` **will block** the event handler until one of the them completes.

- First and last elements are temporarily marked with \[data-infinite-scroll-xxxxx\] identifiers for internal work, so **only sequence elements should be inside** `<InfiniteScroll>`:

Incorrect

```svelte
<InfiniteScroll>
	<h1>Title</h1>
	{#each items as item (item)}
		{item}
	{/each}
</InfiniteScroll>
```

Correct

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

| Property                             | Type                     | Default     | Description                                                                                                                 |
| ------------------------------------ | ------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| `children`                           | `Snippet`                |             |                                                                                                                             |
| `onPrev?`                            | `async fn()`             | `() => {}`  | Occurs when the user scrolls the container to the top                                                                       |
| `onNext?`                            | `async fn()`             | `() => {}`  | Occurs when the user scrolls to the end of the container                                                                    |
| `scrollX?`                           | `boolean`                | `false`     | Horizontal scrolling                                                                                                        |
| `scrollY?`                           | `boolean`                | `true`      | Vertical scrolling                                                                                                          |
| `thresholdPrevInPx?` (in pixels)     | `number`                 | `120`       | Container start threshold for calling `onPrev`                                                                              |
| `thresholdNext?` (in pixels)         | `number`                 | `120`       | Container end threshold for calling `onNext`                                                                                |
| `throttleInMs?` (in milliseconds)    | `number`                 | `150`       | Interval between `onscroll` event calls                                                                                     |
| `promiseRejectTimeoutInSecs?` (in seconds) | `number`                 | `5`         | Tthe maximum time to wait for the `onPrev` and `onNext` functions, if the timeout is exceeded, the onError event will occur |
| `onError?`                           | `(error: Error) => void` | `() => {}`  | Fires when one of the `onPrev` or `onNext` functions fails                                                                  |
| `onFinally?`                         | `() => void`             | `() => {}`  | Fires when one of the `onPrev` or `onNext` functions completes (good tone for hiding the loading)                           |
| `...props?`                          | `HTMLAttributes`         | `undefined` | HTML element attributes                                                                                                     |

## Example

```svelte
<script lang="ts">
	import { InfiniteScroll } from 'infinite-scroll-svelte';

	const items = $state<number[]>([...Array(100).keys()]);
	const handleNext = async () => items.push(Math.random());
</script>

<InfiniteScroll class="size-64 border-2 border-current" throttleInMs={50} onNext={handleNext}>
	{#each items as item (item)}
		<div>{item}</div>
	{/each}
</InfiniteScroll>
```
