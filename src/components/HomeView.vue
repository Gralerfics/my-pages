<script setup>
import { computed } from 'vue'
import { useResponsiveColumns } from '../composables/useResponsiveColumns'
import { useI18n } from '../i18n/useI18n'

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
const { t } = useI18n()

const selectedProjects = computed(() => props.projects.slice(0, props.homePreviewCount))
const { columns: previewColumns } = useResponsiveColumns(selectedProjects)
</script>

<template>
    <div class="page page-home">
        <section class="hero-panel">
            <div class="hero-panel__body">
                <p class="eyebrow">{{ t('home.eyebrow') }}</p>
                <h1>{{ profile.handle }}</h1>
                <p class="hero-panel__title">{{ profile.title }}</p>
                <p class="hero-panel__intro">{{ profile.intro }}</p>
                <p class="hero-panel__statement">{{ profile.statement }}</p>

                <div class="hero-panel__actions">
                    <button type="button" class="button button--primary" @click="emit('open-projects')">
                        {{ t('home.browseProjects') }}
                    </button>
                    <button type="button" class="button" @click="emit('open-resume')">
                        {{ t('home.resume') }}
                    </button>
                </div>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('home.overviewEyebrow') }}</p>
                <h2>{{ t('home.interestsTitle') }}</h2>
            </div>
            <div class="section-body section-body--boxed">
                <ul class="list-clean focus-list">
                    <li v-for="focus in researchFocus" :key="focus">{{ focus }}</li>
                </ul>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('home.previewEyebrow') }}</p>
                <h2>{{ t('home.selectedProjectsTitle') }}</h2>
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
                <p class="project-card__meta">{{ (project.displayGroups ?? project.groups).join(' / ') }}</p>
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
                        {{ t('home.fullIndex') }}
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
