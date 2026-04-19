<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from '../i18n/useI18n'

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
const isLoading = ref(false)
const rootEl = ref(null)
let resizeObserver = null
const baseUrl = import.meta.env.BASE_URL || '/'
let workerRequestId = 0

const renderWorker = new Worker(
    new URL('../workers/typstRenderWorker.js', import.meta.url),
    { type: 'module' },
)

function withBaseUrl(value) {
    if (!value || /^https?:\/\//.test(value)) {
        return value
    }

    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    const normalizedValue = value.replace(/^\/+/, '')
    return `${normalizedBase}${normalizedValue}`
}

function getFontUrls() {
    return [
        withBaseUrl('/typst-fonts/simkai.ttf'),
        withBaseUrl('/typst-fonts/simsun.ttc'),
        withBaseUrl('/typst-fonts/msyh.ttc'),
        withBaseUrl('/typst-fonts/simhei.ttf'),
    ]
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

function getPageWidth(svg) {
    const page = svg.querySelector('.typst-page')
    return Number.parseFloat(
        page?.getAttribute('data-page-width')
        || svg.getAttribute('data-width')
        || svg.getAttribute('width')
        || '0',
    )
}

function applySvgWidth() {
    const host = rootEl.value
    const svg = host?.querySelector('.typst-doc')
    if (!host || !svg) {
        return
    }

    const pageWidth = getPageWidth(svg)
    if (!pageWidth) {
        return
    }

    const availableWidth = host.clientWidth
    if (!availableWidth) {
        return
    }

    svg.style.width = `${availableWidth}px`
    svg.style.height = 'auto'
    svg.style.maxWidth = 'none'
}

function normalizeSvgViewBox() {
    const host = rootEl.value
    const svg = host?.querySelector('.typst-doc')
    if (!host || !svg) {
        return
    }

    const page = svg.querySelector('.typst-page')
    const bbox = page?.getBBox?.()
    const pageWidth = getPageWidth(svg)
    if (!bbox || !Number.isFinite(bbox.height) || bbox.height <= 0 || !pageWidth) {
        return
    }

    const originalViewBox = (svg.getAttribute('viewBox') || '')
        .trim()
        .split(/\s+/)
        .map((value) => Number.parseFloat(value))
    const originalTop = Number.isFinite(originalViewBox[1]) ? originalViewBox[1] : 0
    const top = originalTop - 6
    const padBottom = 12
    const height = Math.max(
        bbox.y + bbox.height + padBottom - top,
        bbox.height + padBottom,
    )

    svg.setAttribute('viewBox', `0 ${top} ${pageWidth} ${height}`)
    svg.setAttribute('width', `${pageWidth}`)
    svg.setAttribute('height', `${height}`)
}

function waitForPaint() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve)
        })
    })
}

onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
        applySvgWidth()
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
            isLoading.value = false
            return
        }

        const token = ++renderToken
        isLoading.value = true
        svgMarkup.value = ''
        renderError.value = ''

        try {
            await nextTick()
            await waitForPaint()

            if (token !== renderToken) {
                return
            }

            const requestId = ++workerRequestId
            const svg = await new Promise((resolve, reject) => {
                const handleMessage = (event) => {
                    const payload = event.data ?? {}
                    if (payload.id !== requestId) {
                        return
                    }

                    renderWorker.removeEventListener('message', handleMessage)
                    renderWorker.removeEventListener('error', handleError)

                    if (payload.ok) {
                        resolve(payload.svg)
                        return
                    }

                    reject(new Error(payload.error || t('common.typstError')))
                }

                const handleError = (event) => {
                    renderWorker.removeEventListener('message', handleMessage)
                    renderWorker.removeEventListener('error', handleError)
                    reject(new Error(event.message || t('common.typstError')))
                }

                renderWorker.addEventListener('message', handleMessage)
                renderWorker.addEventListener('error', handleError, { once: true })
                renderWorker.postMessage({
                    id: requestId,
                    bundleBase: props.bundleBase,
                    entryPath: props.entryPath,
                    fontUrls: getFontUrls(),
                })
            })

            if (token !== renderToken) {
                return
            }

            svgMarkup.value = sanitizeSvg(svg)
            renderError.value = ''
            isLoading.value = false
            await nextTick()
            normalizeSvgViewBox()
            applySvgWidth()
        }
        catch (error) {
            if (token !== renderToken) {
                return
            }

            svgMarkup.value = ''
            isLoading.value = false
            renderError.value = error instanceof Error ? error.message : t('common.typstError')
        }
    },
    { immediate: true },
)
</script>

<template>
    <div ref="rootEl" class="note-typst-document">
        <div v-if="isLoading" class="note-rendered-skeleton" aria-hidden="true">
            <div class="note-rendered-skeleton__line note-rendered-skeleton__line--title" />
            <div class="note-rendered-skeleton__line note-rendered-skeleton__line--full" />
            <div class="note-rendered-skeleton__line note-rendered-skeleton__line--medium" />
            <div class="note-rendered-skeleton__block" />
            <div class="note-rendered-skeleton__line note-rendered-skeleton__line--full" />
            <div class="note-rendered-skeleton__line note-rendered-skeleton__line--short" />
        </div>
        <div v-if="svgMarkup" class="note-rendered-content" v-html="svgMarkup" />
        <pre v-else-if="renderError" class="note-rendered-error">{{ renderError }}</pre>
    </div>
</template>
