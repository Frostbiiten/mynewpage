<script>
    //export let data;
    let { data } = $props();

    import Fa from 'svelte-fa'
    import { goto } from '$app/navigation';
    import { faArrowRotateRight, faArrowLeft, faSquareArrowUpRight, faTrophy } from '@fortawesome/free-solid-svg-icons';
    import { faGit, faGithub } from '@fortawesome/free-brands-svg-icons'

    import project_data_raw from "$lib/data/projects.json"
    let project_data = $state(project_data_raw.projects.find(el => el.name === data.slug))
    $inspect(project_data)

    function getDateInfo(timestamp)
    {
        let date = new Date(timestamp);
        let month = date.toLocaleString('default', {month: 'long' });
        return [month, date.getFullYear()];
    }

    import cx from 'clsx';

    let dateInfo = $derived(getDateInfo(project_data.time));
    //let dataInfo = ["what ever"]
    // <h1 class="h-full font-mono text-xl text-center pointer-events-none select-none text-zinc-700 bg-zinc-700/25" style="writing-mode: vertical-rl">DEMO</h1>

    import emblaCarouselSvelte from 'embla-carousel-svelte';
    let emblaApi 
    let options = { loop: false }
    function onInit(event)
    {
        emblaApi = event.detail
        console.log(emblaApi.slideNodes()) // Access API 
        emblaApi.scrollNext(true);
    }
    
    import Gallery from '$lib/components/gallery.svelte';
</script>

<div class="flex flex-col justify-center items-center w-full">
    <div class="px-4 space-y-4 max-w-screen w-7xl">
        <div class="flex flex-row gap-2">

            <div class="py-1 pl-4 space-y-4 h-min">
             <div class="space-y-1">
                <p class="px-1 text-sm text-slate-500"> {dateInfo[0]} {dateInfo[1]} </p>
                <h1 style="view-transition-name: project-title" class="h-full font-mono text-5xl lg:text-6xl">{data.slug}</h1>
             </div>

                <div
                class="flex flex-row gap-2 w-full">
                    {#each project_data.tags as tag, index (tag)}
                        <div
                        class={cx(
                            'min-w-max text-xs w-min px-4 h-7 rounded-md border-0 transition-all   text-slate-100',
                            'border-rose-900 ease-[cubic-bezier(0.68, -0.6, 0.32, 1.6)] ',
                            'scale-100 duration-300 items-center flex',
                            (!tag.toLowerCase().includes("won")) && 'bg-zinc-900/50',
                            tag.toLowerCase().includes("won") && 'bg-slate-800/80'
                            )}>
                            <div class="flex gap-3 items-center row">
                                {#if tag.toLowerCase().includes("won")}
                                <Fa class="text-slate-300" icon={faTrophy}/>
                                <div class="flex gap-1">
                                    <p class="font-black">{'Won'}</p>
                                    <p>{tag.substring(3)}</p>
                                </div>
                                {:else}
                                <p>{tag}</p>
                                {/if}
                            </div>
                        </div>
                    {/each}
                
                {#if 'src' in project_data}
                <a href={project_data.src} class="flex flex-row gap-2 items-center px-3 w-min text-sm font-bold align-middle rounded-lg transition-all duration-200 text-zinc-950 bg-slate-300 hover:bg-slate-500">
                    Source
                    <Fa class="justify-center h-full translate-y-[-0.05rem] text-md" icon={faSquareArrowUpRight}/>
                </a>
                {/if}
                </div>

            </div>
        </div>

        {#if 'embed' in project_data}
        <div class="space-y-2">
            <div id="unityContainer" class="max-w-7xl aspect-[3/2] border-2 border-slate-700">
                <iframe
                    id="unityIframe"
                    title="Game Embed"
                    src="/games/{project_data.embed}/index.html"
                    style="width: 100%; height: 100%; border: none;"
                    scrolling="no"
                ></iframe>
            </div>
        </div>
        {/if}

    {#if 'galleryCount' in project_data}
    <Gallery project={data.slug} imgCount={project_data.galleryCount[0]} vidCount={project_data.galleryCount[1]}></Gallery>
    {/if}
    </div>


</div>