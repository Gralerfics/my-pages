<script setup>
import archPic from './assets/arch.png'
import slidingWindowPic from './assets/window.png'
import resExample from './assets/res_ex.png'
</script>

<template>
    <div class="project-article pf-drive-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project is a teach-and-repeat driving system for an Ackermann platform, with route recording, repeated traversal, drift compensation and predictive control.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> Multiprocessing design, topological navigation, Ackermann steering control, ROS-based modular integration, Webots simulation.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Baseline</h2>
            <p>
                This project starts from a baseline article [1], which uses a recorded route as the backbone, estimate the current match against the taught data, then apply rotation and along-path correction during replay. Most importantly, it significantly compresses camera images using traditional image processing methods, resulting in very low computational requirements. It is simple enough to be practical on a resource-limited vehicle stack.
            </p>
            <p>
                A large part of the work was about rebuilding the stack around an Ackermann vehicle and dealing with the failure modes that show up once the system is pushed faster or over longer paths: coupled steering and advancing, unstable correction behavior, drift from wheel odometry, and parameter dependence.
            </p>
        </section>

        <section class="project-article__section">
            <h2>System architecture</h2>
            <p>
                ROS 1 is relatively slow due to its design, so I wrote a dedicated and simple multi-process node communication framework <code>multinodes</code> to achieve parallelization of multiple modules and inter-process communication, as shown in the figure. The simulation environment is Webots, while ROS is used as a communication middleware between the two to send camera information and velocity commands.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="archPic" alt="Architecture of the multiprocessing-based experiment system" />
                <figcaption>The architecture of the multiprocessing-based experiment system.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Sliding window and predictive control</h2>
            <p>
                The known data during the repeat process consists of a series of recorded landmarks, each landmark containing odometer and camera information at a specific location during the repeat process. The control system needs to estimate the current position using image sequences and compensate for the accumulated drift error of the odometer to achieve stable path reproduction. In addition, speed control during turns must also be considered. Therefore, using the current landmark as a reference, a sequence of past and future landmarks is maintained for purposes such as estimating location and predicting turns.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="slidingWindowPic" alt="Sliding frame sequence" />
                <figcaption>The sliding frame sequence.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Discussion</h2>
            <p>
                The results show that a stable path can be reproduced over a relatively long distance at a speed of 20 km/h in the simulation environment.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="resExample" alt="Example result" />
                <figcaption>The absolute path error and path visualization during an example run.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>References</h2>
            <p>
                [1] Dall’Osto, D., Fischer, T., & Milford, M. (2020). Fast and Robust Bio-inspired Teach and Repeat Navigation. 2021 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), 500-507.
            </p>
        </section>
    </div>
</template>
