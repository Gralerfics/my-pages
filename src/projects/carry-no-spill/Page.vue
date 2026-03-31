<script setup>
import LocalizedContent from '../../components/LocalizedContent.vue'
import ProjectTypst from '../../components/ProjectTypst.vue'

import systemShot from './assets/system.png'
import totalScorePlot from './assets/total-score.png'
import waterRatioPlot from './assets/water-ratio.png'
</script>

<template>
    <div class="project-article carry-no-spill-article">
        <section class="project-article__section">
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Features.</strong> This project builds a teleoperation experiment platform to study whether force feedback helps operators carry hazardous liquids under reduced visual observability. The platform combines liquid simulation, haptic interaction, repeatable procedural mazes, experiment logging, and score-based evaluation.
                </template>
                <template #zh>
                    <strong>项目特性 -</strong> 这个项目搭建了一个用于研究 “在视觉受限条件下，力反馈是否能帮助操作者更安全、高效地搬运危险液体” 的遥操作实验平台。平台同时整合了液体仿真、触觉交互、可重复的程序化迷宫、实验记录和基于评分的评估流程。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Stack.</strong> LiquidFun / Box2D with <code>pyb2d</code>, <code>pygame</code>, ECS architecture with <code>esper</code>, bidirectional teleoperation with Haply control, seeded map generation, and JSON / CSV run logging for later statistical analysis.
                </template>
                <template #zh>
                    <strong>相关技术 -</strong> LiquidFun / Box2D 与 <code>pyb2d</code>、<code>pygame</code>、基于 <code>esper</code> 的 ECS 架构设计、结合 Haply 力反馈设备的双向遥操作、随机地图生成、动态日志记录等。
                </template>
            </LocalizedContent>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Motivation and demonstration</template>
                <template #zh>研究背景与演示</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Hazardous liquid transport appears in chemical handling, biomedical workflows, and remote operation scenarios. In teleoperation, operators may not reliably observe the internal fluid state, so the problem is not only to reach the goal, but to move quickly without spilling.
                </template>
                <template #zh>
                    危险液体搬运会出现在化工操作、生物医学流程以及远程作业等场景中。对于遥操作而言，操作者往往无法稳定观察到容器内部液体的状态，我们希望在保证避免液体洒出的前提下完成尽可能快速的搬运。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The project therefore focuses on one research question: when fluid-state observability is reduced, can force feedback improve teleoperated carrying performance?
                </template>
                <template #zh>
                    因此，这个项目聚焦于一个核心研究问题：当液体状态的可观测性被降低时，力反馈能否提升遥操作搬运任务的整体表现？
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--large">
                <img :src="systemShot" alt="Carry-No-Spill system screenshot" />
                <LocalizedContent tag="figcaption">
                    <template #en>
                        The main simulation window, status panel, and Haply operator window. The experiment keeps the teleoperation loop, task state, and feedback state visible for repeatable evaluation.
                    </template>
                    <template #zh>
                        主仿真窗口、状态面板以及 Haply 操作窗口。实验平台将遥操作回路、任务状态与反馈状态统一可视化，便于进行可重复的对比评估。
                    </template>
                </LocalizedContent>
            </figure>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Teleoperation platform and control</template>
                <template #zh>遥操作平台与控制设计</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The system is organized as a bidirectional teleoperation loop: operator motion is sent into the simulation, rigid-body and liquid physics are advanced, and an estimated feedback force is returned to the operator. The vessel is modeled as a dynamic rigid body containing liquid particles rather than as a rigidly constrained cup.
                </template>
                <template #zh>
                    系统采用双向遥操作回路：操作者输入运动指令，仿真推进刚体与液体物理，随后再把估计得到的反馈力返回给操作者。容器并不是被刚性锁死的“杯子”，而是一个内部包含液体粒子的动态刚体。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    In order to preserve a realistic carrying behavior, the vessel is kept near upright by a stabilization torque instead of a hard angle lock. The haptic force is then estimated from vessel dynamics and interaction forces.
                </template>
                <template #zh>
                    为了保留更真实的搬运行为，容器并不是通过硬性角度锁定来保持竖直，而是通过稳定化力矩让它倾向于回到近似竖直的姿态。触觉反馈则基于容器动力学和交互力进行估计。
                </template>
            </LocalizedContent>
            <ProjectTypst :framed="false">
                $
                F_"ctrl" = m [k_s (x_p - x) - c dot(x) - g]
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                tau_"upright" = I [k_theta (theta^* - theta) - c_theta dot(theta)]
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                F_"contact" = m a - F_g - F_"handle", quad F_"fb" = F_"contact" - F_"handle"
                $
            </ProjectTypst>
            <LocalizedContent tag="p">
                <template #en>
                    On the software side, the platform uses an ECS architecture to separate control, physics, rendering, evaluation, and logging. That matters for experiments because blind mode, force feedback, delay mode, and map seeds can be controlled independently while keeping reset and logging behavior consistent.
                </template>
                <template #zh>
                    在软件架构上，平台采用 ECS 方式将控制、物理、渲染、评估和日志分离开来。这样做对实验尤其重要，因为盲操模式、力反馈、延迟模式和地图种子都可以独立切换，同时仍保持一致的重置与记录流程。
                </template>
            </LocalizedContent>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Experimental protocol and metrics</template>
                <template #zh>实验设计与评价指标</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The task is to carry a liquid-filled beaker through a maze to the goal region. The current comparison uses two conditions under blind transport: <code>Blind + FFB</code> and <code>Blind + no FFB</code>. Both conditions use the same procedural setting and the same seed <code>42</code>, with <code>29</code> runs collected for each condition.
                </template>
                <template #zh>
                    任务是将装有液体的烧杯穿过迷宫并送到目标区域。当前对比实验使用两种盲操条件：<code>Blind + FFB</code> 和 <code>Blind + no FFB</code>。两组实验都使用同样的程序化地图设置和相同的种子 <code>42</code>，每组各记录了 <code>29</code> 次运行。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The final score combines water retention and time bonus. Water is rewarded nonlinearly so that losing liquid near the top hurts more, while time is normalized by a route-based reference time rather than by raw completion time alone.
                </template>
                <template #zh>
                    最终得分由液体保留表现和时间奖励共同组成。液体部分采用非线性计分，使得上层液体的损失受到更高惩罚；时间部分则通过基于路径长度的参考时间进行归一化，而不是只看原始完成时间。
                </template>
            </LocalizedContent>
            <ProjectTypst :framed="false">
                $
                r_w = N_"in" / N_0, quad S_w = S_w^"max" r_w^gamma
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                T_"ref" = L_"ref" / v_"ref" + Delta T_"field", quad S_t = S_t^"max" max(0, (T_"ref" - T) / T_"ref")
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                S = S_w + S_t
                $
            </ProjectTypst>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Results</template>
                <template #zh>结果</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The current runs show a consistent safety-speed tradeoff. With force feedback, the operator becomes slightly slower, but preserves more liquid and achieves a higher total score. In the recorded blind-condition experiments, <code>Blind + FFB</code> reaches a total score of <code>88.11 +- 13.56</code>, compared with <code>77.51 +- 16.53</code> for <code>Blind + no FFB</code>.
                </template>
                <template #zh>
                    当前实验结果呈现出比较清晰的“安全性与速度”的权衡关系：加入力反馈后，操作者在速度上会略慢一些，但能保留更多液体，并得到更高的综合得分。在当前盲操条件下的记录中，<code>Blind + FFB</code> 的总分达到 <code>88.11 +- 13.56</code>，而 <code>Blind + no FFB</code> 为 <code>77.51 +- 16.53</code>。
                </template>
            </LocalizedContent>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="waterRatioPlot" alt="Water retention ratio comparison between feedback conditions" />
                    <LocalizedContent tag="figcaption">
                        <template #en>Water retention is higher and more stable when force feedback is enabled.</template>
                        <template #zh>启用力反馈后，液体保留率整体更高，也更稳定。</template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="totalScorePlot" alt="Total score comparison between feedback conditions" />
                    <LocalizedContent tag="figcaption">
                        <template #en>The total-score distribution shifts upward with force feedback.</template>
                        <template #zh>加入力反馈后，总分分布整体上移。</template>
                    </LocalizedContent>
                </figure>
            </div>
            <LocalizedContent tag="p">
                <template #en>
                    The interpretation is that force feedback does not maximize raw speed. Instead, it improves disturbance awareness and risk-sensitive control under reduced visual observability, which is exactly the behavior that matters for hazardous liquid transport.
                </template>
                <template #zh>
                    这些结果说明，力反馈带来的收益并不体现在“绝对更快”，而更多体现在视觉受限条件下对扰动的感知和对风险更敏感的控制策略上。而这恰恰是危险液体搬运任务中更关键的能力。
                </template>
            </LocalizedContent>
        </section>
    </div>
</template>
