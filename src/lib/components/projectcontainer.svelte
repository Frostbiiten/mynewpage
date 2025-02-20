<script>
    // project data
    import project_data from "$lib/data/projects.json"
    import ProjectPane from "$lib/components/project.svelte"
    import Search from "./search.svelte";
    import cx from "clsx";

    import Fa from 'svelte-fa'
    import { faXmark } from '@fortawesome/free-solid-svg-icons';

    // for delete easing
    import { circOut, expoOut } from "svelte/easing";
    import { flip } from "svelte/animate";

    // appent $lib/ to the beginning of image path
    project_data.projects = project_data.projects.map(
        o => ({ ...o,
            img: `\$lib/${o.img}`})
    )

    let searchText = $state();
    let tags = $state([['C++', true], ['Java', true], ['C#', true], ['JS', true]]);

    function removeTag(index) {
        // Delay removal to allow animation to complete
        setTimeout(() => {
            tags.splice(index, 1);
            tags = [...tags]; // Ensure reactivity
        }, 200); // Adjust this duration to match the animation
    }


</script>

<div class="px-4 space-y-3">

    <div class="flex gap-5">
    <Search bind:value={searchText}/>
    <div class="basis-1/2">

    <div class="flex flex-row gap-2 h-full">
        {#each tags as tag, index (tag[0])}
            <button
            animate:flip={{duration: 400, easing: expoOut, delay: 200}}
            onclick={() => {
                tags[index][1] = false; removeTag(index)}}
            class={cx(
                'group w-16 h-full rounded-md border-0 transition-all  bg-green-900/20 inset-shadow-teal-400/40 inset-shadow-xs hover:inset-shadow-sm text-green-500',
                'border-rose-900 ease-[cubic-bezier(0.68, -0.6, 0.32, 1.6)] hover:border-2 hover:bg-slate-900/20 hover:inset-shadow-transparent hover:text-slate-900/20',
                'scale-0 duration-300',
                tags[index][1] && 'duration-150 scale-100'
                )}>
                <div class="grid grid-cols-1 grid-rows-1">
                    <p class="col-span-1 col-start-1 row-span-1 row-start-1">{tag[0]}</p>
                
                    <Fa icon={faXmark} class={cx(
                    'translate-y-1 w-full h-full',
                    'duration-100 ease-out',
                    'col-span-1 col-start-1 row-span-1 row-start-1',
                    'ease-out transition-all duration-100 text-rose-600/20 scale-0',
                    'group-hover:text-rose-700 group-hover:scale-150')} />

                </div>
            </button>
        {/each}
        </div>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-3 w-full h-full">
    {#each project_data.projects as project, index}
        <ProjectPane {...project} id={index} />
    {/each}
    </div>

</div>