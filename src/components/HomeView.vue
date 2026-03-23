<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
  researchFocus: {
    type: Array,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
  projectTabs: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['open-project', 'open-resume'])

const activeTab = ref(props.projectTabs[0] ?? '')

const filteredProjects = computed(() =>
  props.projects.filter((project) => project.groups.includes(activeTab.value)),
)
</script>

<template>
  <div class="page page-home">
    <section class="hero-panel panel">
      <div class="hero-panel__body">
        <p class="eyebrow">Portfolio / Static Site / GitHub Pages</p>
        <h1>{{ profile.name }}</h1>
        <p class="hero-panel__title">{{ profile.title }}</p>
        <p class="hero-panel__intro">{{ profile.intro }}</p>
        <p class="hero-panel__statement">{{ profile.statement }}</p>

        <div class="hero-panel__actions">
          <button type="button" class="button button--primary" @click="emit('open-project', projects[0]?.slug)">
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

    <section class="editorial-section">
      <div class="section-label">
        <p class="eyebrow">Projects</p>
        <h2>Project index</h2>
      </div>
      <div class="section-body">
        <div class="project-tabs" role="tablist" aria-label="Project groups">
          <button
            v-for="tab in projectTabs"
            :key="tab"
            type="button"
            class="project-tab"
            :class="{ 'is-active': tab === activeTab }"
            :aria-selected="tab === activeTab"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="project-listing">
          <button
            v-for="project in filteredProjects"
            :key="project.slug"
            type="button"
            class="project-card"
            @click="emit('open-project', project.slug)"
          >
            <div class="project-card__content">
              <img
                v-if="project.cover"
                class="project-card__thumb"
                :src="project.cover"
                :alt="project.title"
              />
              <div v-else class="project-card__thumb project-card__thumb--placeholder" aria-hidden="true">
                <span>{{ project.title }}</span>
              </div>
              <div class="project-card__head">
                <p class="project-card__meta">{{ activeTab }} / {{ project.period }}</p>
                <h3>{{ project.title }}</h3>
                <p class="project-card__subtitle">{{ project.subtitle }}</p>
              </div>
              <p class="project-card__summary">{{ project.summary }}</p>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
