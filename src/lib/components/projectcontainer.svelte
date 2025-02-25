<script>
    // project data
    import project_data from "$lib/data/projects.json"
    import ProjectPane from "$lib/components/project.svelte"
    import Search from "./search.svelte";
    import cx from "clsx";

    import Fa from 'svelte-fa'
    import { faXmark, faFilter, faTrophy } from '@fortawesome/free-solid-svg-icons';

    // for delete easing
    import { circOut, expoInOut, expoOut, quadOut, backIn } from "svelte/easing";
    import { flip } from "svelte/animate";
    import { scale, fly, fade } from "svelte/transition";

    let searchText = $state('');
    let tags = $state([]);

    function addTag(tag)
    {
        //if (tags.map(t => t[0]).some(str => (tag === str))) return;
        if (tags.some(str => tag === str))
        {
            console.log(`${tag} is in ...`)
            console.log(tags)
        }
        else
        {
            console.log(`${tag} is NOT in`)
            console.log(tags)
        }

        //console.log(tags.some(str => tag === str));
        // tags.push(tag);
        tags = [...tags, tag]
    }

    function wordFilter(project, word)
    {
        let nameFound = project.name.toLowerCase().includes(word);
        let tagNameFound = (project.tags.map(t => t.toLowerCase()).some(str => str.includes(word)));
        let tagFilter = (tags.map(t => t.toLowerCase()).every(tag => project.tags.map(t => t.toLowerCase()).includes(tag)));
        return (tagFilter && (nameFound || tagNameFound));
    }

    function inSearch(project)
    {
        let searchFiltered = searchText.toLowerCase();
        return searchFiltered.split(" ").some(str => wordFilter(project, str));
    }

    // load all project images
    const images = import.meta.glob('$lib/img/projects/*', { eager: true });
    function getImage(imgName)
    {
        if (images[`/src/lib/img/projects/${imgName}`]) {
            return {img: images[`/src/lib/img/projects/${imgName}`].default, found: true};
        }
        return {img: images[`/src/lib/img/projects/null.png`].default, found: false};
    }

    function removeTag(index) {
        tags.splice(index, 1);
        tags = [...tags]; // Ensure reactivity (?)
    }

    function scaleY(node, { start = 0, duration = 300, easing = cubicOut }) {
        return {
        duration,
        easing,
        css: t => `transform: scaleY(${start + (1 - start) * t}); opacity: ${t}`
        };
    }

    function scaleX(node, { start = 0, duration = 300, easing = cubicOut }) {
        return {
        duration,
        easing,
        css: t => `transform: scaleX(${start + (1 - start) * t}); opacity: ${t}`
        };
    }

    function sorter(a, b)
    {
        return b.time - a.time;
    }


</script>

<div class="px-4 space-y-3">

    <div
    class="flex flex-row gap-3">
        <!-- perhaps add lg:basis-1/2 too? -->
        <div class="flex flex-row flex-shrink justify-center items-center pb-3 basis-full">
        <Search bind:value={searchText}/>
        </div>
        <div
        class="flex flex-row gap-2 justify-center h-10 transition-all duration-300">
            {#each tags as tag, index (tag)}
                <button
                animate:flip={{duration: 200, easing: expoOut}}
                in:scale={{start: 0.0, duration: 300, easing: expoOut}}
                out:scale={{start: 0.0, duration: 200, easing: backIn}}
                onclick={() => { removeTag(index)}}
                class={cx(
                    'group min-w-max cursor-pointer w-min px-4 h-10 rounded-md border-0 transition-all  bg-green-900/20 inset-shadow-teal-400/40 inset-shadow-xs text-green-500',
                    'border-rose-900 ease-[cubic-bezier(0.68, -0.6, 0.32, 1.6)] hover:border-2 hover:bg-slate-900/20 hover:inset-shadow-transparent hover:text-slate-900/20',
                    'scale-100 duration-300',
                    )}>
                    <div class="grid grid-cols-1 grid-rows-1">
                        {#if tag === "win"}
                        <Fa class="col-span-1 col-start-1 row-span-1 row-start-1 text-amber-500 group-hover:text-transparent" icon={faTrophy}/>
                        {:else}
                        <p class="col-span-1 col-start-1 row-span-1 row-start-1">{tag}</p>
                        {/if}
                    
                        <Fa icon={faXmark} class={cx(
                        (tag != "win") && 'translate-y-1',
                        'w-full h-full',
                        'duration-100 ease-out',
                        'col-span-1 col-start-1 row-span-1 row-start-1',
                        'ease-out transition-all duration-100 text-rose-600/20 scale-0',
                        'group-hover:text-rose-700 group-hover:scale-150')} />

                    </div>
                </button>
            {/each}
        </div>
    </div>

    <div class="grid grid-cols-1 gap-3 w-full h-full lg:grid-cols-2">
    {#each project_data.projects.filter(inSearch).sort(sorter) as project, index (project.name)}
        <div
        animate:flip={{duration: 400, easing: expoOut}}
        in:fly={{y:40}}
        out:fade={{duration:90}}
        >
            <ProjectPane {...project} img={getImage(project.img)} id={index} addedTags={tags} addTag={addTag} />
        </div>
    {/each}
    </div>

</div>