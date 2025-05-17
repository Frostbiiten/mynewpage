<svelte:head>
  <title>Inspiration</title>
  <meta name="description" content="This page contains some of my ramblings on media that has inspired me">
  <meta name="keyword" content="music, games, edits, anime">
  <meta name="keywords" content="music, games, edits, anime">
  <meta name="author" content="Edem Hoggar">

  <meta property="og:title" content="Edem's World"/>
  <meta property="og:description" content="This page contains some of my ramblings on media that has inspired me"/>
  <meta property="og:image" content="https://edem.ca/cloudsbg.webp"/>
  <meta property="og:url" content="https://edem.ca"/>
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Edem's World" />
  <meta name="twitter:description" content="This page contains some of my ramblings on media that has inspired me"/>
  <meta name="twitter:image" content="https://edem.ca/cloudsbg.jpg"/>
</svelte:head>

<script>
    import Projectcontainer from "$lib/components/projectcontainer.svelte";
    import Fa from 'svelte-fa'
    import { faArrowLeft, faArrowRight, faChevronLeft, faChevronRight, faCircle, faPause, faPlug, faPlus, faSquareArrowUpRight, faStar, faLink } from "@fortawesome/free-solid-svg-icons";
    import { faGithub } from '@fortawesome/free-brands-svg-icons';
    import { fly, fade } from "svelte/transition";
    import bg from "$lib/img/cloudsbg.webp"
    import cx from "clsx";
    import { onMount } from 'svelte';

    import { faPlay, faForwardStep, faBackwardStep } from "@fortawesome/free-solid-svg-icons";
    import sittingSketch from "$lib/img/figure/sittingSketch.webp"

    let currentMenu = $state("main");
    let figureWidth = $state(0);
    let figureHeight = $state(0);

    function handleLoad(e) {
      figureWidth = e.target.naturalWidth;
      figureHeight = e.target.naturalHeight;
    }

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
        return {img: images[`/src/lib/img/music/covers/null.png`].default, found: false};
    }

    import music_data from "$lib/data/music.json"

    let scrollContainer;
    let currentCollection = $state(null);
    let collectionElements = {};

    $effect(() => {
        const test = currentCollection;
        checkScroll();
    })

    function closestToCenter() {
        const containerRect = scrollContainer.getBoundingClientRect();
        const containerCenter = containerRect.top + containerRect.height / 2;

        let closest = { index: 0, distance: Infinity };

        Object.values(collectionElements).forEach((el, i) => {
            const rect = getUntransformedRect(el);
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

    let tracklistScrollbox;
    let widenTracklist = $state(false);
    let scrollbarWidth = $state(0);

    function checkScroll()
    {
        widenTracklist = tracklistScrollbox.scrollHeight > tracklistScrollbox.clientHeight;
    }

    // -> https://stackoverflow.com/a/13382873/17597356
    function getScrollbarWidth()
    {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        const inner = document.createElement('div');
        outer.appendChild(inner);
        scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
    }
    

    function trackPerspective()
    {
		animatePerspective();
		requestAnimationFrame(trackPerspective);
    }

    let scrollTimeout;
    onMount(() => {
        if (typeof window === 'undefined') return;

        // scroll snapping & y translation
        scrollContainer.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                closestToCenter();
                //animatePerspective();
            });

            scrollContainer.style.scrollSnapType = 'none';
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => { scrollContainer.style.scrollSnapType = 'y mandatory'; }, 100);
        });

        getScrollbarWidth();
        closestToCenter();
        //animatePerspective();
        trackPerspective();

        function initPlayer() {
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

                            if (playingCollection !== null || playingSong !== null) {
                                updateSpeech(currentTime);
                            }
                        }, 250);
                    },
                    onStateChange: (event) => {
                        playerState = event.data;

                        switch (event.data) {
                            case YT.PlayerState.UNSTARTED:
                                console.log('Unstarted');
                                break;
                            case YT.PlayerState.ENDED:
                                console.log('Ended');
                                playNext();
                                break;
                            case YT.PlayerState.PLAYING:
                                console.log('Playing');
                                break;
                            case YT.PlayerState.PAUSED:
                                console.log('Paused');
                                break;
                            case YT.PlayerState.BUFFERING:
                                console.log('Buffering');
                                break;
                            case YT.PlayerState.CUED:
                                console.log('Video cued');
                                break;
                        }
                    }
                }
            });
        }

        if (!window.YT) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(script);

            window.onYouTubeIframeAPIReady = () => { initPlayer(); };
        } else if (window.YT && window.YT.Player) { initPlayer(); }
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
            duration = 200,
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
            const containerRect = container.getBoundingClientRect();
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

            if (t < 1)
            {
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
            const translateY = Math.max(Math.min(Math.sign(dx) * (Math.pow(Math.abs(dx), 3)), Math.abs(dx * 2)), -Math.abs(dx * 2))  * containerRect.height * 0.1;

            //child.style.transform = `translateX(${translateX}px) rotate(${Math.sign(dx) * Math.pow(Math.abs(dx), 1.3)*14}deg)`;
            //child.style.transform = `perspective(20rem) translateY(${translateY}px) rotateX(${Math.max(Math.min(Math.sign(dx) * Math.pow(Math.abs(dx), 4) * 40, 100), -100)}deg) scaleY(${Math.max(1 - Math.pow(Math.abs(dx), 1.2) * 0.5, 0)}) scaleX(${Math.max(1 - Math.pow(Math.abs(dx), 1.5) * 0.2, 0)})`;
            const imgChild = child.querySelector('img');
            imgChild.style.opacity = `${1 - dx * dx * 0.5}`
            imgChild.style.transform = `perspective(20rem) translateY(${translateY}px) rotateX(${Math.max(Math.min(Math.sign(dx) * Math.pow(Math.abs(dx), 4) * 40, 100), -100)}deg) scaleY(${Math.max(1 - Math.pow(Math.abs(dx), 1.2) * 0.5, 0)}) scaleX(${Math.max(1 - Math.pow(Math.abs(dx), 1.5) * 0.2, 0)})`;

            //child.style.opacity = `${1 - dx * dx * 0.5}`
        });
    }

    let baseFrequency = $state(0.05);
    let scale = $state(0.10);

    $effect(() => {
        const interval = setInterval(() => {
        baseFrequency = 0.006 + Math.random() * 0.006;
        scale = 3 + Math.random();
        }, 400);

        return () => {clearInterval(interval); }
    });

    let characterhover = $state(false);
    let currentDialogue = $state(null);

    function figureTalk()
    {
        characterhover = true;
    }
    function figureTalkEnd()
    {
        //characterhover = false;
    }

    import { marked } from 'marked';
    const renderer = new marked.Renderer();

    renderer.link = function(href, title, text) {
    return `
        <span class="inline-flex gap-1 items-center">
            <a target="_blank" rel="noopener noreferrer" href="${href.href}" class="inline-flex gap-1 items-center text-blue-400 transition-colors duration-200 fill-blue-400 hover:text-blue-300 hover:fill-blue-300" ${href.text ? `title="${href.text}"` : ''}>
                ${href.text}
                <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>
            </a>
        </span>
    `;
    };

    marked.setOptions({
        renderer,
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
    });
    function updateSpeech(time)
    {
        function getPrev(arr, targetTime) {
            let closest = null;
            for (let i = 0; i < arr.length; i++) {
                const time = arr[i].time;
                if (time < targetTime) {
                    if (closest === null || time > closest.time) {
                        closest = arr[i];
                    }
                }
            }
            return closest;
        }

        function getNext(arr, targetTime) {
            let closest = null;
            for (let i = 0; i < arr.length; i++) {
                const time = arr[i].time;
                if (time > targetTime) {
                    if (closest === null || time < closest.time) {
                        closest = arr[i];
                    }
                }
            }
            return closest;
        }

        const current = getPrev(music_data.collections[playingCollection]?.tracklist[playingSong].hotspots, time);
        const next = getNext(music_data.collections[playingCollection]?.tracklist[playingSong].hotspots, time);

        const timeUntilNext = next === null ? Infinity : next.time - time;
        const timeSinceCurrent = current === null ? -Infinity : time - current.time;

        if (timeUntilNext <= 1.5 && timeUntilNext > 0)
        {
            characterhover = false;
        }
        else if (timeSinceCurrent >= 0)
        {
            characterhover = true;
        }

        currentDialogue = current;
        if (current === null)
        {
            characterhover = false;
        }
    }

    let currentDialogueMD = $state(null)
    $effect(() => {
        if (currentDialogue !== null)
        {
            currentDialogueMD = marked(currentDialogue.text);
        }
        else
        {
            characterhover = false;
        }
    })

  import { base } from "$app/paths";
    let emblaApi = $state(null);
    let currentSlide = $state(-1)
    const carouselOptions = { loop: false };
    function onCarouselInit(event) {
        emblaApi = event.detail;
        currentSlide = 0;
        emblaApi.on("select", onCarouselSelect);
    }

    function onCarouselSelect() {
        if (!emblaApi) return;
        currentSlide = emblaApi.selectedScrollSnap();
    }
    $inspect(currentSlide)


    const concerts = import.meta.glob('$lib/img/music/concerts/*.webp', {
        eager: true,
        as: 'url'
    });

    const concertsMap = {};
    for (const path in concerts) {
        const filename = path.split('/').pop();
        concertsMap[filename] = concerts[path];
    }
</script>

<style>
    @keyframes ps {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
    }

    .playing-slide {
        animation: ps 20s linear infinite;
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

    .track-mask-2 {
        --fade-gradient: linear-gradient(to bottom,
            rgba(0, 0, 0, 0.0) 35%,
            rgba(0, 0, 0, 0.2) 40%,
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

    .now-playing-mask {
        --mask-g: linear-gradient(to right,
            rgba(0, 0, 0, 0.0) 0%,
            rgba(0, 0, 0, 1.0) 10%,
            rgba(0, 0, 0, 1.0) 90%,
            rgba(0, 0, 0, 0.0) 100%
        );

        mask-image: var(--mask-g);
        -webkit-mask-image: var(--mask-g);

        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;

        mask-size: 100% 100%;
        -webkit-mask-size: 100% 100%;
    }

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

    .markdown a {
        color: #60a5fa; /* Tailwind's text-blue-400 */
        text-decoration: underline;
    }

    .markdown a:hover {
        color: #3b82f6; /* Tailwind's text-blue-500 */
    }

    @keyframes blockanim {
        0% { width: 100%; transform: translateX(0); }
        100% { width: 0%; transform: translateX(-100%); }
    }

    .block-anim {
        animation: blockanim 2.2s cubic-bezier(0,1,0,1) both;
    }

    @keyframes sectionanim {
        0% { transform: translateX(20rem); }
        100% { transform: translateX(0rem); }
    }

    .section-anim {
        animation: sectionanim 2.2s cubic-bezier(0,1,0,1) both;
    }

</style>

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

{#snippet section(text)}
    <div class="flex flex-col p-6 w-full h-1/4 overflow-clip bg-blue-900 grow">
        <h1 class="pl-3 -mb-6 text-[1.4rem] opacity-70">video</h1>
        <h1 class="pl-3 -mb-6 text-7xl">games</h1>
        <div class="grow"></div>
    </div>
{/snippet}

<div
class="flex flex-row justify-center items-center w-full">
    <div class="px-8 w-screen max-w-7xl pace-y-5">

        <div class="hidden relative w-40 h-70">
            <h1 class="absolute top-0 left-[100%] text-[12rem] font-bold leading-none text-slate-200 rotate-90 align-text-top origin-top-left">
                OK
            </h1>
        </div>

        <div class={cx("p-0 md:scale-100 max-h-[calc(100vh+20rem)] min-[105rem]:max-h-[calc(100vh-20rem)] mt-3 w-0 flex items-start min-[105rem]:translate-x-[-14rem] ease-[cubic-bezier(0,1,0,1)] transition-all duration-1000",
        (currentMenu === "music") ? "translate-y-0 pointer-events-auto w-full max-sm:-translate-x-5 max-sm:w-[calc(100%+2rem)] min-[105rem]:w-[calc(100%+14rem)] opacity-100 h-[calc(100vh+6rem)] ": "translate-y-30 pointer-events-none opacity-0 h-0")}
        >
            <div class="flex flex-row justify-start -mr-2 h-20 rounded-lg border-2 md:mr-0 md:rounded-2xl border-slate-700 bg-gray-900/20 md:h-50">

                <div class="relative h-[80vh] md:h-[calc(30vh+30rem)] w-20 md:w-50 self-center ">
                    <div class="absolute bottom-[65%] w-full h-40 min-[105rem]:hidden"></div>

                    <div bind:this={scrollContainer}
                        style="scrollbar-width: none; scroll-snap-type: y mandatory;"
                        class="flex track-mask-2 min-[105rem]:track-mask overflow-y-scroll flex-col gap-5 items-start p-[0.1rem] h-full md:p-3 scroll-smooth overflow-x-clip">
                        <div class="w-full min-h-[calc(30vh+10rem)]"></div>
                        {#each music_data.collections as collection, index (collection)}
                        <button
                            style="scroll-snap-align: center;"
                            class={cx("cursor-pointer w-full h-full aspect-square ")}
                            bind:this={collectionElements[collection.name]} onclick={() => {
                                //collectionElements[collection.name].scrollIntoView({"behavior": "smooth", "inline": "center", "block": "end"})
                                scrollToElement(collectionElements[collection.name], { duration: 200})
                            }}>
                            <img class={cx(
                                "rounded-lg scale-85 transition-[scale] duration-500 ease-[cubic-bezier(0.25,0,0,1)]",
                                (index == currentCollection) && "opacity-100 scale-90",
                                (index != currentCollection) && "opacity-70 saturate-40"
                            )} src={getImage(collection.img).img} alt={collection.name}>
                        </button>
                        {/each}
                        <div class="w-full min-h-[calc(30vh+10rem)]"></div>
                    </div>

                    <button onclick={() => { currentMenu = "main"; currentSection = ""; }} class="inline-flex absolute gap-2 justify-center items-center pr-3 w-full top-198 z-9999 text-slate-600 hover:text-slate-500">
                        <Fa icon={faArrowLeft}></Fa>
                        back
                    </button>
                </div>
            </div>


            <div class="flex flex-col gap-3 pl-5 w-full font-mono max-w-[calc(100%+15rem)] md:max-w-[calc(100%-13.5rem)] min-[100rem]:w-full ">
                {#if currentCollection !== null}
                <div class="flex flex-col gap-2 p-5 pl-7 w-full bg-gray-900 rounded-xl md:h-35">
                    <p class="-mb-2 text-gray-500 md:text-lg max-lg:mt-4  max-[105rem]:mt-3">
                        {music_data.collections[currentCollection].artist}
                    </p>
                    <h2 class="font-sans text-2xl font-bold sm:text-3xl md:text-[2.1rem] lg:md:text-[3rem] min-[105rem]:text-[4.25rem] text-slate-100">
                        {music_data.collections[currentCollection].name}
                    </h2>
                </div>
                {/if}

                <div
                class="flex relative flex-row gap-5 items-center pl-5 h-12 text-sm text-slate-400">
                    <div class="absolute hidden duration-400 left-0 top-0 w-full h-full bg-gradient-to-r ease-[cubic-bezier(0,1,0,1)] rounded-t-lg from-blue-950/40 via-50% via-blue-900/15 to-indigo-500/0"></div>
                    <div class="absolute duration-400 left-0 top-0 w-full h-full bg-gradient-to-r ease-[cubic-bezier(0,1,0,1)] rounded-t-lg bg-blue-950/15 border-2 border-b-0 border-slate-900"></div>

                    <p class="hidden text-lg sm:block">
                        #
                    </p>
                    <p class="min-[105rem]:w-[27.85rem] w-[calc(100%-10rem)]">
                        Name
                    </p>
                    <div class="block w-3 sm:hidden"></div>
                    <p class="opacity-0 duration-200 sm:opacity-100">
                        Fav
                    </p>

                    <p class="ml-[0.35rem] hidden sm:block">
                        Len
                    </p>
                </div>

                <div class="w-[120%] hidden ml-4 mt-3 h-1 bg-gradient-to-r from-blue-900/0 via-blue-950/70 via-7% to-blue-900/0 opacity-100 "></div>
                <div class="flex flex-row -mt-3">

                    <div bind:this={tracklistScrollbox}
                        style={`scrollbar-color: rgba(200, 200, 230, 0.4) transparent; --sw: ${scrollbarWidth}px`}
                        class={cx("flex text-xs md:text-base max-w-full overflow-y-auto overflow-x-visible flex-col md:gap-2 pr-6 pb-2 pt-3 pl-3 leading-tight whitespace-normal duration-400 ease-[cubic-bezier(0.12,0.639,0.34,1)] min-[105rem]:min-h-110 max-h-[calc(100vh-31.25rem)] rounded-bl-xl border-slate-900 border-2 border-r-0 border-t-0 w-full min-[105rem]:w-160", widenTracklist && "pr-[calc(-var(--sw)*5)] mr-[calc(-var(--sw)*10)] min-[105rem]:w-[calc(40rem+var(--sw))]" )}>

                        {#if currentCollection !== null}

                            {#each music_data.collections[currentCollection].tracklist as song, index (song)}
                                <button
                                onclick={() => {
                                    playingSong = index;
                                    playingCollection = currentCollection;
                                    playNewSong();
                                }}
                                class={cx("flex group relative pl-[0.35rem] items-center w-full flex-row gap-[1.2rem] py-[0.35rem] cursor-pointer")}>
                                    <div class={cx("absolute group-hover:scale-x-100 group-hover:opacity-90 transition-all origin-left scale-x-0 -left-1 top-0 w-full h-full bg-gradient-to-r ease-[cubic-bezier(0,1,0,1)] rounded-md from-blue-950/40 via-50% via-blue-900/15 to-indigo-500/0 opacity-0 duration-1000", (playingSong == index && playingCollection == currentCollection) && "scale-x-100 opacity-100")}></div>

                                    <p class={cx("transition-all hidden sm:block duration-200 ease-[cubic-bezier(1,0,0,1)]", (playingSong != index || playingCollection != currentCollection) && "text-gray-600", (playingSong == index && playingCollection == currentCollection) && "text-slate-500")}>
                                        {String(index).padStart(2, '0')}
                                    </p>

                                    <p class={cx("transition-all grow overflow-ellipsis overflow-hidden md:text-nowrap text-left duration-200 ease-[cubic-bezier(1,0,0,1)]", (playingSong != index || playingCollection != currentCollection) && "text-gray-300", (playingSong == index && playingCollection == currentCollection) && "text-blue-200 md:text-lg")}>
                                        {song.name}
                                    </p>

                                    <div class="h-full">

                                    </div>

                                    <div class={cx("hidden sm:flex justify-center items-center w-4 h-full text-blue-500 text-3xl")}>
                                        {#if song.fav}
                                        <p class={cx("h-2  -translate-y-[1.00rem]", (playingSong == index && playingCollection == currentCollection) && "text-blue-400")}>+</p>
                                        {/if}
                                    </div>

                                    <p class={cx("text-sm pl-2 text-gray-500 hidden sm:block", (playingSong == index && playingCollection == currentCollection) && "text-slate-200")}>
                                        {`${Math.floor(song.length / 60)}:${String(song.length % 60).padStart(2, '0')}` }
                                    </p>
                                </button>
                            {/each}
                        {/if}
                    </div>

                    <div class="overflow-clip relative rounded-br-xl border-r-2 border-b-2 border-slate-900 bg-slate-900/10 grow max-h-[calc(100vh-31rem)] min-[105rem]:min-h-110">
                        <div class="absolute right-0 top-80 w-full h-80 bg-gradient-to-t from-slate-900/15 to-slate-900/10">
                        </div>

                        <img
                        class="hidden absolute right-0 opacity-0 pointer-events-none"
                        src={sittingSketch}
                        alt="Dummy"
                        onload={handleLoad}
                        />


                        <div class="absolute hidden min-[105rem]:block -right-5 top-30 -scale-x-100" style="contain: layout; width: {figureWidth/2.5}px; height: {figureHeight/2.5}px; filter: url(#figsketch);">
                            <div
                            class={cx("absolute top-0 left-0 z-20 w-full h-full")}
                            style="
                                -webkit-mask-image: url({sittingSketch});
                                mask-image: url({sittingSketch});

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
                                src="{sittingSketch}"
                                class="block object-cover absolute w-full h-full"
                                alt="base bg"
                            />
                                <div
                                style="width: 300%;"
                                class="absolute top-0 left-0 h-full bg-gradient-to-tr to-blue-200/10 from-0% to-70% from-slate-600 mix-blend-overlay"></div>
                                <div
                                style="width: 300%;"
                                class="absolute top-0 left-0 h-full bg-gradient-to-tr to-sky-900/10 from-10% to-30% mix-blend-multiply from-sky-900/60"></div>
                            </div>

                        </div>

                        <div class="hidden min-[105rem]:flex absolute top-0 left-0 items-center w-full min-h-110">
                            <div
                                class={cx(
                                "absolute origin-right right-38 transition-transform duration-700 ease-[cubic-bezier(0.054,0.564,0.23,1))]",
                                characterhover && "-translate-x-5 ",
                                !characterhover && "translate-x-2"
                                )}
                            >
                                <div
                                class={cx(
                                    "w-10 h-5 bg-zinc-950/90 max-h-[25rem] overflow-clip transition-all rounded-[1rem] border-2 duration-300 ease-[cubic-bezier(1,0,0,1)]",
                                    characterhover && "w-[24rem] h-fit border-slate-600 font-sans",
                                )}
                                >
                                <p class={cx("absolute mt-[-0.9rem] translate-x-[-0.1rem] h-full translate-y-1/2 w-full transition-[opacity] duration-300 text-xs align-middle text-center font-black", characterhover && "opacity-0")}>...</p>

                                <div class={cx(
                                    "overflow-clip text-slate-200 pointer-events-auto space-y-4 rounded-4xl leading-relaxed text-sm transition-[opacity, font-size, line-height] duration-400 px-5 py-5",
                                    characterhover && "opacity-100 ease-out delay-300 ",
                                    !characterhover && "opacity-0 ease-in delay-0",
                                )}>
                                    {#if currentDialogue !== null}
                                    {#if currentDialogue?.media?.length > 0}
                                        <div class="flex relative z-0 gap-1 mx-auto w-full h-40">
                                            <button
                                                onclick={() => {
                                                    emblaApi?.scrollPrev();
                                                }}
                                                class={cx(
                                                    "flex justify-center delay-500 overflow-clip items-center h-full rounded-sm transition-all duration-400 cursor-pointer bg-slate-200/5 hover:bg-slate-200/2",
                                                    (emblaApi !== null && currentSlide !== 0) && "max-w-6 min-w-6 pl-1",
                                                    (emblaApi === null || currentSlide === 0) && "max-w-0 min-w-0")}
                                            >
                                                <Fa icon={faChevronLeft}></Fa>
                                            </button>

                                            <div
                                                class="flex overflow-hidden items-start bg-gradient-to-b rounded-sm grow"
                                                use:emblaCarouselSvelte={{options: carouselOptions}}
                                                onemblaInit={onCarouselInit}
                                            >
                                                <div class="flex items-start w-full h-full">
                                                    {#each currentDialogue.media as src, index}
                                                    <div class="flex-[0_0_100%] h-full min-w-0 relative w-full">
                                                        <div class={cx(
                                                            "flex justify-center h-full w-full ",
                                                            (emblaApi && currentSlide === index) && 'scale-0',
                                                            (!emblaApi || currentSlide === index) && 'scale-100',
                                                        )}>
                                                            <a href={src.link} target="_blank" rel="noopener noreferrer" class="w-full h-full group">
                                                                <img src={concertsMap[src.img]} alt={name} class="object-cover w-full h-full duration-200 group-hover:opacity-80" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {/each}
                                                </div>
                                            </div>

                                            <button
                                                onclick={() => {
                                                    emblaApi?.scrollNext();
                                                }}
                                                class={cx(
                                                    "flex justify-center delay-500 overflow-clip items-center h-full rounded-sm transition-all duration-400 cursor-pointer bg-slate-200/5 hover:bg-slate-200/2",
                                                    (emblaApi !== null && (emblaApi.selectedScrollSnap() !== currentDialogue.media.length - 1)) && "max-w-6 min-w-6",
                                                    (emblaApi === null || (emblaApi.selectedScrollSnap() === currentDialogue.media.length - 1)) && "max-w-0 min-w-0")}
                                            >
                                                <Fa icon={faChevronRight}></Fa>
                                            </button>
                                        </div>
                                    {/if}
                                    <div class="relative z-10 markdown">
                                    {@html currentDialogueMD}
                                    </div>
                                    {/if}
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            <div class="absolute block min-[105rem]:hidden -right-5 -bottom-2 -scale-x-100" style="contain: layout; width: {figureWidth/2.5}px; height: {figureHeight/2.5}px; filter: url(#figsketch);">
                <div
                class={cx("absolute top-0 left-0 z-20 w-full h-full")}
                style="
                    -webkit-mask-image: url({sittingSketch});
                    mask-image: url({sittingSketch});

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
                    src="{sittingSketch}"
                    class="block object-cover absolute w-full h-full"
                    alt="base bg"
                />
                    <div
                    style="width: 300%;"
                    class="absolute top-0 left-0 h-full bg-gradient-to-tr to-blue-200/10 from-0% to-70% from-slate-600 mix-blend-overlay"></div>
                    <div
                    style="width: 300%;"
                    class="absolute top-0 left-0 h-full bg-gradient-to-tr to-sky-900/10 from-10% to-30% mix-blend-multiply from-sky-900/60"></div>
                </div>

            </div>

            <div class="flex flex-col min-[105rem]:hidden absolute bottom-33 right-35 items-center w-full min-h-110">
                <div
                    class={cx(
                    "absolute origin-bottom right-0 bottom-0 transition-transform duration-700 ease-[cubic-bezier(0.054,0.564,0.23,1))]",
                    characterhover && "sm:translate-y-20 translate-x-20 sm:-translate-x-5 -translate-y-20",
                    !characterhover && ""
                    )}
                >
                    <div
                    class={cx(
                        "w-10 h-5 bg-zinc-950/90 max-h-[25rem] overflow-clip transition-all rounded-[1rem] border-2 duration-300 ease-[cubic-bezier(1,0,0,1)]",
                        characterhover && "w-[24rem] h-fit border-slate-600 font-sans",
                    )}
                    >
                    <p class={cx("absolute mt-[-0.9rem] translate-x-[-0.1rem] h-full translate-y-1/2 w-full transition-[opacity] duration-300 text-xs align-middle text-center font-black", characterhover && "opacity-0")}>...</p>

                    <div class={cx(
                        "overflow-clip text-slate-200 pointer-events-auto space-y-4 rounded-4xl leading-relaxed text-sm transition-[opacity, font-size, line-height] duration-400 px-5 py-5",
                        characterhover && "opacity-100 ease-out delay-300 ",
                        !characterhover && "opacity-0 ease-in delay-0",
                    )}>
                        {#if currentDialogue !== null}
                        {#if currentDialogue?.media?.length > 0}
                            <div class="flex relative z-0 gap-1 mx-auto w-full h-40">
                                <button
                                    onclick={() => {
                                        emblaApi?.scrollPrev();
                                    }}
                                    class={cx(
                                        "flex justify-center delay-500 overflow-clip items-center h-full rounded-sm transition-all duration-400 cursor-pointer bg-slate-200/5 hover:bg-slate-200/2",
                                        (emblaApi !== null && currentSlide !== 0) && "max-w-6 min-w-6 pl-1",
                                        (emblaApi === null || currentSlide === 0) && "max-w-0 min-w-0")}
                                >
                                    <Fa icon={faChevronLeft}></Fa>
                                </button>

                                <div
                                    class="flex overflow-hidden items-start bg-gradient-to-b rounded-sm grow"
                                    use:emblaCarouselSvelte={{options: carouselOptions}}
                                    onemblaInit={onCarouselInit}
                                >
                                    <div class="flex items-start w-full h-full">
                                        {#each currentDialogue.media as src, index}
                                        <div class="flex-[0_0_100%] h-full min-w-0 relative w-full">
                                            <div class={cx(
                                                "flex justify-center h-full w-full ",
                                                (emblaApi && currentSlide === index) && 'scale-0',
                                                (!emblaApi || currentSlide === index) && 'scale-100',
                                            )}>
                                                <a href={src.link} target="_blank" rel="noopener noreferrer" class="w-full h-full group">
                                                    <img src={concertsMap[src.img]} alt={name} class="object-cover w-full h-full duration-200 group-hover:opacity-80" />
                                                </a>
                                            </div>
                                        </div>
                                        {/each}
                                    </div>
                                </div>

                                <button
                                    onclick={() => {
                                        emblaApi?.scrollNext();
                                    }}
                                    class={cx(
                                        "flex justify-center delay-500 overflow-clip items-center h-full rounded-sm transition-all duration-400 cursor-pointer bg-slate-200/5 hover:bg-slate-200/2",
                                        (emblaApi !== null && (emblaApi.selectedScrollSnap() !== currentDialogue.media.length - 1)) && "max-w-6 min-w-6",
                                        (emblaApi === null || (emblaApi.selectedScrollSnap() === currentDialogue.media.length - 1)) && "max-w-0 min-w-0")}
                                >
                                    <Fa icon={faChevronRight}></Fa>
                                </button>
                            </div>
                        {/if}
                        <div class="relative z-10 markdown">
                        {@html currentDialogueMD}
                        </div>
                        {/if}
                    </div>
                    </div>
                </div>
            </div>

            <div id="yt-player" class="w-full h-[360px] hidden"></div>
        </div>

        <div class={cx("p-0 -mt-4 w-full bg-zinc-950/50 rounded-md select-none flex items-start transition-all duration-900 ease-[cubic-bezier(0,1,0,1)]",
        (currentMenu === "edits" || currentMenu === "games" || currentMenu === "anime") ? "translate-y-0 opacity-100 h-[calc(100vh-15rem)]" : "translate-y-30 opacity-0 h-0")}
        >
            <div class="w-full max-w-7xl h-full">
                <div class="flex flex-col relative justify-center items-center w-full h-full border-2 border-gray-800 rounded-lg bg-radial-[at_50%_0%] to-150% from-blue-400/10 to-stone-950/70 ">
                    <h2 class="font-mono text-8xl font-black">WIP</h2>
                    <p class="-mt-2 -translate-x-8 text-zinc-600">coming soon...</p>
                    <div class="absolute top-0 left-0 w-full h-full overflow-clip mix-blend-multiply opacity-4">
                        <div class="overflow-hidden relative w-full h-full rounded-xl scale-300">
                            <div class="absolute top-0 left-0 w-full h-full opacity-10 grain z-9999">
                            </div>
                        </div>
                    </div>
                    <button onclick={() => { currentMenu = "main"; currentSection = ""; }} class="inline-flex absolute top-3 left-4 gap-2 items-center z-9999 text-slate-400 hover:text-slate-300">
                        <Fa icon={faArrowLeft}></Fa>
                        back
                    </button>
                </div>
            </div>
        </div>

        {#if currentMenu === "main"}
        <div
            class={cx("p-0 -mt-4 w-full h-[calc(100vh-12rem)] flex items-start transition-[opacity,scale] origin-left duration-700 delay-300 ease-[cubic-bezier(0.115,0.813,0,1)]", (currentSection !== "") && "opacity-0")}>
            <div class="flex relative flex-col items-stretch w-full h-full overflow-clip rounded-xl">
                    <div
                        class="absolute inset-0 bg-center bg-cover brightness-95"
                        style="background-image: url({bg}); z-index: 0;">
                    </div>

                    <p class="absolute right-10 bottom-20 text-sm text-right text-white">creative works <br/>i've been inspired by.</p>

                    <div class="absolute top-0 left-0 w-full h-full overflow-clip rounded-2xl opacity-50 mix-blend-soft-light">
                        <div class="overflow-hidden relative w-full h-full rounded-xl scale-140">
                            <div class="absolute top-0 left-0 w-[110%] h-[110%] z-9999 grain">
                            </div>
                        </div>
                    </div>

                    {#snippet section(text, extra, delay, desc)}
                    <button
                        onclick={()=> {
                            if (currentSection === "")
                            {
                                currentSection = text;
                                setTimeout(() => {
                                    currentMenu = text;
                                }, 1000);
                            }
                        }}
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
                            style={`animation-delay: ${delay}ms`}
                            class={cx(
                                "z-10 section-anim ml-10 text-7xl group-hover:scale-x-[3] font-mono origin-left duration-100 ease-[cubic-bezier(0.282,1.281,0.769,1.073)]",
                                (currentSection == text) && "scale-y-800 duration-[0.09s] ease-[cubic-bezier(0,0.5,0.5,1)] scale-x-[3]",
                                (currentSection != "" && currentSection != text) && "hidden",
                                currentSection && extra
                            )}
                            >{text}
                        </h1>

                        <p class="absolute right-10">
                            {desc}
                        </p>

                        <div style={`animation-delay: ${delay}ms`} class={cx("absolute bg-zinc-950 h-full block-anim z-11")}>
                            </div>
                    </button>
                    {/snippet}

                    {@render section("music", "mt-80", 500)}
                    {@render section("games", "", 600)}
                    {@render section("edits", "", 700)}
                    {@render section("anime", "mb-80", 800)}
            </div>

        </div>
        {/if}

            <p class="left-10 bottom-20 pt-4 pl-1 text-sm text-left text-slate-800 hover:text-slate-600 transition-color duration-400">Please note, the music player simply streams using official youtube music embeds. I do NOT host copyrighted material.</p>

    </div>
</div>

{#if currentMenu === "music"}
<div class="flex sticky bottom-5 z-10 justify-center -mb-10 w-full mt-30 md:bottom-9 h-25">
    <div class="px-8 space-y-5 w-screen max-w-7xl">
        <div class="flex relative flex-col gap-4 justify-center items-center px-5 w-full h-full rounded-lg border-2 bg-zinc-900 border-zinc-800">

            <div class="flex gap-4 justify-center items-center w-full">
                <div class="md:hidden basis-4/5"></div>
                <div class="hidden gap-3 py-2 w-full md:flex text-zinc-500 basis-4/5 text-nowrap">
                    {#if playerReady && playingCollection !== null && playingSong != null}
                        Now playing:
                        <div class="w-full font-mono max-w-100 now-playing-mask">
                            <p class="playing-slide">{music_data.collections[playingCollection]?.tracklist[playingSong].name} on <span class="italic">{music_data.collections[playingCollection]?.name}</span></p>
                        </div>
                    {/if}
                </div>
                <div class="flex gap-4 justify-center items-center">
                    <button class="w-6 h-8 text-xl cursor-pointer group" onclick={playPrev}>
                        <Fa icon={faBackwardStep} class="w-full h-full text-center align-middle duration-200 text-zinc-300 group-hover:text-zinc-50 group-hover:scale-110"></Fa>
                    </button>
                    <button class={cx(
                        "group w-6 h-8 text-zinc-300 hover:text-zinc-50 duration-200 hover:scale-110 active:scale-90",
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
                            <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_42.0%]" style="animation-duration: 2000ms">*</p>
                        {:else}
                            <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_42.0%]" style="animation-duration: 2000ms">*</p>
                        {/if}
                    {:else}
                        <p class="text-5xl h-full font-[Arial] animate-spin origin-[50%_42.0%]" style="animation-duration: 2000ms">*</p>
                    {/if}
                    </button>
                    <button class="w-6 h-8 text-xl cursor-pointer group" onclick={playNext}>
                        <Fa icon={faForwardStep} class="w-full h-full text-center align-middle duration-200 text-zinc-300 group-hover:text-zinc-50 group-hover:scale-110"></Fa>
                    </button>
                </div>
                <div class="basis-4/5">

                </div>
            </div>
            <div class="flex gap-5 items-center w-full text-gray-300">
                    {#if isNaN(Math.floor((currentTime) / 60))}
                        <p class="w-10">00:00</p>
                    {:else}
                        <p class="w-10">{Math.floor((currentTime) / 60)}:{String(Math.floor(currentTime) % 60).padStart(2, '0')}</p>
                    {/if}
                    <div class="flex relative items-center w-full h-2 rounded-sm bg-zinc-800">
                        <input
                            type="range"
                            min="0"
                            max={music_data.collections[playingCollection]?.tracklist[playingSong].length}
                            step="any"
                            oninput={(event) => {
                                player?.seekTo(event.target.value);
                            }}
                            bind:value={currentTime}
                            class="w-full opacity-0 cursor-pointer"
                        />
                        <div class="h-full pointer-events-none absolute left-0 rounded-sm ease-[cubic-bezier(0.5,0.5,0.5,0.5)] transition-all duration-50 bg-slate-200" style={`width: ${100 * Math.max(Math.min(currentTime / music_data.collections[playingCollection]?.tracklist[playingSong].length, 1), 0)}%`}>
                        </div>
                        <div class="absolute w-full h-full pointer-events-none">
                            <div class="relative w-full h-full">
                            {#each music_data.collections[playingCollection]?.tracklist[playingSong].hotspots as spot}
                                <div class="absolute w-1 h-2 bg-zinc-950/20" style={`left: ${100 * spot.time / music_data.collections[playingCollection]?.tracklist[playingSong].length}%;`}>

                                </div>
                            {/each}
                            </div>
                        </div>
                    </div>
                    {#if playerReady && music_data.collections[playingCollection]?.tracklist[playingSong]}
                        <p>{Math.floor(music_data.collections[playingCollection]?.tracklist[playingSong].length/60)}:{String(music_data.collections[playingCollection]?.tracklist[playingSong].length % 60).padStart(2, '0')}</p>
                    {:else}
                        <p>0:00</p>
                    {/if}
            </div>



            <div class="hidden absolute right-4 bottom-20">
                <img src={sittingSketch} class="hidden w-55 -scale-x-100" style=" filter: url(#figsketch);">
            </div>
        </div>
    </div>
</div>
{/if}