<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<div
class="flex flex-row justify-center items-center w-full">
    <div class="space-y-5 max-w-7xl w-7xl">

        <h1 class="pl-4 w-full font-mono text-7xl text-slate-200">Projects</h1>

        <p class="pl-4 text-slate-400">
        Click on a project to learn more or select a tag to filter.
        All public sources are available on my 
        <a class="inline-flex ease-out gap-x-1 items-center transition-all duration-150 translate-y-[0.1em] hover:-translate-y-0 text-slate-200 hover:text-sky-500" target="_blank" rel="noopener noreferrer" href="https://github.com/Frostbiiten">
            <span>GitHub</span>
            <Fa class="w-[1em] h-[1em] align-middle" icon={faSquareArrowUpRight}/>
        </a> 
        </p>
        

        <div>
        <Projectcontainer></Projectcontainer>
        </div>
    </div>
</div>