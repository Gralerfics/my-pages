<script setup>
defineProps({
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
</script>

<template>
    <div class="page page-project">
        <section class="project-hero panel">
            <div class="project-hero__body">
                <p class="eyebrow">{{ currentProject.category }} / {{ currentProject.year }}</p>
                <h1>{{ currentProject.title }}</h1>
                <p class="project-hero__subtitle">{{ currentProject.subtitle }}</p>
                <p class="project-hero__summary">{{ currentProject.summary }}</p>

                <div class="tag-row">
          <span v-for="tag in currentProject.stack" :key="tag" class="tag">
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

            <img class="project-hero__image" :src="currentProject.image" :alt="currentProject.title" />
        </section>

        <section class="split-section">
            <article class="panel section-card">
                <div class="section-heading">
                    <p class="eyebrow">Project abstract</p>
                    <h2>Project overview</h2>
                </div>
                <p class="detail-text">{{ currentProject.detail }}</p>
            </article>

            <article class="panel section-card">
                <div class="section-heading">
                    <p class="eyebrow">Highlights</p>
                    <h2>Key points</h2>
                </div>
                <ul class="list-clean bullet-list">
                    <li v-for="item in currentProject.highlights" :key="item">{{ item }}</li>
                </ul>
            </article>
        </section>

        <section class="section-stack">
            <div class="section-heading">
                <p class="eyebrow">All projects</p>
                <h2>Browse further</h2>
            </div>
            <div class="project-list panel">
                <button
                    v-for="project in projects"
                    :key="project.slug"
                    type="button"
                    class="project-list__item"
                    :class="{ 'is-active': project.slug === currentProject.slug }"
                    @click="emit('select-project', project.slug)"
                >
                    <div>
                        <p class="project-list__meta">{{ project.category }}</p>
                        <h3>{{ project.title }}</h3>
                    </div>
                    <p>{{ project.subtitle }}</p>
                </button>
            </div>
        </section>
    </div>
</template>
