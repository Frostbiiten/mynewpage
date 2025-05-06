<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";
    import bg from "$lib/img/tengyart-eZT2tMvG8QQ-unsplash.jpg"
    import cx from "clsx";
    import { onMount } from 'svelte';


    let distortfreq = $state(0.01);
    let distortscale = $state(20);

    $effect(() => {
        const interval = setInterval(() => {
        distortfreq = 0.01;
        distortscale = distortscale * 1.01;
        }, 16);

        return () => {clearInterval(interval); }
    });

    let currentSection = $state("");

    // load all music collection images
    const images = import.meta.glob('$lib/img/music/covers/*', { eager: true });
    function getImage(imgName)
    {
        if (images[`/src/lib/img/music/covers/${imgName}`]) {
            return {img: images[`/src/lib/img/music/covers/${imgName}`].default, found: true};
        }
        return {img: images[`/src/lib/img/projects/null.png`].default, found: false};
    }

    import music_data from "$lib/data/music.json"

    let scrollContainer;
    let currentCollection = $state(null);
    let collectionElements = {};

    function closestToCenter() {
        const containerRect = scrollContainer.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closest = { index: 0, distance: Infinity };

        Object.values(collectionElements).forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.left + rect.width / 2;
            const distance = Math.abs(containerCenter - elCenter);
            if (distance < closest.distance) {
                closest = { index: i, distance };
            }
        });

        if (closest.index !== currentCollection) {
            currentCollection = closest.index;
            console.log(`Snap to index [${currentCollection}]`);
        }
    }

    let player;
    onMount(() => {
        if (typeof window === 'undefined') return;

        // scroll snapping & y translation
        scrollContainer.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                closestToCenter();
                animatePerspective();
            });
        });


        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
            player = new YT.Player('yt-player', {
                videoId: '09EsZXrKEP4',
                playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                loop: 1,
                playlist: '09EsZXrKEP4',
                },
                events: {
                onReady: () => {
                    console.log('ready to play');
                    player.mute();
                }
                }
            });
        };
    });

    function play() {
        player?.unMute();
        player?.playVideo();
    }

    function pause() {
        player?.pauseVideo();
    }

    function seekTo(seconds) {
        player?.seekTo(seconds, true);
    }

    function scrollToElement(el, options = {}) {
        const {
            container = el.parentElement,
            duration = 600,
            easing = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
            offset = 0
        } = options;

        const originalSnap = container.style.scrollSnapType;
        container.style.scrollSnapType = 'none';

        const startTime = performance.now();
        const start = container.scrollLeft;

        let targetScrollLeft = calcTargetScrollLeft();

        // Observe for live resizing
        const resizeObserver = new ResizeObserver(() => {
            targetScrollLeft = calcTargetScrollLeft(); // update target dynamically
        });

        resizeObserver.observe(container);
        resizeObserver.observe(el);

        function calcTargetScrollLeft() {
            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const relativeOffset = elRect.left - containerRect.left;
            const scrollOffset = relativeOffset + container.scrollLeft;

            return scrollOffset + offset - (container.clientWidth / 2) + (el.clientWidth / 2);
        }

        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(1, elapsed / duration);
            container.scrollLeft = start + (targetScrollLeft - start) * easing(t);

            if (t < 1) {
            requestAnimationFrame(animateScroll);
            } else {
            resizeObserver.disconnect();
            container.style.scrollSnapType = originalSnap || '';
            }
        }

        requestAnimationFrame(animateScroll);
    }

    function animatePerspective() {
        const container = scrollContainer;
        const children = Object.values(collectionElements);

        const containerRect = container.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;

        children.forEach(child => {
            const childRect = child.getBoundingClientRect();
            const childCenterX = childRect.left + childRect.width / 2;

            const dx = (childCenterX - containerCenterX) / (containerRect.width / 2);
            const translateY = (1-Math.cos(dx * Math.PI / 2)) * containerRect.width * 0.1;

            child.style.transform = `translateY(${translateY}px) rotate(${dx*20}deg)`;
        });
    }
    


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

    .grain {
        content: "";
        background-color: transparent;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 200px;
        position: absolute;
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

    .track-mask {
        --fade-gradient: linear-gradient(to right,
            rgba(0, 0, 0, 0.0) 5%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.9) 46%,
            rgba(0, 0, 0, 0.9) 90%,
            rgba(0, 0, 0, 0) 100%
        );

        mask-image: var(--fade-gradient);
        -webkit-mask-image: var(--fade-gradient);

        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;

        mask-size: 100% 100%;
        -webkit-mask-size: 100% 100%;
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

{#snippet section(text)}
    <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-blue-900 grow">
        <h1 class="pl-3 -mb-6 text-[1.4rem] opacity-70">video</h1>
        <h1 class="pl-3 -mb-6 text-7xl">games</h1>
        <div class="grow"></div>
    </div>
{/snippet}

<div
class="flex flex-row justify-center items-center w-full">
    <div class="px-8 space-y-5 w-screen max-w-7xl">

        <div class="hidden relative w-40 h-70">
            <h1 class="absolute top-0 left-[100%] text-[12rem] font-bold leading-none text-slate-200 rotate-90 align-text-top origin-top-left">
                OK
            </h1>
        </div>

        <div class="p-0 -mt-4 w-full h-[calc(100vh-12rem)] flex items-end ">
            <div class="flex flex-col justify-end rounded-xl border-2 border-slate-700 bg-gray-900/10 w-50">
                <div class="flex hidden flex-col-reverse">
                    <div style="scrollbar-color: rgb(200, 200, 230, 0.4) transparent; " class="flex overflow-y-auto overflow-x-visible flex-col gap-4 py-6 pr-6 pb-2 pl-5 leading-tight whitespace-normal max-h-200 text-slate-300">
                        {#if currentCollection !== null}

                            {#each music_data.collections[currentCollection].tracklist as song, index (song)}
                                <p>
                                    {song.name}
                                </p>
                            {/each}
                        {/if}
                    </div>
                </div>

                <div class="relative w-[calc(30vw+30rem)] h-50 self-center track-mask">
                    <div bind:this={scrollContainer}
                        style="scrollbar-width: none; scroll-snap-type: x mandatory;"
                        class="flex overflow-x-scroll gap-8 items-end p-3 h-full overflow-y-clip">
                        <div class="min-w-[calc(30vw)]"></div>
                        {#each music_data.collections as collection, index (collection)}
                        <button
                            style="scroll-snap-align: center;"
                            class={cx(
                                "min-h-[83%]  cursor-pointer aspect-square duration-500 transition-[min-height] ease-[cubic-bezier(0.25,0,0,1)]",
                                (index == currentCollection) && "min-h-[100%] opacity-100 ",
                                (index != currentCollection) && "opacity-80 saturate-50"
                            )}
                            bind:this={collectionElements[collection.name]} onclick={() => {
                                //collectionElements[collection.name].scrollIntoView({"behavior": "smooth", "inline": "center", "block": "end"})
                                scrollToElement(collectionElements[collection.name], { duration: 500})
                            }}>
                            <img class="rounded-lg" src={getImage(collection.img).img} alt={collection.name}>
                        </button>
                        {/each}
                        <div class="min-w-[calc(30vw)] h-full"></div>
                    </div>
                    <div class="absolute top-0 left-[calc(50%-15rem)] w-60 h-full bg-gradient-to-r pointer-events-none via-zinc-950 from-zinc-950 hidden"></div>
                    <div class="hidden absolute top-0 right-0 h-full bg-gradient-to-l pointer-events-none w-30 from-zinc-950"></div>
                </div>
            </div>

            <div class="flex hidden relative flex-col items-stretch w-full h-full rounded-xl">

                <div class="w-full h-full bg-red-400">

                </div>

                <div id="yt-player" class="w-full h-[360px] hidden"></div>

                <div class="flex gap-4 mt-4">
                <button onclick={play}>Play</button>
                <button onclick={pause}>Pause</button>
                <button onclick={() => seekTo(60)}>Seek to 1:00</button>
                </div>

                <div class="hidden">
                <div
                    class="absolute inset-0 bg-center bg-cover brightness-95"
                    style="background-image: url({bg}); z-index: 0;">
                </div>

                <div class="absolute top-0 left-0 w-full h-full overflow-clip rounded-2xl mix-blend-soft-light">
                    <div class="overflow-hidden relative w-full h-full rounded-xl scale-140">
                        <div class="absolute top-0 left-0 w-[110%] h-[110%] opacity-50 z-9999 grain">
                        </div>
                    </div>
                </div>

                {#snippet section(text, extra)}
                <button
                    onclick={()=> {currentSection = text;}}
                    class={cx(
                        "flex relative flex-col justify-center items-start w-full h-1/4 cursor-pointer group grow hover:mix-blend-darken",
                            (currentSection == text) && "z-50 mix-blend-darken"
                    )}>
                    <div
                        class={cx(
                            "absolute h-full transition-all  bg-zinc-950 ease-[cubic-bezier(0,1,0,1)]",
                            (currentSection != text) && "w-0 duration-200 group-hover:w-full",
                            (currentSection == text) && "w-full scale-y-700 duration-[0.3s] ease-[cubic-bezier(0,0.5,0.5,1)]"
                            )}>
                        </div>
                    <h1
                        class={cx(
                            "z-10 ml-10 text-7xl group-hover:scale-x-[3] font-mono origin-left duration-100 ease-[cubic-bezier(0.282,1.281,0.769,1.073)]",
                            (currentSection == text) && "scale-y-800 duration-[0.09s] ease-[cubic-bezier(0,0.5,0.5,1)] scale-x-[3]",
                            (currentSection != "" && currentSection != text) && "hidden",
                            currentSection && extra
                        )}
                        >{text}
                    </h1>
                </button>
                {/snippet}

                    {@render section("music", "mt-80")}
                    {@render section("games", "")}
                    {@render section("edits", "")}
                    {@render section("anime", "mb-80")}
                </div>

            </div>
        </div>

    </div>
</div>