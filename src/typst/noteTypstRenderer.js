const baseUrl = import.meta.env.BASE_URL || '/'
const svgCache = new Map()
const inFlightRenders = new Map()

let renderWorker = null
let workerRequestId = 0

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

function getWorker() {
    if (!renderWorker) {
        renderWorker = new Worker(
            new URL('../workers/typstRenderWorker.js', import.meta.url),
            { type: 'module' },
        )
    }

    return renderWorker
}

function resetWorker() {
    renderWorker?.terminate()
    renderWorker = null
}

function getCacheKey(bundleBase, entryPath) {
    return `${bundleBase}::${entryPath}`
}

function postWorkerRequest(payload) {
    const worker = getWorker()
    const id = ++workerRequestId

    return new Promise((resolve, reject) => {
        const cleanup = () => {
            worker.removeEventListener('message', handleMessage)
            worker.removeEventListener('error', handleError)
            worker.removeEventListener('messageerror', handleMessageError)
        }

        const handleMessage = (event) => {
            const response = event.data ?? {}
            if (response.id !== id) {
                return
            }

            cleanup()
            if (response.ok) {
                resolve(response)
                return
            }

            reject(new Error(response.error || 'Failed to render Typst contents'))
        }

        const handleError = (event) => {
            cleanup()
            reject(new Error(event.message || 'Failed to render Typst contents'))
        }

        const handleMessageError = () => {
            cleanup()
            reject(new Error('Failed to receive Typst render result.'))
        }

        worker.addEventListener('message', handleMessage)
        worker.addEventListener('error', handleError, { once: true })
        worker.addEventListener('messageerror', handleMessageError, { once: true })
        worker.postMessage({
            id,
            fontUrls: getFontUrls(),
            ...payload,
        })
    })
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms)
    })
}

async function runWithRetry(task, retries = 1) {
    let lastError = null

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await task(attempt)
        }
        catch (error) {
            lastError = error
            resetWorker()
            if (attempt < retries) {
                await wait(180 + attempt * 220)
            }
        }
    }

    throw lastError
}

export function getCachedNoteSvg(bundleBase, entryPath) {
    return svgCache.get(getCacheKey(bundleBase, entryPath)) ?? ''
}

export function renderNoteTypst({ bundleBase, entryPath }) {
    const cacheKey = getCacheKey(bundleBase, entryPath)
    const cachedSvg = svgCache.get(cacheKey)
    if (cachedSvg) {
        return Promise.resolve(cachedSvg)
    }

    const inFlight = inFlightRenders.get(cacheKey)
    if (inFlight) {
        return inFlight
    }

    const renderPromise = runWithRetry(async () => {
        const response = await postWorkerRequest({
            type: 'render',
            bundleBase,
            entryPath,
        })
        svgCache.set(cacheKey, response.svg)
        return response.svg
    })
        .finally(() => {
            inFlightRenders.delete(cacheKey)
        })

    inFlightRenders.set(cacheKey, renderPromise)
    return renderPromise
}

export function preloadNoteTypst({ bundleBase, entryPath = null }) {
    if (entryPath && getCachedNoteSvg(bundleBase, entryPath)) {
        return Promise.resolve()
    }

    return postWorkerRequest({
        type: 'preload',
        bundleBase,
        entryPath,
    })
        .catch(() => {
            resetWorker()
        })
}
