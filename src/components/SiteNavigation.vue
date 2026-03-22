<script setup>
defineProps({
    activeView: {
        type: String,
        required: true,
    },
    activeProjectTitle: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['navigate'])

const items = [
    { key: 'home', label: 'Home' },
    { key: 'resume', label: 'Resume' },
]
</script>

<template>
    <header class="site-header">
        <div class="site-header__brand" @click="emit('navigate', 'home')">
            <span class="site-header__mark">GF</span>
            <div>
                <p class="site-header__name">Gralerfics</p>
                <p class="site-header__meta">Engineering Portfolio</p>
            </div>
        </div>

        <nav class="site-header__nav" aria-label="Primary">
            <button
                v-for="item in items"
                :key="item.key"
                type="button"
                class="site-header__link"
                :class="{ 'is-active': activeView === item.key }"
                @click="emit('navigate', item.key)"
            >
                {{ item.label }}
            </button>
            <button
                type="button"
                class="site-header__link"
                :class="{ 'is-active': activeView === 'project' }"
                @click="emit('navigate', 'fmc-pga')"
            >
                {{ activeView === 'project' ? activeProjectTitle : 'Projects' }}
            </button>
        </nav>
    </header>
</template>
