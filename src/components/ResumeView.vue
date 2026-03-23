<script setup>
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
                <p class="eyebrow">Résumé</p>
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
                            <h3>{{ item.title }}</h3>
                            <p class="resume-entry__org">{{ item.organization }}</p>
                            <p>{{ item.detail }}</p>
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
                <ul class="list-clean bullet-list">
                    <li v-for="skill in resumeContent.skills" :key="skill">{{ skill }}</li>
                </ul>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Awards</p>
                <h2>Honors and awards</h2>
            </div>
            <div class="section-body section-body--boxed">
                <ul class="list-clean bullet-list">
                    <li v-for="item in resumeContent.honors" :key="item">{{ item }}</li>
                </ul>
            </div>
        </section>
    </div>
</template>
