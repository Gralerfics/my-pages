<script setup>
import boardVer11 from './assets/ver-1-1.png'
import boardVer20 from './assets/ver-2-0.jpg'
</script>

<template>
    <div class="project-article rtl-sdr-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project is a low-cost RTL-SDR receiver board built around the classical <code>RTL2832U + R820T2</code> architecture, with board-level design, bring-up, FM reception validation, and a parallel write-up on the corresponding driver and host-side software path.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> RTL2832U, R820T2 tuner, RF front-end and power design, PCB iteration, Osmocom tools, SDRSharp / other host software, and practical debugging around USB, tuning, and receiver bring-up.
            </p>
        </section>

        <section class="project-article__section">
            <h2>What this project was actually about</h2>
            <p>
                This was not just “copy a schematic and see whether FM can be heard”. The useful part was understanding the whole path around a cheap RTL-SDR receiver: what the tuner and demodulator each do, what has to be solved on the PCB side, and how that hardware is actually brought to life from the host using existing SDR tooling.
            </p>
            <p>
                The repository is structured that way on purpose. It contains the board iterations, the documentation around SDR basics, a hardware-design-and-debugging write-up, and notes on the driver / host software side. So the project is really a combined hardware-and-learning record rather than one isolated PCB snapshot.
            </p>
        </section>

        <section class="project-article__section">
            <h2>The signal chain</h2>
            <p>
                The board follows the standard RTL-SDR idea: the tuner handles the RF front-end and frequency conversion, while RTL2832U provides the digital side and the USB path for host-side IQ access. That is exactly why this architecture is such a common entry point for SDR hardware work: the cost is low, the ecosystem is mature, and FM reception is already enough to validate whether the main chain is alive.
            </p>
            <p>
                In the accompanying notes, I also went beyond the board itself and traced how the driver stack sets center frequency, tuner configuration, gain mode, and other parameters. That matters here because one of the main goals was not only to draw the board, but to understand what the host software is actually asking the hardware to do.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Board iterations</h2>
            <p>
                The two public board images in the repository are useful because they show the project as an iteration, not a one-shot success. The early board and the later board are visibly related, but the later one is the result of design correction and bring-up experience rather than a cosmetic revision.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="boardVer11" alt="RTL-SDR board version 1.1" />
                    <figcaption>Version 1.1 of the board during the hardware iteration process.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="boardVer20" alt="RTL-SDR board version 2.0" />
                    <figcaption>Version 2.0 after the major corrections in the design and debugging cycle.</figcaption>
                </figure>
            </div>
            <p>
                That hardware iteration is the part I care about most on this page. With a board like this, the interesting questions are usually not “can I route the nets” but “what did I misunderstand in the chip choice, support circuitry, or bring-up assumptions, and how did I narrow that down”.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Debugging the real problem</h2>
            <p>
                The main failure in this project was not some vague “it does not receive well”. The important conclusion from the debugging notes is much more concrete: one of the early versions used the wrong part assumption around <code>RTL2832</code> versus <code>RTL2832U</code>, which is fatal for this design path because the USB and practical SDR workflow are built around the <code>U</code> part.
            </p>
            <p>
                That is exactly the kind of mistake that makes a hardware project worth documenting. It is not glamorous, but it is the boundary between a board that only resembles an RTL-SDR and a board that can actually enter the familiar host-side workflow with Osmocom tools, SDRSharp, and FM validation.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Bring-up and validation</h2>
            <p>
                The repository also bundles host-side tools and notes for simple reception experiments. I used that path mainly as a practical validation loop: if the board can be recognized properly, tuned from the host, and used for ordinary FM reception, then the main hardware chain and the software interface are at least alive enough to trust.
            </p>
            <p>
                That may sound basic, but it is the right validation target for a project at this scale. A simple, stable FM test is a much better checkpoint than pretending the board is already a full SDR research platform. It verifies the combined result of RF front-end, digital chain, USB path, and host-side control with very little ambiguity.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Why this project still matters to me</h2>
            <p>
                I still keep this project because it sits in a useful middle ground: low enough level to involve PCB iteration and chip-level mistakes, but high enough level that the result connects directly to actual SDR software and signals. It is a compact example of the kind of work where schematic decisions, component knowledge, and software bring-up all meet in one place.
            </p>
        </section>
    </div>
</template>
