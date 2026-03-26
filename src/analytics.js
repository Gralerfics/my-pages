const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

function hasAnalytics() {
    return Boolean(measurementId)
}

export function initAnalytics() {
    if (typeof window === 'undefined' || !hasAnalytics()) {
        return false
    }

    return typeof window.gtag === 'function'
}

export function trackPageView({ pageTitle, pagePath, pageLocation } = {}) {
    if (typeof window === 'undefined' || !hasAnalytics() || typeof window.gtag !== 'function') {
        return
    }

    window.gtag('event', 'page_view', {
        page_title: pageTitle ?? document.title,
        page_path: pagePath ?? `${window.location.pathname}${window.location.hash}`,
        page_location: pageLocation ?? window.location.href,
    })
}
