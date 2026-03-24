<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
    homePreviewCount: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['open-projects', 'open-project', 'open-resume'])

const columnCount = ref(1)

const syncColumnCount = () => {
  if (window.innerWidth >= 900) {
    columnCount.value = 3
    return
  }

  if (window.innerWidth >= 560) {
    columnCount.value = 2
    return
  }

  columnCount.value = 1
}

const previewColumns = computed(() => {
  const selectedProjects = props.projects.slice(0, props.homePreviewCount)
  const columns = Array.from({ length: columnCount.value }, () => [])

  selectedProjects.forEach((project, index) => {
    columns[index % columnCount.value].push(project)
  })

  return columns
})

onMounted(() => {
  syncColumnCount()
  window.addEventListener('resize', syncColumnCount, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncColumnCount)
})
</script>

<template>
    <div class="page page-home">
        <section class="hero-panel">
            <div class="hero-panel__body">
                <p class="eyebrow">Portfolio</p>
                <h1>{{ profile.handle }}</h1>
                <p class="hero-panel__title">{{ profile.title }}</p>
                <p class="hero-panel__intro">{{ profile.intro }}</p>
                <p class="hero-panel__statement">{{ profile.statement }}</p>

                <div class="hero-panel__actions">
                    <button type="button" class="button button--primary" @click="emit('open-projects')">
                        Browse Projects
                    </button>
                    <button type="button" class="button" @click="emit('open-resume')">
                        Résumé
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
                <p class="eyebrow">Preview</p>
                <h2>Selected projects</h2>
      </div>
      <div class="section-body">
        <div class="home-preview-grid">
          <div
            v-for="(column, columnIndex) in previewColumns"
            :key="columnIndex"
            class="home-preview-grid__column"
          >
            <button
              v-for="project in column"
              :key="project.slug"
              type="button"
              class="home-preview-card"
              @click="emit('open-project', project.slug)"
            >
              <img
                v-if="project.cover"
                class="home-preview-card__thumb"
                :src="project.cover"
                :alt="project.title"
              />
              <div v-else class="home-preview-card__thumb home-preview-card__thumb--placeholder" aria-hidden="true">
                <span>{{ project.title }}</span>
              </div>
              <div class="home-preview-card__body">
                <p class="project-card__meta">{{ project.groups.join(' / ') }}</p>
                <h3>{{ project.title }}</h3>
                <p class="home-preview-card__summary">{{ project.subtitle }}</p>
                <div class="home-preview-card__tags">
                  <span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="home-preview-actions">
                    <button type="button" class="text-link" @click="emit('open-projects')">
                        Open full project index
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
