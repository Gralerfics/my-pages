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
        <strong>Key points.</strong> This entry groups three separate robotics course projects rather
        than one monolithic system. The useful part is the spread: ROS1 navigation and stopping around
        uncertain landmarks, ROS2 navigation plus marker-based grasping, and camera-guided whiteboard
        following on a Kinova arm.
      </p>
      <p class="detail-text">
        <strong>Stack.</strong> ROS1 <code>move_base</code>, AMCL, occupancy maps, lidar-based target
        detection, ROS2 Nav2 plugin development, custom A* and DWA implementations, ArUco perception,
        TF-based arm-camera coordination, RealSense capture, and Cartesian PID control for visual
        servoing.
      </p>
    </section>

    <section class="project-article__section">
      <h2>How this grouped project is organised</h2>
      <p>
        The three repositories were built for different courses, but they fit together as one portfolio
        item because they cover a sensible robotics progression. The first project is mostly about
        classical mobile-robot navigation in ROS1. The second moves to ROS2 and Nav2, then extends the
        workflow to visual-marker localisation and arm interaction. The third shifts to manipulation
        and camera-guided control, where the robot has to keep tracking a moving whiteboard instead of
        solving a static navigation problem.
      </p>
      <p>
        The local application materials and videos are useful here because the repositories themselves
        are code-heavy and barely documented. I used those materials mainly to confirm what each task
        was demonstrating, and then filled in the implementation details from the codebases.
      </p>
    </section>

    <section class="project-article__section">
      <h2>EE346: waypoint navigation and stopping near uncertain poles</h2>
      <p>
        The ROS1 repository is not just a launch-file submission. The later lab code combines map-based
        navigation and a second-stage stopping behaviour around target poles whose exact locations are
        not known beforehand. In <code>lab7/scripts/visit.py</code>, the robot first drives through a
        sequence of map-frame goals using <code>move_base</code> and AMCL, then keeps checking the
        lidar scan for candidate poles while it moves.
      </p>
      <p>
        What is technically interesting is the filtering logic. The script loads the map, computes a
        chessboard-distance transform on occupied cells, and rejects scan returns that are too close to
        the wall. That leaves isolated candidates more likely to be actual poles instead of clutter on
        the map boundary. After repeated detections, it cancels the current navigation goal, switches
        into a local parking controller, aligns with the pole, stops near it, and then resumes the
        waypoint sequence.
      </p>
      <p>
        So the project is not only "visit fixed waypoints". It is a layered behaviour: global
        navigation handled by the ROS navigation stack, local detection from lidar, and a custom
        short-range controller for the final stopping manoeuvre.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="ee346Demo" alt="EE346 mobile robot navigation demo with waypoint visiting and stopping" />
        <figcaption>EE346 demo clip: map-based navigation with interruption for target stopping.</figcaption>
      </figure>
      <figure class="project-media project-media--medium">
        <img :src="ee346Map" alt="EE346 map and navigation screenshot" />
        <figcaption>Material used in the original portfolio notes for the ROS1 navigation task.</figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>EE211: ROS2 navigation plus marker-based grasping</h2>
      <p>
        The ROS2 repository is structurally richer. Besides the final grasp package, it also includes a
        custom Nav2 planner plugin and controller plugin. The planner side contains an
        <code>AStarPlanner</code> implementation that converts the costmap into an internal cost array,
        runs potential propagation with an A*-style heuristic, and reconstructs the path by following
        gradients back from start to goal. On the controller side there is a hand-written DWA-style
        local controller that samples linear/angular velocity pairs, rolls trajectories forward, and
        scores them by goal distance, speed preference, and obstacle proximity.
      </p>
      <p>
        The manipulation task then adds another subsystem on top. The <code>grasp</code> package
        combines ArUco-based perception, TF reading, and arm-side control logic. The top-level
        <code>grasp.py</code> waits for the camera-to-arm transform to become available, then hands that
        transform into an arm controller node. Under the same repository there is also a ROS2 ArUco
        package and dedicated interfaces for grasp actions and queries, so the course work already had
        the shape of a small multi-package system rather than one single script.
      </p>
      <p>
        That makes EE211 the most system-like of the three. It is where global planning, local control,
        perception, and arm execution are closest to being stitched into one ROS2 workflow.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="ee211Demo" alt="EE211 ROS2 project demo with perception and manipulation" />
        <figcaption>EE211 demo clip: ROS2 navigation and marker-driven interaction around the task block.</figcaption>
      </figure>
      <figure class="project-media project-media--medium">
        <img :src="ee211Stack" alt="EE211 ROS2 navigation and grasping project image" />
        <figcaption>Material image used in the earlier project collection notes for the EE211 task.</figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>EE368: whiteboard following and drawing with visual servoing</h2>
      <p>
        The EE368 project is the most manipulation-heavy of the three. The Python entry
        <code>py/main.py</code> sets up a Kinova Gen3 Lite arm, a camera, an ArUco detector, and two
        PID controllers. The code explicitly uses hand-eye calibration data, recovers the board marker
        pose relative to the end effector, transforms the target into the hand frame, and then commands
        Cartesian twist motion so that the tool follows the board while keeping a suitable orientation.
      </p>
      <p>
        This is not just marker detection or just arm scripting. The control loop mixes pose
        estimation, frame transformation, velocity feedback, and continuous command updates. The
        position controller drives the tool towards a target point relative to the marker, while a
        second controller uses marker orientation information to keep the end-effector aligned with the
        whiteboard surface. That is a much closer fit to visual servoing than to a fixed pick-and-place
        demo.
      </p>
      <p>
        There is no polished write-up in the repository, but the code is clear enough about the
        intended behaviour: track the board, maintain relative pose, and treat the marker as the moving
        reference for writing motions.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="ee368Setup" alt="EE368 robotic motion and control setup image" />
        <figcaption>Course material image for the whiteboard-following manipulator project.</figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>Why I keep these three together</h2>
      <p>
        I would not group unrelated coursework just to increase project count. These three belong
        together because they show a coherent robotics profile: map-based mobile navigation, local
        sensing and target interaction, then camera-driven manipulation. They are still course projects,
        so each one has the usual scope limits, but together they show repeated work on the same theme:
        perception and control loops that have to survive integration with actual robotics software and
        hardware stacks.
      </p>
    </section>
  </div>
</template>

<style scoped>
.robotics-coursework-article strong {
  color: var(--title);
  font-weight: 600;
}

.project-media {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.project-media--medium {
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
