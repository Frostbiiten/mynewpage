<svelte:head>
  <title>Creative Works</title>
  <meta name="description" content="This page contains my attempts at creative pieces">
  <meta name="keyword" content="sketches, digital, photos, edits, drawings, 3d models">
  <meta name="keywords" content="sketches, digital, photos, edits, drawings, 3d models">
  <meta name="author" content="Edem Hoggar">

  <meta property="og:title" content="Edem's Work"/>
  <meta property="og:description" content="This page contains my attempts at creative pieces"/>
  <meta property="og:image" content="https://edem.ca/cloudsbg.webp"/>
  <meta property="og:url" content="https://edem.ca"/>
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Edem's Work" />
  <meta name="twitter:description" content="This page contains my attempts at creative pieces"/>
  <meta name="twitter:image" content="https://edem.ca/cloudsbg.jpg"/>
</svelte:head>

<script>
    import ImgWrapper from "$lib/components/imgwrapper.svelte";

    import Fa from 'svelte-fa'
    import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faInstagram } from '@fortawesome/free-brands-svg-icons';

    import Masonry from 'svelte-bricks'

    import me from "$lib/img/categories/me.png"
    import sketches from "$lib/img/categories/sketch.webp"
    import digital from "$lib/img/categories/digital.webp"
    import photos from "$lib/img/categories/photos.webp"
    import misc from "$lib/img/categories/misc.webp"
    import misc2 from "$lib/img/categories/misc2.webp"

    import CreativeCategory from "$lib/components/creativecategory.svelte";
    import { fly, fade } from "svelte/transition";
    import cx from "clsx";


    const sketchPreimage = import.meta.glob('$lib/img/creative/images/*', {
        eager: true
    });

    const categories = [
        {
            name: "sketches",
            image: sketches,
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/sketches/*', {
                eager: true
            })).map((module) => module.default),
            contrast: "1.55",
            additionalImageClasses: "saturate-0",
            objectPosition: "35% 50%",
            hoverObjectPosition: "55% 50%"
        },
        {
            name: "digital*",
            image: digital,
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/digital/*', {
                eager: true
            })).map((module) => module.default),
            contrast: "1.05",
            objectPosition: "45% 50%",
            hoverObjectPosition: "35% 50%"
        },
        {
            name: "photos",
            image: photos,
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/photos/*', {
                eager: true
            })).map((module) => module.default),
            contrast: "1.35",
            objectPosition: "65% 50%",
            additionalImageClasses: "brightness-110",
            hoverObjectPosition: "75% 50%"
        },
        {
            name: "misc.",
            image: misc,
            //gallery: Object.values(import.meta.glob('$lib/img/creative/images/misc/*', {
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/misc/*.{png,jpg,jpeg,webp,gif,mp4,webm,mov}', {
                eager: true
            })).map((module) => module.default),
            secondaryImage: misc2,
            contrast: "1.55",
            additionalImageClasses: "scale-120",
            objectPosition: "50% 50%",
            hoverObjectPosition: "40% 50%"
        }
    ]

    let isMd = $state(false)
    $effect(() => {
        const wQuery = window.matchMedia('(min-width: 768px)');
        const check = () => isMd = wQuery.matches; check();
        wQuery.addEventListener('change', check);
        return () => wQuery.removeEventListener('change', check);
    });

    let category = $state("");
    function setCategory(newCategory) {
        if (category === "")
        {
            category = newCategory;
            currentImages = categories.find(el => { return el.name === newCategory}).gallery;
        }
        else category = "";
    }

    let visibleCategories = $derived(!category ? categories : categories.filter(cat => cat.name === category));
    let loadedImg = $state(Object.fromEntries(categories.map(cat => [cat.name, false])));

    let currentImages = $state([]);

    let [minColWidth, maxColWidth, gap] = [320, 450, 10]

    import { cubicOut, expoInOut, expoOut } from 'svelte/easing';
    import { load } from "../projects/[slug]/+page";
  import { onMount } from "svelte";

    function scaleX(node, { delay = 0, duration = 400, easing = expoOut }) {
        return {
        delay,
        duration,
        easing,
        css: t => isMd ? `max-width: ${t * 25}%; overflow: hidden;` : `max-height: ${t * 25}%; overflow: hidden;`
        };
    }
    
    function meAnim(node, { delay = 0, duration = 400, easing = expoOut }) {
        return {
        delay,
        duration,
        easing,
        css: t => `width: calc(var(--spacing) * ${56 * t}); min-width: calc(var(--spacing) * ${56 * t});`
        };
    }

    function titleAnim(node, { delay = 0, duration = 400, easing = expoOut }) {
        return {
        delay,
        duration,
        easing,
        css: t => `transform: scaleX(${1 / Math.max(0.05, t)});`
        };
    }

    let masonryHeight = $state(0)
    let newWidth = $state(0)
    let masonryRef;
    function handleTransitionEnd() {
        //console.log("errmmmm: " + masonryRef.getBoundingClientRect().width);
        newWidth = masonryRef.getBoundingClientRect().width;
    }


    let scrollbarWidth = $state(0);
    // -> https://stackoverflow.com/a/13382873/17597356
    function getScrollbarWidth()
    {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        const inner = document.createElement('div');
        outer.appendChild(inner);
        scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
    }
    onMount(() => {
        getScrollbarWidth();
    })
</script>

<style>
</style>

<div class="flex flex-row justify-center -mt-8 -mb-8 w-full overflow-clip md:-mt-5 grow">
    <div class="px-8 space-y-5 min-h-full max-w-screen md:max-w-7xl grow w-7xl">
        <div class={cx("flex flex-col md:flex-row transition-all items-stretch w-full h-full justify-stretch duration-300", visibleCategories.length != 1 && "gap-2", visibleCategories.length == 1 && "gap-0")}>
            {#if !category}
            <div class="bg-[#d9d9d9] rounded-lg overflow-clip md:w-56 md:min-w-56 hidden md:block"
                in:meAnim={{ duration: 400}}
                out:meAnim={{ duration: 400}}
            >
                <div class="pt-4 pl-5 space-y-2 h-1/2">
                    <h1 class="w-full leading-8 font-mono text-[225%] text-gray-950">creative works</h1>
                </div>
                <img src={me} alt="me" class="hidden object-[47%_0%] object-cover h-1/2"/>
                <p class="hidden content-end p-6 pb-6 h-1/2 text-gray-900">the things i've done</p>
            </div>
            {/if}

            {#each visibleCategories as cat, i (cat.name)}
            <button 
                class="flex bg-slate-800 z-2 group rounded-t-lg md:rounded-lg group-hover:w-[30%] relative justify-start items-end overflow-clip cursor-pointer duration-80 border-zinc-600 grow"
                style="--pos: {cat.objectPosition ?? '50% 50%'}; --hover-pos: {cat.hoverObjectPosition ?? '35% 50%'}; --contr: {cat.contrast ?? '1.55'}"
                onclick={() => setCategory(cat.name)}
                out:scaleX={{ duration: 400, delay: (1+i) * 100 }}
                in:scaleX={{ duration: 400, delay: (1+i) * 100 }}
                >
                <img 
                    class={cx("object-cover opacity-0 rounded-lg contrast-[var(--contr)] pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-700 absolute top-0 left-0 md:h-full object-[var(--pos)] group-hover:object-[var(--hover-pos)]", cat.additionalImageClasses ?? '', loadedImg[cat.name] && "opacity-100")}
                    alt={cat.name} 
                    src={cat.image}
                    onload={() => {loadedImg[cat.name] = true}}
                />
                
                {#if cat.secondaryImage}
                    <img 
                    class="object-cover rounded-lg contrast-[var(--contr)] pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-500 absolute top-0 left-0 h-full opacity-0 group-hover:opacity-100 object-[var(--pos)] group-hover:object-[var(--hover-pos)]" 
                    alt={cat.name} 
                    src={cat.secondaryImage}
                    />
                {/if}
                
                <div class={cx("absolute transition-colors mix-blend-hard-light duration-100 from-gray-950/80 top-0 left-0 w-full h-full bg-gradient-to-t to-60%", visibleCategories.length != 1 && "group-hover:from-[rgb(160,190,255)]", visibleCategories.length == 1 && "group-hover:from-rose-400/30")}></div>
                

                {#if visibleCategories.length == 1}
                    <div class="flex absolute top-0 left-0 justify-center items-start w-full h-5 md:h-20">
                        <h2 class="absolute hidden tracking-[0.15em] px-3 text-2xl text-gray-100 rounded-sm bg-gray-950">{visibleCategories[0].name}</h2>
                        <h2 class="hidden absolute bg-[#d9d9d9] break-all pb-4 px-3 leading-8 text-[225%] text-gray-950 pt-4 text-left">{visibleCategories[0].name}</h2>
                    </div>
                {/if}

                <h3 class={cx("absolute flex items-center gap-3 text-lg tracking-widest group-hover:tracking-widest m-2 md:m-6 duration-300 ease-[cubic-bezier(0.0,1,0,1.0)] font-mono origin-bottom-left pointer-events-none group-hover:scale-[100%_300%] group-hover:translate-y-3 group-hover:uppercase group-hover:font-black ",
                                visibleCategories.length != 1 && "group-hover:text-slate-900 m-6"

                )}>
                    {#if visibleCategories.length == 1}
                    <Fa icon={faArrowLeft}/>
                    {/if}
                    {visibleCategories.length == 1 ? 'back' : cat.name}
                </h3>

            </button>
            {/each}

            <div class={cx("md:w-0 h-0 md:h-full relative overflow-y-visible ease-[cubic-bezier(1,0,0,1)] duration-600", visibleCategories.length == 1 && "md:w-6/7 h-6/7")}>
                {#if visibleCategories.length == 1}
                <div
                    out:fade={{ delay: 100}}
                    class="z-2 tracking-[0.05em] rounded-b-lg md:rounded-lg overflow-clip md:ml-4 mb-3 md:mr-2 px-4 text-[2.2rem] bg-gray-100 text-gray-900 py-2">
                <h2 
                    in:titleAnim={{ duration: 250, delay: 300}}
                    class={cx("origin-top text-sm md:text-2xl md:origin-left", visibleCategories.length == 1 && "md:scale-x-100 scale-y-100", visibleCategories.length != 1 && "scale-y-400 md:scale-x-400")}>{visibleCategories[0].name} </h2>
                </div>

                <div
                    in:fade={{ duration: 200, delay: 700}}
                    out:fade={{ duration: 100}}
                    bind:this={masonryRef}
                    ontransitionend={handleTransitionEnd}
                    class="md:px-4 space-y-5 w-full max-h-[calc(100%-5rem)] h-full text-3xl font-bold">
                    <div
                        style="scrollbar-color: rgb(200, 200, 230, 0.4) transparent; max-width: {newWidth}px; min-width: {newWidth}px"
                        class="hidden overflow-y-scroll relative h-full rounded-lg md:block">
                        <Masonry
                            class={cx("absolute max-h-[100%] w-full pr-6 ")}
                            items={currentImages}
                            {minColWidth}
                            {maxColWidth}
                            {gap}
                            >
                            {#snippet children({ item })}
                                {#if ['.mov', '.mp4', '.webm'].some(end => item.endsWith(end)) }
                                    <video class="overflow-clip rounded-lg" controls autoplay muted src={item}></video>
                                {:else}
                                    <ImgWrapper src={item}/>
                                {/if}
                            {/snippet}
                        </Masonry>
                    </div>
                    
                    <div
                        style="scrollbar-color: rgb(200, 200, 230, 0.4) transparent; max-width: {newWidth}px; min-width: {newWidth}px"
                        class="block overflow-y-scroll relative h-full rounded-lg md:hidden">
                        <div
                            class={cx("absolute max-h-[100%] w-full")}
                            >
                            {#each currentImages as item}
                                {#if ['.mov', '.mp4', '.webm'].some(end => item.endsWith(end)) }
                                    <video class="overflow-clip rounded-lg" controls autoplay muted src={item}></video>
                                {:else}
                                    <ImgWrapper src={item}/>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    </div>
</div>