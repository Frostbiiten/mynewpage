<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faCircle, faPause, faPlug, faPlus, faSquareArrowUpRight, faStar } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";
    import bg from "$lib/img/tengyart-eZT2tMvG8QQ-unsplash.jpg"
    import cx from "clsx";
    import { onMount } from 'svelte';

    import { faPlay, faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";


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
        const containerCenter = containerRect.top + containerRect.height / 2;

        let closest = { index: 0, distance: Infinity };

        Object.values(collectionElements).forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const distance = Math.abs(containerCenter - elCenter);
            if (distance < closest.distance) {
                closest = { index: i, distance };
            }
        });

        if (closest.index !== currentCollection) {
            currentCollection = closest.index;
        }
    }


    let playingCollection = $state(null);
    let playingSong = $state(null);
    let currentVideoId = $state(null);
    let playerReady = $state(false);
    let currentTime = $state(0);
    let playerState = $state(null)

    let player;

    function trackPerspective()
    {
		animatePerspective();
		requestAnimationFrame(trackPerspective);
    }

    onMount(() => {
        if (typeof window === 'undefined') return;

        // scroll snapping & y translation
        scrollContainer.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                closestToCenter();
                //animatePerspective();
            });
        });

        closestToCenter();
        //animatePerspective();
        trackPerspective();


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
                        playerReady = true;
                        player.mute();
                        
                        setInterval(() => {
                            if (playerReady && playerState === YT.PlayerState.PLAYING) {
                                currentTime = player.getCurrentTime();
                            }
                        }, 250);
                    },
                    onStateChange: (event) =>
                    {
                        playerState = event.data;

                        switch (event.data) {
                            case YT.PlayerState.UNSTARTED:  // -1
                                console.log('Unstarted');
                                break;
                            case YT.PlayerState.ENDED:      // 0
                                console.log('Ended');
                                // continue to next
                                playNext();
                                break;
                            case YT.PlayerState.PLAYING:    // 1
                                console.log('Playing');
                                break;
                            case YT.PlayerState.PAUSED:     // 2
                                console.log('Paused');
                                break;
                            case YT.PlayerState.BUFFERING:  // 3
                                console.log('Buffering');
                                break;
                            case YT.PlayerState.CUED:       // 5
                                console.log('Video cued');
                                break;
                        }
                    }
                }
            });
        };

    });

    function playNewSong() {
        currentVideoId = music_data.collections[playingCollection].tracklist[playingSong].link;
        console.log(currentVideoId);
        player?.loadVideoById(currentVideoId);
        play();
    }

    function playNext()
    {
        let songCount = 0;
        if (music_data.collections[playingCollection]) { songCount = music_data.collections[playingCollection].tracklist.length; }
        if (playingSong + 1 < songCount)
        {
            playingSong++;
            currentTime = 0;
            playNewSong();
        }
        else
        {
            if (playingCollection + 1 < music_data.collections.length)
            {
                playingCollection++;
                playingSong = 0;
                currentTime = 0;
                playNewSong();
            }
        }
    }

    function playPrev()
    {
        if (playingSong === 0)
        {
            if (playingCollection > 0)
            {
                playingCollection = 0;
                playingSong = music_data.collections[0].tracklist.length - 1;
                currentTime = 0;
                playNewSong();
            }
        }
        else
        {
            playingSong--;
            currentTime = 0;
            playNewSong();
        }
    }

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



    let currentScrollAnimation = null;


    function getUntransformedRect(el) {
        const prevTransform = el.style.transform;
        el.style.transform = 'none';
        const rect = el.getBoundingClientRect();
        el.style.transform = prevTransform;
        return rect;
    }

    function scrollToElement(el, options = {}) {
        const {
            container = el.parentElement,
            duration = 600,
            easing = t => (--t) * t * t + 1, // easeOutCubic
            offset = 0
        } = options;

        if (!el || !container) return;

        // Cancel any previous animation
        if (currentScrollAnimation?.cancel) {
            currentScrollAnimation.cancel();
        }

        container.style.scrollSnapType = 'none';

        let targetScrollTop = calcTargetScrollTop();
        let animationFrameId = null;

        const resizeObserver = new ResizeObserver(() => {
            targetScrollTop = calcTargetScrollTop();
        });

        resizeObserver.observe(container);
        resizeObserver.observe(el);

        function calcTargetScrollTop() {
            const containerRect = getUntransformedRect(container);
            const elRect = getUntransformedRect(el);
            const relativeOffset = elRect.top - containerRect.top;
            const scrollOffset = relativeOffset + container.scrollTop;

            return scrollOffset + offset - (container.clientHeight / 2) + (el.clientHeight / 2);
        }

        const startTime = performance.now();

        function animateScroll(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(1, elapsed / duration);
            const currentScrollTop = container.scrollTop; // Dynamic starting point

            container.scrollTop = currentScrollTop + (targetScrollTop - currentScrollTop) * easing(t);

            if (t < 1) {
            animationFrameId = requestAnimationFrame(animateScroll);
            } else {
            resizeObserver.disconnect();
            container.style.scrollSnapType = 'y mandatory';
            }
        }

        animationFrameId = requestAnimationFrame(animateScroll);

        // Save this animation so it can be cancelled
        currentScrollAnimation = {
            cancel() {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            }
        };
    }

    function animatePerspective() {
        const container = scrollContainer;
        const children = Object.values(collectionElements);

        const containerRect = container.getBoundingClientRect();
        const containerCenterY = containerRect.top + containerRect.height / 2;

        children.forEach(child => {
            const childRect = getUntransformedRect(child);
            const childCenterY = childRect.top + childRect.height / 2;

            const dx = (childCenterY - containerCenterY) / (containerRect.height / -2);
            //const translateX = (1-Math.cos(dx * Math.PI / 2)) * containerRect.height * 0.05;
            const translateY = Math.sign(dx) * (Math.pow(Math.abs(dx), 3)) * containerRect.height * 0.1;

            //child.style.transform = `translateX(${translateX}px) rotate(${Math.sign(dx) * Math.pow(Math.abs(dx), 1.3)*14}deg)`;
            child.style.transform = `perspective(20rem) translateY(${translateY}px) rotateX(${Math.max(Math.min(Math.sign(dx) * Math.pow(Math.abs(dx), 4) * 40, 100), -100)}deg) scaleY(${Math.max(1 - Math.pow(Math.abs(dx), 1.2) * 0.5, 0)}) scaleX(${Math.max(1 - Math.pow(Math.abs(dx), 1.5) * 0.2, 0)})`;
            child.style.opacity = `${1 - dx * dx * 0.5}`
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
        --fade-gradient: linear-gradient(to bottom,
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

        <div class="p-0 w-full h-[calc(100vh+6rem)] flex items-start translate-x-[-15rem]">
            <div class="flex flex-row justify-start rounded-2xl border-2 border-slate-700 bg-gray-900/20 h-50">

                <div class="relative h-[calc(30vh+30rem)] w-50 self-center track-mask">
                    <div bind:this={scrollContainer}
                        style="scrollbar-width: none; scroll-snap-type: y mandatory;"
                        class="flex overflow-y-scroll flex-col gap-5 items-start p-3 h-full overflow-x-clip">
                        <div class="min-h-[calc(30vh)] "></div>
                            {#each music_data.collections as collection, index (collection)}
                            <button
                                style="scroll-snap-align: center;"
                                class={cx("cursor-pointer w-full h-full aspect-square ")}
                                bind:this={collectionElements[collection.name]} onclick={() => {
                                    //collectionElements[collection.name].scrollIntoView({"behavior": "smooth", "inline": "center", "block": "end"})
                                    scrollToElement(collectionElements[collection.name], { duration: 600})
                                }}>
                                <img class={cx(
                                    "rounded-lg scale-85 transition-[scale] duration-500 ease-[cubic-bezier(0.25,0,0,1)]",
                                    (index == currentCollection) && "opacity-100 scale-90",
                                    (index != currentCollection) && "opacity-70 saturate-40"
                                )} src={getImage(collection.img).img} alt={collection.name}>
                            </button>
                            {/each}
                        <div class="min-h-[calc(30vh)] w-full"></div>
                    </div>
                </div>

            </div>


            <div class="flex flex-col pl-5">
                {#if currentCollection !== null}
                    <h2 class="pb-1 ml-5 text-7xl font-bold text-sky-100">
                        {music_data.collections[currentCollection].name}
                    </h2>
                    <p class="ml-6 text-slate-400">
                        {music_data.collections[currentCollection].artist} <span class="text-slate-500">• {music_data.collections[currentCollection].released}</span>
                    </p>
                {/if}
                <div class="w-[120%] ml-4 mt-3 h-1 bg-gradient-to-r from-blue-900/0 via-blue-950/70 via-7% to-blue-900/0 opacity-100 "></div>
                <div class="flex overflow-y-auto overflow-x-visible flex-col gap-3 pt-3 pr-6 pb-2 pl-4 leading-tight whitespace-normal w-120 max-h-200">

                    {#if currentCollection !== null}

                        {#each music_data.collections[currentCollection].tracklist as song, index (song)}
                            <button
                            onclick={() => {
                                playingSong = index;
                                playingCollection = currentCollection;
                                playNewSong();
                            }}
                            class={cx("flex relative pl-2 items-center flex-row gap-3 py-[0.35rem] cursor-pointer")}>
                                <div class={cx("absolute origin-left scale-x-0 left-0 top-0 w-full h-full bg-gradient-to-r ease-[cubic-bezier(0,1,0,1)] rounded-md from-blue-950/40 via-50% via-blue-900/15 to-indigo-500/0 opacity-0 duration-400", (playingSong == index && playingCollection == currentCollection) && "scale-x-100 opacity-100")}></div>

                                <div class={cx("flex justify-center items-center w-4 h-full text-sm text-blue-600")}>
                                    {#if song.fav}
                                    <p class={cx("h-2 text-2xl -translate-y-[0.75rem]", (playingSong == index && playingCollection == currentCollection) && "text-blue-500")}>+</p>
                                    {/if}
                                </div>

                                <p class={cx("text-sm text-gray-500", (playingSong == index && playingCollection == currentCollection) && "text-slate-200")}>
                                    {`${Math.floor(song.length / 60)}:${String(song.length % 60).padStart(2, '0')}` }
                                </p>

                                <p class={cx("transition-all duration-200 ease-[cubic-bezier(1,0,0,1)]", (playingSong != index || playingCollection != currentCollection) && "text-gray-300", (playingSong == index && playingCollection == currentCollection) && "text-blue-400 text-lg")}>
                                    {song.name}
                                </p>
                            </button>
                        {/each}
                    {/if}
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

<div class="flex sticky bottom-10 z-10 justify-center px-20 w-full h-25">
    <div class="flex flex-col gap-4 justify-center items-center px-5 w-full max-w-6xl h-full rounded-lg border-2 bg-zinc-900 border-zinc-800">

        <div class="flex gap-4 justify-center items-center">
            <button class="w-6 h-8 text-xl cursor-pointer" onclick={playPrev}>
                <Fa icon={faBackwardStep} class="w-full h-full text-center align-middle"></Fa>
            </button>
            <button class={cx(
                "w-6 h-8 ",
                (playerReady == false || playerState === YT.PlayerState.BUFFERING) && "cursor-not-allowed",
                (playerReady && (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.UNSTARTED || playerState === YT.PlayerState.PLAYING || playerState === YT.PlayerState.CUED)) && "cursor-pointer",
                )}
                onclick={() => {
                    if (playerState === YT.PlayerState.PAUSED)
                    {
                        play();
                    }
                    else if (playerState === YT.PlayerState.PLAYING)
                    {
                        pause();
                    }
                }}
            >
            {#if playerReady}
                {#if playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.UNSTARTED || playerState === YT.PlayerState.ENDED || playerState === YT.PlayerState.CUED}
                    <Fa icon={faPlay} class="w-full h-full text-xl text-center align-middle"></Fa>
                {:else if playerState === YT.PlayerState.PLAYING }
                    <Fa icon={faPause} class="w-full h-full text-xl text-center align-middle"></Fa>
                {:else if playerState === YT.PlayerState.BUFFERING}
                    <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_39.45%]" style="animation-duration: 2000ms">*</p>
                {:else}
                    <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_39.45%]" style="animation-duration: 2000ms">*</p>
                {/if}
            {:else}
                <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_39.45%]" style="animation-duration: 2000ms">*</p>
            {/if}
            </button>
            <button class="w-6 h-8 text-xl cursor-pointer" onclick={playNext}>
                <Fa icon={faForwardStep} class="w-full h-full text-center align-middle"></Fa>
            </button>
        </div>
        <div class="flex gap-5 items-center w-full text-gray-300">
            {#if playerReady}
                <p class="w-10">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime) % 60).padStart(2, '0')}</p>
                <div class="flex relative items-center w-full h-2 rounded-sm bg-zinc-800">
                    <input
                        type="range"
                        min="0"
                        max={music_data.collections[playingCollection]?.tracklist[playingSong].length}
                        step="any"
                        oninput={(event) => {
                            player.seekTo(event.target.value);
                        }}
                        bind:value={currentTime}
                        class="w-full opacity-0 cursor-pointer"
                    />
                    <div class="h-full absolute left-0 rounded-sm ease-[cubic-bezier(0.5,0.5,0.5,0.5)] transition-all duration-50 bg-slate-200" style={`width: ${100 * currentTime / music_data.collections[playingCollection]?.tracklist[playingSong].length}%`}>
                    </div>
                </div>
                {#if playerReady && music_data.collections[playingCollection]?.tracklist[playingSong]}
                    <p>{Math.floor(music_data.collections[playingCollection].tracklist[playingSong].length/60)}:{String(music_data.collections[playingCollection].tracklist[playingSong].length % 60).padStart(2, '0')}</p>
                {:else}
                    <p>0:00</p>
                {/if}
            {:else}
                <div class="w-full h-2 rounded-sm bg-zinc-800"></div>
            {/if}
        </div>
    </div>
</div>