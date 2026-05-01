<script>
  let { id, name, desc, tags, img, time, addedTags, addTag } = $props();

  function getDateInfo(timestamp) {
    let date = new Date(timestamp);
    let month = date.toLocaleString("default", { month: "long" });
    return [month, date.getFullYear()];
  }

  let dateInfo = $derived(getDateInfo(time));
  let clickableTags = $derived(
    tags.map((tag) => addedTags.some((added) => tag === added)),
  );

  import { flip } from "svelte/animate";

  import Fa from "svelte-fa";
  import {
    faXmark,
    faPlus,
    faCircle,
    faMedal,
    faTrophy,
  } from "@fortawesome/free-solid-svg-icons";

  import cx from "clsx";
  import { stopPropagation } from "svelte/legacy";
  import { fade } from "svelte/transition";
  let dimensionsLoaded = $state(false);

  //let mappedTags = $derived(tags.map(tag => [tag, true]));

  // NOTE: selected should be a callback to set the
  // currently selected project with a callback in the parent

  // to print when these values are updated ..
  // $inspect(name, desc, tags, img);

  function onImageDimensionsLoaded(event) {
    if (event.target.naturalWidth > 0 && event.target.naturalHeight > 0) {
      dimensionsLoaded = true;
    }
  }

  import { base } from "$app/paths";
</script>

<!-- Full-width projects on mobile, otherwise, 2 in each ... grid should restrict this -->
<a
  href={`${base}/projects/${name}`}
  class="flex flex-col gap-2 px-6 py-5 h-80 overflow-clip bg-none rounded-md border-2 shadow-sm transition-colors duration-200 cursor-pointer md:h-140 group border-slate-800 hover:bg-blue-500/3"
>
  <div class="flex flex-col gap-2 justify-end w-full">
    <div class="flex justify-end w-full">
      <div class="flex flex-col">
        <p class="text-xs text-slate-200/70">
          {dateInfo[0]}
        </p>
        <p class="font-bold tracking-wide">
          {dateInfo[1]}
        </p>
      </div>
      <h2
        class="flex-grow px-3 py-1 text-2xl text-right duration-300 lg:text-3xl group-hover:font-bold"
      >
        {name}
      </h2>
    </div>
    <div
      class="w-full  grid grid-rows-[0fr] group-hover:grid-rows-[1fr]
            transition-[grid-template-rows] duration-400
            ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden"
    >
      <div class="overflow-hidden mr-3">
        <p class="pt-2 w-full border-t-1 text-slate-300 border-slate-800/80">
          {desc}
        </p>
      </div>
    </div>
  </div>


  <div
    class={cx(
      "h-full mt-0 transition-all duration-150 group-hover:mt-[0.4rem]",
      "transition-all duration-800 ease-[cubic-bezier(0.12,1.8,0.0,1.0)] grid overflow-clip rounded-sm will-change-transform bg-slate-900/20",
    )}
  >
    {#if img.found}
      <img
        onload={onImageDimensionsLoaded}
        onloadstart={onImageDimensionsLoaded}
        onresize={onImageDimensionsLoaded}
        class={cx(
          "w-full absolute h-full object-cover",
          dimensionsLoaded && "opacity-80",
          !dimensionsLoaded && "opacity-0 blur-xs",
          "col-start-1 row-start-1 col-span-1 row-span-1 opacity-0",
          "ease-[cubic-bezier(0.06, 1, 0.3, 1)] duration-400 group-hover:brightness-[0.9]",
        )}
        alt=""
        src={img.img}
      />
      <div
        class={cx(
          "hidden absolute w-full h-full opacity-0 load-placeholder group-hover:block group-hover:opacity-100",
          !dimensionsLoaded && "opacity-100 block",
        )}
      ></div>
    {:else}
      <div
        style="background-image: url({img.img});"
        class={cx(
          "w-full h-full bg-[length:130px_130px]",
          "col-start-1 row-start-1 col-span-1 row-span-1 opacity-[0.12]",
        )}
      >
        <div class="absolute inset-0 bg-zinc-600/80"></div>
        <!-- Tint overlay -->
      </div>
      <div
        class="hidden absolute w-full h-full opacity-0 load-placeholder group-hover:block group-hover:opacity-100"
      ></div>
    {/if}

    <div
      class="flex z-10 flex-col flex-grow col-span-1 col-start-1 row-span-1 row-start-1 w-full"
    >

      <div class="flex flex-col flex-grow justify-end">
        <div class="flex gap-2 p-3 h-12 lg:h-14">
          {#each tags as tag, index (tag)}
            <button
              animate:flip={{ duration: 400, easing: expoOut, delay: 150 }}
              disabled={clickableTags[index]}
              onclick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                addTag(tag);
              }}
              class={cx(
                "h-full text-[0.6rem] px-2 lg:text-sm lg:px-3 rounded-md border-1",
                "bg-zinc-950/90 text-slate-300 border-zinc-600/0",
                "group/tag transition-all",
                !clickableTags[index] &&
                  "cursor-pointer hover:border-green-700 hover:bg-green-950/70 hover:text-slate-900/0",
                clickableTags[index] && "cursor-default hover:text-stone-500 ",
                "ease-[cubic-bezier(0.68, -0.6, 0.32, 1.6)] hover:border-2 ",
              )}
            >
              <div
                class="grid grid-cols-1 grid-rows-1"
                aria-label={tag.toLowerCase().includes("won") && "Won"}
              >
                {#if tag.toLowerCase().includes("won")}
                  <Fa
                    class="col-span-1 col-start-1 row-span-1 row-start-1 text-amber-500 group-hover/tag:text-transparent"
                    icon={faTrophy}
                  />
                {:else}
                  <p class="col-span-1 col-start-1 row-span-1 row-start-1">
                    {tag}
                  </p>
                {/if}

                <Fa
                  icon={faPlus}
                  class={cx(
                    "w-full h-full",
                    !tag.toLowerCase().includes("won") && "translate-y-[2px]",
                    "duration-100 ease-out transition-all scale-0",
                    "col-span-1 col-start-1 row-span-1 row-start-1",
                    !clickableTags[index] &&
                      "group-hover/tag:text-green-500 group-hover/tag:scale-100",
                  )}
                />
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</a>

<style>
  @layer utilities {
    .border-special {
      --s: 22px; /* Corner size */
      --t: 3px; /* Border thickness */
      --g: 20px; /* Gap between border and image */
      padding: calc(var(--g) + var(--t));
      outline-width: var(--t);
      outline-style: solid;
      outline-offset: calc(-1 * var(--t));
      -webkit-mask:
        conic-gradient(at var(--s) var(--s), #0000 75%, #000 0) 0 0 /
          calc(100% - var(--s)) calc(100% - var(--s)),
        conic-gradient(#000 0 0) content-box;
      mask:
        conic-gradient(at var(--s) var(--s), #0000 75%, #000 0) 0 0 /
          calc(100% - var(--s)) calc(100% - var(--s)),
        conic-gradient(#000 0 0) content-box;
      transition: all 0.4s ease;
    }

    .border-special:group-hover {
      outline-offset: calc(-1 * var(--g));
    }

    @keyframes placeholder-shimmer {
      0% {
        background-position: 100%;
      }
      100% {
        background-position: -100%;
      }
    }

    .load-placeholder {
      animation: 3s cubic-bezier(0.15, 0.5, 0.85, 0.5) infinite
        placeholder-shimmer;
      background-image: linear-gradient(
        to right,
        rgba(150, 180, 255, 0) 0%,
        rgba(140, 180, 255, 0.008) 25%,
        rgba(40, 80, 255, 0.125) 50%,
        rgba(140, 180, 255, 0.008) 75%,
        rgba(150, 180, 255, 0) 100%
      );
      background-size: 200%;
      height: 100%;
      width: 100%;
    }
  }
</style>
