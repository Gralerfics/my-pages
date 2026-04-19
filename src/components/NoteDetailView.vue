<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
const tocReady = ref(false)

const allTocSections = computed(() =>
    props.note.sections.filter((section) => section.path.length),
)

const eyebrow = computed(() => `${t('notes.detailEyebrow')} / ${props.note.title}`)
const titleParts = computed(() => splitSectionLabel(props.currentSection.displayTitle))
const orderedSections = computed(() => props.note.sections.filter((section) => section.path.length))
const currentSectionIndex = computed(() =>
    orderedSections.value.findIndex((section) => section.pathSlug === props.currentSection.pathSlug),
)
const previousSection = computed(() =>
    currentSectionIndex.value > 0 ? orderedSections.value[currentSectionIndex.value - 1] : null,
)
const nextSection = computed(() =>
    currentSectionIndex.value >= 0 && currentSectionIndex.value < orderedSections.value.length - 1
        ? orderedSections.value[currentSectionIndex.value + 1]
        : null,
)

function isActive(section) {
    return section.pathSlug === props.currentSection.pathSlug
}

function isInCurrentBranch(section) {
    return section.path.every((segment, index) => props.currentSection.path[index] === segment)
}

function openSection(sectionId) {
    emit('open-section', {
        noteSlug: props.note.slug,
        sectionId,
    })
}

function splitSectionLabel(displayTitle) {
    const match = /^(\d+(?:\.\d+)*)\s+(.*)$/.exec(displayTitle)
    if (!match) {
        return {
            number: '',
            title: displayTitle,
        }
    }

    return {
        number: match[1],
        title: match[2],
    }
}

function openRoot() {
    openSection('')
}

function openPrevious() {
    if (previousSection.value) {
        openSection(previousSection.value.number)
        return
    }

    if (props.currentSection.path.length) {
        openRoot()
    }
}

function openNext() {
    if (nextSection.value) {
        openSection(nextSection.value.number)
    }
}

function onKeydown(event) {
    const target = event.target
    if (
        target instanceof HTMLElement
        && (
            target.isContentEditable
            || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        )
    ) {
        return
    }

    if (event.key === 'ArrowLeft') {
        if (previousSection.value || props.currentSection.path.length) {
            event.preventDefault()
            openPrevious()
        }
    }

    if (event.key === 'ArrowRight' && nextSection.value) {
        event.preventDefault()
        openNext()
    }
}

onMounted(async () => {
    await nextTick()
    requestAnimationFrame(() => {
        tocReady.value = true
    })
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <div class="page page-note">
        <section class="project-hero note-hero">
            <div class="project-hero__body">
                <p class="eyebrow">{{ eyebrow }}</p>
                <h1>
                    <span v-if="titleParts.number" class="note-title__number">
                        {{ titleParts.number }}.
                    </span>
                    <span>{{ titleParts.title }}</span>
                </h1>
            </div>
        </section>

        <section class="editorial-section editorial-section--note">
            <aside
                class="note-sidebar"
                :class="{ 'is-collapsed': !tocOpen, 'is-ready': tocReady }"
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
                            @click="openSection(section.number)"
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

                <div v-if="currentSection.childSections.length" class="note-children-list">
                    <button
                        v-for="child in currentSection.childSections"
                        :key="child.pathSlug"
                        type="button"
                        class="note-children-list__item"
                        @click="openSection(child.number)"
                    >
                        <span
                            v-if="splitSectionLabel(child.displayTitle).number"
                            class="note-children-list__number"
                        >
                            {{ splitSectionLabel(child.displayTitle).number }}
                        </span>
                        <span class="note-children-list__title">
                            {{ splitSectionLabel(child.displayTitle).title }}
                        </span>
                    </button>
                </div>

                <div
                    v-if="previousSection || nextSection || currentSection.path.length"
                    class="note-section-nav note-section-nav--bottom"
                >
                    <button
                        v-if="previousSection || currentSection.path.length"
                        type="button"
                        class="button note-section-nav__button note-section-nav__button--prev"
                        @click="openPrevious"
                    >
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path
                                d="M10.5 3.5L6 8l4.5 4.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.7"
                            />
                        </svg>
                        {{ previousSection ? t('notes.previousSection') : t('notes.backToNote') }}
                    </button>

                    <div class="note-section-nav__spacer"></div>

                    <button
                        v-if="nextSection"
                        type="button"
                        class="button note-section-nav__button note-section-nav__button--next"
                        @click="openNext"
                    >
                        {{ t('notes.nextSection') }}
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path
                                d="M5.5 3.5L10 8l-4.5 4.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>
