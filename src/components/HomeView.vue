<script setup>
const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
  researchFocus: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['open-projects', 'open-resume'])
</script>

<template>
  <div class="page page-home">
    <section class="hero-panel">
      <div class="hero-panel__body">
        <p class="eyebrow">Portfolio</p>
        <h1>{{ profile.name }}</h1>
        <p class="hero-panel__title">{{ profile.title }}</p>
        <p class="hero-panel__intro">{{ profile.intro }}</p>
        <p class="hero-panel__statement">{{ profile.statement }}</p>

        <div class="hero-panel__actions">
          <button type="button" class="button button--primary" @click="emit('open-projects')">
            Browse Projects
          </button>
          <button type="button" class="button" @click="emit('open-resume')">
            Resume Snapshot
          </button>
        </div>
      </div>
    </section>

    <section class="editorial-section">
      <div class="section-label">
        <p class="eyebrow">Overview</p>
        <h2>Interests</h2>
      </div>
      <div class="section-body section-body--boxed">
        <ul class="list-clean focus-list">
          <li v-for="focus in researchFocus" :key="focus">{{ focus }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>
