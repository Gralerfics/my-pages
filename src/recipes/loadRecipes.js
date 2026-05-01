const metaModules = import.meta.glob('./*/meta.{json,js}', {
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

const assetModules = import.meta.glob('./*/assets/*', {
    eager: true,
    import: 'default',
})

const recipeEntries = Object.entries(metaModules).map(([path, meta]) => {
    const slug = path.split('/')[1]
    const explicitCover = meta.cover ? assetModules[`./${slug}/${meta.cover}`] : null

    return {
        slug,
        ...meta,
        cover: explicitCover
            ?? coverModules[`./${slug}/cover.png`]
            ?? coverModules[`./${slug}/cover.jpg`]
            ?? coverModules[`./${slug}/cover.jpeg`]
            ?? coverModules[`./${slug}/cover.webp`]
            ?? coverModules[`./${slug}/cover.gif`]
            ?? null,
        pageComponent: pageModules[`./${slug}/Page.vue`],
    }
})

export const recipes = recipeEntries.sort((left, right) => {
    const leftPriority = left.priority ?? 0
    const rightPriority = right.priority ?? 0

    if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority
    }

    return left.title.localeCompare(right.title)
})
