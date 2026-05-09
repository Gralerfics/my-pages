const metaModules = import.meta.glob('./*/meta.{json,js}', {
    eager: true,
    import: 'default',
})

const pageModules = import.meta.glob('./*/Page.vue', {
    eager: true,
    import: 'default',
})

const assetModules = import.meta.glob('./*/assets/*', {
    eager: true,
    import: 'default',
})

const coverModules = import.meta.glob('./*/cover.*', {
    eager: true,
    import: 'default',
})

const normalizeGroups = (meta) => {
    if (Array.isArray(meta.groups)) {
        return meta.groups
    }

    if (meta.group) {
        return [meta.group]
    }

    return []
}

const toolEntries = Object.entries(metaModules).map(([path, meta]) => {
    const slug = path.split('/')[1]
    const explicitCover = meta.cover ? assetModules[`./${slug}/${meta.cover}`] : null

    return {
        slug,
        ...meta,
        groups: normalizeGroups(meta),
        tags: meta.tags ?? [],
        subtitle: meta.subtitle ?? meta.summary ?? '',
        intro: meta.intro ?? meta.summary ?? meta.subtitle ?? '',
        cover: explicitCover
            ?? coverModules[`./${slug}/cover.png`]
            ?? coverModules[`./${slug}/cover.jpg`]
            ?? coverModules[`./${slug}/cover.jpeg`]
            ?? coverModules[`./${slug}/cover.webp`]
            ?? coverModules[`./${slug}/cover.gif`]
            ?? null,
        pageComponent: pageModules[`./${slug}/Page.vue`] ?? null,
    }
})

export const tools = toolEntries.sort((left, right) => {
    const leftPriority = left.priority ?? 0
    const rightPriority = right.priority ?? 0

    if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority
    }

    return String(left.title).localeCompare(String(right.title))
})

export const toolTabs = Array.from(new Set(tools.flatMap((tool) => tool.groups))).sort(
    (left, right) => left.localeCompare(right),
)
