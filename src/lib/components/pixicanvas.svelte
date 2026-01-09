<script>
  import { onMount, onDestroy } from "svelte";
  import { createPixiApp } from "$lib/gfx/pixi/createApp";

  let { className = "", onReady = () => {} } = $props();

  let canvas = $state();
  let host = $state();
  let app = null;
  let cleanup = null;
  let resizeObserver = null;

  onMount(async () => {
    const result = await createPixiApp({
      canvas,
    });

    app = result.app;

    resizeObserver = new ResizeObserver((entries) => {
      if (!app || !app.renderer) return;

      const entry = entries[0];
      let width = entry.contentRect.width;
      let height = entry.contentRect.height;
      if (width <= 1 || height <= 1) return;
      app.renderer.resize(width, height);
    });

    resizeObserver.observe(host);

    const rect = host.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      app.renderer.resize(rect.width, rect.height);
    }

    cleanup = await onReady(app);
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    if (app) {
      app.destroy({
        removeView: true,
        children: true,
        texture: true,
        baseTexture: true,
      });
      app = null;
    }
  });
</script>

<div
  bind:this={host}
  class="{className} relative w-full h-full min-w-[1px] min-h-[1px]"
>
  <canvas bind:this={canvas} class="block w-full h-full"></canvas>
</div>
