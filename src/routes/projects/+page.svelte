<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<div class="flex flex-row justify-center items-center w-full">
    <div class="p-14 space-y-5 max-w-7xl">

        <h1 class="font-mono text-6xl text-slate-200">Projects</h1>

        <p class="text-slate-400">
        Visit  
        <a class="inline-flex ease-out gap-x-1 items-center transition-all duration-150 translate-y-[0.1em] hover:-translate-y-0 text-slate-200 hover:text-sky-500" target="_blank" rel="noopener noreferrer" href="https://github.com/Frostbiiten">
            <Fa class="w-[1em] h-[1em] align-middle" icon={faGithub}/>
            <span>GitHub</span>
        </a> 
        to view my publicly sourced projects.
        </p>
        

        <div>
        <Projectcontainer></Projectcontainer>
        </div>
    </div>
</div>