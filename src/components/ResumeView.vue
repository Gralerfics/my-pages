<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'

const toLines = (detail) => (Array.isArray(detail) ? detail : [detail])
const openEducationEntries = ref([])
const toCourseGroups = (courses) => {
    if (!Array.isArray(courses) || courses.length === 0) {
        return []
    }

    if (courses.some((entry) => Array.isArray(entry?.items))) {
        return courses.map((entry) => ({
            category: entry.category ?? '',
            items: entry.items ?? [],
        }))
    }

    return [
        {
            category: '',
            items: courses,
        },
    ]
}

const isEducationOpen = (entryKey) => openEducationEntries.value.includes(entryKey)

const toggleEducation = (entryKey) => {
    openEducationEntries.value = isEducationOpen(entryKey)
        ? openEducationEntries.value.filter((key) => key !== entryKey)
        : [...openEducationEntries.value, entryKey]
}

const props = defineProps({
    profile: {
        type: Object,
        required: true,
    },
    resumeContent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['open-projects'])
const { t } = useI18n()

const profileEmails = computed(() => {
    if (Array.isArray(props.profile.emails) && props.profile.emails.length) {
        return props.profile.emails
    }

    if (typeof props.profile.email === 'string' && props.profile.email.trim()) {
        return props.profile.email.split('/').map((entry) => entry.trim()).filter(Boolean)
    }

    return []
})
</script>

<template>
    <div class="page page-resume">
        <section class="resume-hero">
            <div class="resume-hero__body">
                <p class="eyebrow">{{ t('resume.eyebrow') }}</p>
                <h1>{{ profile.realName }}</h1>
                <p class="resume-hero__title">{{ profile.title }}</p>
                <p class="resume-hero__contact">
                    <span class="resume-hero__contact-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9A1.5 1.5 0 0 1 18.5 18h-13A1.5 1.5 0 0 1 4 16.5v-9Zm1.2-.3 6.34 4.9a.75.75 0 0 0 .92 0l6.34-4.9"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.7"
                            />
                        </svg>
                    </span>
                    <template v-for="(email, index) in profileEmails" :key="email">
                        <a :href="`mailto:${email}`">{{ email }}</a>
                        <span v-if="index < profileEmails.length - 1"> / </span>
                    </template>
                </p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('resume.profileEyebrow') }}</p>
                <h2>{{ t('resume.profileTitle') }}</h2>
            </div>
            <div class="section-body resume-prose">
                <p v-for="paragraph in resumeContent.profileStatement" :key="paragraph">{{ paragraph }}</p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('resume.educationEyebrow') }}</p>
                <h2>{{ t('resume.educationTitle') }}</h2>
            </div>
            <div class="section-body">
                <ol class="timeline list-clean">
                    <li v-for="item in resumeContent.education" :key="`${item.time}-${item.title}`" class="timeline__item">
                        <p class="timeline__period">{{ item.time }}</p>
                        <div class="timeline__content">
                            <div class="timeline__heading">
                                <div>
                                    <h3>{{ item.title }}</h3>
                                    <p class="resume-entry__org">{{ item.organization }}</p>
                                </div>
                                <button
                                    v-if="item.courses?.length"
                                    type="button"
                                    class="text-link timeline__toggle"
                                    @click="toggleEducation(`${item.time}-${item.title}`)"
                                >
                                    {{
                                        isEducationOpen(`${item.time}-${item.title}`)
                                            ? t('resume.hideCourses')
                                            : t('resume.showCourses')
                                    }}
                                </button>
                            </div>

                            <Transition name="education-panel">
                                <div
                                    v-if="item.courses?.length && isEducationOpen(`${item.time}-${item.title}`)"
                                    class="education-panel"
                                >
                                    <div class="education-course-groups">
                                        <section
                                            v-for="group in toCourseGroups(item.courses)"
                                            :key="group.category || 'default'"
                                            class="education-course-group"
                                        >
                                            <p v-if="group.category" class="education-course-group__title">
                                                {{ group.category }}
                                            </p>
                                            <ul class="list-clean education-course-list">
                                                <li
                                                    v-for="course in group.items"
                                                    :key="typeof course === 'string' ? course : course.name"
                                                    :class="[
                                                        'education-course-list__item',
                                                        typeof course !== 'string' && course.featured
                                                            ? 'education-course-list__item--featured'
                                                            : null,
                                                    ]"
                                                >
                                                    <component
                                                        :is="typeof course !== 'string' && course.link ? 'a' : 'div'"
                                                        class="education-course-list__main"
                                                        :href="typeof course !== 'string' ? course.link : null"
                                                        :target="typeof course !== 'string' && course.link ? '_blank' : null"
                                                        :rel="typeof course !== 'string' && course.link ? 'noreferrer' : null"
                                                    >
                                                        <span
                                                            v-if="typeof course !== 'string' && course.code"
                                                            :class="[
                                                                'education-course-list__code',
                                                                course.featured ? 'education-course-list__code--featured' : null,
                                                            ]"
                                                        >
                                                            {{ course.code }}
                                                        </span>
                                                        <span class="education-course-list__name">
                                                            {{ typeof course === 'string' ? course : course.name }}
                                                        </span>
                                                    </component>
                                                    <span v-if="typeof course !== 'string' && course.grade" class="education-course-list__grade">
                                                        {{ course.grade }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </section>
                                    </div>
                                    <div v-if="item.notes?.length" class="education-panel__notes">
                                        <p
                                            v-for="note in item.notes"
                                            :key="note"
                                            class="education-panel__note"
                                        >
                                            {{ note }}
                                        </p>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </li>
                </ol>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('resume.projectsEyebrow') }}</p>
                <h2>{{ t('resume.projectsTitle') }}</h2>
            </div>
            <div class="section-body resume-prose">
                <p>{{ t('resume.projectsSummary') }}</p>
                <div style="margin-top: -5px">
                    <button type="button" class="button" @click="emit('open-projects')">
                        {{ t('resume.openProjects') }}
                    </button>
                </div>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('resume.skillsEyebrow') }}</p>
                <h2>{{ t('resume.skillsTitle') }}</h2>
            </div>
            <div class="section-body section-body--boxed">
                <div class="resume-detail-list">
                    <article
                        v-for="skill in resumeContent.skills"
                        :key="skill.title"
                        class="resume-detail-item"
                    >
                        <h3>{{ skill.title }}</h3>
                        <div class="resume-detail-item__content">
                            <p v-for="line in toLines(skill.detail)" :key="line">{{ line }}</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('resume.awardsEyebrow') }}</p>
                <h2>{{ t('resume.awardsTitle') }}</h2>
            </div>
            <div class="section-body section-body--boxed">
                <div class="resume-awards-list">
                    <article
                        v-for="item in resumeContent.honors"
                        :key="item.title"
                        class="resume-award-item"
                    >
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.detail }}</p>
                    </article>
                </div>
            </div>
        </section>
    </div>
</template>
