<script setup>
import ee211Stack from './assets/ee211-stack.png'
import ee211Demo from './assets/ee211-demo.gif'
import ee346Map from './assets/ee346-map.png'
import ee346Demo from './assets/ee346-demo.gif'
import ee368Setup from './assets/ee368-setup.jpg'
</script>

<template>
    <div class="project-article robotics-coursework-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This entry groups three robotics course projects that cover a coherent range: ROS1 mobile navigation with target stopping, ROS2 planning / control plus marker-based grasping, and camera-guided manipulator control for whiteboard following.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> ROS1 <code>move_base</code>, AMCL, occupancy maps, lidar target detection, ROS2 Nav2 plugin development, custom A* and DWA implementations, ArUco perception, TF-based hand-eye coordination, RealSense capture, and PID-style Cartesian visual servoing.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Why I keep these three together</h2>
            <p>
                I group these repositories together because they are not random coursework leftovers. They form a progression through the same theme: first get a mobile robot moving reliably in a mapped scene, then combine navigation with perception and interaction, and finally move into manipulation where the camera itself becomes part of the control loop.
            </p>
            <p>
                That is also how I think about them technically. They are smaller than a full research project, but taken together they show repeated work on integrating perception and control instead of stopping at one isolated demo.
            </p>
        </section>

        <section class="project-article__section">
            <h2>EE346: waypoint navigation plus stopping near uncertain poles</h2>
            <p>
                The ROS1 part starts from a standard map-based navigation setup, but the interesting bit is that it does not stop there. The robot first follows a sequence of global goals through <code>move_base</code> and AMCL, and then switches behavior when it detects the target poles that are only approximately known in advance.
            </p>
            <p>
                The final stopping logic uses lidar filtering and map-aware rejection of wall-adjacent returns so that poles are less likely to be confused with clutter. Once the target is detected reliably enough, the robot interrupts the current global goal, performs a local alignment / stopping maneuver, and then resumes the waypoint sequence.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="ee346Demo" alt="EE346 mobile robot navigation demo" />
                    <figcaption>Waypoint navigation with interruption for target stopping.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="ee346Map" alt="EE346 occupancy map" />
                    <figcaption>The task is still grounded in a mapped indoor scene rather than pure reactive motion.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>EE211: ROS2 navigation and marker-based grasping</h2>
            <p>
                The ROS2 repository is the most system-like of the three. It contains both a custom Nav2 planner / controller side and a perception-to-manipulation side. On the navigation path, I worked with a custom A*-style planner and a DWA-style local controller instead of only relying on stock components.
            </p>
            <p>
                On top of that, the project adds ArUco-based perception and a grasp workflow that depends on TF alignment between the camera and the arm. That combination is what makes this course project more interesting than a simple planner plugin assignment: path planning, local control, perception, and arm execution are all beginning to be stitched into one ROS2 pipeline.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media project-media--portrait">
                    <img :src="ee211Demo" alt="EE211 ROS2 demo" />
                    <figcaption>The task extends navigation into marker-driven interaction around the target object.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="ee211Stack" alt="EE211 project stack illustration" />
                    <figcaption>Planning, control, perception, and grasping are already organized as a multi-package ROS2 workflow.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>EE368: visual servoing for whiteboard following</h2>
            <p>
                The third project shifts away from navigation and into manipulation. Here the main problem is not reaching a fixed pose once, but continuously tracking a whiteboard and keeping the end effector aligned with it while the reference is estimated from camera observations.
            </p>
            <p>
                The control loop combines camera input, marker pose estimation, hand-eye calibration, frame transformation, and PID-like Cartesian control. In other words, the camera is not only a detector; it is part of the feedback path that keeps the arm aligned with the moving task frame.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="ee368Setup" alt="EE368 manipulator setup" />
                <figcaption>The visual-servoing project uses camera feedback as part of the manipulator control loop.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>What these projects show together</h2>
            <p>
                None of these repositories alone is meant to be a flagship system. The value is in the continuity across them: repeated work on navigation, local control, perception, and robot interaction, with each project pushing the integration point a little further. That is why I keep them as one grouped entry rather than flattening them into unrelated coursework bullets.
            </p>
        </section>
    </div>
</template>
