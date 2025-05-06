<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";
    import { onMount } from "svelte";
    
    import guy from "$lib/img/figure/sittingA.png"
    import bg from "$lib/img/projects/null.png"
    import windowIcons from "$lib/img/projects/windowicons.svg"
    import { browser } from "$app/environment";
    import gooseSign from "$lib/img/goose_sign.png"
    import floor from "$lib/img/projects/null.png"
    import textbg from "$lib/img/projectsbgold.jpg"

    let figureWidth = $state(0);
    let figureHeight = $state(0);

    function handleLoad(e) {
      figureWidth = e.target.naturalWidth;
      figureHeight = e.target.naturalHeight;
    }

    let targetX = $state(0)
    let targetY = $state(0)
    let scroll = $state(0)

    let smoothX = $state(0);
    let smoothY = $state(0);

    let rafId = $state(null);
    let isMobile = $state(false);

    import cx from "clsx";

    const updateMouse = (e) => {
        const { innerWidth, innerHeight } = window;
        targetX = (e.clientX / innerWidth - 0.5) * 2;
        targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    const updateTilt = (e) => {
      targetX = e.gamma ? e.gamma / 45 : 0;
      targetY = e.beta ? e.beta / 45 : 0;
    };

    const animate = () => {
        smoothX += (targetX - smoothX) * 0.02;
        smoothY += (targetY - smoothY) * 0.02;

        rafId = requestAnimationFrame(animate);
    };

    onMount(() => {

        // Mobile
        isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

        if (isMobile && window.DeviceOrientationEvent) {
        if (DeviceOrientationEvent.requestPermission) {
            DeviceOrientationEvent
            .requestPermission()
            .then((response) => {
                if (response === 'granted') {
                window.addEventListener('deviceorientation', updateTilt);
                }
            })
            .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', updateTilt);
        }
        } else {
        window.addEventListener('mousemove', updateMouse);
        }

        rafId = requestAnimationFrame(animate);
    });

    let baseFrequency = $state(0.05);
    let scale = $state(0.10);

    $effect(() => {
        const interval = setInterval(() => {
        baseFrequency = 0.005 + Math.random() * 0.003;
        scale = 5 + Math.random() * 0.5;
        }, 400);

        return () => {clearInterval(interval); }
    });
</script>

<style>
    .grain {
        content: "";
        background-color: transparent;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 80px;
        position: absolute;
        opacity: 1;
        pointer-events: none;
        z-index: 10;
        animation: animateGrain 10s steps(10) infinite;
        mix-blend-mode: soft-light;
    }

    @keyframes animateGrain {
        0%, 100% { transform: scale(1.1) translate(0, 0) }
        10% { transform: scale(1.1) translate(-2%, -5%) }
        20% { transform: scale(1.1) translate(-5%, -10%) }
        30% { transform: scale(1.1) translate(-2%, -5%) }
        40% { transform: scale(1.1) translate(-5%, -10%) }
        50% { transform: scale(1.1) translate(-5%, -5%) }
        60% { transform: scale(1.1) translate(-2%, -10%) }
        70% { transform: scale(1.1) translate(-5%, -5%) }
        80% { transform: scale(1.1) translate(-2%, -10%) }
        90% { transform: scale(1.1) translate(-5%, -5%) }
        100% { transform: scale(1.1) translate(-2%, -10%) }
    }

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

    @keyframes text-reveal-2 {
        0% {
            opacity: 0;
            transform: translateX(20rem) scale(10);
        }
        100% {
            opacity: 0.2;
            transform: translateX(0) scale(2);
        }
    }

    .animate-text-reveal-2 {
        animation: text-reveal-2 1s ease-out both;
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

    @keyframes featherWipe {
        0% {
            -webkit-mask-position: 220% 0;
            mask-position: 220% 0;
        }
        100% {
            -webkit-mask-position: 0% 0;
            mask-position: 0% 0;
        }
    }

    .wipe-fade-in {
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 100%);
        mask-image: linear-gradient(to right, transparent -20%, black 100%);
        -webkit-mask-size: 200% 100%;
        mask-size: 200% 100%;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        animation: featherWipe 4s cubic-bezier(.28,.02,.18,.99) forwards;
    }

    @keyframes shrinkGrid {
        0% {
            transform: scale(2)  perspective(2rem) rotateY(1deg);
        }
        100% {
            transform: scale(1)  perspective(2rem) rotateY(0deg);
        }
    }

    .animate-grid-shrink {
        --grid-color: rgb(40, 42, 72);
        background-size: 5.2rem 5.2rem;
        animation: shrinkGrid 3s cubic-bezier(0,1,0,1) forwards;
        background-image: 
        linear-gradient(to right, var(--grid-color) 4px, transparent 0px),
        linear-gradient(to bottom, var(--grid-color) 4px, transparent 0px);
        background-position: center;
    }

    @keyframes slide {
        0% {
            transform: translateY(100%);
        }
        100% {
            transform: translateY(-120%);
        }
    }

    .slide-a {
        animation: slide linear infinite;
    }

    @keyframes scaler {
        0% {
            transform: scale(0);
            filter: brightness(40);
            animation-timing-function: cubic-bezier(0, 1, 0, 1);
        }
        4% {
            transform: scale(1);
            filter: brightness(1);
            animation-timing-function: cubic-bezier(0.5, 0, 0.5, 0);
        }
        100% {
            transform: scale(1);
            filter: brightness(0.5);
        }
    }

    .scaler-a {
        animation: scaler cubic-bezier(0, 1, 0, 1) infinite;
    }


    .textmask {
    }

</style>

<svelte:window bind:scrollY={scroll}/>

<div
class="flex flex-row justify-center items-center w-full">
    <div class="px-8 space-y-5 max-w-7xl w-7xl">

        <div class="relative -mt-3 w-full font-mono text-7xl fade-in text-slate-200">

            <div 
            class="w-full h-90 bg-[length:10%_auto] rounded-xl "
            style="background-position: 0px {93 + -0.03 * scroll}%;">

                <div class="absolute rounded-xl top-0 left-0 w-full h-full bg-radial-[at_20%_-40%] from-slate-950 to-black to-150%"></div>

                <div class="absolute top-0 left-0 w-full h-full opacity-20 wipe-fade-in">
                    <div class="absolute inset-0 w-full h-full animate-grid-shrink"></div>
                </div>

            </div>

            <div class="absolute top-0 left-0 p-1 w-full h-full overflow-clip rounded-xl">

                <div class="relative w-full h-full">

                    {#snippet window(height, duration, delay, extra, extra2)}
                    <div
                        style="height: {height}rem; animation-duration: {duration}s; animation-delay: {delay}s;"
                        class={cx("absolute scaler-a backdrop-brightness-[2] backdrop-blur-[4px] bg-radial-[at_50%_-40%] to-150%",
                            extra
                        )}>
                        <div class={cx("flex justify-end items-center w-full border-blue-900/20 bg-blue-900/10 border-b-1", extra2)}>
                            <img class="h-full" src={windowIcons} alt="windowmanip"/>
                        </div>
                    </div>
                    {/snippet}

                    <div class="hidden absolute bottom-0 w-full h-32 from-blue-900 opacity-20 bg-linear-to-t to-blue-950/0">

                    </div>

                    <div class="absolute hidden left-[-50%] w-[200%] h-full -bottom-20 mix-blend-hard-light" style="mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 50%, black 100%); background-image: linear-gradient(rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.4)), url({floor}); background-size: 8rem 8rem; transform: perspective(20rem) rotate3d(1, 0, 0, 75deg)">
                    </div>


                    <div class="absolute hidden text-indigo-900 text-[7.9rem] font-mono origin-bottom-left rotate-90 -left-10 bottom-50" style="transform: scaleX(1.5) perspective(11rem) rotate3d(-0.1, 0.3, 0.02, 40deg);">
                        <span class="opacity-5">
                            <span class="animate-text-reveal-2" style="animation-delay: 0.0s;">OK</span><br/>
                        </span>
                        <span class="opacity-10">
                            <span class="opacity-0 animate-text-reveal-2" style="animation-delay: 0.05s;">OK</span><br/>
                        </span>
                        <span class="opacity-20">
                            <span class="opacity-0 animate-text-reveal-2" style="animation-delay: 0.1s;">OK</span><br/>
                        </span>
                        <span class="opacity-40">
                            <span class="opacity-0 animate-text-reveal-2" style="animation-delay: 0.2s;">OK</span><br/>
                        </span>
                        <span class="opacity-80">
                            <span class="opacity-0 animate-text-reveal-2" style="animation-delay: 0.3s;">OK</span><br/>
                        </span>
                        <span class="opacity-80">
                            <span class="opacity-0 animate-text-reveal-2" style="animation-delay: 0.4s;">OK</span><br/>
                        </span>
                    </div>


                    <div class="">

                        {#each [28, 28, 28.5] as xOffset, i}
                            <div class="absolute h-full w-100 slide-a" style="left: {xOffset}rem; animation-duration: 90s; animation-delay: {-i * 30}s;">
                                {@render window(15, 90, -i * 30, "border-[2px] w-1/2 rounded-xs shadow-[inset_0_-40px_80px_rgba(2,2,6,0.6)] border-gray-100/5 from-[#050508]/60 to-[#050508]/70", "h-4 pr-[6px] pt-[4px] pb-[3px] bg-gray-900/30 border-zinc-700/5")}
                            </div>
                        {/each}

                        {#each [33.8, 33, 33.4] as xOffset, i}
                            <div class="absolute h-full w-130 slide-a" style="left: {xOffset}rem; animation-duration: 90s; animation-delay: {-10 + -i * 30}s;">
                                {@render window(15, 90, -10 + -i * 30, "border-[2px] w-1/2 rounded-sm border-blue-950 shadow-[inset_0_-40px_80px_rgba(0,0,12,0.4)] from-slate-950/60 to-slate-950/70 ", "h-6 pr-4 pt-[5%] pb-[4%]")}
                            </div>
                        {/each}

                        {#each [47.6, 49.2, 47.8] as xOffset, i}
                            <div class="absolute h-full w-190 slide-a" style="left: {xOffset}rem; animation-duration: 45s; animation-delay: {i * -15}s;">
                                {@render window(15, 45, -i * 15, "border-[3px] w-1/2 rounded-md border-blue-900 shadow-[inset_0_-40px_80px_rgba(0,0,30,0.6)] from-[#050508]/60 to-[#050508]/70  ", "h-10 pr-4 pt-[3%] pb-[2%]")}
                            </div>
                        {/each}


                    </div>
                </div>
            </div>


            <div class="absolute top-0 left-0 w-full h-full overflow-clip rounded-2xl mix-blend-soft-light">
                <div class="overflow-hidden relative w-full h-full rounded-xl scale-140">
                    <div class="absolute top-0 left-0 w-full h-full opacity-10 z-9999 grain">
                    </div>
                </div>
            </div>

            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-t rounded-xl border-4 border-blue-400" style="
                border: 2px solid transparent;
                background: radial-gradient(circle at top left, #47546b, #1d293d) border-box;
                mask:
                    linear-gradient(#000 0 0) padding-box, 
                    linear-gradient(#000 0 0);
                mask-composite: exclude;">

            </div>

            <h1 class="absolute top-0 p-10 space-y-7">
                {#each Array.from("Projects") as char, index}
                    <span
                    class="inline-block animate-text-reveal"
                    style="animation-delay: {index * 0.05 - 0.5}s; animation-fill-mode: backwards;"
                    >
                    {@html char === ' ' ? '&nbsp;' : char}
                    </span>
                {/each}
            </h1>

            <img
              class="hidden absolute right-0 opacity-0 pointer-events-none"
              src={guy}
              alt="Dummy"
              onload={handleLoad}
            />

            <svg width="0" height="0" class="absolute">
                <filter id="figsketch">
                  <feTurbulence 
                    type="turbulence" 
                    baseFrequency={baseFrequency}
                    numOctaves="2" 
                    result="noise" />
                  <feDisplacementMap 
                    in="SourceGraphic" 
                    in2="noise" 
                    scale={scale}
                    xChannelSelector="R" 
                    yChannelSelector="G" />
                </filter>
              </svg> 

            <div class="absolute right-0 bottom-0 origin-bottom-right scale-50 -translate-x-17 translate-y-21 -rotate-8" style="contain: layout; width: {figureWidth}px; height: {figureHeight}px; filter: url(#figsketch);">
                <div
                  class={cx("absolute top-0 left-0 z-20 w-full h-full")}
                  style="
                    -webkit-mask-image: url({guy});
                    mask-image: url({guy});

                    -webkit-mask-size: cover;
                    mask-size: cover;

                    -webkit-mask-repeat: no-repeat;
                    mask-repeat: no-repeat;

                    -webkit-mask-position: center;
                    mask-position: center;

                    isolation: isolate;
                  "
                >
                  <img
                    src="{guy}"
                    class="block object-cover absolute w-full h-full"
                    alt="base bg"
                  />
                      <div
                      style="width: 300%;"
                      class="absolute top-0 left-0 h-full bg-gradient-to-tr to-blue-200/10 from-0% to-70% from-slate-600 mix-blend-hard-light"></div>
                      <div
                      style="width: 300%;"
                      class="absolute top-0 left-0 h-full bg-gradient-to-tr to-blue-100/0 from-10% to-30% mix-blend-multiply from-sky-900/100"></div>
                      <div class="grain"></div>
                </div>

            </div>

        </div>


        <p class="text-base text-slate-400 fly-in">
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