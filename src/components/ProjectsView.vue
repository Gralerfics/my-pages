<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
  projectTabs: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['open-project'])

const activeTab = ref('All')
const searchQuery = ref('')

const availableTabs = computed(() => ['All', ...props.projectTabs])

const filteredProjects = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return props.projects.filter((project) => {
    const matchesTab =
      activeTab.value === 'All' || project.groups.includes(activeTab.value)
    const matchesQuery =
      !query
      || project.title.toLowerCase().includes(query)
      || project.subtitle.toLowerCase().includes(query)
      || project.summary.toLowerCase().includes(query)
      || project.tags.some((tag) => tag.toLowerCase().includes(query))

    return matchesTab && matchesQuery
  })
})
</script>

<template>
  <div class="page page-projects">
    <section class="projects-hero">
      <div class="hero-panel__body">
        <p class="eyebrow">Projects</p>
        <h1>Project index</h1>
        <p class="hero-panel__intro">
          A list of selected work across my various interests.
        </p>
      </div>
    </section>

    <section class="editorial-section">
      <div class="section-label">
        <p class="eyebrow">Browse</p>
        <h2>Filter and search</h2>
      </div>
      <div class="section-body">
        <div class="projects-toolbar">
          <div class="project-tabs" role="tablist" aria-label="Project groups">
            <button
              v-for="tab in availableTabs"
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

          <label class="projects-search">
            <span class="projects-search__label">Search</span>
            <input
              v-model="searchQuery"
              class="projects-search__input"
              type="text"
              placeholder="Search by title, summary, or tag"
            />
          </label>
        </div>

        <Transition name="projects-fade" mode="out-in">
          <div :key="`${activeTab}:${searchQuery.trim().toLowerCase()}`" class="project-listing">
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
                  <p class="project-card__meta">{{ project.groups.join(' / ') }} / {{ project.period }}</p>
                  <h3>{{ project.title }}</h3>
                  <p class="project-card__subtitle">{{ project.subtitle }}</p>
                </div>
                <p class="project-card__summary">{{ project.summary }}</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </section>
  </div>
</template>
