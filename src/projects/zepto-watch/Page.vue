<template>
  <div class="project-article">
    <section class="project-article__section">
      <p>
        ZeptoWatch is structured as a device platform rather than a single-function demo. The stronger
        point is the system organization: peripherals, operating system services, storage, GUI, and
        user-facing scripting are all treated as parts of one coherent stack.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Highlights</h2>
      <ul class="bullet-list">
        <li>Integrates touch input, accelerometer, Bluetooth, vibration motor, EEPROM, and RTC.</li>
        <li>Firmware supports FreeRTOS, USB 2.0, FAT filesystem, and LVGL GUI.</li>
        <li>Embeds a Python interpreter with wrapped device and UI interfaces for user scripting.</li>
      </ul>
    </section>

    <section class="project-article__section">
      <h2>Why it matters</h2>
      <p>
        It demonstrates layered embedded design, where the device remains open to further development
        instead of being locked into a fixed firmware feature set.
      </p>
    </section>
  </div>
</template>
