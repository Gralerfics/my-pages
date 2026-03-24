<script setup>
import { ref } from 'vue'

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

defineProps({
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
</script>

<template>
    <div class="page page-resume">
        <section class="resume-hero">
            <div class="resume-hero__body">
                <p class="eyebrow">Resume</p>
                <h1>{{ profile.realName }}</h1>
                <p class="resume-hero__title">{{ profile.title }}</p>
                <p class="resume-hero__contact">{{ profile.email }}</p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Profile</p>
                <h2>Personal statement</h2>
            </div>
            <div class="section-body resume-prose">
                <p v-for="paragraph in resumeContent.profileStatement" :key="paragraph">{{ paragraph }}</p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Education</p>
                <h2>Academic timeline</h2>
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
                                            ? 'Hide courses & grades'
                                            : 'Courses & grades details'
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
                                                    class="education-course-list__item"
                                                >
                                                    <div class="education-course-list__main">
                                                        <span
                                                            v-if="typeof course !== 'string' && course.code"
                                                            class="education-course-list__code"
                                                        >
                                                            {{ course.code }}
                                                        </span>
                                                        <span>{{ typeof course === 'string' ? course : course.name }}</span>
                                                    </div>
                                                    <span v-if="typeof course !== 'string' && course.grade" class="education-course-list__grade">
                                                        {{ course.grade }}
                                                    </span>
                                                </li>
                                            </ul>
                                        </section>
                                    </div>
                                    <p v-if="item.coursesNote" class="education-panel__note">
                                        {{ item.coursesNote }}
                                    </p>
                                </div>
                            </Transition>
                        </div>
                    </li>
                </ol>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Projects</p>
                <h2>Project experience</h2>
            </div>
            <div class="section-body resume-prose">
                <p>
                    Selected projects are documented on the Projects page, where each entry includes
                    overview information and a more detailed page.
                </p>
                <div>
                    <button type="button" class="button" @click="emit('open-projects')">
                        Open Projects Page
                    </button>
                </div>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Skills</p>
                <h2>Technical skills</h2>
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
                <p class="eyebrow">Awards</p>
                <h2>Honors and awards</h2>
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
