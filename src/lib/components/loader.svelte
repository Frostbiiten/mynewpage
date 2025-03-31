<script>
    let { done } = $props();
    let baseFrequency2 = $state(0.05);
    let scale2 = $state(0.5);

    import shinji from "$lib/img/shinji.webp"
    import { fade, fly, scale } from "svelte/transition";

    $effect(() => {
        const interval = setInterval(() => {
        baseFrequency2 = 0.2 + Math.random() * 0.01;
        scale2 = 0.4 + Math.random() * 0.5;
    }, 400);

    return () => clearInterval(interval);
  });

  function bgGone(node, { duration = 200, easing = x => { return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; } }) {
    return {
      duration,
      easing,
      css: x => `
        aewtransform: scaleX(${x});
        opacity: ${x};
      `
    };
  }
</script>


<style>
  .grain::after {
    content: "";
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/9/9a/512x512_Dissolve_Noise_Texture.png");
    height: 600%;
    width: 600%;
    position: absolute;
    opacity: 0.1;
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


  @keyframes gridZoom {
    0% {
      transform: scale(1.5);
      animation-timing-function: cubic-bezier(0.99, 0, 0.01, 1);
    }
    100% {
      transform: scale(1);
    }
  }

  .grid-zoom {
    animation: gridZoom 1.7s forwards;
  }

  @keyframes textZoom {
    0% {
      opacity: 0;
    }

    16% {
      opacity: 0;
      transform: scale(1.6);
      animation-timing-function: cubic-bezier(0, 1, 0, 1);
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .text-zoom {
    animation: textZoom 5.5s forwards;
  }

  @keyframes scroll-grid {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(-25%, -25%);
    }
  }

  .animate-scroll-grid {
    animation: scroll-grid 20s linear infinite;
  }

  @keyframes scale-only {
    0% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes blur-opacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .shinji {
    animation:
      scale-only 0s cubic-bezier(0,1,0,1) forwards,
      blur-opacity 0s cubic-bezier(0.61, 1, 0.88, 1) 0.0s both;
  }

  @keyframes load-spin {
    0% {
      transform: rotate(0deg);
    }

    95% {
      transform: rotate(360deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .load-anim {
    animation: load-spin 1.8s cubic-bezier(0.506, -0.109, 0, 1) infinite;
  }

</style>

  {#if !done}
<div class="fixed inset-0 flex items-center justify-center z-[100] p-8 font-mono">

  <div class="absolute top-0 left-0 w-full h-full select-none">

  <div
    in:bgGone={{ start: 1, end: 0.1, duration: 300, delay: 500 }}
    out:bgGone={{ start: 1, end: 0.1, duration: 300, delay: 0 }}
    class="absolute top-0 left-0 w-full h-full origin-right">
    <div class="absolute top-0 left-0 w-full h-full bg-neutral-900"></div>

    <div class="flex overflow-hidden fixed inset-0 justify-center items-center grid-zoom" style="transform-origin: 30% 30%">
        <div class="absolute animate-scroll-grid opacity-40 w-[200%] h-[200%] bg-[length:30px_30px] bg-[linear-gradient(to_right,rgba(10,10,10,1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(10,10,10,1)_1px,transparent_1px)]"></div>

        <div class="
        absolute
        animate-scroll-grid
        opacity-30
        w-[200%]
        h-[200%]
        bg-[length:120px_120px]
        bg-[linear-gradient(to_right,rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,1)_1px,transparent_1px)]"></div>

      <div
      class="
        absolute
        animate-scroll-grid
        translate-[0px]
        opacity-1
        w-[200%]
        h-[200%]
        bg-[length:30px_30px]
        bg-[radial-gradient(rgba(255,255,255,1)_2px,transparent_1px)]
      "
    ></div>
    </div>
  </div>

    <div
      in:fade={{ duration: 300, delay: 500 }}
      out:fade={{ duration: 300, delay: 0 }}
      class="flex relative flex-col justify-center items-center w-full h-full text-zoom">
      <svg viewBox="0 0 40 10" class="pt-2 -mb-3 w-[40%] fill-zinc-100">
        <defs>
          <filter id="wf">
            <feTurbulence 
              type="turbulence" 
              baseFrequency={baseFrequency2} 
              numOctaves="2" 
              result="turbulence" />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="turbulence" 
              scale={scale2} 
              xChannelSelector="R" 
              yChannelSelector="G" />
          </filter>
        </defs>

        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="10"
          font-family="Space Grotesk"
          filter="url(#wf)"
        >
          edem's
        </text>

      </svg>

      <div class="flex gap-[2vw] font-sans pt-2  -mt-[1vw] pl-[1.5vw] pr-[3vw] w-[40%] z-[101] mix-blend-screen">
        <svg viewBox="0 0 40 10" class="-mb-3 w-[30%] fill-zinc-300">
          <defs>
            <filter id="wf2">
              <feTurbulence 
                type="turbulence" 
                baseFrequency={baseFrequency2 * 0.3} 
                numOctaves="1" 
                offset="3.2"
                result="turbulence" />
              <feDisplacementMap 
                in="SourceGraphic" 
                in2="turbulence" 
                scale={scale2 * 2.3} 
                xChannelSelector="R" 
                yChannelSelector="G" />
            </filter>
          </defs>

          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="14"
            font-family="Reenie Beanie"
            filter="url(#wf2)"
          >
            world
          </text>
        </svg>
        <div class="origin-top-left -ml-[4vw] scale-80">
          <p class="text-[4vw] text-blue-600 mix-blend-difference font-[Arial] text-center align-middle load-anim" style="transform-origin: 50% 35%;">*</p>
        </div>
      </div>
    </div>


  <svg width="0" height="0">
    <filter id="sketch">
      <feTurbulence 
        type="turbulence" 
        baseFrequency={baseFrequency2 * 0.1}
        numOctaves="2" 
        result="noise" />
      <feDisplacementMap 
        in="SourceGraphic" 
        in2="noise" 
        scale={scale2 * 10}
        xChannelSelector="R" 
        yChannelSelector="G" />
    </filter>
  </svg>

  <div class="absolute top-0 right-0 origin-top-right select-none shinji">
    <img src={shinji} class="top-0 right-0 opacity-0 scale-65" style="filter: brightness(0.14) url(#sketch);" alt="shinji-kun" />
  </div>

  </div>
</div>
  {/if}
