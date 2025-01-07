<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';

	const { children }: { children: Snippet } = $props();
</script>

<div class="h-screen px-64 py-32 overflow-hidden">
    {@render children()}
</div>
