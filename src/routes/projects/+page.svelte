<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";
</script>

<style>
    @keyframes text-reveal {
        0% {
            opacity: 0;
            transform: translateX(1.5rem) scaleX(1);
        }
        100% {
            opacity: 1;
            transform: translateX(0) scaleX(1);
        }
    }

    .animate-text-reveal {
        transform-origin: left;
        animation: text-reveal 1.2s cubic-bezier(1, 0, 0, 1) 20s forwards;
    }


    @keyframes textbg-scale-color {
        0% {
            background-color: rgb(0, 0, 0);
            transform: scaleX(1);
        }
        100% {
            background-color: white;
            transform: scaleX(0.1);
        }
    }

    @keyframes fly-in-a {
        from {
        transform: translateX(10px);
        opacity: 0;
        }
        to {
        transform: translateX(0);
        opacity: 1;
        }
    }

    .fly-in {
        animation: fly-in-a 2.0s cubic-bezier(0, 0.5, 0, 1) both;
    }

    @keyframes fade-in-a {
        from {
        opacity: 0;
        }
        to {
        opacity: 1;
        }
    }

    .fade-in {
        animation: fade-in-a 2.0s cubic-bezier(0, 0.5, 0, 1) both;
    }

</style>

<div
class="flex flex-row justify-center items-center w-full">
    <div class="px-8 space-y-5 max-w-7xl w-7xl">

        <h1 class="w-full font-mono text-7xl fade-in text-slate-200">

            <div class="hidden z-40 ml-3 w-32 origin-right animate-textbg-reveal h-21">
            </div>
            
            {#each Array.from("Projects") as char, index}
                <span
                class="inline-block animate-text-reveal"
                style="animation-delay: {index * 0.05 - 0.5}s; animation-fill-mode: backwards;"
                >
                {@html char === ' ' ? '&nbsp;' : char}
                </span>
            {/each}
        </h1>

        <p class="text-slate-400 fly-in">
            Click on a project to learn more or select a tag to filter.
            All public sources are available on my 
            <a class="inline-flex ease-out gap-x-1 items-center transition-all duration-150 translate-y-[0.1em] hover:-translate-y-0 text-slate-200 hover:text-sky-500" target="_blank" rel="noopener noreferrer" href="https://github.com/Frostbiiten">
                <span>GitHub</span>
                <Fa class="w-[1em] h-[1em] align-middle" icon={faSquareArrowUpRight}/>
            </a> 
        </p>
        

        <div class="fly-in">
        <Projectcontainer/>
        </div>
    </div>
</div>