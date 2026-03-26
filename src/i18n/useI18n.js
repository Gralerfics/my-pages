import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'preferred-locale'

export const localeOptions = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
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
        titles: { home: 'Home', projects: 'Projects', resume: 'Resume' },
        nav: { home: 'Home', resume: 'Resume', projects: 'Projects', github: 'GitHub', language: 'Language' },
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
            intro: 'A list of selected work across my various interests.',
            browseEyebrow: 'Browse',
            filterTitle: 'Filter and search',
            groupsAria: 'Project groups',
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
        titles: { home: '首页', projects: '项目列表', resume: '个人简历' },
        nav: { home: '首页', resume: '个人简历', projects: '项目列表', github: 'GitHub', language: '语言' },
        common: {
            repository: '仓库',
            cover: '（封面）',
            close: '关闭',
            moreInfo: '查看更多',
            all: '全部',
            search: '搜索',
            searchProjects: '按标题、简介或标签搜索',
            copy: '复制',
            copied: '已复制',
            copyFailed: '复制失败',
            typstError: '公式渲染失败',
        },
        home: {
            eyebrow: 'Portfolio',
            browseProjects: '浏览项目列表',
            resume: '查看个人简历',
            overviewEyebrow: 'Overview',
            interestsTitle: '兴趣方向',
            previewEyebrow: 'Preview',
            selectedProjectsTitle: '项目概览',
            fullIndex: '查看所有项目',
        },
        projects: {
            eyebrow: 'Projects',
            title: '项目索引',
            intro: '这里是我的部分项目整理，包含个人项目、团体项目、课程作业等。',
            browseEyebrow: 'Browse',
            filterTitle: '搜索与筛选',
            groupsAria: '项目分类',
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
            showCourses: '查看课程与成绩',
            projectsEyebrow: 'Projects',
            projectsTitle: '项目经历',
            projectsSummary: '部分项目整理在项目列表页中，包含概述和详细介绍页面。',
            openProjects: '打开项目页',
            skillsEyebrow: 'Skills',
            skillsTitle: '技术能力',
            awardsEyebrow: 'Awards',
            awardsTitle: '荣誉与奖项',
        },
        groups: {
            Robotics: '机器人',
            Embedded: '嵌入式',
            'Digital Design': '数字设计',
            Graphics: '图形学',
            Web: 'Web',
            Other: '其他',
        },
    },
}

function getValueByPath(source, path) {
    return path.split('.').reduce((value, key) => value?.[key], source)
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
    const t = (path) =>
        getValueByPath(messages[locale.value], path)
        ?? getValueByPath(messages.en, path)
        ?? path

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
