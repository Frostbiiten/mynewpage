<script>
    import ImgWrapper from "$lib/components/imgwrapper.svelte";

    import Fa from 'svelte-fa'
    import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faInstagram } from '@fortawesome/free-brands-svg-icons';

    import Masonry from 'svelte-bricks'

    import me from "$lib/img/categories/me.png"
    import sketches from "$lib/img/categories/20240105_005455 3.png"
    import digital from "$lib/img/categories/digital.png"
    import photos from "$lib/img/categories/photos.png"
    import misc from "$lib/img/categories/misc.png"
    import misc2 from "$lib/img/categories/misc2.png"

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
            contrast: "155",
            additionalImageClasses: "saturate-0",
            objectPosition: "50%_50%",
            hoverObjectPosition: "35%_50%"
        },
        {
            name: "digital*",
            image: digital,
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/digital/*', {
                eager: true
            })).map((module) => module.default),
            contrast: "105",
            objectPosition: "65%_50%",
            hoverObjectPosition: "45%_50%"
        },
        {
            name: "photos",
            image: photos,
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/photos/*', {
                eager: true
            })).map((module) => module.default),
            contrast: "135",
            objectPosition: "60%_50%",
            hoverObjectPosition: "90%_50%"
        },
        {
            name: "misc.",
            image: misc,
            //gallery: Object.values(import.meta.glob('$lib/img/creative/images/misc/*', {
            gallery: Object.values(import.meta.glob('$lib/img/creative/images/misc/*.{png,jpg,jpeg,webp,gif,mp4,webm,mov}', {
                eager: true
            })).map((module) => module.default),
            secondaryImage: misc2,
            contrast: "155",
            additionalImageClasses: "scale-110",
            objectPosition: "50%_50%",
            hoverObjectPosition: "35%_50%"
        }
    ]

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

    let currentImages = $state([]);

    let [minColWidth, maxColWidth, gap] = [320, 450, 10]

    import { cubicOut, expoInOut, expoOut } from 'svelte/easing';

    function scaleX(node, { delay = 0, duration = 400, easing = expoOut }) {
        return {
        delay,
        duration,
        easing,
        css: t => `max-width: ${t * 25}%; overflow: hidden;`
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
</script>

<style>
</style>

<div class="flex flex-row justify-center -mt-4 -mb-8 w-full grow">
    <div class="mx-7 space-y-5 max-w-7xl min-h-full grow w-7xl">
        <div class={cx("flex transition-all items-stretch w-full h-full justify-stretch duration-300", visibleCategories.length != 1 && "gap-2", visibleCategories.length == 1 && "gap-0")}>
            {#if !category}
            <div class="bg-[#d9d9d9] rounded-lg overflow-clip w-56 min-w-56"
                in:meAnim={{ duration: 400}}
                out:meAnim={{ duration: 400}}
            >
                <div class="pt-4 pl-5 space-y-2 h-1/2">
                    <h1 class="w-full leading-8 font-mono text-[225%] text-gray-950">creative works</h1>
                </div>
                <img src={me} alt="me" class="object-cover h-1/2"/>
            </div>
            {/if}

            {#each visibleCategories as cat, i (cat.name)}
            <button 
                class="flex z-2 group rounded-lg group-hover:w-[30%] relative justify-start items-end overflow-clip cursor-pointer duration-80 border-zinc-600 grow group"
                onclick={() => setCategory(cat.name)}
                out:scaleX={{ duration: 400, delay: (1+i) * 100 }}
                in:scaleX={{ duration: 400, delay: (1+i) * 100 }}
                >
                <img 
                    class="object-cover rounded-lg contrast-{cat.contrast ?? 155} {cat.additionalImageClasses ?? ""} pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-500 object-[{cat.objectPosition ?? '50%_50%'}] group-hover:object-[{cat.hoverObjectPosition ?? '35%_50%'}] absolute top-0 left-0 h-full" 
                    alt={cat.name} 
                    src={cat.image}
                />
                
                {#if cat.secondaryImage}
                    <img 
                    class="object-cover rounded-lg contrast-{cat.contrast ?? 155} pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-500 object-[{cat.objectPosition ?? '50%_50%'}] group-hover:object-[{cat.hoverObjectPosition ?? '35%_50%'}] absolute top-0 left-0 h-full opacity-0 group-hover:opacity-100" 
                    alt={cat.name} 
                    src={cat.secondaryImage}
                    />
                {/if}
                
                <div class="absolute top-0 left-0 w-full h-full mix-blend-soft-light bg-blue-600/40"></div>
                <div class={cx("absolute transition-colors mix-blend-hard-light duration-100 from-zinc-950/80 top-0 left-0 w-full h-full bg-gradient-to-t to-60%", visibleCategories.length != 1 && "group-hover:from-[rgb(160,190,255)]", visibleCategories.length == 1 && "group-hover:from-rose-400/30")}></div>
                

                {#if visibleCategories.length == 1}
                    <div class="flex absolute top-0 left-0 justify-center items-start w-full h-20">
                        <h2 class="absolute hidden tracking-[0.15em] px-3 text-2xl text-gray-100 rounded-sm bg-gray-950">{visibleCategories[0].name}</h2>
                        <div class="hidden absolute top-0 left-0 w-full h-20 bg-white"></div>
                        <h2 class="hidden absolute bg-[#d9d9d9] break-all pb-4 px-3 leading-8 text-[225%] text-gray-950 pt-4 text-left">{visibleCategories[0].name}</h2>
                    </div>
                {/if}

                <h3 class={cx("absolute flex items-center gap-3 text-lg tracking-widest group-hover:tracking-widest m-6 duration-300 ease-[cubic-bezier(0.0,1,0,1.0)] font-mono origin-bottom-left pointer-events-none group-hover:scale-[100%_300%] group-hover:translate-y-3 group-hover:uppercase group-hover:font-black ",
                                visibleCategories.length != 1 && "group-hover:text-slate-900"

                )}>
                    {#if visibleCategories.length == 1}
                    <Fa icon={faArrowLeft}/>
                    {/if}
                    {visibleCategories.length == 1 ? 'back' : cat.name}
                </h3>

            </button>
            {/each}

            <div class={cx("w-0 relative overflow-y-visible ease-[cubic-bezier(1,0,0,1)] duration-600", visibleCategories.length == 1 && "w-6/7")}>
                {#if visibleCategories.length == 1}
                <div
                    out:fade={{ delay: 100}}
                    class="z-2 tracking-[0.05em] rounded-lg overflow-clip ml-4 mb-3 mr-2 px-4 text-[2.2rem] bg-gray-100 text-gray-900 py-2">
                <h2 
                    in:titleAnim={{ duration: 250, delay: 300}}
                    class={cx("origin-left", visibleCategories.length == 1 && "scale-x-100", visibleCategories.length != 1 && "scale-x-400")}>{visibleCategories[0].name} </h2>
                </div>

                <div
                    in:fade={{ duration: 200, delay: 700}}
                    out:fade={{ duration: 100}}
                    bind:this={masonryRef}
                    ontransitionend={handleTransitionEnd}
                    class="px-4 space-y-5 w-full max-h-[calc(100%-5rem)] h-full text-3xl font-bold">
                    <div
                        style="scrollbar-color: rgb(200, 200, 230, 0.4) transparent; max-width: {newWidth}px; min-width: {newWidth}px"
                        class="overflow-y-scroll relative h-full rounded-lg">
                        <Masonry
                            class={cx("absolute pr-6 max-h-[100%] w-full")}
                            items={currentImages}
                            {minColWidth}
                            {maxColWidth}
                            {gap}
                            >
                            {#snippet children({ item })}
                                {#if ['.mov', '.mp4', '.webm'].some(end => item.endsWith(end)) }
                                    {console.log(`boohooo ${item}`)}
                                    <video class="overflow-clip rounded-lg" controls autoplay muted src={item}></video>
                                {:else}
                                    <ImgWrapper src={item}/>
                                {/if}
                            {/snippet}
                        </Masonry>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    </div>
</div>