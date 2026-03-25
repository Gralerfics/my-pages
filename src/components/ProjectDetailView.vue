<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

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
const suppressLightboxClick = ref(false)
const settleOffsetX = ref(0)
const lightboxImageTransitionEnabled = ref(true)
const dragState = ref({
    active: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    moved: false,
})
const swipeState = ref({
    pointerType: '',
    startX: 0,
    startY: 0,
    tracking: false,
    offsetX: 0,
    moved: false,
    suppressClick: false,
})
let mediaGridNormalizeFrame = 0

function collectGalleryItems() {
    if (!pageRoot.value) {
        return []
    }

    return Array.from(pageRoot.value.querySelectorAll('.project-cover__image, .section-body img'))
        .map((image, index) => ({
            id: `${index}:${image.currentSrc || image.src}`,
            src: image.currentSrc || image.src,
            alt: image.alt || '',
            caption: image.classList.contains('project-cover__image')
                ? '(cover)'
                : image.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '',
        }))
}

function normalizeArticleLinks() {
    if (!pageRoot.value) {
        return
    }

    pageRoot.value.querySelectorAll('.section-body .project-article a[href]').forEach((link) => {
        const href = link.getAttribute('href') || ''
        const isInternalHashLink = href.startsWith('#/')

        if (isInternalHashLink) {
            link.removeAttribute('target')
            link.removeAttribute('rel')
            return
        }

        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noreferrer')
    })
}

function getProjectMediaHeight(figure) {
    const media =
        figure.querySelector(':scope > .project-media__frame') ||
        figure.querySelector(':scope > img, :scope > video, :scope > canvas, :scope > svg')

    if (!media) {
        return 0
    }

    return media.getBoundingClientRect().height
}

function normalizeProjectMediaGrids() {
    if (!pageRoot.value) {
        return
    }

    pageRoot.value.querySelectorAll('.project-media-grid').forEach((grid) => {
        const figures = Array.from(grid.querySelectorAll(':scope > .project-media'))
        if (!figures.length) {
            grid.style.removeProperty('--project-media-area-height')
            return
        }

        let tallestHeight = 0
        figures.forEach((figure) => {
            tallestHeight = Math.max(tallestHeight, getProjectMediaHeight(figure))
        })

        if (tallestHeight > 0) {
            grid.style.setProperty('--project-media-area-height', `${Math.ceil(tallestHeight)}px`)
        } else {
            grid.style.removeProperty('--project-media-area-height')
        }
    })
}

function scheduleProjectMediaNormalization() {
    if (typeof window === 'undefined') {
        return
    }

    window.cancelAnimationFrame(mediaGridNormalizeFrame)
    mediaGridNormalizeFrame = window.requestAnimationFrame(() => {
        normalizeProjectMediaGrids()
    })
}

function bindProjectMediaLoadHandlers() {
    if (!pageRoot.value) {
        return
    }

    pageRoot.value.querySelectorAll('.project-media-grid img').forEach((image) => {
        if (image.complete) {
            return
        }

        image.addEventListener('load', scheduleProjectMediaNormalization, { once: true })
    })
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

function getPrevItem() {
    if (!lightbox.value || lightbox.value.currentIndex <= 0) {
        return null
    }

    return lightbox.value.items[lightbox.value.currentIndex - 1]
}

function getNextItem() {
    if (!lightbox.value || lightbox.value.currentIndex >= lightbox.value.items.length - 1) {
        return null
    }

    return lightbox.value.items[lightbox.value.currentIndex + 1]
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

function resetGestureState() {
    dragState.value = {
        active: false,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        moved: false,
    }
    swipeState.value = {
        pointerType: '',
        startX: 0,
        startY: 0,
        tracking: false,
        offsetX: 0,
        moved: false,
        suppressClick: false,
    }
}

function startSettleAnimation(initialOffsetX) {
    lightboxImageTransitionEnabled.value = false
    settleOffsetX.value = initialOffsetX
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            lightboxImageTransitionEnabled.value = true
            settleOffsetX.value = 0
        })
    })
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
        return 5
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
    const slots = gallerySlots.value
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

function showPrevImage(settleFromX = 0) {
    if (!canGoPrev()) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: lightbox.value.currentIndex - 1,
    }
    if (settleFromX) {
        startSettleAnimation(settleFromX)
    }
}

function showNextImage(settleFromX = 0) {
    if (!canGoNext()) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: lightbox.value.currentIndex + 1,
    }
    if (settleFromX) {
        startSettleAnimation(settleFromX)
    }
}

function jumpToImage(index) {
    if (!lightbox.value || index < 0 || index >= lightbox.value.items.length) {
        return
    }

    lightbox.value = {
        ...lightbox.value,
        currentIndex: index,
    }
    settleOffsetX.value = 0
    resetGestureState()
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
    scheduleProjectMediaNormalization()
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
    swipeState.value = {
        pointerType: event.pointerType || '',
        startX: event.clientX,
        startY: event.clientY,
        tracking: true,
        offsetX: 0,
        moved: false,
        suppressClick: false,
    }

    if (!currentViewState || currentViewState.scale <= 1) {
        return
    }

    dragState.value = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: currentViewState.offsetX,
        offsetY: currentViewState.offsetY,
        moved: false,
    }
}

function handleLightboxPointerMove(event) {
    if (dragState.value.active) {
        event.preventDefault()

        const deltaX = event.clientX - dragState.value.startX
        const deltaY = event.clientY - dragState.value.startY

        setCurrentViewState({
            ...getCurrentViewState(),
            offsetX: dragState.value.offsetX + deltaX,
            offsetY: dragState.value.offsetY + deltaY,
        })
        dragState.value.moved = Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6
        return
    }

    if (!swipeState.value.tracking) {
        return
    }

    const currentViewState = getCurrentViewState()
    if (!currentViewState || currentViewState.scale > 1) {
        return
    }

    const deltaX = event.clientX - swipeState.value.startX
    const deltaY = event.clientY - swipeState.value.startY

    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.1) {
        return
    }

    event.preventDefault()

    const blockedAtEdge =
        (deltaX > 0 && !canGoPrev()) ||
        (deltaX < 0 && !canGoNext())

    swipeState.value.offsetX = blockedAtEdge ? deltaX * 0.35 : deltaX
    swipeState.value.moved = Math.abs(swipeState.value.offsetX) > 10
}

function handleLightboxImageClick() {
    if (suppressLightboxClick.value) {
        suppressLightboxClick.value = false
        return
    }

    const currentViewState = getCurrentViewState()
    if (!currentViewState) {
        return
    }

    if (currentViewState.scale !== 1 || currentViewState.offsetX !== 0 || currentViewState.offsetY !== 0) {
        resetCurrentViewState()
    }
}

function endLightboxDrag(event) {
    if (dragState.value.active && dragState.value.moved) {
        suppressLightboxClick.value = true
    }

    if (swipeState.value.tracking && event && !dragState.value.active) {
        const deltaX = swipeState.value.offsetX || (event.clientX - swipeState.value.startX)
        const deltaY = event.clientY - swipeState.value.startY
        const absX = Math.abs(deltaX)
        const absY = Math.abs(deltaY)
        const threshold = Math.min(180, viewportWidth.value * 0.18)
        const didSwipe = absX > threshold && absX > absY * 1.2
        suppressLightboxClick.value = swipeState.value.moved || dragState.value.moved

        if (didSwipe) {
            if (deltaX < 0) {
                showNextImage(viewportWidth.value + deltaX)
            } else {
                showPrevImage(-viewportWidth.value + deltaX)
            }

            resetGestureState()
            return
        }
    }

    resetGestureState()
}

function getLightboxImageTransform(position) {
    const currentViewState = getCurrentViewState() ?? { scale: 1, offsetX: 0, offsetY: 0 }
    const swipeOffsetX = dragState.value.active ? 0 : swipeState.value.offsetX
    const viewportSpan = viewportWidth.value

    if (position === 'current') {
        return `translate(calc(-50% + ${currentViewState.offsetX + swipeOffsetX + settleOffsetX.value}px), calc(-50% + ${currentViewState.offsetY}px)) scale(${currentViewState.scale})`
    }

    const baseOffset = position === 'prev' ? -viewportSpan : viewportSpan
    return `translate(calc(-50% + ${baseOffset + swipeOffsetX}px), -50%) scale(1)`
}

watch(
    () => props.currentProject.slug,
    async () => {
        closeLightbox()
        await nextTick()
        normalizeArticleLinks()
        bindProjectMediaLoadHandlers()
        scheduleProjectMediaNormalization()
    },
    { immediate: true },
)

onBeforeUnmount(() => {
    document.body.style.overflow = ''
    if (typeof window !== 'undefined') {
        window.cancelAnimationFrame(mediaGridNormalizeFrame)
    }
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
            v-for="repository in currentProject.repositoryLinks"
            :key="repository.href"
            class="button button--primary"
            :href="repository.href"
                        target="_blank"
                        rel="noreferrer"
          >
            {{ repository.label }}
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
                <p class="project-article__ending" aria-hidden="true">§</p>
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
                    <div class="image-lightbox__stage">
                        <img
                            v-if="getPrevItem() && (swipeState.offsetX > 0 || swipeState.tracking)"
                            class="image-lightbox__image image-lightbox__image--adjacent"
                            :src="getPrevItem()?.src"
                            :alt="getPrevItem()?.alt"
                            draggable="false"
                            @dragstart.prevent
                            :style="{ transform: getLightboxImageTransform('prev') }"
                        />
                        <img
                            ref="lightboxImage"
                            class="image-lightbox__image"
                            :class="{ 'image-lightbox__image--no-transition': !lightboxImageTransitionEnabled }"
                            :src="getCurrentItem()?.src"
                            :alt="getCurrentItem()?.alt"
                            draggable="false"
                            @dragstart.prevent
                            @load="analyseCurrentImageContrast"
                            @click.stop="handleLightboxImageClick"
                            :style="{ transform: getLightboxImageTransform('current') }"
                        />
                        <img
                            v-if="getNextItem() && (swipeState.offsetX < 0 || swipeState.tracking)"
                            class="image-lightbox__image image-lightbox__image--adjacent"
                            :src="getNextItem()?.src"
                            :alt="getNextItem()?.alt"
                            draggable="false"
                            @dragstart.prevent
                            :style="{ transform: getLightboxImageTransform('next') }"
                        />
                    </div>
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
