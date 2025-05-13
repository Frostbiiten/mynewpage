<script>
  import emblaCarouselSvelte from 'embla-carousel-svelte';
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
  
  // Main carousel API
  let emblaApi = $state();

  // Thumbnail carousel API
  let thumbsApi;
  
  // Options for main carousel
  const mainOptions = { 
    loop: true,
    draggable: true,
  };
  
  // Options for thumbnails carousel
  const thumbOptions = {
    containScroll: 'keepSnaps',
    dragFree: true,
  };

  let currentSlide = $state()

  // Video playback control
  function handleSlideChange() {
    if (!emblaApi) return;
    
    // Pause all videos when changing slides
    const allVideos = document.querySelectorAll('.carousel-video');
    allVideos.forEach(video => {
      video.pause();
    });
    
    // Optionally autoplay the current video
    // const
    currentSlide = emblaApi.selectedScrollSnap();
    const currentMedia = mediaItems[currentSlide];
    
    if (currentMedia && currentMedia.type === 'video') {
      // Get the current video and play it
      setTimeout(() => {
        const currentVideo = document.querySelector(`.video-slide-${currentSlide} video`);
        if (currentVideo) {
          currentVideo.play().catch(e => {
            console.log('Video autoplay prevented:', e);
            // Autoplay might be prevented by browser policy
          });
        }
      }, 50);
    }
  }
  
  // Update thumbnail selection when main carousel changes
  function onMainCarouselSelect() {
    if (!emblaApi || !thumbsApi) return;
    
    thumbsApi.scrollTo(emblaApi.selectedScrollSnap());
    updateSelectedThumb();
    handleSlideChange();
  }
  
  // Highlight the selected thumbnail
  function updateSelectedThumb() {
    if (!emblaApi || !thumbsApi) return;
    
    const selected = emblaApi.selectedScrollSnap();
    const thumbs = thumbsApi.slideNodes();
    
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle('ring-2', index === selected);
      thumb.classList.toggle('ring-blue-500', index === selected);
      thumb.classList.toggle('opacity-50', index !== selected);
      thumb.classList.toggle('opacity-100', index === selected);
    });
  }
  
  // Initialize main carousel
  function onMainInit(event) {
    emblaApi = event.detail;
    
    // Set up event listeners once API is available
    emblaApi.on("select", onMainCarouselSelect);
    
    // Initial setup
    handleSlideChange();
  }
  
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
    if (emblaApi) emblaApi.scrollNext();
  }
  
  function scrollPrev() {
    if (emblaApi) emblaApi.scrollPrev();
  }
  
  // Debug media loading
  function handleMediaError(e, index) {
    console.error(`Failed to load media at index ${index}:`, e.target.src);
  }
  
  function handleMediaLoad(index) {
    console.log(`Successfully loaded media at index ${index}`);
  }
  
  // Toggle video play/pause
  function toggleVideo(event, index) {
    const video = event.target;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
  
  // Ensure thumbnails are properly selected after component is mounted
  onMount(() => {
    // Force an update after the component is fully mounted
    setTimeout(() => {
      if (emblaApi && thumbsApi) {
        updateSelectedThumb();
        handleSlideChange();
      }
    }, 100);
  });
    //<h3 class="pt-5 w-full font-mono text-3xl font-black text-slate-500">Gallery</h3>
</script>

<div class="flex flex-col px-3 pb-4 rounded-lg">


{#if mediaItems.length > 0}




  <!-- Main Carousel -->
  <div class="relative mx-auto w-full max-w-screen">
    <div 
      class="flex overflow-hidden flex-col bg-gradient-to-b rounded-2xl embla"
      use:emblaCarouselSvelte={{options: mainOptions}}
      onemblaInit={onMainInit}
    >
      <div class="flex items-start">
        {#each mediaItems as item, index}
          <div class="flex-[0_0_100%] min-w-0 relative video-slide-{index}">
            <div class={cx(
                "flex justify-center p-3 w-full",
                (emblaApi && emblaApi.selectedScrollSnap() === index) && 'scale-0',
                (!emblaApi || emblaApi.selectedScrollSnap() === index) && 'scale-100',
                )}>
              {#if item.type === 'image'}
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  class="object-fill h-full rounded-sm shadow-md"
                  onerror={(e) => handleMediaError(e, index)}
                  onload={() => handleMediaLoad(index)}
                />
              {:else if item.type === 'video'}
                <video 
                  src={item.src}
                  autoplay
                  muted
                  class="object-contain max-w-full rounded-sm shadow-md pointer-events-none carousel-video autoplay muted loop"
                  controls="false"
                  preload="metadata"
                  onerror={(e) => handleMediaError(e, index)}
                  onclick={(e) => toggleVideo(e, index)}
                  onended={(e) => scrollNext()}
                >
                  Your browser does not support the video tag.
                </video>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Navigation Buttons -->
  </div>
  <div class="flex flex-row">

    <button 
      class="z-10 p-2 my-3 text-gray-600 border-2 shadow-md transition-all duration-150 cursor-pointer border-slate-900 hover:bg-slate-800/10 hover:border-slate-950"
      onclick={scrollPrev}
    >
        <Fa icon={faArrowLeft}/>
    </button>

  <!-- Thumbnails Carousel -->
  <div 
    class="overflow-hidden mx-4 w-full"
    use:emblaCarouselSvelte={{options: thumbOptions}}
    onemblaInit={onThumbsInit}
  >
    <div class="flex p-1 space-x-2">
      {#each mediaItems as item, index}
        <button 
          class="flex-[0_0_20%] min-w-0 transition-opacity duration-300 cursor-pointer p-1 rounded-md"
          onclick={() => onThumbClick(index)}
        >
          <div class="flex relative justify-center items-center aspect-video">
            {#if item.type === 'image'}
              <img 
                src={item.src} 
                alt={`Thumbnail ${item.alt}`} 
                class={cx(
                  "object-contain max-w-full max-h-full rounded-lg border-2 transition-all duration-200",
                  (!emblaApi || currentSlide !== index) && 'border-zinc-800/80 hover:border-zinc-400',
                  (emblaApi && currentSlide === index) && 'border-zinc-800/0 hover:border-zinc-400/0'
                  )}
                onerror={(e) => handleMediaError(e, index)}
              />
            {:else if item.type === 'video'}
              <div 
                class={cx(
                  "flex relative justify-center items-center w-full h-full rounded-lg border-2 bg-gray-800/10",
                  (!emblaApi || currentSlide !== index) && 'border-zinc-600/80 hover:border-zinc-400',
                  (emblaApi && currentSlide === index) && 'border-zinc-800/0 hover:border-zinc-400/0'
                  )}
              >
                <Fa icon={faPlayCircle} class="text-3xl"/>
              </div>
            {/if}
          </div>
        </button>
      {/each}

    </div>

  </div>

    <button 
      class="z-10 p-2 my-3 text-gray-600 border-2 shadow-md transition-all duration-150 cursor-pointer border-slate-900 hover:bg-slate-800/10 hover:border-slate-950"
      onclick={scrollNext}
    >
        <Fa icon={faArrowRight}/>
    </button>

    </div>
{/if}
</div>