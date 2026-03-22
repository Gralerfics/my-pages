import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

function readHash() {
    const rawHash = window.location.hash.replace(/^#\/?/, '')

    if (!rawHash) {
        return { name: 'home', slug: null }
    }

    const [section, slug] = rawHash.split('/')

    if (section === 'projects' && slug) {
        return { name: 'project', slug }
    }

    if (section === 'resume') {
        return { name: 'resume', slug: null }
    }

    return { name: 'home', slug: null }
}

export function useHashRoute() {
    const route = ref(readHash())

    const syncRoute = () => {
        route.value = readHash()
    }

    const navigate = (target) => {
        if (target === 'home') {
            window.location.hash = '/'
            return
        }

        if (target === 'resume') {
            window.location.hash = '/resume'
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
        navigate,
    }
}
