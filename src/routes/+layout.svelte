<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="size-full min-h-screen flex flex-col items-center justify-center p-32">
	{@render children()}
</div>
