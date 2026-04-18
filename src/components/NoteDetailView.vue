<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from '../i18n/useI18n'

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
const renderedContent = ref(null)

const allTocSections = computed(() =>
    props.note.sections.filter((section) => section.path.length),
)

const breadcrumb = computed(() => {
    if (!props.currentSection.path?.length) {
        return []
    }

    return props.currentSection.path
        .map((_, index) => {
            const targetPath = props.currentSection.path.slice(0, index + 1)
            const pathSlug = targetPath.join('-')
            return props.note.sections.find((section) => section.pathSlug === pathSlug)
        })
        .filter(Boolean)
})

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

function handleTypstHashChange() {
    if (!window.location.hash.startsWith('#/loc-') && !window.location.hash.startsWith('#loc-')) {
        return
    }

    const sectionPath = props.currentSection.pathSlug ? `/${props.currentSection.pathSlug}` : ''
    history.replaceState(null, '', `#/notes/${props.note.slug}${sectionPath}`)
}

function bindRenderedSvg() {
    const host = renderedContent.value
    if (!host) {
        return
    }

    const svg = host.querySelector('.typst-doc')
    if (!svg) {
        return
    }

    if (typeof window.typstProcessSvg === 'function' && !svg.dataset.typstProcessed) {
        window.typstProcessSvg(svg)
        svg.dataset.typstProcessed = 'true'
    }
}

onMounted(() => {
    window.addEventListener('hashchange', handleTypstHashChange)
})

onBeforeUnmount(() => {
    window.removeEventListener('hashchange', handleTypstHashChange)
})

watch(
    () => props.currentSection.pathSlug,
    async () => {
        await nextTick()
        bindRenderedSvg()
    },
    { immediate: true },
)
</script>

<template>
    <div class="page page-note">
        <section class="project-hero note-hero">
            <div class="project-hero__body">
                <p class="eyebrow">{{ eyebrow }}</p>
                <h1>{{ currentSection.displayTitle }}</h1>
                <p v-if="breadcrumb.length" class="note-breadcrumb">
                    <template v-for="(item, index) in breadcrumb" :key="item.pathSlug">
                        <button
                            type="button"
                            class="note-breadcrumb__item"
                            @click="openSection(item.pathSlug)"
                        >
                            {{ item.displayTitle }}
                        </button>
                        <span v-if="index < breadcrumb.length - 1" class="note-breadcrumb__separator">/</span>
                    </template>
                </p>
            </div>
        </section>

        <section class="editorial-section editorial-section--note">
            <aside
                class="note-sidebar"
                :class="{ 'is-collapsed': !tocOpen }"
            >
                <button
                    type="button"
                    class="note-sidebar__toggle"
                    @click="tocOpen = !tocOpen"
                >
                    {{ tocOpen ? t('notes.hideToc') : t('notes.showToc') }}
                </button>
                <div class="note-toc">
                    <p class="eyebrow">{{ t('notes.tocEyebrow') }}</p>
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
                <div
                    v-if="currentSection.svg"
                    ref="renderedContent"
                    class="note-rendered-content"
                    v-html="currentSection.svg"
                />
                <p v-else class="note-empty-body">{{ t('notes.noBody') }}</p>

                <p v-if="currentSection.childSections.length" class="note-children-inline">
                    <template v-for="(child, index) in currentSection.childSections" :key="child.pathSlug">
                        <button
                            type="button"
                            class="note-inline-link"
                            @click="openSection(child.pathSlug)"
                        >
                            {{ child.displayTitle }}
                        </button>
                        <span v-if="index < currentSection.childSections.length - 1" class="note-inline-separator"> / </span>
                    </template>
                </p>
            </div>
        </section>
    </div>
</template>
