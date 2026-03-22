<script setup>
import { computed, watchEffect } from 'vue'
import HomeView from './components/HomeView.vue'
import ProjectDetailView from './components/ProjectDetailView.vue'
import ResumeView from './components/ResumeView.vue'
import SiteNavigation from './components/SiteNavigation.vue'
import { useHashRoute } from './composables/useHashRoute'
import {
    contactLinks,
    metrics,
    profile,
    projects,
    researchFocus,
    resumeSections,
    sideProjects,
    timeline,
} from './content/siteContent'

const { routeName, routeSlug, navigate } = useHashRoute()

const currentProject = computed(() => {
    return projects.find((project) => project.slug === routeSlug.value) ?? projects[0]
})

watchEffect(() => {
    const titles = {
        home: `${profile.name} | Portfolio`,
        resume: `${profile.name} | Resume`,
        project: `${currentProject.value.title} | ${profile.name}`,
    }

    document.title = titles[routeName.value]
})
</script>

<template>
    <div class="app-shell">
        <div class="backdrop"></div>

        <SiteNavigation
            :active-view="routeName"
            :active-project-title="currentProject.title"
            @navigate="navigate"
        />

        <main class="content-shell">
            <HomeView
                v-if="routeName === 'home'"
                :profile="profile"
                :metrics="metrics"
                :timeline="timeline"
                :research-focus="researchFocus"
                :featured-projects="projects.slice(0, 4)"
                :side-projects="sideProjects"
                :contact-links="contactLinks"
                @open-project="navigate"
                @open-resume="navigate('resume')"
            />

            <ProjectDetailView
                v-else-if="routeName === 'project'"
                :current-project="currentProject"
                :projects="projects"
                @select-project="navigate"
            />

            <ResumeView
                v-else
                :profile="profile"
                :sections="resumeSections"
            />
        </main>
    </div>
</template>
