<script>
    // Pass text as a STATE
    let { value = $bindable() } = $props();
    let focused = $state(false);

    import Fa from 'svelte-fa'
    import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
    import cx from 'clsx';
</script>

<style>
  .parent:has(.child:focus) {
    border-color: rgb(148 163 184 / 0.7);
  }
</style>


<div class={cx('parent', 
    'duration-200 ease-out transition-all bg-transparent rounded-lg border-2 border-slate-700 w-full',
    focused && 'border-slate-400/70'
    )}> 

    <div class="flex relative justify-end items-center w-full">
    <input
        class="child p-2 pl-12 w-full h-full bg-transparent placeholder:text-slate-600 outline-hidden!"
        type="text"
        placeholder="Search for a project or tag"
        onfocus={()=>{focused=true;}}
        onblur={()=>{focused=false;}}
        bind:value
    >
    <Fa icon={faMagnifyingGlass} class={cx(
        "absolute ease-out transition-all duration-100 left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 ",
        focused && 'text-blue-100/80',
        !focused && 'text-blue-300/60')} />
    </div>

</div>