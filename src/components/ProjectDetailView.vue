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
    relatedProjectsCount: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['select-project'])

const relatedProjects = computed(() =>
    props.projects
        .filter((project) => project.slug !== props.currentProject.slug)
        .slice(0, props.relatedProjectsCount),
)
</script>

<template>
    <div class="page page-project">
        <section v-if="currentProject.cover" class="project-cover">
            <img
                class="project-cover__image"
                :src="currentProject.cover"
                :alt="currentProject.title"
            />
        </section>

        <section class="project-hero">
            <div class="project-hero__body">
                <p class="eyebrow">{{ currentProject.groups.join(' / ') }}</p>
                <h1>{{ currentProject.title }}</h1>
                <p class="project-hero__subtitle">{{ currentProject.subtitle }}</p>

                <div class="tag-row">
          <span v-for="tag in currentProject.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
                </div>

                <p class="project-hero__summary">{{ currentProject.intro }}</p>

        <div class="project-hero__actions">
          <a
            v-if="currentProject.repo"
            class="button button--primary"
            :href="currentProject.repo"
                        target="_blank"
                        rel="noreferrer"
          >
            Open Repository
          </a>
          <span v-if="currentProject.time" class="status-pill">{{ currentProject.time }}</span>
          <span v-if="currentProject.status" class="status-pill">{{ currentProject.status }}</span>
          <span v-if="currentProject.collaboration" class="status-pill">{{ currentProject.collaboration }}</span>
        </div>
      </div>
    </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Project</p>
                <h2>Details</h2>
            </div>
            <div class="section-body">
                <component :is="currentProject.pageComponent" />
            </div>
        </section>

        <section class="editorial-section editorial-section--related">
            <div class="section-label">
                <p class="eyebrow">Browse</p>
                <h2>Other projects</h2>
            </div>
            <div class="section-body">
                <div class="project-list">
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
