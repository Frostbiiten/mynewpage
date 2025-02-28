<script>
    import {page} from '$app/state'
    import cx from 'clsx';
    import Fa from 'svelte-fa';
    import { faAsterisk } from '@fortawesome/free-solid-svg-icons'
    import { faGit, faGithub } from '@fortawesome/free-brands-svg-icons'
    /*

        <p class="font-mono text-4xl text-left scale-y-50 w-7xl text-slate-800/80">
            ▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░
        </p>
        {#each { length: 15 }, i}
            <div style="opacity: {1.0 / Math.pow(i + 1, 1.7)}" class={cx(`w-10 h-full bg-slate-100`)}></div>
        {/each}
    */
</script>

<div class="flex flex-col justify-center items-center px-8 mt-14 mb-20" style="view-transition-name: footer;">
    <div class="flex flex-col gap-6 items-stretch w-full max-w-7xl">
        <div class="flex-none max-w-7xl h-[0.2rem] text-3xl overflow-cli bg-blue-400/50">
        </div>
        <div class="flex flex-row gap-6 items-center text-xl select-none text-blue-400/60">
            <p>{new Date().getFullYear()} © Edem Hoggar</p>
            <a
            target="_blank" rel="noopener noreferrer"
            href="https://github.com/Frostbiiten"
            class='flex transition-all duration-200 grow hover:text-blue-400'><div class="grow"></div><Fa class="text-right" icon={faGithub}></Fa></a>
        </div>
    </div>
</div>

