const metaModules = import.meta.glob('./*/meta.json', {
  eager: true,
  import: 'default',
})

const pageModules = import.meta.glob('./*/Page.vue', {
  eager: true,
  import: 'default',
})

const coverModules = import.meta.glob('./*/cover.*', {
  eager: true,
  import: 'default',
})

const projectEntries = Object.entries(metaModules).map(([path, meta]) => {
  const slug = path.split('/')[1]
  const groups = Array.isArray(meta.groups)
    ? meta.groups
    : meta.group
      ? [meta.group]
      : []

  return {
    slug,
    ...meta,
    groups,
    cover: coverModules[`./${slug}/cover.png`]
      ?? coverModules[`./${slug}/cover.jpg`]
      ?? coverModules[`./${slug}/cover.jpeg`]
      ?? coverModules[`./${slug}/cover.webp`]
      ?? coverModules[`./${slug}/cover.svg`]
      ?? null,
    pageComponent: pageModules[`./${slug}/Page.vue`],
  }
})

export const projects = projectEntries.sort((left, right) => {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.title.localeCompare(right.title)
})

export const projectTabs = Array.from(new Set(projects.flatMap((project) => project.groups)))
