import fmcPgaImage from '../../deserted/imgs/FmcPGA.jpg'
import zeptoWatchImage from '../../deserted/imgs/ZeptoWatch.png'
import othelloooImage from '../../deserted/imgs/OthellooO.png'
import pfDriveImage from '../../deserted/imgs/pfdrive.png'
import httpFileManagerImage from '../../deserted/imgs/http_file_manager.png'
import rtlSdrImage from '../../deserted/imgs/rtlsdr.jpg'

export const profile = {
    name: 'Gralerfics',
    title: 'Electronic Engineering / Robotics / Systems Development',
    location: 'Shenzhen, China',
    email: 'contact@example.com',
    intro:
        'An engineering-oriented student developer working across embedded systems, robotics, digital design, and full-stack implementation.',
    statement:
        'This portfolio emphasizes projects that can be explained, implemented, tested, and demonstrated. The focus is on systems thinking rather than isolated demos.',
}

export const metrics = [
    { label: 'Selected projects', value: '8+' },
    { label: 'Technical domains', value: '4' },
    { label: 'Course and lab works', value: '12+' },
    { label: 'Core keywords', value: 'FPGA / Robotics / Embedded / Web' },
]

export const researchFocus = [
    'Embedded systems and hardware-software co-design',
    'Robotics navigation, perception, and control',
    'Digital system design with verifiable implementation',
    'Full-stack engineering from protocols to interfaces',
]

export const timeline = [
    {
        period: 'Present',
        title: 'Building a coherent portfolio archive',
        detail: 'Reframing course work, long-term projects, and experiments into a single engineering narrative.',
    },
    {
        period: 'Ongoing',
        title: 'Teach-and-Repeat autonomous shuttle system',
        detail: 'Extending a bio-inspired route repetition method to an Ackermann vehicle platform with room for obstacle handling and multi-vehicle coordination.',
    },
    {
        period: 'Undergraduate practice',
        title: 'Robotics, digital systems, and embedded engineering',
        detail: 'Developing across navigation, control, image processing, communication, digital circuits, and MCU platforms.',
    },
]

export const projects = [
    {
        slug: 'fmc-pga',
        title: 'FmcPGA',
        subtitle: 'A VHDL voxel-style graphics system on FPGA',
        year: 'Course / Hardware',
        category: 'Digital System Design',
        image: fmcPgaImage,
        repo: 'https://github.com/Gralerfics/FmcPGA',
        status: 'Completed',
        summary:
            'A compact FPGA graphics project built in VHDL, combining display logic, interaction, and hardware timing under strict resource constraints.',
        highlights: [
            'Uses ray-stepping and pipelined logic for simplified 3D scene rendering',
            'Runs on FPGA hardware and supports PS/2 controller input',
            'Shows practical digital timing design and real-time display integration',
        ],
        stack: ['VHDL', 'FPGA', 'PS/2', 'Pipeline Design'],
        detail:
            'The project is valuable not because it imitates a full game engine, but because it turns graphics output, input handling, and basic interaction into an actual hardware implementation. It reflects low-level system design discipline.',
    },
    {
        slug: 'zepto-watch',
        title: 'ZeptoWatch',
        subtitle: 'A modular STM32-based smart watch platform',
        year: 'Embedded System',
        category: 'Embedded Platform',
        image: zeptoWatchImage,
        repo: 'https://github.com/Gralerfics/ZeptoWatch',
        status: 'Completed',
        summary:
            'A wearable embedded platform built around STM32, covering peripheral integration, system software, GUI, and extensibility.',
        highlights: [
            'Integrates touch input, accelerometer, Bluetooth, vibration motor, EEPROM, and RTC',
            'Firmware supports FreeRTOS, USB 2.0, FAT filesystem, and LVGL GUI',
            'Embeds a Python interpreter with wrapped device and UI interfaces for user scripting',
        ],
        stack: ['STM32', 'FreeRTOS', 'LVGL', 'USB 2.0', 'FAT', 'Python'],
        detail:
            'This project is structured as a platform rather than a single-function device. The stronger point is the layered organization between drivers, runtime services, and application-level extensibility.',
    },
    {
        slug: 'othellooo',
        title: 'OthellooO',
        subtitle: 'A 3D board game with rendering experiments',
        year: 'Graphics / Java',
        category: 'Rendering & Interaction',
        image: othelloooImage,
        repo: 'https://github.com/Gralerfics/OthellooO',
        status: 'Completed',
        summary:
            'A 3D Reversi system implemented with Java, Swing, and LWJGL, combining gameplay features with graphics exploration.',
        highlights: [
            'Includes save management, AI play, undo, replay, and configurable themes',
            'Experiments with ray tracing, PBR, HDR backgrounds, and importance sampling',
            'Uses structures such as octrees to improve rendering organization',
        ],
        stack: ['Java', 'Swing', 'LWJGL', 'OpenGL', 'Shader'],
        detail:
            'The project combines software engineering and graphics interests in one application. It moves beyond game logic into interaction design, rendering experiments, and desktop application completeness.',
    },
    {
        slug: 'pf-drive',
        title: 'Teach-and-Repeat Shuttle Drive',
        subtitle: 'An autonomous shuttle system based on demonstrated routes',
        year: 'Ongoing',
        category: 'Autonomous Driving',
        image: pfDriveImage,
        repo: 'https://github.com/Gralerfics/pf-drive',
        status: 'Temporarily Private',
        summary:
            'An Ackermann-platform driving project built on a bio-inspired teach-and-repeat baseline, with emphasis on stable route repetition.',
        highlights: [
            'Extends a classical method from paper baseline to a real vehicle-scale platform',
            'Planned around recording, repetition, aggregation, and obstacle handling',
            'Represents a longer-term research direction rather than a short course exercise',
        ],
        stack: ['Robotics', 'Autonomous Driving', 'Control', 'Perception'],
        detail:
            'This is the most research-oriented thread in the portfolio. The point is not a single algorithm demo, but engineering a route repetition method into a system that can operate on a real vehicle with future room for coordination.',
    },
    {
        slug: 'http-file-manager',
        title: 'HTTP Server & File Manager',
        subtitle: 'From protocol implementation to application workflow',
        year: 'Networking / Software',
        category: 'Systems & Web',
        image: httpFileManagerImage,
        repo: 'https://github.com/Gralerfics/http_file_manager',
        status: 'Completed',
        summary:
            'A Python project implementing an HTTP server without relying on web frameworks, then extending it into a complete file manager application.',
        highlights: [
            'Implements basic HTTP/1.1 handling with GET, POST, and HEAD',
            'Includes a lightweight encrypted communication mechanism',
            'Supports login, upload, download, delete, rename, directory creation, and file inspection',
        ],
        stack: ['Python', 'HTTP/1.1', 'Backend', 'Frontend'],
        detail:
            'The project shows systems understanding through vertical integration: protocol handling, application logic, and user-facing workflow are developed together instead of hidden behind a framework.',
    },
    {
        slug: 'rtl-sdr',
        title: 'RTL-SDR Project',
        subtitle: 'Software-defined radio hardware design and validation',
        year: 'Hardware / Communication',
        category: 'RF & Signal',
        image: rtlSdrImage,
        repo: 'https://github.com/Gralerfics/RTL-SDR-Project',
        status: 'Completed',
        summary:
            'A low-cost software-defined radio receiver project inspired by classical RTL-SDR architecture and validated with FM reception.',
        highlights: [
            'Covers hardware design files, tools, and explanatory documentation',
            'Includes design rationale, principle analysis, and driver-related study notes',
            'Reflects communication hardware and signal-chain understanding',
        ],
        stack: ['SDR', 'RF', 'Hardware', 'Signal Processing'],
        detail:
            'Compared with pure software work, this project requires a stronger grasp of physical structure and the signal chain. Its value lies in both the design artifact and the reasoning recorded around it.',
    },
]

export const sideProjects = [
    {
        title: 'Robotics navigation and control coursework',
        text: 'Navigation, manipulation, and QR-code based task execution across several robotics courses and labs.',
    },
    {
        title: 'Mobile robot navigation lab',
        text: 'Navigation and stop-point execution in obstacle-heavy scenes with uncertain markers.',
    },
    {
        title: 'Whiteboard-following robotics project',
        text: 'Tracking a moving whiteboard by QR recognition and drawing patterns on its surface.',
    },
    {
        title: 'Digital image processing project',
        text: 'Rectangle segmentation, geometric correction, and image enhancement tasks from image processing coursework.',
    },
]

export const resumeSections = [
    {
        title: 'Research and engineering interests',
        items: [
            'Robotics navigation, perception, and control systems',
            'Embedded systems, RTOS, and platform-oriented device design',
            'FPGA and HDL-based digital implementation',
            'Communication, signal processing, and systems software',
        ],
    },
    {
        title: 'Working style',
        items: [
            'Comfortable across hardware, firmware, algorithms, and interfaces',
            'Prefers verifiable implementations rather than purely framework-driven assembly',
            'Cares about architecture, interface boundaries, testing logic, and documentation clarity',
            'Able to reorganize course projects into a coherent public-facing portfolio',
        ],
    },
    {
        title: 'Course and project arc',
        items: [
            'Digital system design: FmcPGA, FPongGA, and related labs',
            'Embedded and analog practice: ZeptoWatch and STM32 platform work',
            'Networking and systems: native HTTP server and file manager',
            'Robotics direction: EE211, EE346, EE368 related labs and projects',
            'Image and signal work: image processing, signals and systems, music synthesizer',
        ],
    },
]

export const contactLinks = [
    { label: 'GitHub', value: 'github.com/Gralerfics', href: 'https://github.com/Gralerfics' },
    { label: 'Projects', value: '8+ repos curated', href: '#/projects/fmc-pga' },
    { label: 'Location', value: profile.location, href: '#/resume' },
]
