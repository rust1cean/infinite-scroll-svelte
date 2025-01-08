# infinite-scroll-svelte

Wrapper that fires events when the user has scrolled it to the beginning or end

## Working conditions

- All keys must be unique

## Important

The `onPrevChunk` and `onNextChunk` scroll events will be blocked until the previous ones are executed

## Props

- **onPrevChunk**: *async fn()* - this event occurs when the user scrolls the container to the top
- **onNextChunk**: *async fn()* - this event occurs when the user scrolls to the end of the container
- **scrollX**: *boolean* - horizontal scrolling
- **scrollY**: *boolean* - vertical scrolling
- **thresholdBack (in pixels)**: *number* - container start threshold for calling `onPrevChunk`
- **thresholdNext (in pixels)**: *number* - container end threshold for calling `onNextChunk`
- **throttleMs (in milliseconds)**: *number* - interval between `onscroll` event calls
- **timeoutFailSecs (in seconds)**: *number* - the maximum time to wait for the `onPrevChunk` and `onNextChunk` functions, if the timeout is exceeded, the onError event will occur
- **onError**: *fn(error: Error)* - fires when one of the `onPrevChunk` or `onNextChunk` functions fails
- **onFinally**: *fn()* - fires when one of the `onPrevChunk` or `onNextChunk` functions completes (good tone for hiding the loading)
- **...props**: *HTMLAttributes* - HTML element attributes

## Example

```svelte
<script lang="ts">
import { InfiniteScroll } from 'infinite-scroll-svelte';

const items = $state<number[]>([...Array(100).keys()]);
const handleNext = async () => items.push(...[Math.random()]);
</script>

<InfiniteScroll className="size-64 border-2 border-current" throttleMs={50} onNextChunk={handleNext}>
{#each items as item (item)}
<div>{item}</div>
{/each}
</InfiniteScroll>
```
