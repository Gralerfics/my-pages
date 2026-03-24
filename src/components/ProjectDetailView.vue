<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
    currentProject: {
        type: Object,
        required: true,
    },
    projects: {
        type: Array,
        required: true,
    },
    relatedProjectsCount: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['select-project'])

const relatedProjects = computed(() =>
    props.projects
        .filter((project) => project.slug !== props.currentProject.slug)
        .slice(0, props.relatedProjectsCount),
)

const pageRoot = ref(null)
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
const lightbox = ref(null)
const lightboxImage = ref(null)
const dragState = ref({
    active: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
})

function collectGalleryItems() {
    if (!pageRoot.value) {
        return []
    }

    return Array.from(pageRoot.value.querySelectorAll('.project-cover__image, .section-body img'))
        .map((image, index) => ({
            id: `${index}:${image.currentSrc || image.src}`,
            src: image.currentSrc || image.src,
            alt: image.alt || '',
            caption: image.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '',
        }))
}

function openLightbox(clickedImage) {
    const items = collectGalleryItems()
    const clickedSrc = clickedImage.currentSrc || clickedImage.src
    const currentIndex = Math.max(
        0,
        items.findIndex((item) => item.src === clickedSrc),
    )

    lightbox.value = {
        items,
        currentIndex,
        viewStates: {},
        contrastModes: {},
    }
    document.body.style.overflow = 'hidden'
}

function closeLightbox() {
    lightbox.value = null
    document.body.style.overflow = ''
}

function handleImageClick(event) {
    const image = event.target.closest('img')
    if (!image || !event.currentTarget.contains(image)) {
        return
    }

    openLightbox(image)
}

function getCurrentItem() {
    return lightbox.value?.items?.[lightbox.value.currentIndex] ?? null
}

function getCurrentViewState() {
    const currentItem = getCurrentItem()
    if (!lightbox.value || !currentItem) {
        return null
    }

    return lightbox.value.viewStates[currentItem.id] ?? { scale: 1, offsetX: 0, offsetY: 0 }
}

function setCurrentViewState(nextState) {
    const currentItem = getCurrentItem()
    if (!lightbox.value || !currentItem) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        viewStates: {
            ...lightbox.value.viewStates,
            [currentItem.id]: nextState,
        },
    }
}

function resetCurrentViewState() {
    setCurrentViewState({ scale: 1, offsetX: 0, offsetY: 0 })
    endLightboxDrag()
}

function getCurrentContrastMode() {
    const currentItem = getCurrentItem()
    if (!lightbox.value || !currentItem) {
        return 'dark-image'
    }

    return lightbox.value.contrastModes[currentItem.id] ?? 'dark-image'
}

function setCurrentContrastMode(mode) {
    const currentItem = getCurrentItem()
    if (!lightbox.value || !currentItem) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        contrastModes: {
            ...lightbox.value.contrastModes,
            [currentItem.id]: mode,
        },
    }
}

const gallerySlots = computed(() => {
    if (viewportWidth.value < 520) {
        return 3
    }
    if (viewportWidth.value < 760) {
        return 4
    }
    if (viewportWidth.value < 1080) {
        return 5
    }
    return 7
})

const galleryWindow = computed(() => {
    if (!lightbox.value) {
        return { items: [], hasPrevHidden: false, hasNextHidden: false }
    }

    const items = lightbox.value.items
    const slots = Math.min(gallerySlots.value, Math.max(1, items.length))
    const half = Math.floor(slots / 2)
    const start = lightbox.value.currentIndex - half

    return {
        items: Array.from({ length: slots }, (_, slotIndex) => {
            const itemIndex = start + slotIndex
            if (itemIndex < 0 || itemIndex >= items.length) {
                return null
            }

            return {
                ...items[itemIndex],
                index: itemIndex,
            }
        }),
        hasPrevHidden: start > 0,
        hasNextHidden: start + slots < items.length,
    }
})

function canGoPrev() {
    return Boolean(lightbox.value && lightbox.value.currentIndex > 0)
}

function canGoNext() {
    return Boolean(lightbox.value && lightbox.value.currentIndex < lightbox.value.items.length - 1)
}

function showPrevImage() {
    if (!canGoPrev()) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: lightbox.value.currentIndex - 1,
    }
    endLightboxDrag()
}

function showNextImage() {
    if (!canGoNext()) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: lightbox.value.currentIndex + 1,
    }
    endLightboxDrag()
}

function jumpToImage(index) {
    if (!lightbox.value || index < 0 || index >= lightbox.value.items.length) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: index,
    }
    endLightboxDrag()
}

function analyseCurrentImageContrast() {
    if (!lightboxImage.value) {
        return
    }

    const sample = document.createElement('canvas')
    const width = 24
    const height = 24
    sample.width = width
    sample.height = height

    const context = sample.getContext('2d', { willReadFrequently: true })
    if (!context) {
        return
    }

    try {
        context.drawImage(lightboxImage.value, 0, 0, width, height)
        const { data } = context.getImageData(0, 0, width, height)
        let luminanceSum = 0
        let alphaSum = 0

        for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3] / 255
            if (alpha === 0) {
                continue
            }

            const r = data[index]
            const g = data[index + 1]
            const b = data[index + 2]
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

            luminanceSum += luminance * alpha
            alphaSum += alpha
        }

        const averageLuminance = alphaSum > 0 ? luminanceSum / alphaSum : 0
        setCurrentContrastMode(averageLuminance > 164 ? 'light-image' : 'dark-image')
    } catch {
        setCurrentContrastMode('dark-image')
    }
}

function handleKeydown(event) {
    if (event.key === 'Escape' && lightbox.value) {
        closeLightbox()
        return
    }

    if (event.key === 'ArrowLeft' && lightbox.value) {
        event.preventDefault()
        showPrevImage()
        return
    }

    if (event.key === 'ArrowRight' && lightbox.value) {
        event.preventDefault()
        showNextImage()
        return
    }

    if (event.key === 'ArrowUp' && lightbox.value) {
        event.preventDefault()
        resetCurrentViewState()
    }
}

function handleResize() {
    viewportWidth.value = window.innerWidth
}

function handleLightboxWheel(event) {
    if (!lightbox.value || !lightboxImage.value) {
        return
    }

    event.preventDefault()

    const rect = lightboxImage.value.getBoundingClientRect()
    const delta = event.deltaY < 0 ? 0.16 : -0.16
    const currentViewState = getCurrentViewState()
    const prevScale = currentViewState.scale
    const nextScale = Math.min(4, Math.max(0.2, Number((prevScale + delta).toFixed(2))))
    const pointerX = event.clientX - rect.left - rect.width / 2
    const pointerY = event.clientY - rect.top - rect.height / 2
    const scaleRatio = nextScale / prevScale

    setCurrentViewState({
        scale: nextScale,
        offsetX: nextScale <= 1 ? 0 : currentViewState.offsetX - pointerX * (scaleRatio - 1),
        offsetY: nextScale <= 1 ? 0 : currentViewState.offsetY - pointerY * (scaleRatio - 1),
    })
}

function handleLightboxPointerDown(event) {
    if (!lightboxImage.value) {
        return
    }

    if (event.target.closest('.image-lightbox__close, .image-lightbox__nav, .image-lightbox__meta')) {
        return
    }

    if (!event.target.closest('.image-lightbox__image')) {
        closeLightbox()
        return
    }

    const currentViewState = getCurrentViewState()
    if (!currentViewState || currentViewState.scale <= 1) {
        return
    }

    dragState.value = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: currentViewState.offsetX,
        offsetY: currentViewState.offsetY,
    }
}

function handleLightboxPointerMove(event) {
    if (!dragState.value.active) {
        return
    }

    event.preventDefault()

    const deltaX = event.clientX - dragState.value.startX
    const deltaY = event.clientY - dragState.value.startY

    setCurrentViewState({
        ...getCurrentViewState(),
        offsetX: dragState.value.offsetX + deltaX,
        offsetY: dragState.value.offsetY + deltaY,
    })
}

function endLightboxDrag() {
    dragState.value.active = false
}

watch(
    () => props.currentProject.slug,
    () => {
        closeLightbox()
    },
)

onBeforeUnmount(() => {
    document.body.style.overflow = ''
})

if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', handleResize)
    onBeforeUnmount(() => {
        window.removeEventListener('keydown', handleKeydown)
        window.removeEventListener('resize', handleResize)
    })
}
</script>

<template>
    <div class="page page-project">
        <div ref="pageRoot">
        <section v-if="currentProject.cover" class="project-cover" @click="handleImageClick">
            <img
                class="project-cover__image"
                :src="currentProject.cover"
                :alt="currentProject.title"
            />
        </section>

        <section class="project-hero">
            <div class="project-hero__body">
                <p class="eyebrow">{{ currentProject.groups.join(' / ') }}</p>
                <h1>{{ currentProject.title }}</h1>
                <p class="project-hero__subtitle">{{ currentProject.subtitle }}</p>

                <div class="tag-row">
          <span v-for="tag in currentProject.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
                </div>

                <p class="project-hero__summary">{{ currentProject.intro }}</p>

        <div class="project-hero__actions">
          <a
            v-if="currentProject.repo"
            class="button button--primary"
            :href="currentProject.repo"
                        target="_blank"
                        rel="noreferrer"
          >
            Open Repository
          </a>
          <span v-if="currentProject.time" class="status-pill">{{ currentProject.time }}</span>
          <span v-if="currentProject.status" class="status-pill">{{ currentProject.status }}</span>
          <span v-if="currentProject.collaboration" class="status-pill">{{ currentProject.collaboration }}</span>
        </div>
      </div>
    </section>

        <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Project</p>
                <h2>Details</h2>
            </div>
            <div class="section-body" @click="handleImageClick">
                <component :is="currentProject.pageComponent" />
            </div>
        </section>

        <section class="editorial-section editorial-section--related">
            <div class="section-label">
                <p class="eyebrow">Browse</p>
                <h2>Other projects</h2>
            </div>
            <div class="section-body">
                <div class="project-list">
                    <button
                        v-for="project in relatedProjects"
                        :key="project.slug"
                        type="button"
                        class="project-list__item"
                        @click="emit('select-project', project.slug)"
                    >
                        <div>
                            <p class="project-list__meta">{{ project.groups.join(' / ') }}</p>
                            <h3>{{ project.title }}</h3>
                        </div>
                        <p>{{ project.subtitle }}</p>
                    </button>
                </div>
            </div>
        </section>
        </div>

        <teleport to="body">
            <div
                v-if="lightbox"
                class="image-lightbox"
                :class="`image-lightbox--${getCurrentContrastMode()}`"
                role="dialog"
                aria-modal="true"
                @wheel="handleLightboxWheel"
                @pointerdown="handleLightboxPointerDown"
                @pointermove="handleLightboxPointerMove"
                @pointerup="endLightboxDrag"
                @pointerleave="endLightboxDrag"
                @pointercancel="endLightboxDrag"
            >
                <button type="button" class="image-lightbox__close" @click="closeLightbox">
                    Close
                </button>
                <button
                    v-if="canGoPrev()"
                    type="button"
                    class="image-lightbox__nav image-lightbox__nav--prev"
                    @click.stop="showPrevImage"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14.5 5.5 8 12l6.5 6.5" />
                    </svg>
                </button>
                <button
                    v-if="canGoNext()"
                    type="button"
                    class="image-lightbox__nav image-lightbox__nav--next"
                    @click.stop="showNextImage"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
                    </svg>
                </button>
                <div class="image-lightbox__viewport">
                    <img
                        ref="lightboxImage"
                        class="image-lightbox__image"
                        :src="getCurrentItem()?.src"
                        :alt="getCurrentItem()?.alt"
                        draggable="false"
                        @dragstart.prevent
                        @load="analyseCurrentImageContrast"
                        :style="{
                            transform: `translate(${getCurrentViewState()?.offsetX ?? 0}px, ${getCurrentViewState()?.offsetY ?? 0}px) scale(${getCurrentViewState()?.scale ?? 1})`,
                        }"
                    />
                </div>
                <div class="image-lightbox__meta">
                    <div class="image-lightbox__info">
                        <p class="image-lightbox__counter">
                            {{ lightbox.currentIndex + 1 }} / {{ lightbox.items.length }}
                        </p>
                        <p v-if="getCurrentItem()?.caption" class="image-lightbox__caption">
                            {{ getCurrentItem()?.caption }}
                        </p>
                    </div>
                    <div
                        v-if="lightbox.items.length > 1"
                        class="image-lightbox__gallery"
                        :class="{
                            'has-prev-hidden': galleryWindow.hasPrevHidden,
                            'has-next-hidden': galleryWindow.hasNextHidden,
                        }"
                        :style="{ '--gallery-columns': galleryWindow.items.length }"
                    >
                        <button
                            v-for="(item, slotIndex) in galleryWindow.items"
                            :key="item?.id ?? `placeholder-${slotIndex}`"
                            type="button"
                            class="image-lightbox__thumb"
                            :class="{
                                'is-active': item?.index === lightbox.currentIndex,
                                'is-placeholder': !item,
                            }"
                            :disabled="!item"
                            @click.stop="item && jumpToImage(item.index)"
                        >
                            <img
                                v-if="item"
                                :src="item.src"
                                :alt="item.alt"
                                draggable="false"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
</template>
