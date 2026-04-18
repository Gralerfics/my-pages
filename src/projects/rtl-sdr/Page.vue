<script setup>
import LocalizedContent from '../../components/LocalizedContent.vue'
import sdrSharp from './assets/sdrsharp.png'
import schematicV2 from './assets/schematic-v2.png'
import pcbV2 from './assets/pcb-v2.png'
</script>

<template>
    <div class="project-article rtl-sdr-article">
        <section class="project-article__section">
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Features.</strong> This project is a RTL-SDR receiver board built around the classical <code>RTL2832U + R820T2</code> architecture, with board-level design, bring-up, FM reception validation, and a parallel write-up on the corresponding driver and host-side software path.
                </template>
                <template #zh>
                    <strong>项目特性 -</strong> 这个项目围绕经典的 <code>RTL2832U + R820T2</code> 架构实现了一块 RTL-SDR 接收板，内容包括板级设计、硬件 bring-up、FM 接收验证，以及对其驱动与主机端软件路径的同步整理。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Stack.</strong> RTL2832U, R820T2 tuner, RF front-end and power design, PCB iteration, Osmocom tools, SDRSharp / other host software, and practical debugging around USB, tuning, and receiver bring-up.
                </template>
                <template #zh>
                    <strong>相关技术 -</strong> RTL2832U、R820T2 调谐器、射频前端与电源设计、PCB 迭代、Osmocom 工具链、SDRSharp / 其他上位机软件，以及围绕 USB、调谐和接收器 bring-up 的实际调试。
                </template>
            </LocalizedContent>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Background</template>
                <template #zh>背景</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Originally, the RTL-SDR was a mass-produced DVB-T TV stick (digital high-definition television signal demodulator), in which the RTL2832U chip was used to receive and demodulate DVB-T digital signals. After Antti Palosaari discovered that the TV stick could be used to receive raw data from FM radio signals, various parties (including Eric Fry, who developed the RTL2832U Linux driver) studied the RTL2832U chip and discovered that it allowed entering a "test mode" by setting it up, skipping the DVB-T demodulation process and directly transmitting sampled raw I/Q data to the USB interface. Ultimately, Osmocom engineers (mainly Steve Markgraf) finally implemented the RTL-SDR driver.
                </template>
                <template #zh>
                    RTL-SDR 最初其实是一种大规模生产的 DVB-T 电视棒，其中的 RTL2832U 芯片原本用于接收和解调 DVB-T 数字电视信号。后来 Antti Palosaari 发现，这种电视棒能够接收 FM 广播的原始数据。随后，包含 Eric Fry（RTL2832U Linux 驱动开发者）在内的许多人开始研究这颗芯片，并发现它可以通过配置进入一种“测试模式”，跳过 DVB-T 解调流程，直接把采样得到的原始 I/Q 数据送到 USB 接口。最终，由 Osmocom 工程师（主要是 Steve Markgraf）完成了 RTL-SDR 驱动的实现。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Therefore, this is actually a readily available hardware device that can be widely purchased. This project is simply to collect information and then try to design a PCB using the same chip to verify its functionality, while also learning some communication knowledge.
                </template>
                <template #zh>
                    所以从结果上看，这其实是一类已经非常成熟、可以直接买到的现成硬件设备。这个项目的目的，主要是自己整理相关资料，并尝试用同样的芯片重新设计一块 PCB 来验证其功能，同时借这个过程补充一些通信方向的知识。
                </template>
            </LocalizedContent>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Hardware</template>
                <template #zh>硬件</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Referring to the original RTL-SDR schematic, my design schematic is shown in the figure below.
                </template>
                <template #zh>
                    参考原始 RTL-SDR 原理图设计的电路如下图所示。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--large">
                <img :src="schematicV2" alt="Schematic version 2" />
                <LocalizedContent tag="figcaption">
                    <template #en>The version 2 schematic.</template>
                    <template #zh>第二版原理图。</template>
                </LocalizedContent>
            </figure>
            <LocalizedContent tag="p">
                <template #en>
                    In addition, there were some adjustments made to the PCB design to improve signal quality, but at the time there was no rigorous verification of whether there was any improvement.
                </template>
                <template #zh>
                    此外，我还对 PCB 设计做了一些调整，希望改善信号质量，不过当时并没有做非常严格的验证来确认这些改动究竟带来了多少提升。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--large">
                <img :src="pcbV2" alt="PCB layout version 2" />
                <LocalizedContent tag="figcaption">
                    <template #en>The PCB layout.</template>
                    <template #zh>PCB 布局。</template>
                </LocalizedContent>
            </figure>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Validation</template>
                <template #zh>验证</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    After the hardware is soldered and assembled, the USB driver can be installed directly, and the SDRSharp software can be used for control. The image below shows the result of adjusting the tuner frequency to receive local FM radio broadcasts.
                </template>
                <template #zh>
                    硬件焊接并装配完成后，可以直接安装 USB 驱动，并使用 SDRSharp 进行控制。下图展示的是调节调谐器频率后接收到本地 FM 广播的结果。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--medium">
                <img :src="sdrSharp" alt="Receiving an FM radio signal with SDRSharp" />
                <LocalizedContent tag="figcaption">
                    <template #en>A demonstration to receive an FM radio signal using SDRSharp.</template>
                    <template #zh>使用 SDRSharp 接收 FM 广播信号的演示。</template>
                </LocalizedContent>
            </figure>
        </section>
    </div>
</template>
