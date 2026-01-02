<script>
    import { onMount, onDestroy } from 'svelte';
    import { createPixiApp } from '$lib/gfx/pixi/createApp';

    let { className = '', onReady = () => {} } = $props();

    let canvas = $state();
    let host = $state();
    let app = null;
    let cleanup = null;

    onMount(async () => {
        const result = await createPixiApp({
            canvas,
            resizeTo: host
        });

        app = result.app;
        cleanup = await onReady(app);
    });

    onDestroy(() => {
        if (cleanup) cleanup();
        if (app) app.destroy(true, { children: true, texture: true });
    });
</script>

<div bind:this={host} class="{className} relative w-full h-full">
    <canvas bind:this={canvas} class="block w-full h-full"></canvas>
</div>