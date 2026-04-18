const noteModules = import.meta.glob('../generated/notes/*/index.json', {
    eager: true,
})

const notesIndexModule = import.meta.glob('../generated/notes/index.json', {
    eager: true,
})

function readModule(mod) {
    return mod?.default ?? mod
}

export const notes = Object.values(noteModules)
    .map(readModule)
    .sort((left, right) => left.title.localeCompare(right.title))

export const notesIndex = readModule(Object.values(notesIndexModule)[0]) ?? {
    generatedAt: null,
    notes: [],
    tree: [],
}

export function findNoteBySlug(slug) {
    return notes.find((note) => note.slug === slug) ?? null
}

export function findSectionByPathSlug(note, pathSlug = '') {
    return note?.sections.find((section) => section.pathSlug === pathSlug) ?? note?.sections[0] ?? null
}
