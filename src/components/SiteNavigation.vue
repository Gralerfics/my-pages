<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  activeView: {
    type: String,
    required: true,
  },
  projectsLabel: {
    type: String,
    default: 'Projects',
  },
  githubHref: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['navigate'])
const isPinned = ref(false)
const topSentinel = ref(null)
let observer = null

const items = [
  { key: 'home', label: 'Home' },
  { key: 'resume', label: 'Resume' },
]

onMounted(() => {
  // Prevent browser scroll restoration from nudging the page on refresh.
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      isPinned.value = !entry.isIntersecting
    },
    {
      threshold: 0,
      rootMargin: '-1px 0px 0px 0px',
    },
  )

  if (topSentinel.value) {
    observer.observe(topSentinel.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="topSentinel" class="site-header__sentinel" aria-hidden="true"></div>
  <header class="site-header" :class="{ 'is-pinned': isPinned }">
    <div class="site-header__inner">
      <div class="site-header__main">
        <div class="site-header__brand" @click="emit('navigate', 'home')">
          <span class="site-header__mark">GF</span>
          <div>
            <p class="site-header__name">Gralerfics</p>
            <p class="site-header__meta">Engineering Portfolio</p>
          </div>
        </div>

        <div class="site-header__divider" aria-hidden="true"></div>

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
            :class="{ 'is-active': activeView === 'projects' || activeView === 'project' }"
            @click="emit('navigate', 'projects')"
          >
            {{ projectsLabel }}
          </button>
        </nav>
      </div>

      <div class="site-header__icons">
        <a class="site-header__icon" :href="githubHref" target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
            />
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </header>
</template>
