<script>
    import {page} from '$app/state'
    import cx from 'clsx';
    import Fa from 'svelte-fa';
    import { faArrowLeft, faArrowRight, faAsterisk, faBold, faBook, faBrush, faDotCircle, faHome, faPalette, faPenToSquare, faSquarePen } from '@fortawesome/free-solid-svg-icons'
    import { base } from '$app/paths';

    const images = import.meta.glob('$lib/assets/gallery/*.{jpg,png,webp}', {
        eager: true,
        import: 'default',
    });

    const imageList = Object.values(images);

    let navMenu = $state(false);
</script>

<style>
    @keyframes hintFade
    {
        0% { opacity: 1;}
        80% { opacity: 1;}
        100% { opacity: 0;}
    }

    .hint {
        animation: hintFade 7s forwards;
        animation-iteration-count: 1;
    }
</style>

<div class="flex flex-col justify-center items-center mt-7 mb-8 md:mt-14" style="view-transition-name: header;">
    <div class="flex flex-col gap-2 items-stretch px-8 w-full max-w-7xl">
        <div class="flex flex-row gap-6 items-center text-xl select-none text-blue-400/60">
            <button class="cursor-pointer z-99998" onclick={() => {navMenu = true;}}>
                <Fa class="text-2xl text-blue-400/80 sm:text-xl" icon={faAsterisk}></Fa>
            </button>
            
            <p class={cx("gap-2 items-center hint text-sm sm:hidden", page.url.pathname === `${base}/` ? "inline-flex" : "hidden")}><Fa icon={faArrowLeft}></Fa>click me to navigate !</p>

            <div class="hidden flex-row gap-6 items-center sm:flex">
                <a
                href={base + "/"}
                class={cx(
                    'transition-all duration-200',
                    page.url.pathname === `${base}/` && 'text-slate-300 font-bold'
                )}>
                    Home
                </a>

                <a
                href={base + "/projects"}
                class={cx(
                    'transition-all duration-200',
                    page.url.pathname.startsWith(`${base}/projects`) && 'text-slate-300 font-bold'
                )}>
                    Projects
                </a>

                <a
                href={base + "/blog"}
                class={cx(
                    'transition-all duration-200',
                    page.url.pathname.startsWith(`${base}/blog`) && 'text-slate-300 font-bold'
                )}>
                    Blog
                </a>

                <a
                href={base + "/creative"}
                class={cx(
                    'transition-all duration-200',
                    page.url.pathname.startsWith(`${base}/creative`) && 'text-slate-300 font-bold'
                )}>
                    Creative
                </a>

                <a
                href={base + "/ok"}
                class={cx('transition-all duration-200 font-mono translate-y-[0.8px] rotate-90 scale-70 -ml-2 font-bold',
                    page.url.pathname.startsWith(`${base}/ok`) && 'text-slate-300 font-black'
                    )}>
                    OK
                </a>
            </div>
        </div>

        <div class="flex-none pt-3 max-w-7xl h-10 text-3xl overflow-clip bg-gradient-to-r scale-y-50 select-none via-blue-800/30 to-violet-800/0 grow from-blue-600/40 text-slate-950">
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
    </div>
</div>

<div class={cx("absolute w-full h-full transition-all duration-300 z-99999 text-stone-500", navMenu ? "backdrop-blur-xs bg-zinc-950/95 block" : "pointer-events-none")}>
    <div class="relative w-full h-full">
        <button class="absolute w-full h-full z-1" onclick={() => {navMenu = false;}}>
        </button>
        <div class={cx("absolute z-2 transition-all duration-300 ease-[cubic-bezier(0,1,0,1)] p-3 px-7 space-y-5 w-48 h-full bg-zinc-900", navMenu ? "left-0" : "left-[-100%]")}>
            <Fa class="mt-4 text-2xl text-stone-300" icon={faAsterisk}></Fa>
            <div class="flex flex-col gap-2 font-mono text-lg">
                {#snippet p(name, href)}
                <a onclick={() => {navMenu = false;}} href={`${base}/${href}`} class={cx("w-full h-8", (page.url.pathname.startsWith(`${base}/${href}`) && (href !== "" || page.url.pathname.endsWith(`${base}/${href}`))) ? "font-bold text-stone-600" : "text-stone-400")}>
                {name}
                </a>
                {/snippet}

                {@render p("home", "")}
                {@render p("projects", "projects")}
                {@render p("blog", "blog")}
                {@render p("creative", "creative")}
                {@render p("OK", "ok")}
            </div>
        </div>
    </div>
</div>