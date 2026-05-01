<script setup>
const props = defineProps({
    lightbox: {
        type: Object,
        required: true,
    },
    galleryWindow: {
        type: Object,
        required: true,
    },
    currentItem: {
        type: Object,
        default: null,
    },
    prevItem: {
        type: Object,
        default: null,
    },
    nextItem: {
        type: Object,
        default: null,
    },
    contrastMode: {
        type: String,
        required: true,
    },
    canGoPrev: {
        type: Boolean,
        required: true,
    },
    canGoNext: {
        type: Boolean,
        required: true,
    },
    swipeOffsetX: {
        type: Number,
        required: true,
    },
    swipeTracking: {
        type: Boolean,
        required: true,
    },
    imageTransitionEnabled: {
        type: Boolean,
        required: true,
    },
    imageTransform: {
        type: Function,
        required: true,
    },
    closeLabel: {
        type: String,
        required: true,
    },
})

const emit = defineEmits([
    'close',
    'previous',
    'next',
    'jump',
    'wheel',
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerleave',
    'pointercancel',
    'image-load',
    'image-click',
])
</script>

<template>
    <div
        class="image-lightbox"
        :class="`image-lightbox--${contrastMode}`"
        role="dialog"
        aria-modal="true"
        @wheel="emit('wheel', $event)"
        @pointerdown="emit('pointerdown', $event)"
        @pointermove="emit('pointermove', $event)"
        @pointerup="emit('pointerup', $event)"
        @pointerleave="emit('pointerleave', $event)"
        @pointercancel="emit('pointercancel', $event)"
    >
        <button type="button" class="image-lightbox__close" @click="emit('close')">
            {{ closeLabel }}
        </button>
        <button
            v-if="canGoPrev"
            type="button"
            class="image-lightbox__nav image-lightbox__nav--prev"
            @click.stop="emit('previous')"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.5 5.5 8 12l6.5 6.5" />
            </svg>
        </button>
        <button
            v-if="canGoNext"
            type="button"
            class="image-lightbox__nav image-lightbox__nav--next"
            @click.stop="emit('next')"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
            </svg>
        </button>
        <div class="image-lightbox__viewport">
            <div class="image-lightbox__stage">
                <img
                    v-if="prevItem && (swipeOffsetX > 0 || swipeTracking)"
                    class="image-lightbox__image image-lightbox__image--adjacent"
                    :src="prevItem.src"
                    :alt="prevItem.alt"
                    draggable="false"
                    :style="{ transform: imageTransform('prev') }"
                    @dragstart.prevent
                />
                <img
                    class="image-lightbox__image"
                    :class="{ 'image-lightbox__image--no-transition': !imageTransitionEnabled }"
                    :src="currentItem?.src"
                    :alt="currentItem?.alt"
                    draggable="false"
                    :style="{ transform: imageTransform('current') }"
                    @dragstart.prevent
                    @load="emit('image-load', $event)"
                    @click.stop="emit('image-click')"
                />
                <img
                    v-if="nextItem && (swipeOffsetX < 0 || swipeTracking)"
                    class="image-lightbox__image image-lightbox__image--adjacent"
                    :src="nextItem.src"
                    :alt="nextItem.alt"
                    draggable="false"
                    :style="{ transform: imageTransform('next') }"
                    @dragstart.prevent
                />
            </div>
        </div>
        <div class="image-lightbox__meta">
            <div class="image-lightbox__info">
                <p class="image-lightbox__counter">
                    {{ lightbox.currentIndex + 1 }} / {{ lightbox.items.length }}
                </p>
                <p v-if="currentItem?.caption" class="image-lightbox__caption">
                    {{ currentItem.caption }}
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
                    @click.stop="item && emit('jump', item.index)"
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
</template>
