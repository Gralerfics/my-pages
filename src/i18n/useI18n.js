import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'preferred-locale'

export const localeOptions = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
]

function getInitialLocale() {
    if (typeof window === 'undefined') {
        return 'en'
    }

    const savedLocale = window.localStorage.getItem(STORAGE_KEY)
    return localeOptions.some((option) => option.code === savedLocale) ? savedLocale : 'en'
}

export const locale = ref(getInitialLocale())

const messages = {
    en: {
        titles: {
            home: 'Home',
            projects: 'Projects',
            notes: 'Notes',
            resume: 'Resume',
        },
        nav: {
            home: 'Home',
            resume: 'Resume',
            projects: 'Projects',
            notes: 'Notes',
            github: 'GitHub',
            language: 'Language',
        },
        common: {
            repository: 'Repository',
            cover: '(cover)',
            close: 'Close',
            moreInfo: 'More Info',
            all: 'All',
            search: 'Search',
            searchProjects: 'Search by title, summary, or tag',
            copy: 'Copy',
            copied: 'Copied',
            copyFailed: 'Failed',
            typstError: 'Failed to render equation',
        },
        home: {
            eyebrow: 'Portfolio',
            browseProjects: 'Browse Projects',
            resume: 'Resume',
            overviewEyebrow: 'Overview',
            interestsTitle: 'Interests',
            previewEyebrow: 'Preview',
            selectedProjectsTitle: 'Selected projects',
            fullIndex: 'Open full project index',
        },
        projects: {
            eyebrow: 'Projects',
            title: 'Project index',
            intro: 'A list of selected work across different directions.',
            browseEyebrow: 'Browse',
            filterTitle: 'Filter and search',
            groupsAria: 'Project groups',
        },
        notes: {
            eyebrow: 'Notes',
            title: 'Notes index',
            intro: 'Structured notes generated from Typst sources.',
            browseEyebrow: 'Browse',
            directoryTitle: 'Directory',
            empty: 'No notes have been generated yet.',
            detailEyebrow: 'Note',
            tocEyebrow: 'Outline',
            showToc: 'Show',
            hideToc: 'Hide',
            sectionEyebrow: 'Section',
            noBody: 'This section currently has no standalone body content.',
            childrenEyebrow: 'Subsections',
            childrenTitle: 'Open a deeper section',
            childSectionLabel: 'Child section',
            openSection: 'Open section',
            sectionCount: '{count} top-level sections',
        },
        projectDetail: {
            eyebrow: 'Project',
            title: 'Details',
            browseEyebrow: 'Browse',
            otherProjects: 'Other projects',
        },
        resume: {
            eyebrow: 'Resume',
            profileEyebrow: 'Profile',
            profileTitle: 'Personal statement',
            educationEyebrow: 'Education',
            educationTitle: 'Academic timeline',
            hideCourses: 'Hide courses & grades',
            showCourses: 'Courses & grades details',
            projectsEyebrow: 'Projects',
            projectsTitle: 'Project experience',
            projectsSummary: 'Selected projects are documented on the Projects page, where each entry includes overview information and a more detailed page.',
            openProjects: 'Open Projects Page',
            skillsEyebrow: 'Skills',
            skillsTitle: 'Technical skills',
            awardsEyebrow: 'Awards',
            awardsTitle: 'Honors and awards',
        },
        groups: {
            Robotics: 'Robotics',
            Embedded: 'Embedded',
            'Digital Design': 'Digital Design',
            Graphics: 'Graphics',
            Web: 'Web',
            Other: 'Other',
        },
    },
    zh: {
        titles: {
            home: '首页',
            projects: '项目',
            notes: '笔记',
            resume: '简历',
        },
        nav: {
            home: '首页',
            resume: '简历',
            projects: '项目',
            notes: '笔记',
            github: 'GitHub',
            language: '语言',
        },
        common: {
            repository: '查看仓库',
            cover: '（封面）',
            close: '关闭',
            moreInfo: '查看更多',
            all: '全部',
            search: '搜索',
            searchProjects: '按标题、摘要或标签搜索',
            copy: '复制',
            copied: '已复制',
            copyFailed: '复制失败',
            typstError: '公式渲染失败',
        },
        home: {
            eyebrow: 'Portfolio',
            browseProjects: '浏览项目',
            resume: '查看简历',
            overviewEyebrow: 'Overview',
            interestsTitle: '兴趣方向',
            previewEyebrow: 'Preview',
            selectedProjectsTitle: '精选项目',
            fullIndex: '查看完整项目列表',
        },
        projects: {
            eyebrow: 'Projects',
            title: '项目索引',
            intro: '这里整理了我在不同方向上的部分项目。',
            browseEyebrow: 'Browse',
            filterTitle: '筛选与搜索',
            groupsAria: '项目分类',
        },
        notes: {
            eyebrow: 'Notes',
            title: '笔记索引',
            intro: '由 Typst 源文件解析生成的结构化笔记。',
            browseEyebrow: 'Browse',
            directoryTitle: '目录',
            empty: '当前还没有生成任何笔记。',
            detailEyebrow: 'Note',
            tocEyebrow: '目录',
            showToc: '展开',
            hideToc: '收起',
            sectionEyebrow: 'Section',
            noBody: '这一节暂时没有可单独展示的正文内容。',
            childrenEyebrow: 'Subsections',
            childrenTitle: '进入下一级小节',
            childSectionLabel: '子节',
            openSection: '进入该节',
            sectionCount: '{count} 个一级小节',
        },
        projectDetail: {
            eyebrow: 'Project',
            title: '项目详情',
            browseEyebrow: 'Browse',
            otherProjects: '其他项目',
        },
        resume: {
            eyebrow: 'Resume',
            profileEyebrow: 'Profile',
            profileTitle: '个人陈述',
            educationEyebrow: 'Education',
            educationTitle: '教育经历',
            hideCourses: '收起课程与成绩',
            showCourses: '课程与成绩详情',
            projectsEyebrow: 'Projects',
            projectsTitle: '项目经历',
            projectsSummary: '部分项目已整理在 Projects 页面中，每个项目都包含简要概述和更详细的单独页面。',
            openProjects: '打开 Projects 页面',
            skillsEyebrow: 'Skills',
            skillsTitle: '技术能力',
            awardsEyebrow: 'Awards',
            awardsTitle: '荣誉与奖项',
        },
        groups: {
            Robotics: '机器人',
            Embedded: '嵌入式',
            'Digital Design': '数字设计',
            Graphics: '图形',
            Web: 'Web',
            Other: '其他',
        },
    },
}

function getValueByPath(source, path) {
    return path.split('.').reduce((value, key) => value?.[key], source)
}

function interpolate(message, params = {}) {
    if (typeof message !== 'string') {
        return message
    }

    return message.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`))
}

watch(
    locale,
    (nextLocale) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, nextLocale)
        }

        if (typeof document !== 'undefined') {
            document.documentElement.lang = nextLocale === 'zh' ? 'zh-CN' : 'en'
        }
    },
    { immediate: true },
)

export function useI18n() {
    const t = (path, params) => {
        const value =
            getValueByPath(messages[locale.value], path)
            ?? getValueByPath(messages.en, path)
            ?? path

        return interpolate(value, params)
    }

    const currentLocaleOption = computed(() =>
        localeOptions.find((option) => option.code === locale.value) ?? localeOptions[0],
    )

    const setLocale = (nextLocale) => {
        if (localeOptions.some((option) => option.code === nextLocale)) {
            locale.value = nextLocale
        }
    }

    return {
        locale,
        localeOptions,
        currentLocaleOption,
        setLocale,
        t,
        groupLabel: (groupKey) => t(`groups.${groupKey}`) || groupKey,
    }
}
