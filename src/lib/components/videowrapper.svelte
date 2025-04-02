<script>
  import cx from "clsx";
  import { fade } from "svelte/transition";

  // Props: source, alt-like description, and any other attributes
  let { src, alt, ...restProps } = $props();

  let loaded = $state(false);
  let error = $state(false);
  let dimensionsLoaded = $state(false);

  function onLoadedData() {
    loaded = true;
  }

  function onError() {
    error = true;
  }

  function onVideoDimensionsLoaded(event) {
    // If the video has valid width & height, we consider dimensions loaded.
    if (event.target.videoWidth > 0 && event.target.videoHeight > 0) {
      dimensionsLoaded = true;
    }
  }
</script>

<div
  in:fade={{ duration: 300 }}
  class={cx(
    "video-wrapper rounded-lg overflow-clip",
    loaded && "loaded",
    error && "error"
  )}
>
  <div
    class={cx(
      "top-0 duration-600 left-0 w-full h-full",
      !loaded && "blur-xs opacity-5 scale-130"
    )}
  >
    <video
      {...restProps}
      src={src}
      onloadeddata={onLoadedData}
      onerror={onError}
      onloadedmetadata={onVideoDimensionsLoaded}
      onresize={onVideoDimensionsLoaded}
    >
      {alt || "Your browser does not support the video tag."}
    </video>
  </div>

  {#if !loaded && !error}
    <div class="border-2 loading-indicator border-slate-900/40 bg-slate-950/10">
      <div class="absolute w-full h-full animate-pulse bg-blue-400/2 loading-indicator">
        {#if dimensionsLoaded}
          Loading...
        {/if}
      </div>
    </div>
  {/if}

  {#if error}
    <div class="border-2 border-red-800/20 bg-red-950/10 error-message">
      Loading Error
    </div>
  {/if}
</div>

<style>
  .video-wrapper {
    position: relative;
    display: inline-block;
  }

  .loading-indicator,
  .error-message {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
