<script>
    import { onMount } from "svelte";

    const images = import.meta.glob('$lib/img/projects/*', { eager: true });
    let carouselImg = $state(Object.values(images).map(img => img.default));
    let dup = $derived([...carouselImg, ...carouselImg])

    import scrollA from '$lib/img/projects/aero.webp'
    import scrollB from '$lib/img/projects/fff.webp'
    import scrollC from '$lib/img/projects/frac.webp'
    import scrollD from '$lib/img/projects/gaia.webp'
    
    import Blurscroll from "$lib/components/blurscroll.svelte";

    $inspect(carouselImg)
    //carouselImg = [...carouselImg, ...carouselImg];
</script>

<div class="flex flex-col gap-7 justify-center items-center w-full">

    <div class="space-y-4 w-7xl">
      <div class="flex z-40 flex-col col-span-1 col-start-1 row-span-1 row-start-1 items-start">
          <h1 class="z-40 font-mono text-7xl drop-shadow-lg">Edem</h1>
          <h1 class="z-40 px-1 text-2xl tracking-widest drop-shadow-lg text-slate-400">Hoggar</h1>
      </div>

        <div class="text-lg text-slate-200">
        Welcome to my site.
        </div>
    </div>

    <div class="space-y-4 overflow-clip rounded-xl max-w-screen w-7xl">
        <div class="grid max-w-full h-60 overflow-clip">
            <div class="flex col-span-1 col-start-1 row-span-1 row-start-1 gap-3 w-max h-60 rounded-2xl blur-3xl scale-110 carousel-track">
            <img src={scrollA} alt={"scrolling blur"}>
            <img src={scrollB} alt={"scrolling blur"}>
            <img src={scrollC} alt={"scrolling blur"}>
            <img src={scrollA} alt={"scrolling blur"}>
            <img src={scrollB} alt={"scrolling blur"}>
            <img src={scrollC} alt={"scrolling blur"}>
            </div>


            <div class="z-10 col-span-1 col-start-1 row-span-1 row-start-1 h-full mix-blend-color backdrop-brightness-125 bg-blue-400/30 w-7xl">
            </div>
        </div>
    </div>
</div>

<style>
  .carousel-track {
    animation: scroll-left 50s linear infinite;
  }
  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(-100% / 2)); 
    }
  }
</style>