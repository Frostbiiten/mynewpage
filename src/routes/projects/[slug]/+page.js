export const load = ({ params }) => {
    return {
        slug: decodeURIComponent(params.slug)
    }
}

import p_data from "$lib/data/projects.json"
export const entries = async () => {
  return p_data.projects.map(p =>
    ({"slug": `${encodeURIComponent(p.name)}`})
  )
};