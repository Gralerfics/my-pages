<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    code: {
        type: String,
        required: true,
    },
    lang: {
        type: String,
        default: 'text',
    },
})

const copyLabel = ref('Copy')

function escapeHtml(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}

function normalizeCodeText(text) {
    const lines = text
        .replaceAll('\r\n', '\n')
        .replace(/^\n+/, '')
        .replace(/\n+\s*$/, '')
        .split('\n')

    const indents = lines
        .filter((line) => line.trim())
        .map((line) => (line.match(/^(\s*)/)?.[0].length ?? 0))

    const minIndent = indents.length ? Math.min(...indents) : 0
    return lines.map((line) => line.slice(minIndent)).join('\n')
}

function highlightCode(text, language) {
    const patternsByLanguage = {
        python: [
            { type: 'comment', pattern: /#[^\n]*/y },
            { type: 'string', pattern: /(?:f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*')/y },
            { type: 'keyword', pattern: /\b(?:and|as|break|class|continue|def|elif|else|except|False|finally|for|from|if|import|in|is|lambda|None|not|or|pass|raise|return|True|try|while|with|yield)\b/y },
            { type: 'number', pattern: /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?)\b/y },
        ],
        text: [],
    }

    const patterns = patternsByLanguage[language] ?? patternsByLanguage.text
    let index = 0
    let html = ''

    while (index < text.length) {
        let matched = false

        for (const token of patterns) {
            token.pattern.lastIndex = index
            const result = token.pattern.exec(text)
            if (!result) {
                continue
            }

            html += `<span class="token token--${token.type}">${escapeHtml(result[0])}</span>`
            index += result[0].length
            matched = true
            break
        }

        if (!matched) {
            html += escapeHtml(text[index])
            index += 1
        }
    }

    return html
}

const normalizedCode = computed(() => normalizeCodeText(props.code))
const normalizedLang = computed(() => props.lang.toLowerCase())
const highlightedLines = computed(() =>
    normalizedCode.value.split('\n').map((line) => line ? highlightCode(line, normalizedLang.value) : '&nbsp;'),
)

async function copyCode() {
    try {
        await navigator.clipboard.writeText(normalizedCode.value)
        copyLabel.value = 'Copied'
    } catch {
        copyLabel.value = 'Failed'
    }

    window.setTimeout(() => {
        copyLabel.value = 'Copy'
    }, 1200)
}
</script>

<template>
    <div class="project-code-block">
        <div class="project-code-block__toolbar">
            <span class="project-code-block__label">{{ normalizedLang }}</span>
            <button type="button" class="project-code-block__copy" @click="copyCode">
                {{ copyLabel }}
            </button>
        </div>
        <pre><code>
            <span
                v-for="(line, index) in highlightedLines"
                :key="index"
                class="project-code-block__line"
            >
                <span class="project-code-block__line-number" aria-hidden="true">{{ index + 1 }}</span>
                <span class="project-code-block__line-content" v-html="line" />
            </span>
        </code></pre>
    </div>
</template>
