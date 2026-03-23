<script setup>
defineProps({
  activeView: {
    type: String,
    required: true,
  },
  githubHref: {
    type: String,
    required: true,
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
          :class="{ 'is-active': activeView === 'project' }"
          @click="emit('navigate', 'home')"
        >
          Projects
        </button>
      </nav>
    </div>

    <div class="site-header__icons">
      <a class="site-header__icon" :href="githubHref" target="_blank" rel="noreferrer" aria-label="GitHub">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.33-1.76c-1.09-.74.08-.72.08-.72a2.52 2.52 0 0 1 1.84 1.23 2.57 2.57 0 0 0 3.51 1 2.58 2.58 0 0 1 .77-1.61c-2.67-.31-5.47-1.34-5.47-5.97a4.67 4.67 0 0 1 1.24-3.24 4.33 4.33 0 0 1 .12-3.19s1.01-.32 3.3 1.24a11.4 11.4 0 0 1 6 0c2.28-1.56 3.29-1.24 3.29-1.24a4.33 4.33 0 0 1 .12 3.19 4.67 4.67 0 0 1 1.24 3.24c0 4.65-2.8 5.65-5.48 5.96a2.89 2.89 0 0 1 .82 2.24v3.32c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z"
          />
        </svg>
      </a>
    </div>
  </header>
</template>
