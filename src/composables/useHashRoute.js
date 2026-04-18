import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

function readHash(currentRoute = { name: 'home', slug: null, extra: [] }) {
    const rawHash = window.location.hash.replace(/^#\/?/, '')

    if (!rawHash) {
        return { name: 'home', slug: null, extra: [] }
    }

    if (/^loc-\d+x-?\d+(?:\.\d+)?x-?\d+(?:\.\d+)?$/.test(rawHash)) {
        return currentRoute
    }

    const segments = rawHash.split('/').filter(Boolean)
    const [section, slug, ...extra] = segments

    if (section === 'projects' && !slug) {
        return { name: 'projects', slug: null, extra: [] }
    }

    if (section === 'projects' && slug) {
        return { name: 'project', slug, extra }
    }

    if (section === 'notes' && !slug) {
        return { name: 'notes', slug: null, extra: [] }
    }

    if (section === 'notes' && slug) {
        return { name: 'note', slug, extra }
    }

    if (section === 'resume') {
        return { name: 'resume', slug: null, extra: [] }
    }

    return { name: 'home', slug: null, extra: [] }
}

export function useHashRoute() {
    const route = ref(readHash())

    const syncRoute = () => {
        const nextRoute = readHash(route.value)
        const shouldResetScroll = nextRoute !== route.value
        route.value = nextRoute
        if (shouldResetScroll) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        }
    }

    const navigate = (target, extra = []) => {
        if (typeof target === 'object' && target !== null) {
            if (target.noteSlug) {
                const sectionPath = target.sectionPath ? `/${target.sectionPath}` : ''
                window.location.hash = `/notes/${target.noteSlug}${sectionPath}`
                return
            }
        }

        if (target === 'home') {
            window.location.hash = '/'
            return
        }

        if (target === 'resume') {
            window.location.hash = '/resume'
            return
        }

        if (target === 'projects') {
            window.location.hash = '/projects'
            return
        }

        if (target === 'notes') {
            window.location.hash = '/notes'
            return
        }

        if (Array.isArray(extra) && extra.length > 0) {
            window.location.hash = `/${target}/${extra.join('/')}`
            return
        }

        window.location.hash = `/projects/${target}`
    }

    onMounted(() => {
        window.addEventListener('hashchange', syncRoute)
        syncRoute()
    })

    onBeforeUnmount(() => {
        window.removeEventListener('hashchange', syncRoute)
    })

    return {
        route,
        routeName: computed(() => route.value.name),
        routeSlug: computed(() => route.value.slug),
        routeExtra: computed(() => route.value.extra ?? []),
        navigate,
    }
}
