<script>
    // Pass text as a STATE
    let { value = $bindable() } = $props();
    let focused = $state(false);

    import Fa from 'svelte-fa'
    import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
    import cx from 'clsx';
</script>

<!-- Full-width projects on mobile, otherwise, 2 in each ... grid should restrict this -->
<div class={cx(
    "duration-200 ease-out transition-all bg-transparent rounded-lg border-2 border-slate-700 basis-1/2",
    focused && 'border-slate-400/70'
    )}> 

<div class="flex relative justify-end items-center w-2/3">
<input
    class="p-2 pl-12 w-full h-full bg-transparent outline-hidden!"
    type="text"
	placeholder="Search for a project or tag"
    onfocus={()=>{focused=true;}}
    onblur={()=>{focused=false;}}
    bind:value
>
<Fa icon={faMagnifyingGlass} class={cx(
    "absolute ease-out transition-all duration-100 left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400",
    focused && 'scale-110 text-slate-100')} />
</div>

</div>