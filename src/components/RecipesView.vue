<script setup>
import { computed, ref } from 'vue'
import { useResponsiveColumns } from '../composables/useResponsiveColumns'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
    recipes: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['open-recipe'])
const { t } = useI18n()
const searchQuery = ref('')

const filteredRecipes = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
        return props.recipes
    }

    return props.recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
        || recipe.subtitle.toLowerCase().includes(query)
        || (recipe.representative_ingredients ?? []).some((ingredient) => ingredient.toLowerCase().includes(query)),
    )
})

const { columns: recipeColumns } = useResponsiveColumns(filteredRecipes)
</script>

<template>
    <div class="page page-recipes">
        <section class="recipes-hero">
            <div class="hero-panel__body">
                <p class="eyebrow">{{ t('recipes.eyebrow') }}</p>
                <h1>{{ t('recipes.title') }}</h1>
                <p class="hero-panel__intro">
                    {{ t('recipes.intro') }}
                </p>
            </div>
        </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">{{ t('recipes.browseEyebrow') }}</p>
                <h2>{{ t('recipes.searchTitle') }}</h2>
            </div>
            <div class="section-body">
                <div class="projects-toolbar recipes-toolbar">
                    <label class="projects-search">
                        <span class="projects-search__label">{{ t('common.search') }}</span>
                        <input
                            v-model="searchQuery"
                            class="projects-search__input"
                            type="text"
                            :placeholder="t('common.searchRecipes')"
                        />
                    </label>
                </div>

                <Transition name="projects-fade" mode="out-in">
                    <div :key="searchQuery.trim().toLowerCase()" class="home-preview-grid recipes-grid">
                        <div
                            v-for="(column, columnIndex) in recipeColumns"
                            :key="columnIndex"
                            class="home-preview-grid__column"
                        >
                            <button
                                v-for="recipe in column"
                                :key="recipe.slug"
                                type="button"
                                class="home-preview-card recipe-card"
                                @click="emit('open-recipe', recipe.slug)"
                            >
                                <img
                                    v-if="recipe.cover"
                                    class="home-preview-card__thumb recipe-card__thumb"
                                    :src="recipe.cover"
                                    :alt="recipe.title"
                                />
                                <div v-else class="home-preview-card__thumb home-preview-card__thumb--placeholder" aria-hidden="true">
                                    <span>{{ recipe.title }}</span>
                                </div>
                                <div class="home-preview-card__body">
                                    <h3>{{ recipe.title }}</h3>
                                    <p class="home-preview-card__summary">{{ recipe.subtitle }}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </section>
    </div>
</template>
