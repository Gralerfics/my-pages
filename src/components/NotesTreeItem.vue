<script setup>
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
    entry: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['open-note'])
const { t } = useI18n()
</script>

<template>
    <div v-if="entry.type === 'directory'" class="notes-tree__directory">
        <p class="notes-tree__path">{{ entry.path }}</p>
        <div class="notes-tree__children">
            <NotesTreeItem
                v-for="child in entry.children"
                :key="child.path ?? child.slug"
                :entry="child"
                @open-note="emit('open-note', $event)"
            />
        </div>
    </div>
    <button
        v-else
        type="button"
        class="note-index-card"
        @click="emit('open-note', entry.slug)"
    >
        <p class="note-index-card__path">{{ entry.relativeDir }}</p>
        <h3>{{ entry.title }}</h3>
        <p class="note-index-card__meta">
            {{ t('notes.sectionCount', { count: entry.topSectionCount }) }}
        </p>
    </button>
</template>
