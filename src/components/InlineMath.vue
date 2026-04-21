<script setup>
import ProjectTypst from './ProjectTypst.vue'

defineProps({
    code: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        default: '10.5pt',
    },
})
</script>

<template>
    <ProjectTypst :code="code" :size="size" :framed="false" inline />
</template>
