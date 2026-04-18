<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import NoteTypstDocument from './NoteTypstDocument.vue'

const props = defineProps({
    note: {
        type: Object,
        required: true,
    },
    currentSection: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['open-section'])
const { t } = useI18n()
const tocOpen = ref(true)

const allTocSections = computed(() =>
    props.note.sections.filter((section) => section.path.length),
)

const eyebrow = computed(() => `${t('notes.detailEyebrow')} / ${props.note.title}`)

function isActive(section) {
    return section.pathSlug === props.currentSection.pathSlug
}

function isInCurrentBranch(section) {
    return section.path.every((segment, index) => props.currentSection.path[index] === segment)
}

function openSection(pathSlug) {
    emit('open-section', {
        noteSlug: props.note.slug,
        sectionPath: pathSlug,
    })
}
</script>

<template>
    <div class="page page-note">
        <section class="project-hero note-hero">
            <div class="project-hero__body">
                <p class="eyebrow">{{ eyebrow }}</p>
                <h1>{{ currentSection.displayTitle }}</h1>
            </div>
        </section>

        <section class="editorial-section editorial-section--note">
            <aside
                class="note-sidebar"
                :class="{ 'is-collapsed': !tocOpen }"
            >
                <button
                    type="button"
                    class="note-sidebar__toggle note-sidebar__toggle--desktop"
                    @click="tocOpen = !tocOpen"
                    :aria-label="tocOpen ? t('notes.hideToc') : t('notes.showToc')"
                >
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path
                            v-if="tocOpen"
                            d="M10.5 3.5L6 8l4.5 4.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.7"
                        />
                        <path
                            v-else
                            d="M5.5 3.5L10 8l-4.5 4.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.7"
                        />
                    </svg>
                </button>
                <div class="note-toc">
                    <div class="note-toc__head">
                        <p class="eyebrow">{{ t('notes.tocEyebrow') }}</p>
                        <button
                            type="button"
                            class="text-link note-toc__inline-toggle"
                            @click="tocOpen = !tocOpen"
                        >
                            {{ tocOpen ? t('notes.hideToc') : t('notes.showToc') }}
                        </button>
                    </div>
                    <div class="note-toc__list">
                        <button
                            v-for="section in allTocSections"
                            :key="section.pathSlug"
                            type="button"
                            class="note-toc__item"
                            :class="{
                                'is-active': isActive(section),
                                'is-branch': isInCurrentBranch(section),
                            }"
                            :style="{ '--note-level': section.path.length }"
                            @click="openSection(section.pathSlug)"
                        >
                            {{ section.displayTitle }}
                        </button>
                    </div>
                </div>
            </aside>

            <div class="section-body note-section-body">
                <NoteTypstDocument
                    v-if="currentSection.typstEntry"
                    :bundle-base="note.bundleBase"
                    :entry-path="currentSection.typstEntry"
                />
                <p v-else class="note-empty-body">{{ t('notes.noBody') }}</p>

                <div v-if="currentSection.childSections.length" class="note-children-list">
                    <button
                        v-for="child in currentSection.childSections"
                        :key="child.pathSlug"
                        type="button"
                        class="note-children-list__item"
                        @click="openSection(child.pathSlug)"
                    >
                        {{ child.displayTitle }}
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
