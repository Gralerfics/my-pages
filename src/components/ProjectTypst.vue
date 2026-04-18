<script setup>
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue'
import { $typst } from '@myriaddreamin/typst.ts'
import { useI18n } from '../i18n/useI18n'
import { configureTypstWasm } from '../typst/configureTypstWasm'

const props = defineProps({
    code: {
        type: String,
        default: '',
    },
    caption: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: '15pt',
    },
    framed: {
        type: Boolean,
        default: true,
    },
    inline: {
        type: Boolean,
        default: false,
    },
})

const { t } = useI18n()

const svgMarkup = ref('')
const renderError = ref('')
const slotSourceEl = ref(null)
const slotSourceText = ref('')

function updateSlotSource() {
    slotSourceText.value = slotSourceEl.value?.textContent?.trim() ?? ''
}

onMounted(() => {
    nextTick(updateSlotSource)
})

onUpdated(() => {
    nextTick(updateSlotSource)
})

const documentSource = computed(() => [
    '#set page(width: auto, height: auto, margin: 0pt)',
    `#set text(size: ${props.size})`,
    '#set par(justify: false)',
    (props.code || slotSourceText.value).trim(),
].join('\n'))

let renderToken = 0

watch(
    documentSource,
    async (source) => {
        const token = ++renderToken

        try {
            configureTypstWasm()

            const svg = await $typst.svg({
                mainContent: source,
            })

            if (token !== renderToken) {
                return
            }

            svgMarkup.value = svg
            renderError.value = ''
        }
        catch (error) {
            if (token !== renderToken) {
                return
            }

            svgMarkup.value = ''
            renderError.value = error instanceof Error ? error.message : t('common.typstError')
        }
    },
    { immediate: true },
)
</script>

<template>
    <span ref="slotSourceEl" class="project-equation__source" aria-hidden="true">
        <slot />
    </span>
    <span v-if="inline" class="project-equation-inline">
        <span v-if="svgMarkup" class="project-equation-inline__svg" v-html="svgMarkup" />
        <span v-else-if="renderError" class="project-equation-inline__error">{{ renderError }}</span>
    </span>
    <figure v-else class="project-equation">
        <div class="project-equation__body" :class="{ 'project-equation__body--plain': !framed }">
            <div v-if="svgMarkup" class="project-equation__svg" v-html="svgMarkup" />
            <pre v-else-if="renderError" class="project-equation__error">{{ renderError }}</pre>
        </div>
        <figcaption v-if="caption" class="project-equation__caption">
            {{ caption }}
        </figcaption>
    </figure>
</template>
