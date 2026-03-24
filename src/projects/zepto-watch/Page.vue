<script setup>
import ProjectCodeBlock from '../../components/ProjectCodeBlock.vue'
import boardLayout0 from './assets/pcb-main-0.png'
import boardLayout1 from './assets/pcb-main-1.png'
import runtimePhoto from './assets/runtime.jpg'
import prototyping from './assets/prototyping.jpg'
import gravityDemo from './assets/gravity.gif'

const gravityExampleCode = `
    # icon: notebook
    # color: 0x4F7BD9
    # name: Gravity Demo

    import zws
    import lvgl as lv

    field = zws.Display.getField()
    label = lv.label(field)

    while True:
        ax, ay, az = zws.IMU.getAcceleration()
        label.set_text(f"g = ({ax:.2f}, {ay:.2f}, {az:.2f})")
        zws.System.delayMs(40)
`
</script>

<template>
    <div class="project-article zepto-watch-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project implements a usable application runtime (based on an open-source Python interpreter <a href="https://github.com/pikasTech/pikaPython">PikaPython</a>) on a STM32 watch instead of a fixed-function firmware. Second, the resources on board are open to the runtime through custom drivers.
            </p>
            <p class="detail-text">
                <strong>Stacks.</strong> STM32F405RGT6, FreeRTOS, LVGL, FatFs, board-level peripherals (touchscreen, battery management, microphone, buttons, IMU, vibration motor, bluetooth, USB 2.0, EEPROM, RTC), and PikaPython with custom libraries.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Hardware development</h2>
            <p>
                It begins with prototyping, where driver circuits are manually built on a breadboard to perform initial debugging and firmware writing for peripherals such as the touchscreen and IMU.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="prototyping" alt="Hardware platform during prototyping" />
                <figcaption>The hardware platform during prototyping.</figcaption>
            </figure>
            <p>
                After completing the verification and deciding which peripherals to use, I proceeded with component selection and PCB design. Since that was my first time designing an embedded system, I made many mistakes and iterated through three versions. The final design was a magnetically attached stacked board: the upper layer was the screen module, and the lower layer contained the controller and peripherals. The layout of the lower board is shown in the figure below.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="boardLayout0" alt="Front view of the bottom plate layout design" />
                    <figcaption>A front view of the bottom plate layout design.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="boardLayout1" alt="Reverse view of the bottom plate layout design" />
                    <figcaption>A reverse view of the bottom plate layout design.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>Runtime model</h2>
            <p>
                Because it integrates many peripheral modules, numerous functions can be implemented through software calls. However, as a so-called smart device, I didn't want its firmware to be hardcoded like other projects, requiring troublesome code updates.
                Finally, I considered building a runtime environment that could read user-provided applications. The simplest and most direct approach was to integrate a lightweight Python interpreter, encapsulating the hardware interfaces as packages, allowing users to write their own Python scripts to implement different functions.
                Thus, the following implementation was derived. The firmware is based on FreeRTOS and is used to manage the system UI, file system, and the built-in open-source Python interpreter PikaPython, which is responsible for executing scripts.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="runtimePhoto" alt="Testing script applications from onboard storage" />
                <figcaption>A prototype for the real-time system as a test for the runtime. Scripts are loaded as applications, not as hidden test code.</figcaption>
            </figure>
            <ProjectCodeBlock lang="python" :code="gravityExampleCode" />
        </section>

        <section class="project-article__section">
            <h2>Python-facing API surface</h2>
            <p>
                The API document is rough, but it is enough to reconstruct the intended software boundary.
                The standard library wrapper provides timing, display brightness, RTC access, and
                <code>Display.getField()</code> for acquiring the root object of the current app screen. The
                peripheral wrapper exposes IMU, battery, microphone, and vibrator. On the GUI side, scripts
                work directly with wrapped LVGL types and callbacks.
            </p>
            <p>
                <code>Display.getField()</code> is a useful detail. The documentation explicitly discourages
                building top-level UI objects directly on the raw active screen, because transient system UI
                such as pull-down panels can make objects appear in the wrong place. A dedicated application
                root object avoids that. That is a small implementation detail, but it shows the project is
                solving integration problems at the platform boundary instead of only exposing raw library
                calls.
            </p>
            <p>
                The calculator example makes the model concrete: create LVGL objects on the app field, assign
                IDs to buttons, register <code>lv.EVENT.CLICKED</code> callbacks, and keep the main loop alive
                with RTOS-backed delays. The scripting layer is therefore not just sensor readouts; it is able
                to build interactive UI and event-driven behaviour on top of the firmware.
            </p>
        </section>

        <section class="project-article__section">
            <h2>The example scripts / applications</h2>
            <p>
                I put some example scripts in storage, which are used to test the operation of different peripherals and subsystems:
            </p>
            <ul class="bullet-list">
                <li>UI and callback handling in the calculator example.</li>
                <li>Microphone sampling and FFT-based spectrum display in the frequency example.</li>
                <li>RTC interaction and settings UI.</li>
                <li>Brightness, temperature, charging, and battery-related tests.</li>
                <li>IMU-based small physics sketches using acceleration input.</li>
                <li>Vibration and image-resource access in an electronic wooden fish demo.</li>
            </ul>
            <p>
                The frequency example covers functions such as microphone, computing acceleration library and UI drawing, which is relatively comprehensive; there is also a small demo that uses IMU to detect the direction of gravity, as shown in the figure below:
            </p>
            <figure class="project-media project-media--medium">
                <img :src="gravityDemo" alt="Demonstration of the IMU-based physics example" />
                <figcaption>The demonstration of the IMU-based physics example.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Limitations</h2>
            <p>
                TODO.
            </p>
        </section>
    </div>
</template>
