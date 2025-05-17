<svelte:head>
  <title>Blog</title>
  <meta name="description" content="Welcome to my (not yet functional) blog">
  <meta name="keyword" content="programming, cs, music, games, edits, anime">
  <meta name="keywords" content="programming, cs, music, games, edits, anime">
  <meta name="author" content="Edem Hoggar">

  <meta property="og:title" content="Edem's Blog"/>
  <meta property="og:description" content="Welcome to my (not yet functional) blog"/>
  <meta property="og:image" content="https://edem.ca/cloudsbg.webp"/>
  <meta property="og:url" content="https://edem.ca"/>
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Edem's Blog" />
  <meta name="twitter:description" content="Welcome to my (not yet functional) blog"/>
  <meta name="twitter:image" content="https://edem.ca/cloudsbg.jpg"/>
</svelte:head>

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
</style>

<div class="flex flex-col gap-7 justify-center items-center -mt-5 w-full h-[calc(100vh-15rem)] -mb-10">
    <div class="px-8 w-full max-w-7xl h-full">
        <div class="flex flex-col relative justify-center items-center w-full h-full border-2 border-gray-800 rounded-lg bg-radial-[at_50%_0%] to-150% from-[#141b27] to-[#0e1114]">
            <h2 class="font-mono text-8xl font-black">WIP</h2>
            <p class="-mt-2 -translate-x-8 text-zinc-600">coming soon...</p>
            <div class="absolute top-0 left-0 w-full h-full overflow-clip mix-blend-multiply opacity-4">
                <div class="overflow-hidden relative w-full h-full rounded-xl scale-300">
                    <div class="absolute top-0 left-0 w-full h-full opacity-10 grain z-9999">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>