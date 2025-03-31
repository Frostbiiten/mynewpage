<script>
    import {page} from '$app/state'
    import cx from 'clsx';
    import Fa from 'svelte-fa';
    import { faAsterisk } from '@fortawesome/free-solid-svg-icons'

    const images = import.meta.glob('/src/lib/assets/gallery/*.{jpg,png,webp}', {
        eager: true,
        import: 'default',
    });

    const imageList = Object.values(images);
    /*

        <p class="font-mono text-4xl text-left scale-y-50 w-7xl text-slate-800/80">
            ▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░
        </p>
        {#each { length: 15 }, i}
            <div style="opacity: {1.0 / Math.pow(i + 1, 1.7)}" class={cx(`w-10 h-full bg-slate-100`)}></div>
        {/each}
    */
</script>

<div class="flex flex-col justify-center items-center mx-8 mt-14 mb-8" style="view-transition-name: header;">
    <div class="flex flex-col gap-2 items-stretch w-full max-w-7xl">
        <div class="flex flex-row gap-6 items-center text-xl select-none text-blue-400/60">
            <Fa class="text-blue-400/80" icon={faAsterisk}></Fa>
            <a
            href="/"
            class={cx('transition-all duration-200',
                page.url.pathname === '/' && 'text-slate-300 font-bold'
                )}>Home</a>
            <a
            href="/projects"
            class={cx('transition-all duration-200',
                page.url.pathname.startsWith('/projects') && 'text-slate-300 font-bold'
                )}>Projects</a>
            <a
            href="/blog"
            class={cx('transition-all duration-200',
                page.url.pathname.startsWith('/blog') && 'text-slate-300 font-bold'
                )}>Blog</a>
            <a
            href="/creative"
            class={cx('transition-all duration-200',
                page.url.pathname.startsWith('/creative') && 'text-slate-300 font-bold'
                )}>Creative</a>
        </div>

        <div class="flex-none pt-3 max-w-7xl h-10 text-3xl overflow-clip bg-gradient-to-r scale-y-50 select-none via-blue-800/30 to-violet-800/0 grow from-blue-600/40 text-slate-950">
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
    </div>
</div>

