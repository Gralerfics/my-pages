<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentProject: {
    type: Object,
    required: true,
  },
  projects: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select-project'])

const relatedProjects = computed(() =>
  props.projects.filter((project) => project.slug !== props.currentProject.slug),
)
</script>

<template>
  <div class="page page-project">
    <section class="project-hero">
      <div class="project-hero__body">
        <p class="eyebrow">{{ currentProject.groups.join(' / ') }} / {{ currentProject.period }}</p>
        <h1>{{ currentProject.title }}</h1>
        <p class="project-hero__subtitle">{{ currentProject.subtitle }}</p>
        <p class="project-hero__summary">{{ currentProject.intro }}</p>

        <div class="tag-row">
          <span v-for="tag in currentProject.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <div class="project-hero__actions">
          <a class="button button--primary" :href="currentProject.repo" target="_blank" rel="noreferrer">
            Open Repository
          </a>
          <span class="status-pill">{{ currentProject.status }}</span>
        </div>
      </div>

      <img
        v-if="currentProject.cover"
        class="project-hero__image"
        :src="currentProject.cover"
        :alt="currentProject.title"
      />
    </section>

    <section class="editorial-section">
      <div class="section-label">
        <p class="eyebrow">Details</p>
        <h2>Project Information</h2>
      </div>
      <div class="section-body">
        <component :is="currentProject.pageComponent" />
      </div>
    </section>

    <section class="editorial-section">
      <div class="section-label">
        <p class="eyebrow">Browse</p>
        <h2>Other projects</h2>
      </div>
      <div class="section-body">
        <div class="project-list panel">
          <button
            v-for="project in relatedProjects"
            :key="project.slug"
            type="button"
            class="project-list__item"
            @click="emit('select-project', project.slug)"
          >
            <div>
              <p class="project-list__meta">{{ project.groups.join(' / ') }}</p>
              <h3>{{ project.title }}</h3>
            </div>
            <p>{{ project.subtitle }}</p>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
