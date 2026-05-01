<script setup>
import { computed, ref } from 'vue'
import ImageLightbox from './ImageLightbox.vue'
import { useArticleMedia } from '../composables/useArticleMedia'
import { useI18n } from '../i18n/useI18n'

const props = defineProps({
    currentRecipe: {
        type: Object,
        required: true,
    },
    recipes: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['select-recipe'])
const { t } = useI18n()
const pageRoot = ref(null)

const relatedRecipes = computed(() =>
    props.recipes
        .filter((recipe) => recipe.slug !== props.currentRecipe.slug)
        .slice(0, 4),
)

const {
    lightbox,
    lightboxImageTransitionEnabled,
    swipeState,
    galleryWindow,
    closeLightbox,
    handleImageClick,
    getCurrentItem,
    getPrevItem,
    getNextItem,
    getCurrentContrastMode,
    canGoPrev,
    canGoNext,
    showPrevImage,
    showNextImage,
    jumpToImage,
    analyseCurrentImageContrast,
    handleLightboxWheel,
    handleLightboxPointerDown,
    handleLightboxPointerMove,
    handleLightboxImageClick,
    endLightboxDrag,
    getLightboxImageTransform,
} = useArticleMedia({
    pageRoot,
    watchKey: () => props.currentRecipe.slug,
    t,
})
</script>

<template>
    <div class="page page-project page-recipe">
        <div ref="pageRoot">
            <section v-if="currentRecipe.cover" class="project-cover recipe-cover" @click="handleImageClick">
                <img
                    class="project-cover__image"
                    :src="currentRecipe.cover"
                    :alt="currentRecipe.title"
                />
            </section>

            <section class="project-hero recipe-hero">
                <div class="project-hero__body">
                    <p class="eyebrow">{{ t('recipeDetail.eyebrow') }}</p>
                    <h1>{{ currentRecipe.title }}</h1>
                    <p class="project-hero__subtitle">{{ currentRecipe.subtitle }}</p>
                </div>
            </section>

            <div class="recipe-page-content" @click="handleImageClick">
                <component :is="currentRecipe.pageComponent" />
                <p class="project-article__ending" aria-hidden="true">§</p>
            </div>

            <section v-if="relatedRecipes.length" class="editorial-section editorial-section--related">
                <div class="section-label">
                    <p class="eyebrow">{{ t('recipeDetail.browseEyebrow') }}</p>
                    <h2>{{ t('recipeDetail.otherRecipes') }}</h2>
                </div>
                <div class="section-body">
                    <div class="project-list">
                        <button
                            v-for="recipe in relatedRecipes"
                            :key="recipe.slug"
                            type="button"
                            class="project-list__item"
                            @click="emit('select-recipe', recipe.slug)"
                        >
                            <div>
                                <p class="project-list__meta">{{ t('recipeDetail.eyebrow') }}</p>
                                <h3>{{ recipe.title }}</h3>
                            </div>
                            <p>{{ recipe.subtitle }}</p>
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <teleport to="body">
            <ImageLightbox
                v-if="lightbox"
                :lightbox="lightbox"
                :gallery-window="galleryWindow"
                :current-item="getCurrentItem()"
                :prev-item="getPrevItem()"
                :next-item="getNextItem()"
                :contrast-mode="getCurrentContrastMode()"
                :can-go-prev="canGoPrev()"
                :can-go-next="canGoNext()"
                :swipe-offset-x="swipeState.offsetX"
                :swipe-tracking="swipeState.tracking"
                :image-transition-enabled="lightboxImageTransitionEnabled"
                :image-transform="getLightboxImageTransform"
                :close-label="t('common.close')"
                @close="closeLightbox"
                @previous="showPrevImage"
                @next="showNextImage"
                @jump="jumpToImage"
                @wheel="handleLightboxWheel"
                @pointerdown="handleLightboxPointerDown"
                @pointermove="handleLightboxPointerMove"
                @pointerup="endLightboxDrag"
                @pointerleave="endLightboxDrag"
                @pointercancel="endLightboxDrag"
                @image-load="analyseCurrentImageContrast"
                @image-click="handleLightboxImageClick"
            />
        </teleport>
    </div>
</template>
