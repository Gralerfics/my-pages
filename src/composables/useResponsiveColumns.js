import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export function useResponsiveColumns(items, maxColumns = 3) {
    const columnCount = ref(1)

    const syncColumnCount = () => {
        if (window.innerWidth >= 900) {
            columnCount.value = Math.min(maxColumns, 3)
            return
        }

        if (window.innerWidth >= 560) {
            columnCount.value = Math.min(maxColumns, 2)
            return
        }

        columnCount.value = 1
    }

    const columns = computed(() => {
        const currentItems = typeof items === 'function' ? items() : items.value
        const nextColumns = Array.from({ length: columnCount.value }, () => [])

        currentItems.forEach((item, index) => {
            nextColumns[index % columnCount.value].push(item)
        })

        return nextColumns
    })

    onMounted(() => {
        syncColumnCount()
        window.addEventListener('resize', syncColumnCount, { passive: true })
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', syncColumnCount)
    })

    return {
        columnCount,
        columns,
    }
}
