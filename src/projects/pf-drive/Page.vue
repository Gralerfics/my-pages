<script setup>
import coverDemo from './cover.gif'
</script>

<template>
    <div class="project-article pf-drive-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project is a teach-and-repeat driving system for an Ackermann platform in semi-closed environments, with route recording, repeated traversal, drift compensation, prediction-based control, and both simulation and real-vehicle deployment paths.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> Camera-based route replay, wheel odometry, topological / taught-route navigation, Ackermann steering control, ROS-based modular integration, Webots and real-world execution paths, multiprocessing nodes, and parameterized drift-correction logic around the teach-and-repeat baseline.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Representative result</h2>
            <p>
                The goal here was not generic end-to-end autonomy, but stable repetition of a taught route in a constrained scene. That sounds narrower, but it makes the control problem more concrete: once the route has been demonstrated, how much of the replay stack can be made robust with lightweight vision, odometry, and correction logic instead of a full mapping-and-planning pipeline?
            </p>
            <figure class="project-media project-media--large">
                <img :src="coverDemo" alt="PF-Drive teach-and-repeat demo" />
                <figcaption>A recorded-route replay demo on the Ackermann platform.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>What I kept from the baseline, and what I changed</h2>
            <p>
                The slide deck makes it clear that this project starts from the fast bio-inspired teach-and-repeat idea: use a recorded route as the backbone, estimate the current match against the taught data, then apply rotation and along-path correction during replay. I kept that overall direction because it is simple enough to be practical on a resource-limited vehicle stack.
            </p>
            <p>
                But I did not just leave it as the baseline. A large part of the work was about rebuilding the stack around an Ackermann vehicle and dealing with the failure modes that show up once the system is pushed faster or over longer paths: coupled steering and advancing, unstable correction behavior, drift from wheel odometry, and brittle parameter dependence.
            </p>
        </section>

        <section class="project-article__section">
            <h2>System architecture</h2>
            <p>
                The reconstructed architecture in the slides is the part I find most useful. Instead of one monolithic script, the system is split into camera, locator, controller, actuator, loader, and vehicle-side interfaces, all coordinated through ROS and allowed to run in multiprocessing-style nodes. The same structure is meant to survive both Webots simulation and the real hardware path.
            </p>
            <p>
                That split matters because teach-and-repeat is not just “match one image and steer”. There is a recorded-data path, a live image path, odometry, command decomposition for the Ackermann chassis, and debug signals such as ground-truth pose or goal-passed events. Once those are separated cleanly, the correction logic can be iterated without collapsing the rest of the system.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Ackermann actuation and replay control</h2>
            <p>
                One of the practical differences from differential-drive teach-and-repeat examples is that this project has to obey Ackermann geometry. The slides explicitly separate the actuator and wheel odometry path, with decomposed commands and instantaneous radius logic instead of pretending the platform can pivot arbitrarily.
            </p>
            <p>
                That directly affects replay control. Steering prediction, slowing prediction, and along-path correction are all parameterized around a vehicle model with wheelbase, track, steering limit, and reference velocity. So route replay here is really a combination of taught-data matching and vehicle-constrained control, not a pure image-matching problem.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Drift compensation</h2>
            <p>
                The most technically specific part in the slides is the drift-compensation discussion. The replay path does not simply trust odometry and it does not simply snap to the best visual match either. Instead, it tries to keep the estimate inside a plausible local neighborhood of the recorded route and then update translation and rotation correction with tuned rates and thresholds.
            </p>
            <p>
                The parameter tables in the experiment section show that clearly. The system exposes correction distance intervals, separate update rates for translation and rotation compensation, angular and translational thresholds, prediction horizons, and steering weights. That is a sign of where the real work went: shaping the replay dynamics so the vehicle stays stable instead of oscillating or gradually losing the path.
            </p>
            <p>
                The slide notes also point out why this is hard. Similarity scores are useful for ranking candidate matches, but they are not a linear physical error metric. So the correction logic has to be selective about which candidates influence the estimate; otherwise the replay will consistently run ahead or lag behind and eventually diverge.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Experiment setup and takeaways</h2>
            <p>
                The experiment pages are mostly parameter studies over different vehicle presets and correction settings. What they show is less about one magical best configuration and more about sensitivity: reference velocity, correction interval, and the weighting of predicted steering goals all matter. The system can work well, but it is not indifferent to tuning.
            </p>
            <p>
                I like that the slides are honest about the weaknesses too. The listed future issues are exactly the right ones for this kind of project: strong parameter dependence, better distance-based normalization of targets, unified tuning, reduced jitter, post-processing of taught data, visual odometry support, and stronger simulation / real-world validation. That matches my own view of the project: the core direction is solid, but the next step is reducing the amount of hand tuning needed for stable replay.
            </p>
        </section>
    </div>
</template>
