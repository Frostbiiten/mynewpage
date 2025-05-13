<script>
    import {page} from '$app/state'
    import cx from 'clsx';
    import Fa from 'svelte-fa';
    import { faAsterisk, faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
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

<div class="flex flex-col justify-center items-center px-12 mt-14 mb-14" style="view-transition-name: footer;">
    <div class="flex flex-col gap-6 justify-center items-stretch w-full max-w-7xl h-20 rounded-lg border-2 bg-zinc-950/85 border-slate-900/50">
        <div class="flex flex-row gap-6 items-center px-8 select-none text-md text-blue-200/60">
            <p>© {new Date().getFullYear()} <span class="text-slate-500">Edem Hoggar</span></p>
            <div class="grow"></div>

            <div class="flex items-center gap-[8px] text-gray-800">
                <a class="duration-200 hover:text-gray-500" href="https://cs.uwatering.com/#https://edem.ca?nav=prev"><Fa icon={faAngleLeft}/></a>
                <a href="https://cs.uwatering.com/#https://edem.ca" target="_blank">
                    <img class="w-[24px] duration-200 h-auto saturate-30 hover:brightness-150 pl-[3px] hue-rotate-220" src="https://cs.uwatering.com/icon.red.svg" alt="CS Webring"/>
                </a>
                
                <a class="duration-200 hover:text-gray-500" href="https://cs.uwatering.com/#https://edem.ca?nav=next"><Fa icon={faAngleRight}/></a>
            </div>

            <a
            target="_blank" rel="noopener noreferrer"
            href="https://github.com/Frostbiiten"
            class='flex hidden transition-all duration-200 translate-y-[-2px] hover:text-blue-400'><div class="grow"></div><Fa class="text-right" icon={faGithub}></Fa></a>
        </div>
    </div>
</div>

