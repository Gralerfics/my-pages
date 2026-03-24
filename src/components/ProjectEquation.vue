<script setup>
import { computed, ref, watch } from 'vue'
import { $typst } from '@myriaddreamin/typst.ts'
import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/wasm?url'
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url'
import { setImportWasmModule as setRendererImportWasmModule } from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer.mjs'
import { setImportWasmModule as setCompilerImportWasmModule } from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler.mjs'

const props = defineProps({
    code: {
        type: String,
        required: true,
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
})

let typstWasmConfigured = false

function configureTypstWasm() {
    if (typstWasmConfigured) {
        return
    }

    setRendererImportWasmModule((wasmName) => {
        if (wasmName === 'typst_ts_renderer_bg.wasm') {
            return fetch(rendererWasmUrl)
        }

        throw new Error(`Unknown renderer wasm module: ${wasmName}`)
    })

    setCompilerImportWasmModule((wasmName) => {
        if (wasmName === 'typst_ts_web_compiler_bg.wasm') {
            return fetch(compilerWasmUrl)
        }

        throw new Error(`Unknown compiler wasm module: ${wasmName}`)
    })

    typstWasmConfigured = true
}

const svgMarkup = ref('')
const renderError = ref('')

const documentSource = computed(() => [
    '#set page(width: auto, height: auto, margin: 0pt)',
    `#set text(size: ${props.size})`,
    '#set par(justify: false)',
    props.code.trim(),
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
            renderError.value = error instanceof Error ? error.message : 'Failed to render equation.'
        }
    },
    { immediate: true },
)
</script>

<template>
    <figure class="project-equation">
        <div class="project-equation__body" :class="{ 'project-equation__body--plain': !framed }">
            <div v-if="svgMarkup" class="project-equation__svg" v-html="svgMarkup" />
            <pre v-else-if="renderError" class="project-equation__error">{{ renderError }}</pre>
        </div>
        <figcaption v-if="caption" class="project-equation__caption">
            {{ caption }}
        </figcaption>
    </figure>
</template>
