<script setup>
import menuShot from './assets/menu.png'
import gameplayShotA from './assets/20211227 1.png'
import gameplayShotB from './assets/20211227 2.png'
import hdrShot from './assets/20211208 Test hdr 1.jpg'
import bunnyShot from './assets/20211114 Test Bunny.png'
</script>

<template>
    <div class="project-article othellooo-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project is a complete 3D Othello / Reversi game rather than a pure rendering toy: player profiles, save and replay, human-vs-AI play, theme customization, and a 3D presentation layer all live in the same Java application.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> Java, Swing, LWJGL, OpenGL, fragment-shader ray tracing, HDR environment maps, PBR-style materials, BVH-style acceleration, and a separate gameplay / persistence layer for rules, profiles, and replay data.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Representative result</h2>
            <p>
                I did not want this to stop at “render a pretty board”. The point was to make the whole game usable, then keep pushing the visual side far enough that the renderer itself also became an interesting part of the project.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="menuShot" alt="OthellooO main menu" />
                    <figcaption>The project includes a complete menu and profile flow rather than only the board scene.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="gameplayShotA" alt="OthellooO gameplay screenshot" />
                    <figcaption>The final application keeps the game state, interaction, and 3D scene in one desktop workflow.</figcaption>
                </figure>
            </div>
            <div class="project-media-grid project-media-grid--three">
                <figure class="project-media">
                    <img :src="gameplayShotB" alt="OthellooO second gameplay screenshot" />
                    <figcaption>Board presentation and scene composition.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="hdrShot" alt="OthellooO HDR rendering experiment" />
                    <figcaption>HDR environment lighting experiments inside the same renderer.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="bunnyShot" alt="OthellooO rendering experiment with bunny model" />
                    <figcaption>The renderer was also used as a sandbox for non-board scenes and material tests.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>Game application first, renderer second</h2>
            <p>
                The project is easy to misread as “a board game with a fancy shader”, but the real structure is the other way around. I first made it a complete game application, with player management, save data, replay, and AI support, and then used the 3D layer to turn that application into something visually distinctive.
            </p>
            <p>
                That is why the repository is split so broadly. There is normal desktop-application code around controllers, dialogs, and data persistence, and alongside it there is a dedicated rendering side with scene generation, materials, rays, triangles, BVH nodes, and shader management. I wanted both to be real parts of the same project, not a game stapled onto a renderer or vice versa.
            </p>
        </section>

        <section class="project-article__section">
            <h2>The rendering direction</h2>
            <p>
                On the rendering side I kept pushing beyond a simple shaded chessboard. The project uses LWJGL and fragment-shader-based ray tracing, and I kept layering in things that made the scene feel less like a class assignment and more like an actual small graphics playground: HDR backgrounds, reflective materials, PBR-like shading, and acceleration structures for geometry queries.
            </p>
            <p>
                The screenshots in the repository show that progression clearly. Some scenes are directly about the game board, while others are obviously rendering experiments: Cornell-box style tests, metallic reflections, HDR lighting, mirror boxes, and imported geometry such as the Stanford bunny. That was intentional. I used the game project as a stable target while also using the renderer to explore techniques that would have been too detached if they were only isolated demos.
            </p>
        </section>

        <section class="project-article__section">
            <h2>What sits behind the UI</h2>
            <p>
                The non-rendering part is not trivial either. The codebase has explicit gameplay classes, AI classes, persistence managers for players and profiles, and UI components for dialogs and windows. So things like replay, custom themes, different player setups, and AI matches were not afterthoughts. They were treated as first-class features and organized like a normal application rather than hidden in one giant main file.
            </p>
            <p>
                That application layer is what makes the rendering experiments worthwhile here. Once the game loop, save data, and interaction model are already stable, improvements to materials, camera, or scene generation actually land on something that people can play with instead of only looking at in screenshots.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Why I still keep this project</h2>
            <p>
                I keep this project because it shows a mix I still care about: not just making a tool work, and not just making a picture look better, but getting interaction, software structure, and visual presentation to reinforce each other. The code is older and the renderer is still an experimental one, but the direction is clear even now: a game application that also served as a personal graphics lab.
            </p>
        </section>
    </div>
</template>
