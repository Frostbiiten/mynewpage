<script>
    let { id, name, desc, tags, img, time, addedTags, addTag} = $props();

    function getDateInfo(timestamp)
    {
        let date = new Date(timestamp);
        let month = date.toLocaleString('default', {month: 'long' });
        return [month, date.getFullYear()];
    }

    let dateInfo = $derived(getDateInfo(time));
    let clickableTags = $derived(tags.map(tag => addedTags.some(added => (tag === added))))



    import { flip } from 'svelte/animate';

    import Fa from 'svelte-fa'
    import { faXmark, faPlus, faCircle, faMedal, faTrophy } from '@fortawesome/free-solid-svg-icons';

    import cx from "clsx";
    //let mappedTags = $derived(tags.map(tag => [tag, true]));

    // NOTE: selected should be a callback to set the
    // currently selected project with a callback in the parent

    // to print when these values are updated ..
    $inspect(name, desc, tags, img);


</script>

<style>
    @layer utilities {
    .border-special {
        --s: 20px; /* Corner size */
        --t: 2px;  /* Border thickness */
        --g: 20px; /* Gap between border and image */
        padding: calc(var(--g) + var(--t));
        outline-width: var(--t);
        outline-style: solid;
        outline-offset: calc(-1 * var(--t));
        -webkit-mask: 
            conic-gradient(at var(--s) var(--s), #0000 75%, #000 0)
            0 0 / calc(100% - var(--s)) calc(100% - var(--s)),
            conic-gradient(#000 0 0) content-box;
        mask: 
            conic-gradient(at var(--s) var(--s), #0000 75%, #000 0)
            0 0 / calc(100% - var(--s)) calc(100% - var(--s)),
            conic-gradient(#000 0 0) content-box;
        transition: all 0.4s ease;
    }

    .border-special:group-hover {
        outline-offset: calc(-1 * var(--g));
    }
}
</style>

<!-- Full-width projects on mobile, otherwise, 2 in each ... grid should restrict this -->
<div role="button" class="grid h-64 bg-none shadow-sm cursor-pointer group"> 
    <div class='col-span-1 col-start-1 row-span-1 row-start-1 transition-all border-special outline-slate-300/0 group-hover:outline-slate-200/80'>
    </div>
    <div class={cx(
        'col-start-1 row-start-1 col-span-1 row-span-1',
        'shadow-lg shadow-black group-hover:shadow-black group-hover:shadow-2xl',
        "grid overflow-hidden will-change-transform transition-all duration-300 ease-[cubic-bezier(0.16, 1, 0.3, 1)] bg-slate-900/20 bg-clip-content group-hover:m-3")}>
        {#if img.found}
            <img class={cx(
                'w-full h-full object-cover opacity-80',
                'col-start-1 row-start-1 col-span-1 row-span-1',
                'duration-400 ease-[cubic-bezier(0.16, 1, 0.3, 1)] group-hover:scale-120 group-hover:blur-sm group-hover:saturate-0 group-hover:brightness-[0.4]',
                )} alt="" src={img.img}/>
        {:else}
            <div
            style="background-image: url({img.img});"
            class={cx(
                'w-full h-full bg-[length:130px_130px]',
                'col-start-1 row-start-1 col-span-1 row-span-1 opacity-[0.12]',
                )}>
                  <div class="absolute inset-0 bg-zinc-600/80"></div> <!-- Tint overlay -->
                </div>
        {/if}



        <div class="flex z-10 flex-col col-span-1 col-start-1 row-span-1 row-start-1 w-full h-full">

            <div class={cx(
                'flex justify-end p-3 w-full backdrop-saturate-40',
                (img.found) && 'bg-zinc-950/90',
                (!img.found) && 'bg-zinc-950/80 backdrop-saturate-100 backdrop-blur-none'
                )}>
                <div class="flex flex-col">
                    <p class="text-xs text-slate-200/70">
                    {dateInfo[0]}
                    </p>
                    <p class="font-bold tracking-wide">
                    {dateInfo[1]}
                    </p>
                </div>
                <h3 class="flex-grow px-3 py-1 text-3xl text-right duration-300 group-hover:font-bold">{name}</h3>
            </div>

            <p class="p-3 px-6 delay-0 duration-150 group-hover:delay-200 align-bottom flex-grow group-hover:duration-400 -translate-x-1 group-hover:translate-x-0 ease-[cubic-bezier(0.16, 1, 0.3, 1)] opacity-0 group-hover:opacity-100">{desc}</p>


            <div class="flex gap-2 p-3 h-14">
            {#each tags as tag, index (tag)}
                <button
                    animate:flip={{duration: 400, easing: expoOut, delay: 150}}
                    disabled={clickableTags[index]}
                    onclick={() => {addTag(tag);}}
                    class={cx(
                        'h-full text-sm px-3 rounded-md border-1',
                        'bg-zinc-950 text-slate-300 border-zinc-600',
                        'group/tag transition-all',
                        !clickableTags[index]&& 'cursor-pointer hover:border-green-700 hover:bg-green-950/70 hover:text-slate-900/0',
                        clickableTags[index] && 'cursor-default hover:text-stone-500 ',
                        'ease-[cubic-bezier(0.68, -0.6, 0.32, 1.6)] hover:border-2 ',
                        )}>
                        <div class="grid grid-cols-1 grid-rows-1">
                            {#if tag === "win"}
                            <Fa class="col-span-1 col-start-1 row-span-1 row-start-1 text-amber-500 group-hover/tag:text-transparent" icon={faTrophy}/>
                            {:else}
                            <p class="col-span-1 col-start-1 row-span-1 row-start-1">{tag}</p>
                            {/if}
                        
                            <Fa icon={faPlus} class={cx(
                            'w-full h-full',
                            (tag != "win") && 'translate-y-[2px]',
                            'duration-100 ease-out transition-all scale-0',
                            'col-span-1 col-start-1 row-span-1 row-start-1',
                            !clickableTags[index] && 'group-hover/tag:text-green-500 group-hover/tag:scale-100')} />

                        </div>
                    </button>
            {/each}
            </div>
        </div>
    </div>
</div>