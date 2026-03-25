<script setup>
import cornell267Result from './cover.gif'
import prettyHipResult from './assets/pretty-hip-example.gif'
import discoteq2Result from './assets/discoteq2-example.gif'
import abstractLevels from './assets/abstract-levels.jpg'
import timingReport from './assets/timing-report.png'
import m2Diagram from './assets/m2-diagram.jpg'
import m2ElaboratedSchematic from './assets/m2-elaborated-schematic.jpg'
import refGraph from './assets/ref-graph.jpg'
import structureRef from './assets/structure_refs.jpg'
import platformPhoto from './assets/platform.jpg'
import phCombElaboratedSchematic from './assets/ph-comb-elaborated-schematic.jpg'
import ridGraph from './assets/rid_graph.jpg'
import staCacheEx from './assets/sta_cache_ex.png'
import ProjectCodeBlock from "../../components/ProjectCodeBlock.vue";
</script>

<template>
    <div class="project-article nodalhdl-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project is a set of pipeline digital circuit design tools tightly embedded in the Python workflow, supporting automatic pipelining, combinatorial logic high-level synthesis and other features, and equipped with "visual but not yet editor" and other auxiliary tools.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> Python 3.12, custom signal and type system, structural IR around <code>Structure</code>, <code>Node</code> and <code>Net</code>, VHDL  / Verilog generation, static timing analysis (Vivado batch-mode), retiming, auto-pipelining, and Python-side behavioral construction for combinational datapaths.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Representative results</h2>
            <p>
                The most intuitive validation cases are the fragment-shader examples. Fragment shaders are naturally suited for computationally accelerated architecture design tasks; they output color values in parallel from input pixel coordinates.
            </p>
            <p>
                The following three examples are images captured during actual operation on an FPGA. These HDLs were generated directly from Python code using <code>nodalhdl</code> and automatically pipelined. In short, these images are outputed by real hardware circuits through HDMI cable.
            </p>
            <div class="project-media-grid project-media-grid--three">
                <figure class="project-media">
                    <img :src="cornell267Result" alt="Cornell 267 shader generated with NodalHDL" />
                    <figcaption>Demo 1: Cornell 267.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="prettyHipResult" alt="Pretty Hip shader generated with NodalHDL" />
                    <figcaption>Demo 2: Pretty Hip.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="discoteq2Result" alt="Discoteq 2 shader generated with NodalHDL" />
                    <figcaption>Demo 3: Discoteq 2.</figcaption>
                </figure>
            </div>
            <p>
                For example, the core circuit structure of Demo 2 before pipelined implementation roughly looks like the figure below. This was generated directly from Python code.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="phCombElaboratedSchematic" alt="The core circuits of Pretty Hip before pipelining" />
                <figcaption>The core circuits of Demo 2 (Pretty Hip) before auto-pipelining. Five clear Multipliers can be seen in the diagram, which are automatically implemented.</figcaption>
            </figure>
            <p>
                Manual programming would take a lot of design and debugging time, and the pipeline layout would be very tedious. But now, it can be programmed and simulated at the Python layer to generate the final product.
            </p>
            <figure class="project-media project-media--portrait">
                <img :src="platformPhoto" alt="The experiment FPGA platform" />
                <figcaption>The photo of the experiment FPGA platform.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Project overview</h2>
            <p>
                What I wanted here was not just another front end that prints HDL. The point was to build a workable middle layer for digital circuits, so that the circuit remains explicit and editable before code generation. That makes it possible to do structured reuse, automatic completion, timing analysis, and pipeline redistribution in one consistent flow.
            </p>
            <p>
                I divide the toolchain into three abstraction levels: a behavioral layer, a structural representation layer, and the HDL file model layer. The structural layer is the center. Upward, it can be built from Python-side behavior descriptions; downward, it maps to HDL files. Inside the toolchain, it is the layer where most transformations happen.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="abstractLevels" alt="Abstraction levels used in NodalHDL" />
                <figcaption>The project is organized around a structure layer between Python-embedded behavior and emitted HDL.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>The structural representation</h2>
            <p>
                The core object is <code>Structure</code>, which corresponds to a module template. Inside it, ports, substructures, nodes, nets, and structured port bundles are all explicit objects. A structure can be instantiated into another structure, so hierarchy is represented directly instead of being flattened away from the beginning.
            </p>
            <p>
                We divide the circuit into basic elements such as Structure, Node, and Net, which reference each other, as shown in the diagram below:
            </p>
            <figure class="project-media project-media--medium">
                <img :src="structureRef" alt="Reference relationships between objects" />
                <figcaption>The reference relationships between objects.</figcaption>
            </figure>
            <p>
                This part matters because I wanted the representation to stay close to circuit block diagrams. The project uses substructures, ports, and nets to build signal paths, and a proxy interface makes substructure ports accessible through <code>IO</code> in a way that is much easier to work with than raw hierarchical references.
            </p>
            <div class="project-media-grid project-media-grid--three">
                <figure class="project-media">
                    <img :src="m2Diagram" alt="M2 structure diagram in NodalHDL" />
                    <figcaption>A structured representation can stay close to a circuit block diagram instead of collapsing into raw HDL too early.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="m2ElaboratedSchematic" alt="Elaborated schematic for M2 in NodalHDL" />
                    <figcaption>After elaboration, the same design can be expanded into a flatter schematic for later analysis and generation.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="refGraph" alt="M2 reference relationships" />
                    <figcaption>For the example structure above, here are the reference relationships within nodalhdl.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>Type system, deduction and runtime information</h2>
            <p>
                To make parameterized design practical, the project includes a custom type system instead of relying only on plain bit vectors. It supports arbitrary-width integers, fixed-point numbers, floating-point numbers, bundles, and IO wrappers. One important point is that some type information can be left incomplete and then deduced later.
            </p>
            <p>
                I keep that deduction-related information as runtime information attached to a structure instance rather than rewriting the original structure definition directly. That is what lets the same structure be safely reused in different places, while still allowing operations such as automatic type deduction, timing analysis, and later solidification of inferred information.
            </p>
            <p>
                To isolate runtime information between different instances and prevent runtime information of structures that are instantiated multiple times from being confused, I use Runtime ID as a unique identifier that can be uniquely derived from the Runtime ID of the upper-level structure.
            </p>
            <figure class="project-media project-media--small">
                <img :src="ridGraph" alt="Runtime ID information attached to structures" />
                <figcaption>Latency and other runtime information are attached to structural objects according to the unique Runtime ID.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>Workflow, STA, and automatic pipelining</h2>
            <p>
                The repository exposes a fairly complete structural workflow: duplication and stripping, singletonization, substructure expansion, automatic type deduction, HDL generation, persistence, and static timing analysis. In the examples this usually appears as a sequence such as <code>singletonize()</code>, <code>expand()</code>, <code>deduction()</code>, <code>VivadoSTA.analyse()</code>, <code>pipelining()</code>, and finally <code>generation()</code>.
            </p>
            <p>
                The automatic pipelining part is based on retiming. The implementation provides both a simple circuit model and an extended circuit model. The simple one is faster and works well for quick verification; the extended one models internal paths more carefully and can produce slightly better results. In both cases, the idea is not to blindly insert registers, but to add pipeline stages and then redistribute them through retiming so the final register layout is better balanced.
            </p>
            <p>
                Static timing analysis (STA) is a prerequisite for automated pipelined timing information. I used Vivado's STA functionality to parse its ASCII-formatted reports to obtain timing information. To obtain timing information for each component, I needed to perform STA for each component individually, choosing multi-threading for synchronous execution to speed things up. To reduce the time consumption of this step, I implemented a caching system, allowing unmodified components to directly reuse previous STA results without needing to rerun.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="timingReport" alt="Timing report parsed by NodalHDL" />
                    <figcaption>Static timing information is pulled back from Vivado and written into the structural workflow.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="staCacheEx" alt="STA cache example" />
                    <figcaption>An example for STA cache management.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>Behavioral generation and the shader example</h2>
            <p>
                On top of the structural layer, I also tried to introduce some HLS-like behavior. The basic idea is to use Python execution itself to trace signal flow and build a computational graph, then turn that graph into structural objects. This part is mainly aimed at combinational datapaths; sequential logic and FSM generation are discussed, but not yet complete.
            </p>
            <p>
                To illustrate further, as shown in Demo 2 above, its core circuitry was generated by executing the following Python code, and the VHDL it generates has tens of thousands of lines.
            </p>
            <ProjectCodeBlock
                lang="python"
                :code="String.raw`
                from nodalhdl.py.std import mux, sfixed, uint
                from nodalhdl.py.glsl import vec2, vec4, fract, ceil, min, clamp

                T = SFixedPoint[16, 12]

                def shader(iTime_us_u64: ComputeElement, fragCoord_u12: vec2) -> ComputeElement:
                    iTime_us = sfixed(iTime_us_u64, T.W_int + 20, T.W_frac)
                    iTime_s = sfixed(iTime_us >> 20, T.W_int, T.W_frac)

                    fragCoord = vec2(sfixed(fragCoord_u12.x, T.W_int, T.W_frac), sfixed(fragCoord_u12.y, T.W_int, T.W_frac))

                    a = vec2((fragCoord.x >> 9) + (fragCoord.x >> 7) - 5, (fragCoord.y >> 9) + (fragCoord.y >> 7) - 3.75)
                    u = vec2(a.x - a.y + 5, a.x + a.y + 5)
                    f = fract(u)
                    f = min(f, 1 - f)
                    v = ceil(u) - 5.5

                    s = 1 + ((v.x * v.x + v.y * v.y) >> 3)
                    e = (fract((iTime_s - (s >> 1)) >> 2) << 1) - 1
                    t = fract(min(f.x, f.y) << 2)

                    rampFactor = 0.95 * mux(e[e.type.W - 1], 1 - t, t) - e * e
                    mixFactor = clamp((rampFactor << 4) + (rampFactor << 2) + 1, 0, 0.9999) + s * 0.1

                    fragColor = clamp(vec4(1 - (mixFactor >> 1), 1 - (mixFactor >> 2), 0.9999, 0.9999), 0, 0.9999)
                    return uint(fragColor.r << 8, 8) @ uint(fragColor.g << 8, 8) @ '11111111'
                `"
            />
        </section>

        <section class="project-article__section">
            <h2>Discussion</h2>
            <p>
                The project is still incomplete in several obvious places. The structural layer is expressive, but that also makes persistence and some integrations less lightweight. Timing analysis is currently tied mainly to Vivado. Sequential logic generation, generic simulation on the structure layer, richer board-support components, and more complete visual tooling are still future work.
            </p>
            <p>
                Even so, the main path I wanted is already usable: describe arithmetic-heavy behavior in Python, turn it into an explicit structure, run deduction and timing-driven pipelining on that structure, and emit HDL that can be pushed into a real FPGA validation flow.
            </p>
        </section>
    </div>
</template>
