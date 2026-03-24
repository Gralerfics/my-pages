<script setup>
import boardV11 from './assets/ver-1-1.png'
import boardV20 from './assets/ver-2-0.jpg'
</script>

<template>
  <div class="project-article">
    <section class="project-article__section">
      <p>
        This project was a board-level reconstruction and validation study of the classical
        <code>RTL2832U + R820T2</code> low-cost SDR architecture, with the final target kept deliberately
        practical: build a receiver that can be brought up with existing host software and validated
        through real FM broadcast reception.
      </p>
      <p>
        The work covered two sides at once. On the hardware side, I split the design into tuner,
        baseband, power, clock, USB, EEPROM, and debug interfaces, then iterated the PCB across
        multiple revisions. On the software side, I traced how the Osmocom stack actually initializes
        the device, enables SDR mode, configures the tuner, and moves I/Q samples to the host.
      </p>
      <ul class="bullet-list">
        <li>
          <strong>What was built:</strong> a reproducible RTL-SDR-compatible receiver board with documented
          schematic, layout, bring-up, and host-side validation.
        </li>
        <li>
          <strong>What was learned:</strong> practical SDR performance depends as much on power integrity,
          chip selection, and driver behavior as on the nominal signal-chain diagram.
        </li>
        <li>
          <strong>Stack:</strong> EasyEDA, RTL2832U, R820T2, USB, SDRSharp, Zadig, Osmocom <code>rtl-sdr</code>
          utilities.
        </li>
      </ul>
    </section>

    <section class="project-article__section">
      <h2>Architecture and signal path</h2>
      <p>
        The hardware followed the standard RTL-SDR organization rather than attempting a custom receiver
        architecture. The RF input is first handled by the <code>R820T2</code> tuner, which performs channel
        selection and analog frequency conversion. Its output is then passed to the <code>RTL2832U</code>,
        whose ADC and digital down-conversion stages push sampled baseband data to the host through USB.
      </p>
      <p>
        The documentation in the repository emphasizes an important practical detail here: despite the
        broader “I/Q receiver” mental model often used when introducing SDR, this particular hardware path
        is constrained by the tuner and demodulator combination. The design therefore has to be understood
        as a concrete commodity architecture, not as a generic abstract SDR block diagram.
      </p>
      <p>
        I also summarized the control plane rather than only the data plane. Host software configures the
        demodulator over USB control transfers; the internal controller on the RTL2832U then drives the
        tuner over I2C. That interaction matters when debugging bring-up, because a board that looks fine
        electrically can still fail if the software stack cannot detect and configure the tuner properly.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Board partitioning and revision history</h2>
      <p>
        The board was split into tuner front-end, RTL2832U baseband section, power conversion, clocking,
        USB interface, EEPROM, and exposed debug nodes. That decomposition was useful not only for the
        schematic itself, but also for systematic bring-up. Test pads and rail breakouts were intentionally
        preserved so that the power tree and control buses could be inspected without reworking the board.
      </p>

      <figure class="project-media project-media--medium">
        <img
          :src="boardV11"
          alt="RTL-SDR board revision 1.1"
        />
        <figcaption>
          Revision 1.1 of the board, where the receiver chain, USB interface, and supporting rails were
          already laid out in a compact form suitable for initial validation.
        </figcaption>
      </figure>

      <p>
        The early revisions used the standard surrounding circuits from datasheets and public references,
        then gradually exposed more debug convenience and cleaner partitioning. One of the hardware notes in
        the repository discusses a resistor placement around the tuner supply path that produced an undesired
        voltage drop; this is representative of the kind of issue that does not change the schematic concept
        itself, but matters immediately in a real board.
      </p>

      <figure class="project-media project-media--medium">
        <img
          :src="boardV20"
          alt="RTL-SDR board revision 2.0"
        />
        <figcaption>
          Revision 2.0 enlarged the board and reorganized the power sections, with the later goal of
          improving anti-interference behavior and making the 1.2 V supply arrangement less fragile.
        </figcaption>
      </figure>

      <p>
        Later revisions paid more attention to interference and supply topology. In particular, the design
        notes compare using the RTL2832U's internal regulation path with using a dedicated external
        <code>1.2 V</code> switching supply. That is a very practical trade-off: the receiver does not fail
        because of one idealized “wrong architecture”, but because noise coupling, rail quality, and layout
        choices accumulate into something the tuner and demodulator can no longer tolerate.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Bring-up and the actual failure mode</h2>
      <p>
        The most useful result of the project was not just that one version eventually worked, but that the
        debugging process forced a separation between suspected analog problems and the real root cause. The
        repository records that a major blocker was ultimately traced to using <code>RTL2832</code> rather
        than <code>RTL2832U</code>. That kind of error is easy to hide behind more fashionable explanations
        such as RF interference or unstable regulation, especially in a mixed-signal board.
      </p>
      <p>
        Once that device issue was corrected, the receiver could be brought up with standard host tooling
        and used for FM broadcast reception. That outcome is modest by SDR standards, but it is the right
        validation target for this class of design: it proves that USB enumeration, tuner control, clocking,
        baseband path, and host software integration are all coherent enough to produce usable radio data.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Host software and driver-side understanding</h2>
      <p>
        The repository also includes a separate reading note on the Osmocom driver stack. I kept that part
        because it changes how the hardware is interpreted. Instead of treating the board as a black box that
        “should work with SDRSharp”, I went through the initialization flow implemented by tools such as
        <code>rtl_sdr</code> and <code>rtl_fm</code>: device open, baseband initialization, sample-rate
        configuration, center-frequency setting, tuner detection, and data streaming.
      </p>
      <p>
        This is where the project stops being only a PCB exercise. The practical sample-rate ceiling, the
        distinction between control transfers and streaming, and the way tuner-specific paths are selected in
        the driver all affect what should be expected from the hardware. The documentation therefore ends up
        describing the board as part of a complete platform rather than as an isolated RF board.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Result</h2>
      <p>
        In the end, this project is valuable less because it presents a novel SDR architecture, and more
        because it records the full path from reference design study to board partitioning, revision, fault
        isolation, and host-side validation. That combination of schematic work, debugging discipline, and
        software-side reading is the part I would want to preserve and reuse in later mixed-signal or
        embedded system work.
      </p>
    </section>
  </div>
</template>
