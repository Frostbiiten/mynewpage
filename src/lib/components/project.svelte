<script>
    let { id, name, desc, tags, img, time} = $props();
    let date = new Date(time);
    let month = ((date.getMonth() + 1) % 12);
    let year = date.getFullYear();

    if (month < 4) month = "Winter";
    else if (month < 8) month = "Spring";
    else "Fall";


    // NOTE: selected should be a callback to set the
    // currently selected project with a callback in the parent

    // to print when these values are updated ..
    $inspect(name, desc, tags, img);

    // however, we can also do ... (idk if this works with multiple runes)
    $inspect(name).with((type, count) =>
    {
        // Print count and up
        console.log(`Trigger ${count} (${type})`);
    });
</script>

<!-- Full-width projects on mobile, otherwise, 2 in each ... grid should restrict this -->
<button class="p-5 w-full h-full text-left text-red-50 bg-slate-900"> 
<div class="flex justify-end w-full text-3xl">
    <h3>{name}</h3>
</div>
<p>desc {desc}</p>
<p>tags {tags}</p>
<p>img {img}</p>
<p>{year} {time}</p>
</button>