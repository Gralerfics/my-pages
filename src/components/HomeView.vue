<script setup>
defineProps({
    profile: {
        type: Object,
        required: true,
    },
    metrics: {
        type: Array,
        required: true,
    },
    timeline: {
        type: Array,
        required: true,
    },
    researchFocus: {
        type: Array,
        required: true,
    },
    featuredProjects: {
        type: Array,
        required: true,
    },
    sideProjects: {
        type: Array,
        required: true,
    },
    contactLinks: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['open-project', 'open-resume'])
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
                    <button type="button" class="button button--primary" @click="emit('open-project', 'zepto-watch')">
                        View Selected Work
                    </button>
                    <button type="button" class="button" @click="emit('open-resume')">
                        Resume Snapshot
                    </button>
                </div>
            </div>

            <aside class="hero-panel__aside">
                <div class="signal-card">
                    <p class="signal-card__label">Current profile</p>
                    <p class="signal-card__value">Student engineer with cross-stack practice</p>
                </div>
                <div class="signal-card">
                    <p class="signal-card__label">Primary themes</p>
                    <p class="signal-card__value">Embedded systems, robotics, digital design, systems software</p>
                </div>
                <div class="signal-card">
                    <p class="signal-card__label">Presentation goal</p>
                    <p class="signal-card__value">Minimal, academic, modern, and intentionally restrained.</p>
                </div>
            </aside>
        </section>

        <section class="metrics-grid">
            <article v-for="metric in metrics" :key="metric.label" class="metric-card panel">
                <p class="metric-card__value">{{ metric.value }}</p>
                <p class="metric-card__label">{{ metric.label }}</p>
            </article>
        </section>

        <section class="split-section">
            <article class="panel section-card">
                <div class="section-heading">
                    <p class="eyebrow">Overview</p>
                    <h2>Research focus</h2>
                </div>
                <ul class="list-clean focus-list">
                    <li v-for="focus in researchFocus" :key="focus">{{ focus }}</li>
                </ul>
            </article>

            <article class="panel section-card">
                <div class="section-heading">
                    <p class="eyebrow">Timeline</p>
                    <h2>Timeline</h2>
                </div>
                <ol class="timeline list-clean">
                    <li v-for="item in timeline" :key="item.title" class="timeline__item">
                        <p class="timeline__period">{{ item.period }}</p>
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.detail }}</p>
                    </li>
                </ol>
            </article>
        </section>

        <section class="section-stack">
            <div class="section-heading">
                <p class="eyebrow">Selected Work</p>
                <h2>Selected projects</h2>
            </div>

            <div class="project-grid">
                <article
                    v-for="project in featuredProjects"
                    :key="project.slug"
                    class="project-card panel"
                >
                    <div class="project-card__content">
                        <p class="project-card__meta">{{ project.category }} / {{ project.year }}</p>
                        <h3>{{ project.title }}</h3>
                        <p class="project-card__subtitle">{{ project.subtitle }}</p>
                        <p class="project-card__summary">{{ project.summary }}</p>
                        <button type="button" class="text-link" @click="emit('open-project', project.slug)">
                            Open detail
                        </button>
                    </div>
                </article>
            </div>
        </section>

        <section class="section-stack">
            <div class="section-heading">
                <p class="eyebrow">Additional Practice</p>
                <h2>Course and lab work</h2>
            </div>

            <div class="side-grid">
                <article v-for="item in sideProjects" :key="item.title" class="side-card panel">
                    <div class="side-card__content">
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.text }}</p>
                    </div>
                </article>
            </div>
        </section>

        <section class="contact-strip panel">
            <div>
                <p class="eyebrow">Links</p>
                <h2>Quick links</h2>
            </div>
            <div class="contact-strip__links">
                <a
                    v-for="item in contactLinks"
                    :key="item.label"
                    class="contact-link"
                    :href="item.href"
                    :target="item.href.startsWith('http') ? '_blank' : undefined"
                    :rel="item.href.startsWith('http') ? 'noreferrer' : undefined"
                >
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                </a>
            </div>
        </section>
    </div>
</template>
