<script>
    //export let data;
    let { data } = $props();

    import Fa from 'svelte-fa'
    import { goto } from '$app/navigation';
    import { faArrowRotateRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

    import project_data_raw from "$lib/data/projects.json"
    let project_data = $state(project_data_raw.projects.find(el => el.name === data.slug))
    $inspect(project_data)

    function getDateInfo(timestamp)
    {
        let date = new Date(timestamp);
        let month = date.toLocaleString('default', {month: 'long' });
        return [month, date.getFullYear()];
    }

    //let dateInfo = $derived(getDateInfo(project_data.time));
    let dataInfo = ["what ever"]
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
    <div class="px-14 max-w-screen w-7xl">
        <div class="flex flex-row gap-2 h-18">
            {#if 'embed' in project_data}
            <button
                onclick={() => document.getElementById('unityIframe').contentWindow.location.reload()}
                class="cursor-pointer group bg-zinc-950 outline-2 outline-slate-900 aspect-square hover:bg-red-900/25 hover:outline-red-900">
                <Fa class="w-full h-full text-2xl transition-all duration-500 group-hover:scale-110 text-slate-100 group-hover:text-red-400 group-active:scale-90" icon={faArrowRotateRight}/>
            </button>
            <h1 class="ml-1 h-full font-mono text-xl text-center pointer-events-none select-none text-zinc-700 bg-zinc-700/25" style="writing-mode: vertical-rl">DEMO</h1>
            {/if}

            <h1 class="pt-1 h-full font-mono text-6xl">{data.slug}</h1>
        </div>

        {#if 'embed' in project_data}
        <div id="unityContainer" class="max-w-7xl aspect-[3/2] border-2 border-slate-700">
            <iframe
                id="unityIframe"
                title="Game Embed"
                src="/games/{project_data.embed}/index.html"
                style="width: 100%; height: 100%; border: none;"
                scrolling="no"
            ></iframe>
        </div>
        {/if}

    {#if 'galleryCount' in project_data}
    <Gallery project={data.slug} imgCount={project_data.galleryCount[0]} vidCount={project_data.galleryCount[1]}></Gallery>
    {/if}
    </div>


</div>