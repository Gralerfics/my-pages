<script setup>
defineProps({
    profile: {
        type: Object,
        required: true,
    },
    sections: {
        type: Array,
        required: true,
    },
})
</script>

<template>
    <div class="page page-resume">
        <section class="resume-hero panel">
            <div>
                <p class="eyebrow">Resume Snapshot</p>
                <h1>{{ profile.name }}</h1>
                <p class="resume-hero__title">{{ profile.title }}</p>
            </div>
            <div class="resume-hero__facts">
                <div>
                    <span>Location</span>
                    <strong>{{ profile.location }}</strong>
                </div>
                <div>
                    <span>Focus</span>
                    <strong>Systems, robotics, embedded</strong>
                </div>
                <div>
                    <span>Format</span>
                    <strong>Academic-style static portfolio</strong>
                </div>
            </div>
        </section>

        <section class="resume-grid">
            <article v-for="section in sections" :key="section.title" class="panel resume-card">
                <div class="section-heading">
                    <p class="eyebrow">Section</p>
                    <h2>{{ section.title }}</h2>
                </div>
                <ul class="list-clean bullet-list">
                    <li v-for="item in section.items" :key="item">{{ item }}</li>
                </ul>
            </article>
        </section>

        <section class="panel resume-note">
            <p class="eyebrow">Note</p>
            <p>
                This page is a concise profile summary tailored for a portfolio site rather than a full
                document-style CV. It can be extended later into a dedicated CV page or multilingual version.
            </p>
        </section>
    </div>
</template>
