<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { FetchAccessModel } from '@myriaddreamin/typst.ts'
import { TypstSnippet } from '@myriaddreamin/typst.ts/contrib/snippet'
import { useI18n } from '../i18n/useI18n'
import { configureTypstWasm } from '../typst/configureTypstWasm'

const snippetCache = new Map()

const props = defineProps({
    bundleBase: {
        type: String,
        required: true,
    },
    entryPath: {
        type: String,
        default: null,
    },
})

const { t } = useI18n()
const svgMarkup = ref('')
const renderError = ref('')
const rootEl = ref(null)
let resizeObserver = null

function getSnippet(bundleBase) {
    if (snippetCache.has(bundleBase)) {
        return snippetCache.get(bundleBase)
    }

    const accessModel = new FetchAccessModel(bundleBase, {
        fullyCached: true,
    })
    const snippet = new TypstSnippet()
    snippet.use(
        TypstSnippet.preloadFonts([
            '/typst-fonts/msyh.ttc',
            '/typst-fonts/simhei.ttf',
        ]),
        TypstSnippet.withAccessModel(accessModel),
        TypstSnippet.fetchPackageRegistry(accessModel),
    )

    const instance = { snippet }
    snippetCache.set(bundleBase, instance)
    return instance
}

function sanitizeSvg(svg) {
    return svg
        .replace(/<a\b[^>]*>/g, '')
        .replace(/<\/a>/g, '')
        .replaceAll('cursor: pointer;', 'cursor: default;')
        .replaceAll('pointer-events: all;', 'pointer-events: none;')
}

const renderKey = computed(() => `${props.bundleBase}::${props.entryPath ?? ''}`)

let renderToken = 0

function syncSvgLayout() {
    const host = rootEl.value
    const svg = host?.querySelector('.typst-doc')
    if (!host || !svg) {
        return
    }

    const page = svg.querySelector('.typst-page')
    const bbox = page?.getBBox?.()
    const pageWidth = Number.parseFloat(
        page?.getAttribute('data-page-width')
        || svg.getAttribute('data-width')
        || svg.getAttribute('width')
        || '0',
    )
    if (!pageWidth) {
        return
    }

    if (bbox && Number.isFinite(bbox.height) && bbox.height > 0) {
        const padTop = 2
        const padBottom = 8
        const top = Math.max(0, bbox.y - padTop)
        const height = bbox.height + (bbox.y - top) + padBottom
        svg.setAttribute('viewBox', `0 ${top} ${pageWidth} ${height}`)
        svg.setAttribute('width', `${pageWidth}`)
        svg.setAttribute('height', `${height}`)
    }

    const availableWidth = host.clientWidth
    if (!availableWidth) {
        return
    }

    svg.style.width = `${availableWidth}px`
    svg.style.height = 'auto'
    svg.style.maxWidth = 'none'
}

onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
        syncSvgLayout()
    })

    if (rootEl.value) {
        resizeObserver.observe(rootEl.value)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
})

watch(
    renderKey,
    async () => {
        if (!props.entryPath) {
            svgMarkup.value = ''
            renderError.value = ''
            return
        }

        const token = ++renderToken

        try {
            configureTypstWasm()
            const { snippet } = getSnippet(props.bundleBase)
            const svg = await snippet.svg({
                mainFilePath: props.entryPath,
            })

            if (token !== renderToken) {
                return
            }

            svgMarkup.value = sanitizeSvg(svg)
            renderError.value = ''
            await nextTick()
            syncSvgLayout()
        }
        catch (error) {
            if (token !== renderToken) {
                return
            }

            svgMarkup.value = ''
            renderError.value = error instanceof Error ? error.message : t('common.typstError')
        }
    },
    { immediate: true },
)
</script>

<template>
    <div ref="rootEl" class="note-typst-document">
        <div v-if="svgMarkup" class="note-rendered-content" v-html="svgMarkup" />
        <pre v-else-if="renderError" class="note-rendered-error">{{ renderError }}</pre>
    </div>
</template>
