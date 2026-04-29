<script>
  import { base } from "$app/paths";
  import { onMount, onDestroy } from "svelte";
  import {
    faDiscord,
    faGithub,
    faLinkedinIn,
    faTwitter,
  } from "@fortawesome/free-brands-svg-icons";
  import {
    faAt,
    faSquareArrowUpRight,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import cx from "clsx";

  // categories
  import creativeImg from "$lib/img/categories/creative.webp";
  import blogImg from "$lib/img/categories/blog.webp";
  import projectImg from "$lib/img/categories/project.webp";
  import windowIcons from "$lib/img/projects/windowicons.svg";

  // logos
  import psLogo from "$lib/img/playstation.svg";
  import eaLogo from "$lib/img/ea.svg";

  const images = import.meta.glob("$lib/img/projects/*", { eager: true });

  // mouse (will update later to merge with bg mouseState)
  let targetX = 0,
    targetY = 0;
  let smoothX = $state(0);
  let smoothY = $state(0);
  let scroll = $state(0);

  let windowWidth = 1000,
    windowHeight = 1000;
  function updateMouse(e) {
    targetX = (e.x / windowWidth - 0.5) * 2;
    targetY = (e.y / windowHeight - 0.5) * 2;
  }

  const windowResize = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };

  let rafId = $state(null);
  let isMobile = $state(false);
  let browser = $state(false);

  const easeInOutCubic = (x) => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  const animate = () => {
    smoothX += (targetX - smoothX) * 0.039;
    smoothY += (targetY - smoothY) * 0.039;
    rafId = requestAnimationFrame(animate);
  };

  // Figure stuff
  import figure from "$lib/img/figure/0.webp";
  import talkSoundFile from "$lib/sound/talk.mp3";
  import talkSoundFile2 from "$lib/sound/boop.mp3";
  let characterhover = $state(false);
  let talkSound;
  let talkSound2;

  let figureWidth = $state(0);
  let figureHeight = $state(0);
  const figureDummyLoad = (e) => {
    figureWidth = e.target.naturalWidth;
    figureHeight = e.target.naturalHeight;
  };

  const figureTalk = () => {
    talkSound.currentTime = 0;
    talkSound.play();
    talkSound2.currentTime = 0;
    talkSound2.play();
    characterhover = true;
  };
  const figureTalkEnd = () => {
    characterhover = false;
  };

  let infoText = $state("");
  const infoStatements = {
    projects: "check out the cool projects i have been working on !",
    blog: "wip (coming soon)",
    creative: "check out my non-programming creative works !",
  };

  const setInfo = (key) => {
    infoText = infoStatements[key];
  };
  const clearInfo = () => {
    infoText = "";
  };

  onMount(() => {
    isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android/i.test(navigator.userAgent);
    browser = true;

    talkSound = new Audio(talkSoundFile);
    talkSound.volume = 0.1;

    talkSound2 = new Audio(talkSoundFile2);
    talkSound2.volume = 0.1;

    window.addEventListener("mousemove", updateMouse, { passive: true });
    window.addEventListener("resize", windowResize, { passive: true });
    windowResize();

    rafId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    if (!browser) return;

    window.removeEventListener("mousemove", updateMouse);
    window.removeEventListener("resize", windowResize);
    if (rafId) cancelAnimationFrame(rafId);
  });

  let msgCount = 0;
  let messages = $state([]);
  function addMsg(msg) {
    const id = ++msgCount;
    messages.push({ id, msg });

    setTimeout(() => {
      messages = messages.filter((msg) => msg.id !== id);
    }, 3500);
  }

  // Background
  import PixiCanvas from "$lib/components/pixicanvas.svelte";
  import { mountHeroBackground } from "$lib/gfx/scenes/heroBackground.js";
  import { mountHeroFigure } from "$lib/gfx/scenes/figureCanvas.js";

  // Managed by heroBackground
  const mouseState = {
    smoothX: 0,
    smoothY: 0,
    targetX: 0,
    targetY: 0,
    dist01: 1,
    screenDist01: 1,
  };

  let heroFigure;
  let heroBackground;

  $effect(() => {
    const hover = characterhover;
    if (heroFigure?.setHover) {
      heroFigure.setHover(hover);
    }
    if (heroBackground?.setHover) {
      heroBackground.setHover(hover);
    }
  });
</script>

<svelte:head>
  <title>Edem's World</title>
  <meta
    name="description"
    content="Welcome to my site! Visit the projects page to view my past works."
  />
  <meta
    name="keyword"
    content="portfolio, cs, se, c++, c#, java, python, game, developer"
  />
  <meta
    name="keywords"
    content="portfolio, cs, se, c++, c#, java, python, game, developer"
  />
  <meta name="author" content="Edem Hoggar" />

  <meta property="og:title" content="Edem's World" />
  <meta
    property="og:description"
    content="Welcome to my site! Visit the projects page to view my past works."
  />
  <meta property="og:image" content="https://edem.ca/cloudsbg.webp" />
  <meta property="og:url" content="https://edem.ca" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Edem's World" />
  <meta
    name="twitter:description"
    content="Welcome to my site! Navigate to Projects to view my past works."
  />
  <meta name="twitter:image" content="https://edem.ca/cloudsbg.jpg" />
</svelte:head>

<svelte:window bind:scrollY={scroll} />

<div
  class="hidden absolute z-0 justify-center -mt-10 w-full overflow-clip select-none h-250 md:flex"
>
  <div class="relative h-250 w-7xl">
    <div
      class="absolute left-0 opacity-10 h-50 w-50 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:48px_48px] will-change-transform"
      style="transform: translate3d({smoothX * -30 - 400}px, {smoothY * -30 +
        180}px, 0);"
    ></div>

    <div
      class="absolute left-0 opacity-15 h-24 w-50 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:52px_52px] blur-sm will-change-transform"
      style="transform: translate3d({smoothX * -100 - 500}px, {smoothY * -100 +
        480}px, 0);"
    ></div>

    <div
      class="absolute left-0 opacity-15 h-24 w-50 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:48px_48px] blur-xs will-change-transform"
      style="transform: translate3d({smoothX * -35 - 800}px, {smoothY * -35 +
        280}px, 0);"
    ></div>

    <div
      class="absolute left-0 opacity-15 h-20 w-20 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:52px_52px] blur-md will-change-transform"
      style="transform: translate3d({smoothX * -30 - 700}px, {smoothY * -30 +
        580}px, 0);"
    ></div>

    <div
      class="absolute left-0 opacity-5 h-50 w-80 bg-[radial-gradient(#e5e7eb_2px,transparent_1px)] [background-size:36px_36px] will-change-transform"
      style="transform: translate3d({smoothX * -9 - 580}px, {smoothY * -9 +
        280}px, 0);"
    ></div>

    <div
      class="absolute left-0 opacity-15 h-130 w-120 bg-[radial-gradient(#6a707d_2px,transparent_1px)] [background-size:38px_38px] blur-xs will-change-transform"
      style="transform: translate3d({smoothX * -6 - 400}px, {smoothY * -6 +
        280}px, 0);"
    ></div>


    <div
      class="absolute right-0 opacity-15 h-24 w-50 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:52px_52px] blur-sm will-change-transform"
      style="transform: translate3d({smoothX * -100 + 400}px, {smoothY * -100 +
        280}px, 0);"
    ></div>

    <div
      class="absolute right-0 opacity-15 h-24 w-50 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:48px_48px] blur-xs will-change-transform"
      style="transform: translate3d({smoothX * -35 + 400}px, {smoothY * -35 +
        480}px, 0);"
    ></div>

    <div
      class="absolute right-0 opacity-15 h-20 w-20 bg-[radial-gradient(#e5e7eb_4px,transparent_1px)] [background-size:52px_52px] blur-md will-change-transform"
      style="transform: translate3d({smoothX * -30 + 700}px, {smoothY * -30 +
        380}px, 0);"
    ></div>

    <div
      class="absolute right-0 opacity-5 h-50 w-80 bg-[radial-gradient(#e5e7eb_2px,transparent_1px)] [background-size:36px_36px] will-change-transform"
      style="transform: translate3d({smoothX * -9 + 580}px, {smoothY * -9 +
        380}px, 0);"
    ></div>

    <div
      class="absolute right-0 opacity-15 h-130 w-120 bg-[radial-gradient(#6a707d_2px,transparent_1px)] [background-size:38px_38px] blur-xs will-change-transform"
      style="transform: translate3d({smoothX * -6 + 400}px, {smoothY * -6 +
        280}px, 0);"
    ></div>
  </div>
</div>

<div class="flex flex-col items-center -mt-5 w-full">
  <div
    class="flex flex-col gap-5 justify-center items-center px-8 w-full max-w-7xl md:gap-7"
  >
    <div
      class="z-2 img relative w-full h-[40rem] md:h-[40rem] rounded-md md:rounded-xl select-none border-2 border-slate-800/40 overflow-clip bg-clip-padding"
    >
      <div class="w-full h-full bg-zinc-950/90">
        <PixiCanvas
          transparent={false}
          onReady={(app) => {
            heroBackground = mountHeroBackground(app, mouseState);
          }}
        />
      </div>

      <div
        class="translate-x-[calc(12rem-5%)] translate-y-65 md:translate-y-0 md:translate-x-[calc(41rem-50%)] absolute top-0 left-0 z-50 w-full h-full origin-bottom-right scale-130"
        style="transform: translate3d({mouseState.smoothX *
          -2.4}%, {mouseState.smoothY * -13 + 30}px, 0) scale({0.3 *
          (1 - mouseState.dist01 * 0.02)}); filter: blur({easeInOutCubic(
          Math.max(0, mouseState.dist01 - 0.6) * 2,
        ) * 0}px)"
      >
        <div
          class={cx(
            "absolute translate-x-[-60%] right-0 bottom-0 p-12 rounded-[3rem] outline-black",
          )}
        >
          <button
            class="absolute top-[5%] left-[35%] w-[30%] h-[90%] z-400"
            onfocus={figureTalk}
            ontouchstart={figureTalk}
            onmouseover={figureTalk}
            onblur={figureTalkEnd}
            ontouchend={figureTalkEnd}
            onmouseleave={figureTalkEnd}
            aria-label="Figure"
            tabindex="0"
          ></button>

          <div
            class={cx(characterhover && "boop-anim", "relative")}
            style="width: {figureWidth}px; height: {figureHeight}px;"
          >
            <div
              class="absolute left-1/2 top-1/2 w-[150%] h-[150%] -scale-x-100 -translate-x-1/2 -translate-y-1/2"
            >
              <PixiCanvas
                onReady={(app) => {
                  heroFigure = mountHeroFigure(app, mouseState, characterhover);
                }}
              />
            </div>
          </div>
        </div>

        <div
          class="absolute flex items-center z-[430] top-0 right-0 w-20 h-80 -translate-x-1/2 translate-y-[-150%] pointer-events-none"
          style="transform: translate({smoothX * -30 - 1000}px, {smoothY *
            -30}px)"
        >
          <div
            class={cx(
              "absolute origin-right right-[100%] transition-transform duration-700 ease-[cubic-bezier(0, 1, 0, 1)]",
              characterhover &&
                "translate-y-[calc(-50rem)] translate-x-[calc(41rem-15%)] md:translate-y-0 md:-translate-x-40",
              !characterhover && "translate-x-60 md:translate-x-55",
            )}
          >
            <div
              class={cx(
                "w-40 h-20 bg-zinc-950/90 md:max-h-[84rem] overflow-clip transition-all rounded-[1rem] md:rounded-[3rem] border-3 duration-300 ease-[cubic-bezier(1,0,0,1)]",
                characterhover && "w-[165vw] md:w-[80rem] h-fit",
              )}
            >
              <p
                class={cx(
                  "absolute translate-y-1/2 -mt-14 w-full transition-[opacity] duration-300 h-full text-7xl align-middle text-center",
                  characterhover && "opacity-0",
                )}
              >
                ...
              </p>

              <div
                aria-hidden="true"
                class={cx(
                  "overflow-clip rounded-4xl leading-relaxed text-4xl px-7 py-8 md:text-5xl transition-[opacity, font-size, line-height] duration-400 md:px-20 md:py-15",
                  characterhover && "opacity-100 ease-out delay-300 ",
                  !characterhover && "opacity-0 ease-in delay-0",
                )}
              >
                Welcome to my world of interesting projects! Please feel free to
                look around.

                <br />
                <br />

                This website is in a rather early state, so please report any
                bugs you come across to @edemh on discord. Please note I also go
                by
                <span class="font-black text-blue-500">
                  {#each "Frostbiiten!" as char, i}
                    <span
                      class="inline-block animate-wave"
                      style="animation-delay: {-i * 50}ms"
                    >
                      {char}
                    </span>
                  {/each}
                </span>
                in some circles.

                <br />
                <br />

                I'm currently working on some 
                <strong>C++</strong> projects. They'll be added to the projects page
                soon!
              </div>
            </div>
          </div>
        </div>

        <img
          class="absolute right-0 opacity-0 pointer-events-none figure"
          src={figure}
          alt="Dummy"
          onload={figureDummyLoad}
        />
      </div>

      <div class="absolute top-0 left-0 w-full h-full">
        <div class="relative z-0 w-full h-full">
          <div class="top-0 left-0 p-7 w-full h-full md:absolute md:p-12">
            <div
              class={cx(
                "font-mono h-fit flex flex-col relative z-[30] select-none transition-all duration-200",
                !characterhover && "opacity-100",
                characterhover && "opacity-0",
              )}
            >
              <h1 class="z-40 text-7xl font-bold md:text-8xl">
                {#each Array.from("Edem") as char, index}
                  <span
                    class="inline-block animate-text-reveal"
                    style="animation-delay: {index * 0.05 -
                      0.5}s; animation-fill-mode: backwards;"
                  >
                    {@html char === " " ? "&nbsp;" : char}
                  </span>
                {/each}
              </h1>

              <h2
                class="z-40 px-1 text-lg md:text-2xl transition-all tracking-[0.2em] md:tracking-[0.3em] text-stone-300 md:text-slate-500"
              >
                Hoggar
              </h2>

              <div class="h-full md:h-5"></div>

              <div
                class="w-[calc(100%+1rem)] -mx-2 mt-7 font-mono rounded-md backdrop-blur-[5px] bg-slate-900/70 backdrop-saturate-130 backdrop-brightness-200 md:hidden shadow-[inset_0px_1px_4px_rgba(230,200,250,0.8),inset_0px_20px_20px_rgba(0,0,30,0.3)]"
              >
                <div
                  class="flex items-center p-[0.6rem] px-4 w-full border-blue-900/20 bg-slate-900/40 rounded-t-md border-b-1"
                >
                  <a
                    href="https://cs.uwaterloo.ca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center transition-all text-stone-200"
                  >
                    CS @ UW
                  </a>
                  <div class="grow"></div>
                  <img
                    class="h-full opacity-70 saturate-0 brightness-500"
                    src={windowIcons}
                    alt="windowmanip"
                  />
                </div>
                <p class="text-[0.9rem] leading-loose text-stone-100 p-4 py-3">
                  <strong class="inline"></strong>
                  Seeking Fall 2025 Software Dev roles. Find contacts below for any
                  inquiries.
                </p>
              </div>

              <div
                class="py-3 hidden md:block tracking-[0.02em] leading-10 font-mono px-4 mt-6 w-90 text-sm md:text-[1rem] md:w-130 text-slate-300 rounded-sm bg-zinc-950/[0.0] h-60"
              >
                <div class="space-y-1">
                  <p class="flex flex-row flex-wrap items-center">
                    Third Year <strong class="pl-2">CS </strong>&nbsp;@
                    <a
                      href="https://cs.uwaterloo.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex z-40 flex-row gap-2 items-center px-1 pl-3 font-bold transition-all md:text-sky-600 md:group-hover:text-sky-500 group"
                    >
                      <span class="tracking-widest duration-200 text-nowrap transition-color md:group-hover:text-sky-500">
                        University of Waterloo
                      </span>

                      <Fa
                        class="-mx-0.5 ease-[cubic-bezier(0.1,2.2,0.1,1)] duration-300 scale-90 group-hover:scale-105 md:group-hover:text-blue-300"
                        icon={faSquareArrowUpRight}
                      />
                    </a>
                  </p>

                  {#snippet experience({ time, role, company, href, logo })}
                    <div class="flex flex-row flex-wrap items-center">
                      <div class="leading-none text-slate-500 h-min">
                        {time}
                      </div>

                      <span class="mr-3 ml-2 border-3 border-l-0 border-b-0 border-gray-400 [transform:rotate(45deg)] size-2"></span>

                      <span class="mr-2 text-slate-100">{role}</span>@

                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex z-40 flex-row gap-2 items-center px-1 pl-3 font-bold transition-all md:text-sky-600 md:group-hover:text-sky-500 group"
                      >
                        <span class="flex flex-row gap-2 items-center tracking-widest duration-200 text-nowrap transition-color md:group-hover:text-sky-500">
                          {@render logo()}
                          {company}
                        </span>

                        <Fa
                          class="-mx-0.5 ease-[cubic-bezier(0.1,2.2,0.1,1)] duration-300 scale-90 group-hover:scale-105 md:group-hover:text-blue-300"
                          icon={faSquareArrowUpRight}
                        />
                      </a>
                    </div>
                  {/snippet}

                  {#snippet microsoftLogo()}
                    <div
                      class="size-[1rem] shrink-0"
                      aria-label="Microsoft logo"
                      title="Microsoft"
                    >
                      <svg
                        viewBox="0 0 21 21"
                        xmlns="http://www.w3.org/2000/svg"
                        class="block size-full"
                        role="img"
                      >
                        <rect x="0" y="0" width="10" height="10" fill="#f25022" />
                        <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
                        <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
                        <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
                      </svg>
                    </div>
                  {/snippet}

                  {#snippet playStationLogo()}
                    <div
                      class="size-[1.05rem] mx-[-0.03rem]"
                      aria-label="PlayStation Studios logo"
                      title="PlayStation Studios"
                    >
                      <img
                        src={psLogo}
                        alt="PlayStation Studios"
                        class="block object-contain pb-1 w-6 h-5"
                      />
                    </div> 
                  {/snippet}

                  {#snippet electronicArtsLogo()}
                    <div
                      class="size-[1.05rem] mx-[-0.03rem]"
                      aria-label="PlayStation Studios logo"
                      title="PlayStation Studios"
                    >
                      <img
                        src={eaLogo}
                        alt="Electronic Arts"
                        class="block object-contain pb-1 w-6 h-5"
                      />
                    </div> 
                  {/snippet}

                  {@render experience({
                    time: "F26",
                    role: "SWE",
                    company: "Microsoft",
                    href: "https://www.microsoft.com/",
                    logo: microsoftLogo
                  })}

                  {@render experience({
                    time: "S26",
                    role: "SWE",
                    company: "PlayStation",
                    href: "https://www.playstation.com/",
                    logo: playStationLogo
                  })}

                  {@render experience({
                    time: "F26",
                    role: "SWE",
                    company: "Electronic Arts",
                    href: "https://www.ea.com/",
                    logo: electronicArtsLogo
                  })}



                  <p>
                    Seeking <span class="font-sans font-bold text-slate-100">Summer 2027</span> Software Engineering roles. Check out my contacts below for any inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full md:h-min z-100">
        <div
          class={cx(
            "text-xl z-40 gap-3 flex flex-row relative bottom-0 md:bg-none bg-linear-to-t from-zinc-950 left-0 duration-200 md:gap-[0.35rem] items-start md:items-end md:p-8 md:px-[3.95rem] px-5 py-3 w-full md:text-xl text-stone-200 md:text-gray-400",
            !characterhover && "opacity-100",
            characterhover && "opacity-0",
          )}
        >
          <a
            aria-label="Visit my Github"
            href="https://github.com/Frostbiiten"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 transition-all duration-200 hover:text-sky-100"
          >
            <Fa icon={faGithub} />
          </a>

          <a
            aria-label="Visit my LinkedIn"
            href="https://www.linkedin.com/in/edem-hoggar/"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 transition-all duration-200 hover:text-sky-100"
          >
            <Fa icon={faLinkedinIn} />
          </a>

          <a
            aria-label="Visit my Twitter"
            href="https://x.com/frostbiiten"
            target="_blank"
            rel="noopener noreferrer"
            class="px-[0.28rem] py-2 transition-all duration-200 hover:text-sky-100"
          >
            <Fa icon={faTwitter} />
          </a>

          <button
            aria-label="Copy Discord"
            onclick={() => {
              addMsg("Discord Copied");
              navigator.clipboard.writeText("edemh");
            }}
            class="px-2 py-2 transition-all duration-200 cursor-pointer hover:text-sky-100"
          >
            <Fa icon={faDiscord} />
          </button>

          <button
            aria-label="Copy Email"
            onclick={() => {
              addMsg("Email Copied");
              navigator.clipboard.writeText("edemkhoggar@gmail.com");
            }}
            class="px-1 py-2 transition-all duration-200 cursor-pointer hover:text-sky-100"
          >
            <Fa icon={faAt} />
          </button>
        </div>
      </div>
    </div>

    <div
      class="z-2 flex bg-zinc-950 gap-3 border-0 md:gap-0 relative duration-200 transition-[border-color] flex-col md:flex-row w-full max-w-7xl h-[39vh] md:h-72 md:overflow-clip rounded-xl md:border-2 select-none border-blue-950/50 hover:border-blue-700/40"
    >
      <a
        onfocus={() => {
          setInfo("projects");
        }}
        onmouseover={() => {
          setInfo("projects");
        }}
        onblur={clearInfo}
        onmouseleave={clearInfo}
        href={base + "/projects"}
        class="md:h-full h-1/4 border-stone-800 border-2 md:border-0 rounded-md md:rounded-none relative group basis-1/3 transition-[flex-basis] duration-600 overflow-clip"
      >
        <img
          alt="project bg"
          src={projectImg}
          class="
						object-cover w-full h-full origin-top-left
						transition-[transform, opacity]
						scale-140 translate-x-[-30%] group-hover:translate-x-[-25%] group-focus:translate-x-[-25%] opacity-10 group-hover:opacity-100 group-focus:opacity-100
						duration-500 ease-[cubic-bezier(0.45,0,0,1)]"
        />
        <div
          class="absolute hidden md:block top-0 left-0 w-full h-full mix-blend-hard-light z-[2] transition-colors duration-400 bg-[linear-gradient(-30deg,_#09080F_-106%,_#182D97_95.51%)]"
        ></div>
        <h2
          class="absolute transition-[font-size, color] font-mono text-stone-200/50 md:text-indigo-400/50 md:group-hover:text-blue-600 group-focus:text-blue-600 z-[2] duration-600 top-4 left-6 text-[1.7rem]"
        >
          Projects
        </h2>
      </a>

      <a
        onfocus={() => {
          setInfo("blog");
        }}
        onmouseover={() => {
          setInfo("blog");
        }}
        onblur={clearInfo}
        onmouseleave={clearInfo}
        href={base + "/blog"}
        class="md:h-full h-1/4 border-stone-800 border-2 md:border-0 rounded-md md:rounded-none relative group basis-1/3 transition-[flex-basis] duration-600 overflow-clip"
      >
        <img
          alt="blog bg"
          class="
					object-cover w-full h-full origin-top-left
					transition-[transform, opacity]
					scale-145 translate-x-[-5%] group-hover:translate-x-0 group-focus:translate-x-0 opacity-10 group-hover:opacity-100 group-focus:opacity-100
					duration-500 ease-[cubic-bezier(0.45,0,0,1)]"
          src={blogImg}
        />
        <div
          class="
				absolute hidden md:block top-0 left-0 w-full h-full mix-blend-hard-light z-[2] transition-colors duration-400
				bg-[linear-gradient(52.89deg,_#09080F_-20%,_#1f3980_51%)]
				"
        ></div>
        <h2
          class="absolute transition-[font-size, color] font-mono text-stone-200/50 md:text-indigo-400/50 md:group-hover:text-blue-600 group-focus:text-blue-600 z-[2] duration-600 top-4 left-6 text-[1.7rem]"
        >
          Blog
        </h2>
      </a>

      <a
        onfocus={() => {
          setInfo("creative");
        }}
        onmouseover={() => {
          setInfo("creative");
        }}
        onblur={clearInfo}
        onmouseleave={clearInfo}
        href={base + "/creative"}
        class="md:h-full h-1/4 border-stone-800 border-2 md:border-0 rounded-md md:rounded-none relative group basis-1/3 transition-[flex-basis] duration-600 overflow-clip"
      >
        <img
          alt="creative bg"
          class="
					object-cover w-full h-full origin-top-left
					transition-[transform, opacity]
					scale-140 translate-x-[-5%] group-hover:translate-x-0 group-focus:translate-x-0 opacity-10 group-hover:opacity-100 group-focus:opacity-100
					duration-500 ease-[cubic-bezier(0.45,0,0,1)]"
          src={creativeImg}
        />
        <div
          class="
				absolute hidden md:block top-0 left-0 w-full h-full mix-blend-hard-light z-[2] transition-colors duration-400
				bg-[linear-gradient(52.89deg,_#09080F_-20%,_#182D97_95.51%)]
				"
        ></div>
        <h2
          class="absolute transition-[font-size, color] font-mono text-stone-200/50 md:text-indigo-400/50 md:group-hover:text-blue-600 group-focus:text-blue-600 z-[2] duration-600 top-4 left-6 text-[1.7rem]"
        >
          Creative
        </h2>
      </a>
    </div>

    <div
      class="flex relative flex-row gap-2 items-center w-full max-w-7xl select-none"
    >
      <p
        class={cx(
          "w-full pl-1 italic text-center hidden md:block md:text-left transition-colors",
          infoText
            ? "md:text-slate-400 text-stone-400"
            : "md:text-slate-500 text-stone-500",
        )}
      >
        {#if infoText}
          {infoText}
        {:else}
          Welcome to <span class="font-semibold">my world!</span> Feel free to click
          around and explore.
        {/if}
      </p>
    </div>
  </div>
</div>

<div class="flex fixed right-10 bottom-10 flex-col gap-3 z-9999999">
  {#each messages as msg, index (msg.id)}
    <div
      class="flex justify-center items-center font-mono overflow-clip rounded-md msg-appear w-50 bg-stone-900 text-stone-300"
    >
      <p class="">{msg.msg}</p>
    </div>
  {/each}
</div>

<style>
  @keyframes boop {
    0% {
      animation-timing-function: ease-out;
      transform: scaleX(1) scaleY(1);
    }
    30% {
      transform: scaleX(1.03) scaleY(0.95);
    }
    70% {
      animation-timing-function: ease-in;
      transform: scaleX(0.98) scaleY(1.02);
    }
    100% {
      transform: scaleX(1) scaleY(1);
    }
  }

  .boop-anim {
    animation: boop 0.4s forwards;
  }

  @keyframes wave {
    to {
      transform: translateY(-5px);
    }
  }
  .animate-wave {
    animation: wave 0.4s infinite alternate ease-in-out;
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

  @keyframes msg-appear {
    0% {
      height: 0rem;
    }
    20% {
      height: 3rem;
    }
    84% {
      height: 3rem;
    }
    100% {
      height: 0rem;
    }
  }

  .msg-appear {
    animation: msg-appear 2.5s cubic-bezier(0, 1, 0, 1) forwards;
  }
</style>
