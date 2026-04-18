import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const defaultNotesRepoRoot = 'C:/Workspace/my-notes'
const notesRepoRoot = path.resolve(process.env.NOTES_REPO_ROOT || defaultNotesRepoRoot)
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

function filterSetupLines(lines) {
    return lines.filter((line) => !line.trim().startsWith('#hide['))
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

function isStandaloneMathDelimiter(line) {
    return /^\$\s*(?:<[^>]+>)?\s*$/.test(line.trim())
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

async function removeDirIfExists(targetPath) {
    await fs.rm(targetPath, { recursive: true, force: true })
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

function escapeTypstString(value) {
    return value
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
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
            setupLines.push(...filterSetupLines(entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath))))
            continue
        }

        break
    }

    return setupLines
}

function collectSetupLines(entries) {
    return entries
        .filter((entry) => entry.type === 'content' && isSetupOnly(entry.lines))
        .flatMap((entry) => filterSetupLines(entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath))))
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
    let inBlockMath = false

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
        const trimmed = line.trim()
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

        // Typst multiline equations commonly use a standalone `$` line to open/close
        // a math block. While inside that block, leading `=` belongs to math content,
        // not to section headings.
        if (isStandaloneMathDelimiter(trimmed)) {
            bufferedLines.push(line)
            inBlockMath = !inBlockMath
            continue
        }

        if (inBlockMath) {
            bufferedLines.push(line)
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
                pendingSetupLines.push(...filterSetupLines(entry.lines.map((line) => rewriteLinePaths(line, entry.sourcePath))))
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

function createReferenceDisplay(label, counters) {
    if (label.startsWith('sec:')) {
        return null
    }

    if (label.startsWith('fig:')) {
        counters.figure += 1
        return `Figure ${counters.figure}`
    }

    if (label.startsWith('tab:')) {
        counters.table += 1
        return `Table ${counters.table}`
    }

    return null
}

function extractLabelsFromLines(lines) {
    const labels = new Set()

    for (const line of lines) {
        const matches = line.matchAll(/<([^<>\s]+)>/g)
        for (const match of matches) {
            if (match[1]) {
                labels.add(match[1])
            }
        }
    }

    return labels
}

function isDisplayEquationDelimiterLine(trimmedLine) {
    return /^\$\s*(?:<[^>]+>)?\s*$/.test(trimmedLine)
}

function isSingleLineDisplayEquation(trimmedLine) {
    if (!trimmedLine.startsWith('$')) {
        return false
    }

    if (isDisplayEquationDelimiterLine(trimmedLine)) {
        return false
    }

    return /^\$[\s\S]*\$\s*(?:<[^>]+>)?\s*$/.test(trimmedLine)
}

function countBlockEquationsInLines(lines) {
    let count = 0
    let inBlockMath = false

    for (const line of lines) {
        const trimmed = line.trim()

        if (inBlockMath) {
            if (isDisplayEquationDelimiterLine(trimmed)) {
                inBlockMath = false
            }
            continue
        }

        if (isSingleLineDisplayEquation(trimmed)) {
            count += 1
            continue
        }

        if (isDisplayEquationDelimiterLine(trimmed)) {
            count += 1
            inBlockMath = true
        }
    }

    return count
}

function assignEquationOffsets(entries, state = { count: 0 }) {
    for (const entry of entries) {
        if (entry.type === 'content') {
            state.count += countBlockEquationsInLines(entry.lines)
            continue
        }

        entry.equationOffset = state.count
        assignEquationOffsets(entry.entries, state)
    }
}

function hasTypstCli() {
    try {
        execFileSync('typst', ['--version'], { stdio: 'ignore' })
        return true
    }
    catch {
        return false
    }
}

function buildLabelMetadataLine(label) {
    const escapedLabel = escapeTypstString(label)
    return `#context [metadata((kind: "label", label: "${escapedLabel}", heading: counter(heading).get(), equation: counter(math.equation).get().first(), image: counter(figure.where(kind: image)).get().first(), table: counter(figure.where(kind: table)).get().first()))]`
}

function instrumentTypstSourceForMetadata(source) {
    const lines = splitLines(source)
    const output = []

    for (const line of lines) {
        output.push(line)

        if (line.trim().startsWith('//')) {
            continue
        }

        for (const label of extractLabelsFromLines([line])) {
            output.push(buildLabelMetadataLine(label))
        }
    }

    return `${output.join('\n')}\n`
}

function chooseBestLabelRecord(label, records) {
    if (!records.length) {
        return null
    }

    if (label.startsWith('sec:')) {
        return records.find((record) => Array.isArray(record.heading) && record.heading.length > 0) ?? records[0]
    }

    if (label.startsWith('equ:')) {
        return records
            .filter((record) => Number(record.equation) > 0)
            .sort((left, right) => Number(right.equation) - Number(left.equation))[0]
            ?? null
    }

    if (label.startsWith('fig:')) {
        return records
            .filter((record) => Number(record.image) > 0)
            .sort((left, right) => Number(right.image) - Number(left.image))[0]
            ?? null
    }

    if (label.startsWith('tab:')) {
        return records
            .filter((record) => Number(record.table) > 0)
            .sort((left, right) => Number(right.table) - Number(left.table))[0]
            ?? null
    }

    return records[0]
}

async function resolveTypstRenderData(noteDir, entryPath, allSections) {
    if (!hasTypstCli()) {
        return null
    }

    const tempNoteDir = path.join(
        os.tmpdir(),
        `my-pages-note-query-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    const queryFilePath = path.join(tempNoteDir, '__notes_query.typ')
    const queryLines = [
        `#include "${entryPath}"`,
        '#context [',
        '  #for h in query(heading) {',
        '    metadata((kind: "section", heading: counter(heading).at(h.location()), equation: counter(math.equation).at(h.location()).first(), image: counter(figure.where(kind: image)).at(h.location()).first(), table: counter(figure.where(kind: table)).at(h.location()).first()))',
        '  }',
        ']',
    ]

    try {
        await fs.cp(noteDir, tempNoteDir, { recursive: true })
        const copiedFiles = await collectFiles(tempNoteDir)
        for (const filePath of copiedFiles) {
            if (!filePath.endsWith('.typ')) {
                continue
            }

            const source = await fs.readFile(filePath, 'utf8')
            const instrumented = instrumentTypstSourceForMetadata(source)
            await fs.writeFile(filePath, instrumented, 'utf8')
        }

        await fs.writeFile(queryFilePath, `${queryLines.join('\n')}\n`, 'utf8')
        const raw = execFileSync(
            'typst',
            ['query', '--root', tempNoteDir, queryFilePath, 'metadata'],
            {
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024,
            },
        )
        const items = JSON.parse(raw)
        const sectionItems = items.filter((item) => item?.value?.kind === 'section')
        const labelItems = items.filter((item) => item?.value?.kind === 'label')

        if (sectionItems.length !== allSections.length) {
            return null
        }

        const labelBuckets = new Map()
        for (const item of labelItems) {
            const label = item?.value?.label
            if (!label) {
                continue
            }

            if (!labelBuckets.has(label)) {
                labelBuckets.set(label, [])
            }
            labelBuckets.get(label).push(item.value)
        }

        const labels = new Map()
        for (const [label, records] of labelBuckets) {
            const best = chooseBestLabelRecord(label, records)
            if (best) {
                labels.set(label, best)
            }
        }

        return {
            sections: sectionItems.map((item) => ({
                heading: Array.isArray(item.value.heading) ? item.value.heading.map((value) => Number(value) || 0) : [],
                equation: Number(item.value.equation) || 0,
                image: Number(item.value.image) || 0,
                table: Number(item.value.table) || 0,
            })),
            labels,
        }
    }
    catch {
        return null
    }
    finally {
        await removeDirIfExists(tempNoteDir)
    }
}

function buildReferenceRegistry(entries, sections, equationNumbers = new Map()) {
    const registry = new Map()

    for (const section of sections) {
        if (section.anchor) {
            registry.set(section.anchor, `Section ${section.number}`)
        }
    }

    const counters = {
        figure: 0,
        table: 0,
    }

    const assignMaxEquationReference = (label, equationNumber) => {
        if (!label.startsWith('equ:') || equationNumber <= 0) {
            return
        }

        const nextDisplay = `Equation (${equationNumber})`
        const currentDisplay = registry.get(label)
        const currentMatch = /^Equation \((\d+)\)$/.exec(currentDisplay || '')
        const currentNumber = currentMatch ? Number(currentMatch[1]) : 0
        if (equationNumber > currentNumber) {
            registry.set(label, nextDisplay)
        }
    }

    for (const section of sections) {
        let inBlockMath = false
        let currentEquationNumber = 0
        let nextEquationNumber = Number(section.equationOffset) || 0
        const bodyLines = renderableBodyLines([
            ...section.leadEntries,
            ...section.tailEntries,
        ])

        for (const line of bodyLines) {
            const trimmed = line.trim()

            if (inBlockMath) {
                for (const label of extractLabelsFromLines([line])) {
                    assignMaxEquationReference(label, currentEquationNumber)
                }

                if (isDisplayEquationDelimiterLine(trimmed)) {
                    inBlockMath = false
                    currentEquationNumber = 0
                }
                continue
            }

            if (isSingleLineDisplayEquation(trimmed)) {
                nextEquationNumber += 1
                for (const label of extractLabelsFromLines([line])) {
                    assignMaxEquationReference(label, nextEquationNumber)
                }
                continue
            }

            if (isDisplayEquationDelimiterLine(trimmed)) {
                nextEquationNumber += 1
                currentEquationNumber = nextEquationNumber
                for (const label of extractLabelsFromLines([line])) {
                    assignMaxEquationReference(label, currentEquationNumber)
                }
                inBlockMath = true
                continue
            }
        }
    }

    const visitEntries = (currentEntries) => {
        for (const entry of currentEntries) {
            if (entry.type === 'content') {
                for (const line of entry.lines) {
                    for (const label of extractLabelsFromLines([line])) {
                        if (registry.has(label)) {
                            continue
                        }

                        if (label.startsWith('equ:')) {
                            const equationNumber = equationNumbers.get(label)?.equation ?? 0
                            if (equationNumber > 0) {
                                registry.set(label, `Equation (${equationNumber})`)
                            }
                            continue
                        }

                        if (label.startsWith('fig:')) {
                            const figureNumber = equationNumbers.get(label)?.image ?? 0
                            if (figureNumber > 0) {
                                registry.set(label, `Figure ${figureNumber}`)
                            }
                            continue
                        }

                        if (label.startsWith('tab:')) {
                            const tableNumber = equationNumbers.get(label)?.table ?? 0
                            if (tableNumber > 0) {
                                registry.set(label, `Table ${tableNumber}`)
                            }
                            continue
                        }

                        const display = createReferenceDisplay(label, counters)
                        if (display) {
                            registry.set(label, display)
                        }
                    }
                }
                continue
            }

            visitEntries(entry.entries)
        }
    }

    visitEntries(entries)
    return registry
}

function downgradeUnresolvedRefs(lines, availableLabels, referenceRegistry) {
    return lines.map((line) => {
        if (line.trim().startsWith('//')) {
            return line
        }

        return line.replace(/(^|[^\w])@([A-Za-z0-9:_-]+)/g, (match, prefix, label) => {
            if (availableLabels.has(label)) {
                return match
            }

            const display = referenceRegistry.get(label) ?? `@${label}`
            return `${prefix}#text("${escapeTypstString(display)}")`
        })
    })
}

function extractReferencedLabels(lines) {
    const labels = new Set()

    for (const line of lines) {
        if (line.trim().startsWith('//')) {
            continue
        }

        for (const match of line.matchAll(/(^|[^\w])@([A-Za-z0-9:_-]+)/g)) {
            if (match[2]) {
                labels.add(match[2])
            }
        }
    }

    return labels
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
    assignEquationOffsets(parsed.entries)

    const bundleDir = path.join(publicBundlesRoot, slug)
    await copyNoteFiles(noteDir, bundleDir)

    const topSections = parsed.entries.filter((entry) => entry.type === 'section')
    const allSections = flattenSections(parsed.entries)
    const typstRenderData = await resolveTypstRenderData(noteDir, entryPath, allSections)
    if (typstRenderData?.sections?.length === allSections.length) {
        allSections.forEach((section, index) => {
            const offsets = typstRenderData.sections[index]
            section.equationOffset = offsets.equation
            section.figureOffset = offsets.image
            section.tableOffset = offsets.table
        })
    }
    const noteGlobalSetupLines = collectLeadingRootSetup(parsed.entries)
    const referenceRegistry = buildReferenceRegistry(
        parsed.entries,
        allSections,
        typstRenderData?.labels ?? new Map(),
    )
    const sectionPayloads = []
    for (const section of allSections) {
        const bodySetup = [
            '#set page(width: 600pt, height: auto, margin: 0pt)',
            ...noteGlobalSetupLines,
            ...section.inheritedSetupLines,
            ...section.prependedSetupLines,
            ...collectSetupLines(section.leadEntries),
            `#counter(math.equation).update(${section.equationOffset ?? 0})`,
            `#counter(figure.where(kind: image)).update(${section.figureOffset ?? 0})`,
            `#counter(figure.where(kind: table)).update(${section.tableOffset ?? 0})`,
        ]
        const bodyEntries = [
            ...section.leadEntries,
            ...section.tailEntries,
        ]
        const rawBodyLines = renderableBodyLines(bodyEntries)
        const availableLabels = new Set([
            ...(section.anchor ? [section.anchor] : []),
            ...extractLabelsFromLines(bodySetup),
            ...extractLabelsFromLines(rawBodyLines),
        ])
        const referencedLabels = extractReferencedLabels(rawBodyLines)
        const labelStubLines = allSections
            .filter((candidate) => candidate.anchor && referencedLabels.has(candidate.anchor))
            .map((candidate) => `#hide[${candidate.headingLine}]`)
        const bodyLines = downgradeUnresolvedRefs(rawBodyLines, availableLabels, referenceRegistry)
        const sectionSourceLines = [
            ...bodySetup,
            ...bodyLines,
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
