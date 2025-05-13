export const load = ({ params }) => {
    return {
        slug: params.slug
    }
}

import p_data from "$lib/data/projects.json"
export const entries = p_data.projects.map(p => `/projects/${p.name}`);
console.log(entries)