<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
    tools: {
        type: Array,
        required: true,
    },
    toolTabs: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['open-tool'])
const { t, groupLabel } = useI18n()

const ALL_TAB = '__all__'
const activeTab = ref(ALL_TAB)
const searchQuery = ref('')

const availableTabs = computed(() => [ALL_TAB, ...props.toolTabs])

const filteredTools = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return props.tools.filter((tool) => {
        const matchesTab = activeTab.value === ALL_TAB || tool.groups.includes(activeTab.value)
        const searchableGroups = tool.displayGroups ?? tool.groups
        const matchesQuery =
            !query
            || tool.title.toLowerCase().includes(query)
            || tool.subtitle.toLowerCase().includes(query)
            || tool.intro.toLowerCase().includes(query)
            || searchableGroups.some((group) => group.toLowerCase().includes(query))
            || tool.tags.some((tag) => tag.toLowerCase().includes(query))

        return matchesTab && matchesQuery
    })
})
</script>

<template>
    <div class="page page-tools">
        <section class="projects-hero tools-hero">
            <div class="hero-panel__body">
                <p class="eyebrow">{{ t('tools.eyebrow') }}</p>
                <h1>{{ t('tools.title') }}</h1>
                <p class="hero-panel__intro">
                    {{ t('tools.intro') }}
                </p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('tools.browseEyebrow') }}</p>
                <h2>{{ t('tools.filterTitle') }}</h2>
            </div>
            <div class="section-body">
                <div class="projects-toolbar">
                    <div class="project-tabs" role="tablist" :aria-label="t('tools.groupsAria')">
                        <button
                            v-for="tab in availableTabs"
                            :key="tab"
                            type="button"
                            class="project-tab"
                            :class="{ 'is-active': tab === activeTab }"
                            :aria-selected="tab === activeTab"
                            @click="activeTab = tab"
                        >
                            {{ tab === ALL_TAB ? t('common.all') : groupLabel(tab) }}
                        </button>
                    </div>

                    <label class="projects-search">
                        <span class="projects-search__label">{{ t('common.search') }}</span>
                        <input
                            v-model="searchQuery"
                            class="projects-search__input"
                            type="text"
                            :placeholder="t('common.searchTools')"
                        />
                    </label>
                </div>

                <Transition name="projects-fade" mode="out-in">
                    <div :key="`${activeTab}:${searchQuery.trim().toLowerCase()}`" class="project-listing">
                        <button
                            v-for="tool in filteredTools"
                            :key="tool.slug"
                            type="button"
                            class="project-card"
                            @click="emit('open-tool', tool.slug)"
                        >
                            <div class="project-card__content">
                                <img
                                    v-if="tool.cover"
                                    class="project-card__thumb"
                                    :src="tool.cover"
                                    :alt="tool.title"
                                />
                                <div v-else class="project-card__thumb project-card__thumb--placeholder" aria-hidden="true">
                                    <span>{{ tool.title }}</span>
                                </div>
                                <div class="project-card__head">
                                    <p class="project-card__meta">{{ (tool.displayGroups ?? tool.groups).join(' / ') }}</p>
                                    <h3>{{ tool.title }}</h3>
                                    <p class="project-card__subtitle">{{ tool.subtitle }}</p>
                                </div>
                                <div class="project-card__summary-wrap">
                                    <p class="project-card__summary">{{ tool.intro }}</p>
                                    <span class="project-card__more">
                                        {{ t('common.open') }}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>
                </Transition>
            </div>
        </section>
    </div>
</template>
