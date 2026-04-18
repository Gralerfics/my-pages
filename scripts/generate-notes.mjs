import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const notesRepoRoot = 'C:/Workspace/my-notes'
const generatedRoot = path.join(projectRoot, 'src', 'generated', 'notes')
const publicBundlesRoot = path.join(projectRoot, 'public', 'generated-notes')

function normalizeSlashes(value) {
    return value.replace(/\\/g, '/')
}

function slugifySegment(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
}

function createStableSlug(relativeDir) {
    return normalizeSlashes(relativeDir)
        .split('/')
        .filter(Boolean)
        .map((segment) => slugifySegment(segment) || 'note')
        .join('__')
}

function createSectionFileName(section) {
    return `__section__${(section.pathSlug || 'root').replace(/[^A-Za-z0-9.-]+/g, '_')}.typ`
}

function removeBom(text) {
    return text.replace(/^\uFEFF/, '')
}

function splitLines(text) {
    return removeBom(text).split(/\r?\n/)
}

function isSetupOnly(lines) {
    return lines.every((line) => {
        const trimmed = line.trim()
        return (
            trimmed === ''
            || trimmed.startsWith('//')
            || trimmed.startsWith('#import ')
            || trimmed.startsWith('#set ')
            || trimmed.startsWith('#show ')
            || trimmed.startsWith('#let ')
        )
    })
}

function parseHeading(line) {
    const match = /^(=+)\s+(.*)$/.exec(line)
    if (!match) {
        return null
    }

    const level = match[1].length
    const content = match[2]
    const anchorMatch = /\s+<([^>]+)>\s*$/.exec(content)
    const title = anchorMatch ? content.slice(0, anchorMatch.index).trim() : content.trim()

    return {
        level,
        rawTitle: title,
        anchor: anchorMatch?.[1] ?? null,
        line,
    }
}

function parseInclude(line) {
    const match = /^\s*#include\s+"([^"]+)"\s*$/.exec(line)
    return match ? match[1] : null
}

function rewriteLinePaths(line) {
    return line
}

async function exists(targetPath) {
    try {
        await fs.access(targetPath)
        return true
    }
    catch {
        return false
    }
}

async function ensureCleanDir(targetPath) {
    await fs.rm(targetPath, { recursive: true, force: true })
    await fs.mkdir(targetPath, { recursive: true })
}

async function walkNoteDirs(rootDir, relativeDir = '') {
    const currentDir = path.join(rootDir, relativeDir)
    const metaPath = path.join(currentDir, 'meta.json')
    if (await exists(metaPath)) {
        return [currentDir]
    }

    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    const results = []

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) {
            continue
        }

        results.push(...await walkNoteDirs(rootDir, path.join(relativeDir, entry.name)))
    }

    return results
}

async function collectFiles(rootDir) {
    const files = []

    async function walk(currentDir) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name)
            if (entry.isDirectory()) {
                await walk(fullPath)
                continue
            }

            files.push(fullPath)
        }
    }

    await walk(rootDir)
    return files
}

function sectionDisplayTitle(section) {
    return section.number ? `${section.number} ${section.rawTitle}` : section.rawTitle
}

function splitSectionContent(entries) {
    const firstChildIndex = entries.findIndex((entry) => entry.type === 'section')

    if (firstChildIndex === -1) {
        return {
            leadEntries: entries.filter((entry) => entry.type === 'content'),
            childSections: [],
            tailEntries: [],
        }
    }

    return {
        leadEntries: entries.slice(0, firstChildIndex).filter((entry) => entry.type === 'content'),
        childSections: entries.filter((entry) => entry.type === 'section'),
        tailEntries: entries.slice(firstChildIndex + 1).filter((entry) => entry.type === 'content'),
    }
}

function collectLeadingRootSetup(entries) {
    const setupLines = []

    for (const entry of entries) {
        if (entry.type === 'section') {
            break
        }

        if (entry.type === 'content' && isSetupOnly(entry.lines)) {
            setupLines.push(...entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath)))
            continue
        }

        break
    }

    return setupLines
}

function collectSetupLines(entries) {
    return entries
        .filter((entry) => entry.type === 'content' && isSetupOnly(entry.lines))
        .flatMap((entry) => entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath)))
}

async function parseTypstFile(noteDir, relativeFilePath, state) {
    const normalizedPath = normalizeSlashes(relativeFilePath)
    if (state.fileCache.has(normalizedPath)) {
        return state.fileCache.get(normalizedPath)
    }

    if (state.fileStack.has(normalizedPath)) {
        throw new Error(`Circular include detected: ${normalizedPath}`)
    }

    state.fileStack.add(normalizedPath)

    const fileContent = await fs.readFile(path.join(noteDir, normalizedPath), 'utf8')
    const lines = splitLines(fileContent)
    const rootEntries = []
    const sectionStack = []
    let bufferedLines = []

    const flushBuffer = () => {
        if (!bufferedLines.length) {
            return
        }

        const targetEntries = sectionStack.length
            ? sectionStack[sectionStack.length - 1].entries
            : rootEntries

        targetEntries.push({
            type: 'content',
            sourcePath: normalizedPath,
            lines: bufferedLines,
        })
        bufferedLines = []
    }

    for (const line of lines) {
        const includeTarget = parseInclude(line)
        if (includeTarget) {
            flushBuffer()

            const childPath = normalizeSlashes(path.posix.normalize(path.posix.join(path.posix.dirname(normalizedPath), includeTarget)))
            const childResult = await parseTypstFile(noteDir, childPath, state)
            const targetEntries = sectionStack.length
                ? sectionStack[sectionStack.length - 1].entries
                : rootEntries

            targetEntries.push(...childResult.entries)
            continue
        }

        const heading = parseHeading(line)
        if (!heading) {
            bufferedLines.push(line)
            continue
        }

        flushBuffer()

        while (sectionStack.length && sectionStack[sectionStack.length - 1].level >= heading.level) {
            sectionStack.pop()
        }

        const section = {
            type: 'section',
            level: heading.level,
            rawTitle: heading.rawTitle,
            anchor: heading.anchor,
            headingLine: heading.line,
            sourcePath: normalizedPath,
            entries: [],
        }

        const targetEntries = sectionStack.length
            ? sectionStack[sectionStack.length - 1].entries
            : rootEntries

        targetEntries.push(section)
        sectionStack.push(section)
    }

    flushBuffer()
    state.fileStack.delete(normalizedPath)

    const result = { entries: rootEntries }
    state.fileCache.set(normalizedPath, result)
    return result
}

function annotateSections(entries, context) {
    const { inheritedSetupLines, parentSectionPath, numberPrefix } = context
    let pendingSetupLines = []
    let siblingIndex = 0

    for (const entry of entries) {
        if (entry.type === 'content') {
            if (isSetupOnly(entry.lines)) {
                pendingSetupLines.push(...entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath)))
            }
            else {
                pendingSetupLines = []
            }
            continue
        }

        siblingIndex += 1
        const number = numberPrefix ? `${numberPrefix}.${siblingIndex}` : String(siblingIndex)
        const sectionPath = [...parentSectionPath, number]
        const pathSlug = sectionPath.join('-')
        const { leadEntries, childSections, tailEntries } = splitSectionContent(entry.entries)

        entry.number = number
        entry.path = sectionPath
        entry.pathSlug = pathSlug
        entry.prependedSetupLines = pendingSetupLines
        entry.leadEntries = leadEntries
        entry.childSections = childSections
        entry.tailEntries = tailEntries
        entry.inheritedSetupLines = [...inheritedSetupLines]

        const childInheritedSetup = [
            ...inheritedSetupLines,
            ...pendingSetupLines,
            ...collectSetupLines(leadEntries),
        ]

        pendingSetupLines = []

        annotateSections(entry.entries, {
            inheritedSetupLines: childInheritedSetup,
            parentSectionPath: sectionPath,
            numberPrefix: number,
        })
    }
}

function flattenSections(entries, acc = []) {
    for (const entry of entries) {
        if (entry.type !== 'section') {
            continue
        }

        acc.push(entry)
        flattenSections(entry.entries, acc)
    }

    return acc
}

function buildDirectoryTree(notes) {
    const root = []
    const directoryMap = new Map([['', root]])

    const ensureDirectory = (relativeDir) => {
        const normalized = normalizeSlashes(relativeDir).replace(/^\/+|\/+$/g, '')
        if (directoryMap.has(normalized)) {
            return directoryMap.get(normalized)
        }

        const parts = normalized ? normalized.split('/') : []
        let currentPath = ''
        let currentItems = root

        for (const part of parts) {
            currentPath = currentPath ? `${currentPath}/${part}` : part
            if (!directoryMap.has(currentPath)) {
                const dirNode = {
                    type: 'directory',
                    name: part,
                    path: currentPath,
                    children: [],
                }
                currentItems.push(dirNode)
                directoryMap.set(currentPath, dirNode.children)
            }
            currentItems = directoryMap.get(currentPath)
        }

        return currentItems
    }

    for (const note of notes) {
        const parentDir = normalizeSlashes(path.posix.dirname(note.relativeDir))
        const bucket = ensureDirectory(parentDir === '.' ? '' : parentDir)
        bucket.push({
            type: 'note',
            slug: note.slug,
            title: note.title,
            relativeDir: note.relativeDir,
            topSectionCount: note.sections[0]?.childSections?.length ?? 0,
            updatedAt: note.updatedAt,
        })
    }

    return root
}

function renderableBodyLines(entries) {
    return entries.flatMap((entry) => entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath)))
}

async function copyNoteFiles(noteDir, bundleDir) {
    const filesDir = path.join(bundleDir, 'files')
    const noteFiles = await collectFiles(noteDir)

    for (const filePath of noteFiles) {
        const relativePath = normalizeSlashes(path.relative(noteDir, filePath))
        const targetPath = path.join(filesDir, relativePath)
        await fs.mkdir(path.dirname(targetPath), { recursive: true })
        await fs.copyFile(filePath, targetPath)
    }
}

async function writeSectionSource(bundleDir, section, sourceLines) {
    const sourceDir = path.posix.dirname(section.sourcePath)
    const relativeEntryPath = normalizeSlashes(path.posix.join(
        '/files',
        sourceDir === '.' ? '' : sourceDir,
        createSectionFileName(section),
    ))
    const filesystemPath = path.join(bundleDir, relativeEntryPath.replace(/^\//, ''))
    await fs.mkdir(path.dirname(filesystemPath), { recursive: true })
    await fs.writeFile(filesystemPath, `${sourceLines.join('\n').trim()}\n`, 'utf8')
    return relativeEntryPath
}

async function buildNotePayload(noteDir) {
    const relativeDir = normalizeSlashes(path.relative(notesRepoRoot, noteDir))
    const slug = createStableSlug(relativeDir)
    const meta = JSON.parse(await fs.readFile(path.join(noteDir, 'meta.json'), 'utf8'))
    const entryPath = normalizeSlashes(meta.entry)
    const parserState = {
        fileCache: new Map(),
        fileStack: new Set(),
    }
    const parsed = await parseTypstFile(noteDir, entryPath, parserState)
    annotateSections(parsed.entries, {
        inheritedSetupLines: [],
        parentSectionPath: [],
        numberPrefix: '',
    })

    const bundleDir = path.join(publicBundlesRoot, slug)
    await copyNoteFiles(noteDir, bundleDir)

    const topSections = parsed.entries.filter((entry) => entry.type === 'section')
    const allSections = flattenSections(parsed.entries)
    const noteGlobalSetupLines = collectLeadingRootSetup(parsed.entries)
    const labelStubLines = allSections
        .filter((section) => section.anchor)
        .map((section) => `#hide[${section.headingLine}]`)

    const sectionPayloads = []
    for (const section of allSections) {
        const bodySetup = [
            '#set page(width: 600pt, height: auto, margin: 0pt)',
            ...noteGlobalSetupLines,
            ...section.inheritedSetupLines,
            ...section.prependedSetupLines,
            ...collectSetupLines(section.leadEntries),
        ]
        const bodyEntries = [
            ...section.leadEntries,
            ...section.tailEntries,
        ]
        const sectionSourceLines = [
            ...bodySetup,
            ...renderableBodyLines(bodyEntries),
            ...labelStubLines,
        ]
        const entryFile = await writeSectionSource(bundleDir, section, sectionSourceLines)

        sectionPayloads.push({
            path: section.path,
            pathSlug: section.pathSlug,
            number: section.number,
            level: section.level,
            title: section.rawTitle,
            displayTitle: sectionDisplayTitle(section),
            anchor: section.anchor,
            sourcePath: section.sourcePath,
            typstEntry: entryFile,
            childSections: section.childSections.map((child) => ({
                path: child.path,
                pathSlug: child.pathSlug,
                number: child.number,
                title: child.rawTitle,
                displayTitle: sectionDisplayTitle(child),
            })),
        })
    }

    const rootSection = {
        path: [],
        pathSlug: '',
        number: '',
        level: 0,
        title: meta.name,
        displayTitle: meta.name,
        anchor: null,
        sourcePath: `/${entryPath}`,
        typstEntry: null,
        childSections: topSections.map((section) => ({
            path: section.path,
            pathSlug: section.pathSlug,
            number: section.number,
            title: section.rawTitle,
            displayTitle: sectionDisplayTitle(section),
        })),
    }

    const stats = await fs.stat(path.join(noteDir, 'meta.json'))

    return {
        slug,
        title: meta.name,
        relativeDir,
        entry: entryPath,
        bundleBase: `/generated-notes/${slug}`,
        updatedAt: stats.mtime.toISOString(),
        sections: [rootSection, ...sectionPayloads],
    }
}

async function main() {
    if (!await exists(notesRepoRoot)) {
        throw new Error(`Notes repository not found: ${notesRepoRoot}`)
    }

    await ensureCleanDir(generatedRoot)
    await ensureCleanDir(publicBundlesRoot)

    const noteDirs = await walkNoteDirs(notesRepoRoot)
    const notes = []

    for (const noteDir of noteDirs) {
        notes.push(await buildNotePayload(noteDir))
    }

    for (const note of notes) {
        const noteDir = path.join(generatedRoot, note.slug)
        await fs.mkdir(noteDir, { recursive: true })
        await fs.writeFile(
            path.join(noteDir, 'index.json'),
            JSON.stringify(note, null, 2),
            'utf8',
        )
    }

    const notesIndex = {
        generatedAt: new Date().toISOString(),
        notes: notes.map((note) => ({
            slug: note.slug,
            title: note.title,
            relativeDir: note.relativeDir,
            updatedAt: note.updatedAt,
            topSectionCount: note.sections[0].childSections.length,
        })),
        tree: buildDirectoryTree(notes),
    }

    await fs.writeFile(
        path.join(generatedRoot, 'index.json'),
        JSON.stringify(notesIndex, null, 2),
        'utf8',
    )

    console.log(`Generated ${notes.length} note(s) into ${generatedRoot}`)
}

await main()
