<script setup>
import boardRender from './assets/ui-home.png'
import boardLayout from './assets/ui-scripts.png'
import runtimePhoto from './assets/hardware-stack.jpg'
</script>

<template>
    <div class="project-article zepto-watch-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project implements a usable application runtime (based on an open-source Python interpreter <a href="https://github.com/pikasTech/pikaPython">PikaPython</a>) on a STM32 watch instead of a fixed-function firmware. Second, the resources on board are open to the runtime through custom drivers.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> STM32F405RGT6, FreeRTOS, LVGL, FatFs, board-level peripherals (touchscreen, battery management, microphone, buttons, IMU, vibration motor, bluetooth, USB 2.0, EEPROM, RTC), and PikaPython with custom libraries.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Runtime model</h2>
            <p>
                The core design choice was to make user scripts deployable as files rather than building every
                function into the firmware image. The README documents the mechanism clearly: the watch mounts
                as a USB mass-storage device, scripts are copied into the root directory, and the firmware
                scans them into an application list. Each script begins with a small metadata header that
                declares icon, name, and color. That header is not decoration; it is the contract between the
                filesystem and the launcher UI.
            </p>
            <p>
                This means the boundary of the project is not "watch firmware plus some demos". It is closer
                to a small embedded runtime with a launcher, a file format convention, a script interpreter,
                and a wrapped device API.
            </p>
            <figure class="project-media project-media--narrow">
                <img :src="runtimePhoto" alt="ZeptoWatch running script applications from onboard storage" />
                <figcaption>Scripts are loaded as applications, not as hidden test code.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Scheduling and script constraints</h2>
            <p>
                The most practical detail in the documentation is the scheduling rule. Script code is expected
                to yield by calling <code>zws.System.delayMs()</code>, which is backed by FreeRTOS
                <code>osDelay</code>. Without that yield point, UI refresh, touch handling, brightness sync,
                and other system tasks stall. This is a good example of the project being honest about its
                execution model: the scripting layer is intentionally lightweight, but it is still running in
                a cooperative environment on top of a real RTOS.
            </p>
            <p>
                That constraint also explains the rest of the API design. The runtime is not trying to emulate
                desktop Python. It exposes only the parts of the system that can be made predictable on a
                small embedded target.
            </p>
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
            <h2>What the example scripts actually cover</h2>
            <p>
                The sample scripts are valuable because they exercise different subsystems rather than just
                repeating the same pattern. The repository includes:
            </p>
            <ul class="bullet-list">
                <li>UI and callback handling in the calculator example.</li>
                <li>Microphone sampling and FFT-based spectrum display in the frequency example.</li>
                <li>RTC interaction and settings UI.</li>
                <li>Brightness, temperature, charging, and battery-related tests.</li>
                <li>IMU-based small physics sketches using acceleration input.</li>
                <li>Vibration and image-resource access in lightweight application demos.</li>
            </ul>
            <p>
                The frequency example is particularly representative. It combines microphone sampling,
                windowing, real FFT, magnitude calculation, and LVGL slider updates in a loop that still yields
                to the scheduler. That is enough to show the runtime can support sensor processing, display
                output, and repeated UI updates without falling apart.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Firmware and hardware were developed together</h2>
            <p>
                The repository structure and README both show that the project was not written against a fixed
                off-the-shelf board. Hardware revisions were part of the work. The README lists several board
                versions, ending in a stacked version 3.0 design, and explicitly notes that earlier revisions
                were partly transitional and still contained issues to be fixed. That progression matters
                because the firmware assumptions depend on the final board composition: display, touch,
                STM32F405, power path, IMU, microphone, vibration motor, and USB-C are all part of the same
                design target.
            </p>
            <figure class="project-media project-media--narrow">
                <img :src="boardLayout" alt="ZeptoWatch PCB layout from a later hardware revision" />
                <figcaption>Later PCB revision from the repository, showing the board was iterated during development.</figcaption>
            </figure>
            <p>
                The board render is also worth keeping because it makes the packaging problem visible. This is
                not firmware developed in isolation; the software platform was being built for a compact
                wearable form factor with a constrained board area and a nontrivial peripheral set.
            </p>
            <figure class="project-media project-media--narrow">
                <img :src="boardRender" alt="Rendered ZeptoWatch board model" />
                <figcaption>Version 3.0 board render from the original project repository.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>What is technically strongest here</h2>
            <p>
                The strongest part of ZeptoWatch is the interface between firmware internals and user code. A
                lot of embedded projects can demonstrate a display, a sensor, or an interpreter in isolation.
                This one goes further and defines a working combination: file-based deployment, launcher
                metadata, wrapped board APIs, LVGL bindings, and explicit RTOS-aware scripting conventions.
            </p>
            <p>
                That is also where most of the technical risk sits. If any one of those pieces had been left
                undefined, the project would have collapsed back into a collection of demos. Instead, the repo
                shows a credible attempt to make the device extensible at runtime while still keeping the
                system small enough to run on an STM32F405-based watch.
            </p>
        </section>
    </div>
</template>

<style scoped>
.zepto-watch-article strong {
    color: var(--title);
    font-weight: 600;
}

.project-media {
    display: grid;
    gap: 8px;
    margin-top: 16px;
}

.project-media--narrow {
    max-width: 760px;
}

.project-media img {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.56);
}

.project-media figcaption {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.9rem;
}
</style>
