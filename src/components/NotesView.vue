<script setup>
import { computed } from 'vue'
import NotesTreeItem from './NotesTreeItem.vue'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
    notesIndex: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['open-note'])
const { t } = useI18n()

const hasNotes = computed(() => (props.notesIndex.tree?.length ?? 0) > 0)

function openNote(noteSlug) {
    emit('open-note', noteSlug)
}
</script>

<template>
    <div class="page page-notes">
        <section class="projects-hero">
            <div class="hero-panel__body">
                <p class="eyebrow">{{ t('notes.eyebrow') }}</p>
                <h1>{{ t('notes.title') }}</h1>
                <p class="hero-panel__intro">{{ t('notes.intro') }}</p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('notes.browseEyebrow') }}</p>
                <h2>{{ t('notes.directoryTitle') }}</h2>
            </div>
            <div class="section-body">
                <div v-if="hasNotes" class="notes-tree">
                    <NotesTreeItem
                        v-for="entry in notesIndex.tree"
                        :key="entry.path ?? entry.slug"
                        :entry="entry"
                        @open-note="openNote"
                    />
                </div>
                <div v-else class="section-body section-body--boxed">
                    <p>{{ t('notes.empty') }}</p>
                </div>
            </div>
        </section>
    </div>
</template>
