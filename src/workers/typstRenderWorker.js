import { FetchAccessModel } from '@myriaddreamin/typst.ts'
import { TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import { configureTypstWasm } from '../typst/configureTypstWasm'

const snippetCache = new Map()

function getSnippet(bundleBase, fontUrls) {
    const cacheKey = `${bundleBase}::${fontUrls.join('|')}`
    if (snippetCache.has(cacheKey)) {
        return snippetCache.get(cacheKey)
    }

    const accessModel = new FetchAccessModel(bundleBase, {
        fullyCached: true,
    })
    const snippet = new TypstSnippet()
    snippet.use(
        TypstSnippet.preloadFonts(fontUrls),
        TypstSnippet.withAccessModel(accessModel),
        TypstSnippet.fetchPackageRegistry(accessModel),
    )

    const instance = { snippet }
    snippetCache.set(cacheKey, instance)
    return instance
}

self.onmessage = async (event) => {
    const { id, bundleBase, entryPath, fontUrls } = event.data ?? {}

    if (!id || !bundleBase || !entryPath || !Array.isArray(fontUrls)) {
        self.postMessage({
            id,
            ok: false,
            error: 'Invalid typst render request.',
        })
        return
    }

    try {
        configureTypstWasm()
        const { snippet } = getSnippet(bundleBase, fontUrls)
        const svg = await snippet.svg({
            mainFilePath: entryPath,
        })

        self.postMessage({
            id,
            ok: true,
            svg,
        })
    }
    catch (error) {
        self.postMessage({
            id,
            ok: false,
            error: error instanceof Error ? error.message : 'Failed to render Typst contents',
        })
    }
}
