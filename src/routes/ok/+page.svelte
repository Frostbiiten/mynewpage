<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";

    let distortfreq = $state(0.01);
    let distortscale = $state(20);

    $effect(() => {
        const interval = setInterval(() => {
        distortfreq = 0.01;
        distortscale = distortscale * 1.01;
        }, 16);

        return () => {clearInterval(interval); }
    });
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

<svg width="0" height="0" class="absolute">
    <filter id="figsketch">
        <feTurbulence 
        type="turbulence" 
        baseFrequency={distortfreq}
        numOctaves="1" 
        result="noise" />
        <feDisplacementMap 
        in="SourceGraphic" 
        in2="noise" 
        scale={distortscale}
        xChannelSelector="" 
        yChannelSelector="R" />
    </filter>
</svg> 

<div
class="flex flex-row justify-center items-center w-full">
    <div class="px-8 space-y-5 w-screen max-w-7xl">

        <div class="hidden relative w-40 h-70">
            <h1 class="absolute top-0 left-[100%] text-[12rem] font-bold leading-none text-slate-200 rotate-90 align-text-top origin-top-left">
                OK
            </h1>
        </div>

        <div class="flex flex-col items-stretch -mt-4 w-full h-160">
            <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-blue-950 grow">
                <h1 class="pl-3 -mb-6 text-[1.4rem] opacity-70">mu</h1>
                <h1 class="pl-2 text-7xl tracking-[-0.135em]">μ-sic</h1>
                <div class="grow"></div>
            </div>
            <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-blue-900 grow">
                <h1 class="pl-3 -mb-6 text-[1.4rem] opacity-70">video</h1>
                <h1 class="pl-3 -mb-6 text-7xl">games</h1>
                <div class="grow"></div>
            </div>
            <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-[#1341B5] grow">
                <h1 class="pl-3 -mb-6 text-[1.4rem] opacity-70">game</h1>
                <h1 class="pl-3 -mb-6 text-7xl">edits</h1>
                <div class="grow"></div>
            </div>
            <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-[#235DF2] grow">
                <h1 class="pl-3 -mb-6 text-7xl">anime</h1>
                <div class="grow"></div>
            </div>
        </div>

    </div>
</div>