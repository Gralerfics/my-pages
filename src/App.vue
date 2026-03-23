<script setup>
import { computed, watchEffect } from 'vue'
import HomeView from './components/HomeView.vue'
import ProjectDetailView from './components/ProjectDetailView.vue'
import ProjectsView from './components/ProjectsView.vue'
import ResumeView from './components/ResumeView.vue'
import SiteNavigation from './components/SiteNavigation.vue'
import { useHashRoute } from './composables/useHashRoute'
import { profile, researchFocus, resumeContent } from './content/profileContent'
import { projectConfig } from './content/projectConfig'
import { projectTabs, projects } from './projects/loadProjects'

const { routeName, routeSlug, navigate } = useHashRoute()

const currentProject = computed(() => {
    return projects.find((project) => project.slug === routeSlug.value) ?? projects[0]
})

watchEffect(() => {
    const titles = {
        home: `${profile.handle} | Home`,
        projects: `${profile.handle} | Projects`,
        resume: `${profile.handle} | Résumé`,
        project: `${currentProject.value.title} | ${profile.handle}`,
    }

    document.title = titles[routeName.value]
})
</script>

<template>
    <div class="app-shell">
        <div class="backdrop"></div>

        <SiteNavigation
            :active-view="routeName"
            :projects-label="routeName === 'project' ? currentProject.title : 'Projects'"
            :handle="profile.handle"
            :real-name="profile.realName"
            :github-href="profile.github"
            @navigate="navigate"
        />

        <main class="content-shell">
            <HomeView
                v-if="routeName === 'home'"
                :profile="profile"
                :research-focus="researchFocus"
                :projects="projects"
                :home-preview-count="projectConfig.homePreviewCount"
                @open-project="navigate"
                @open-projects="navigate('projects')"
                @open-resume="navigate('resume')"
            />

            <ProjectsView
                v-else-if="routeName === 'projects'"
                :projects="projects"
                :project-tabs="projectTabs"
                @open-project="navigate"
            />

            <ProjectDetailView
                v-else-if="routeName === 'project'"
                :current-project="currentProject"
                :projects="projects"
                :related-projects-count="projectConfig.relatedProjectsCount"
                @select-project="navigate"
            />

            <ResumeView
                v-else
                :profile="profile"
                :resume-content="resumeContent"
                @open-projects="navigate('projects')"
            />
        </main>
    </div>
</template>
