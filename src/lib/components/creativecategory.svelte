<!-- CreativeWorksItem.svelte -->
<script>
  // Correctly using $props and initializing state variables
  const props = $props();
  
  // Initialize state variables with default values
  let name = $state(props.name ?? '');
  let image = $state(props.image ?? '');
  let secondaryImage = $state(props.secondaryImage ?? null);
  let currentCategory = $state(props.currentCategory ?? null);
  let objectPosition = $state(props.objectPosition ?? '50% 50%');
  let hoverObjectPosition = $state(props.hoverObjectPosition ?? '35% 50%');
  let contrast = $state(props.contrast ?? '155');
  let additionalImageClasses = $state(props.additionalImageClasses ?? '');
  
</script>

  <img 
    class="object-cover contrast-{contrast} {additionalImageClasses} pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-500 object-[{objectPosition}] group-hover:object-[{hoverObjectPosition}] absolute top-0 left-0 h-full" 
    alt={name} 
    src={image}
  />
  
  {#if secondaryImage}
    <img 
      class="object-cover contrast-{contrast} pointer-events-none ease-[cubic-bezier(0.233,0.001,0,1.166)] duration-500 object-[{objectPosition}] group-hover:object-[{hoverObjectPosition}] absolute top-0 left-0 h-full opacity-0 group-hover:opacity-100" 
      alt={name} 
      src={secondaryImage}
    />
  {/if}
  
  <div class="absolute top-0 left-0 w-full h-full mix-blend-soft-light bg-blue-600/40"></div>
  <div class="absolute transition-colors duration-100 from-white/10 top-0 left-0 w-full h-full bg-gradient-to-t via-black/40 via-20% group-hover:from-white/80 to-40%"></div>
  <div class="absolute transition-colors mix-blend-hard-light duration-100 from-zinc-950/80 top-0 left-0 w-full h-full bg-gradient-to-t group-hover:from-blue-300 to-40%"></div>
  
  <h3 class="absolute text-lg tracking-widest group-hover:tracking-widest m-6 duration-400 ease-[cubic-bezier(0.0,1,0,1.0)] font-mono origin-bottom-left pointer-events-none group-hover:scale-[200%_200%] group-hover:font-black group-hover:text-slate-900">{name}</h3>