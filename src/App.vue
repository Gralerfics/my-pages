<script setup>
import { computed, nextTick, watch, watchEffect } from 'vue'
import HomeView from './components/HomeView.vue'
import NoteDetailView from './components/NoteDetailView.vue'
import NotesView from './components/NotesView.vue'
import ProjectDetailView from './components/ProjectDetailView.vue'
import ProjectsView from './components/ProjectsView.vue'
import ResumeView from './components/ResumeView.vue'
import SiteNavigation from './components/SiteNavigation.vue'
import { trackPageView } from './analytics'
import { useHashRoute } from './composables/useHashRoute'
import { localizedContent } from './content/localizedContent'
import { projectConfig } from './content/projectConfig'
import { findNoteBySlug, findSectionByPathSlug, notes, notesIndex } from './notes/loadNotes'
import { projectTabs, projects } from './projects/loadProjects'
import { useI18n } from './i18n/useI18n'

const { routeName, routeSlug, routeExtra, navigate } = useHashRoute()
const { locale, localeOptions, setLocale, t, groupLabel } = useI18n()

const localizedSiteContent = computed(() =>
    localizedContent[locale.value] ?? localizedContent.en,
)

const profile = computed(() => localizedSiteContent.value.profile)
const researchFocus = computed(() => localizedSiteContent.value.researchFocus)
const resumeContent = computed(() => localizedSiteContent.value.resumeContent)

const resolveLocalizedValue = (value) => {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
        return value
    }

    if ('en' in value || 'zh' in value) {
        return value[locale.value] ?? value.en ?? value.zh
    }

    return value
}

const localizedProjects = computed(() =>
    projects.map((project) => ({
        ...project,
        title: resolveLocalizedValue(project.title),
        subtitle: resolveLocalizedValue(project.subtitle),
        intro: resolveLocalizedValue(project.intro),
        tags: resolveLocalizedValue(project.tags) ?? project.tags,
        status: resolveLocalizedValue(project.status),
        collaboration: resolveLocalizedValue(project.collaboration),
        displayGroups: project.groups.map((group) => groupLabel(group)),
        repositoryLinks: project.repositoryLinks.map((repository) => ({
            ...repository,
            label: resolveLocalizedValue(repository.label)
                ?? t('common.repository'),
        })),
    })),
)

const currentProject = computed(() => {
    return localizedProjects.value.find((project) => project.slug === routeSlug.value) ?? localizedProjects.value[0]
})

const currentNote = computed(() => findNoteBySlug(routeSlug.value) ?? notes[0] ?? null)
const currentNoteSection = computed(() => {
    if (!currentNote.value) {
        return null
    }

    return findSectionByPathSlug(currentNote.value, routeExtra.value[0] ?? '')
})

watchEffect(() => {
    const titles = {
        home: `${profile.value.handle} | ${t('titles.home')}`,
        projects: `${profile.value.handle} | ${t('titles.projects')}`,
        notes: `${profile.value.handle} | ${t('titles.notes')}`,
        resume: `${profile.value.handle} | ${t('titles.resume')}`,
        project: `${currentProject.value.title} | ${profile.value.handle}`,
        note: `${currentNoteSection.value?.displayTitle ?? currentNote.value?.title ?? t('titles.notes')} | ${profile.value.handle}`,
    }

    document.title = titles[routeName.value]
})

watch(
    [routeName, routeSlug],
    async () => {
        await nextTick()
        trackPageView({
            pageTitle: document.title,
            pagePath: `${window.location.pathname}${window.location.hash}`,
            pageLocation: window.location.href,
        })
    },
    { immediate: true },
)
</script>

<template>
    <div class="app-shell">
        <div class="backdrop"></div>

        <SiteNavigation
            :active-view="routeName"
            :projects-label="t('nav.projects')"
            :handle="profile.handle"
            comment="Portfolio"
            :github-href="profile.github"
            :locale-options="localeOptions"
            :current-locale="locale"
            @navigate="navigate"
            @set-locale="setLocale"
        />

        <main class="content-shell">
            <HomeView
                v-if="routeName === 'home'"
                :profile="profile"
                :research-focus="researchFocus"
                :projects="localizedProjects"
                :home-preview-count="projectConfig.homePreviewCount"
                @open-project="navigate"
                @open-projects="navigate('projects')"
                @open-resume="navigate('resume')"
            />

            <ProjectsView
                v-else-if="routeName === 'projects'"
                :projects="localizedProjects"
                :project-tabs="projectTabs"
                @open-project="navigate"
            />

            <NotesView
                v-else-if="routeName === 'notes'"
                :notes-index="notesIndex"
                @open-note="(noteSlug) => navigate({ noteSlug, sectionPath: '' })"
            />

            <NoteDetailView
                v-else-if="routeName === 'note' && currentNote && currentNoteSection"
                :note="currentNote"
                :current-section="currentNoteSection"
                @open-section="navigate"
            />

            <ProjectDetailView
                v-else-if="routeName === 'project'"
                :current-project="currentProject"
                :projects="localizedProjects"
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
