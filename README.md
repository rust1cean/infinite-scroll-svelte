# infinite-scroll-svelte

Wrapper that fires events when the user has scrolled it to the beginning or end

## Working conditions

- All keys must be unique

## Example

```svelte
<script lang="ts">
import { InfiniteScroll } from 'infinite-scroll-svelte';

const items = $state<number[]>([...Array(100).keys()]);
const handleNext = async () => items.push(...[Math.random()]);
</script>

<InfiniteScroll className="size-64 border-2 border-current" throttleMs={50} onNextChunk={handleNext}>
{#each items as item (Math.random())}
<div>{item}</div>
{/each}
</InfiniteScroll>
```
