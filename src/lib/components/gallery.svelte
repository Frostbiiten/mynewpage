<script>
  import { onMount } from 'svelte';
  
  import Fa from 'svelte-fa'
  import { faArrowLeft, faArrowRight, faCirclePlay, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
  import { base } from '$app/paths';

  let {project, imgCount, vidCount }= $props();
  
  let mediaItems = [];
  for (let i = 1; i <= imgCount; i++) {
    mediaItems.push({
      id: i,
      src: `${base}/gallery/${project}/${i}.webp`,
      alt: `Media ${i} from ${project}`,
      type: 'image'
    });
  }

  for (let i = 1; i <= vidCount; i++) {
    mediaItems.push({
      id: i,
      src: `${base}/gallery/${project}/${i}.webm`,
      alt: `Media ${i} from ${project}`,
      type:  'video'
    });
  }

  import cx from 'clsx';
  
  // Initialize thumbnail carousel
  function onThumbsInit(event) {
    thumbsApi = event.detail;
    
    // Initial update of selected thumbnail
    if (emblaApi) updateSelectedThumb();
  }
  
  // Click handler for thumbnails
  function onThumbClick(index) {
    if (emblaApi) emblaApi.scrollTo(index);
  }
  
  // Navigation functions
  function scrollNext() {
    splideInst?.go('>');
  }
  
  function scrollPrev() {
    splideInst?.go('<');
  }

  let loadedMedia = $state(0)

  $effect(() => {
    const currentLoaded = loadedMedia;
    if (currentLoaded == mediaItems.length)
    {
      scrollNext();
      scrollPrev();
    }
  })
  
  // Debug media loading
  function handleMediaError(e, index) {
    console.error(`Failed to load media at index ${index}:`, e.target.src);
    loadedMedia++;
  }
  
  function handleMediaLoad(index) {
    console.log(`Successfully loaded media at index ${index}`);
    loadedMedia++;
  }

  function videosUpdate()
  {
    const allVideos = document.querySelectorAll('.carousel-video');
    allVideos.forEach(video => {
      video.pause();
    });

    const currentMedia = mediaItems[currentSlide];
    
    if (currentMedia && currentMedia.type === 'video') {
      // Get the current video and play it
      setTimeout(() => {
        const currentVideo = document.querySelector(
          `.splide__slide[data-real-index="${currentSlide}"]:not(.splide__slide--clone).is-current video`
        );

        if (currentVideo) {
          currentVideo.play().catch(e => {
            console.log('Video autoplay prevented:', e);
            // Autoplay might be prevented by browser policy
          });
        }
      }, 50);
    }
  }
  import { Splide, SplideSlide, SplideTrack } from '@splidejs/svelte-splide';
  import '@splidejs/svelte-splide/css';

  let splideInst;
  let thumbs;
  const options = {
    type: 'loop',
    gap: '1rem',
    autoWidth: true,
    speed: 750,
    easing: 'cubic-bezier(0.792,0.006,0,0.995)',
    pagination: false,
    arrows: true,
    focus: 'center'
  };

  const thumbsOptions = {
    type: 'slide',
    trimSpace: false,
    loop: true,
    fixedWidth: 110,
    fixedHeight: 110,
    gap: 12,
    rewind: true,
    pagination: false,
    isNavigation: true,
    focus: 'center',
    arrows: false,
  };

  onMount(() => {
    videosUpdate();
    setTimeout(() => { scrollNext(); scrollPrev(); }, 500)
    if (splideInst && thumbs) {
      splideInst.sync(thumbs.splide);
    }
  })

  function refreshSplide() {
    if (splideInst?.splide) {
      splideInst.splide.refresh();
      splideInst?.go('>');
    }
  }

  function markCurrent(index) {
    const allSlides = document.querySelectorAll('.splide__slide');
    allSlides.forEach(slide => {
      const realIndex = slide.getAttribute('data-real-index');
      if (parseInt(realIndex) === index) {
        slide.classList.add('is-current');
      } else {
        slide.classList.remove('is-current');
      }
    });
  }

  let currentSlide = $state()
  let currentSlideDelayed = $state()
  function onMoveStart(splide) {
    currentSlide = splide.index;
    markCurrent(currentSlide);
  }

  function onMoveEnd(splide) {
    currentSlideDelayed = splide.index;
    videosUpdate();
  }

</script>

<style>
  /* default vars on every slide */
  :global(.splide__slide) {
    --s: 0.9;
    --b: 0.3;
    --blur: 2px;
  }

  :global(.splide__slide.is-current) {
    --s: 1;
    --b: 1;
    --blur: 0px;
  }

  /* 3) apply transform & filter (and transition) only on your inner wrapper */
  :global(.splide__slide > .slide-content) {
    transform: scale(var(--s));
    filter:    brightness(var(--b)) blur(var(--blur));
    transition:
      transform 0.55s cubic-bezier(0.8,0,0,0.8),
      filter    0.55s cubic-bezier(0.8,0,0,0.8);
  }

  video::-webkit-media-controls {
  }

  .track-mask {
      --fade-gradient: linear-gradient(to right,
          rgba(0, 0, 0, 0.0) 5%,
          rgba(0, 0, 0, 1.0) 30%,
          rgba(0, 0, 0, 1.0) 70%,
          rgba(0, 0, 0, 0.0) 95%
      );

      mask-image: var(--fade-gradient);
      -webkit-mask-image: var(--fade-gradient);

      mask-repeat: no-repeat;
      -webkit-mask-repeat: no-repeat;

      mask-size: 100% 100%;
      -webkit-mask-size: 100% 100%;
  }

</style>

<div class="flex flex-col px-3 pb-4 rounded-lg">


{#if mediaItems.length > 0}
  <Splide
    bind:this={splideInst}
    {options}
    on:move={(e) => onMoveStart(e.detail)}
    on:moved={(e) => onMoveEnd(e.detail)}
    hasTrack={ false } aria-label="Project Media" class="h-[min(calc(100vh-15rem),45rem)] relative rounded-2xl"
  >
    <SplideTrack>
      {#each mediaItems as item, index}
        <SplideSlide data-real-index={index} class={cx(`h-[min(calc(100vh-20rem),45rem)] p-10 min-w-0 relative video-slide-${index} max-h-full transition-all`)}>
          <div class={cx("flex justify-center h-full max-h-full duration-550 slide-content ease-[cubic-bezier(0.8,0,0,0.8)]")}>
            {#if item.type === 'image'}
              <img 
                src={item.src} 
                alt={item.alt} 
                class="object-contain max-h-full rounded-sm shadow-md object-fit"
                onerror={(e) => handleMediaError(e, index)}
                onload={() => handleMediaLoad(index)}

              />
            {:else if item.type === 'video'}
              <video 
                src={item.src}
                autoplay
                muted
                class="object-contain w-auto max-h-full rounded-sm shadow-md carousel-video autoplay muted loop"
                controls="false"
                preload="metadata"
                onerror={(e) => handleMediaError(e, index)}
                onended={(e) => scrollNext()}
              >
                Your browser does not support the video tag.
              </video>
            {/if}
          </div>
        </SplideSlide>
      {/each}
    </SplideTrack>

    <div class="flex absolute top-0 left-0 flex-col justify-end px-1 w-full h-full pointer-events-auto splide__arrows">
      <div class="relative w-full bg-gradient-to-r rounded-2xl translate-y-30 h-35 from-black/70 to-black/70">
        <button class="absolute !left-[1rem] !bg-slate-950/20 hover:!bg-slate-900/30 !backdrop-blur-lg !border-1 !border-slate-800/80 !transition-all !opacity-100 z-10 !rounded-lg !w-13 !h-28 splide__arrow splide__arrow--prev">
          <Fa class="text-slate-400" icon={faArrowRight}></Fa>
        </button>
        <div class="flex w-full max-w-full h-full track-mask">
          <Splide class="flex justify-center items-center w-full h-full thumbnail-carousel" options={thumbsOptions} bind:this={thumbs}>
            {#each mediaItems as item, index}
              <SplideSlide data-real-index={index} class={cx("w-full rounded-lg", currentSlide === index && "ring-2")}>
                {#if item.type === 'image'}
                <img alt="thumbnail preview" src={item.src} class="object-cover w-full h-full transition-all cursor-pointer brightness-70 aspect-square hover:!brightness-100"/>
                {:else}
                <div class="flex justify-center items-center rounded-lg border-2 backdrop-blur-2xl transition-opacity cursor-pointer aspect-square border-slate-800/40 hover:opacity-100 bg-black/30"><Fa class="w-full text-3xl text-slate-300" icon={faPlayCircle}></Fa></div>
                {/if}
              </SplideSlide>
            {/each}
          </Splide>
        </div>
        <button class="absolute !right-[1rem] !bg-slate-950/20 hover:!bg-slate-900/30 !backdrop-blur-lg !border-1 !border-slate-800/80 !transition-all !opacity-100 z-10 !rounded-lg !w-13 !h-28 splide__arrow splide__arrow--next">
          <Fa class="text-slate-400" icon={faArrowRight}></Fa>
        </button>
      </div>
    </div>
  </Splide>
{/if}
</div>