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
import ProjectCodeBlock from '../../components/ProjectCodeBlock.vue'
import LocalizedContent from '../../components/LocalizedContent.vue'
</script>

<template>
    <div class="project-article nodalhdl-article">
        <section class="project-article__section">
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Features.</strong> This project is a set of pipeline digital circuit design tools tightly embedded in the Python workflow, supporting automatic pipelining, combinatorial logic high-level synthesis and other features, and equipped with "visual but not yet editor" and other auxiliary tools.
                </template>
                <template #zh>
                    <strong>项目特性 - </strong> 这个项目是一套紧密嵌入 Python 工作流的流水数字电路设计工具，支持自动流水化、组合逻辑高层综合等能力，并配有可视化编辑器等辅助工具。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p" class="detail-text">
                <template #en>
                    <strong>Stack.</strong> Python 3.12, custom signal and type system, structural IR around <code>Structure</code>, <code>Node</code> and <code>Net</code>, VHDL / Verilog generation, static timing analysis (Vivado batch-mode), retiming, auto-pipelining, and Python-side behavioral construction for combinational datapaths.
                </template>
                <template #zh>
                    <strong>相关技术 - </strong> Python 3.12、自定义信号与类型系统、围绕 <code>Structure</code> / <code>Node</code> / <code>Net</code> 的结构化中间表示、HDL / Verilog 生成、静态时序分析（借助 Vivado）、重定时（retiming）、自动流水化，以及面向组合数据通路的 Python 级行为描述。
                </template>
            </LocalizedContent>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Representative results</template>
                <template #zh>结果演示</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The most intuitive validation cases are the fragment-shader examples. Fragment shaders are naturally suited for computationally accelerated architecture design tasks; they output color values in parallel from input pixel coordinates.
                </template>
                <template #zh>
                    最直观的验证案例是几个片段着色器（fragment shader）示例。片段着色器天然适合作为计算密集型架构设计的验证对象，简单的片段着色器本质就是一个输入像素坐标、输出颜色值的可并行化的计算函数。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The following three examples are images captured during actual operation on an FPGA. These HDLs were generated directly from Python code using <code>nodalhdl</code> and automatically pipelined. In short, these images are outputed by real hardware circuits through HDMI cable.
                </template>
                <template #zh>
                    下面三个示例都是 FPGA 实际运行时通过 HDMI 输出到屏幕上的拍摄画面。这些 HDL 由 Python 代码通过 <code>nodalhdl</code> 直接生成，并自动完成流水化，是真实硬件输出的渲染结果。
                </template>
            </LocalizedContent>
            <div class="project-media-grid project-media-grid--three">
                <figure class="project-media">
                    <img :src="cornell267Result" alt="Cornell 267 shader generated with NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>Demo 1: Cornell 267.</template>
                        <template #zh>示例一：Cornell 267。</template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="prettyHipResult" alt="Pretty Hip shader generated with NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>Demo 2: Pretty Hip.</template>
                        <template #zh>示例二：Pretty Hip。</template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="discoteq2Result" alt="Discoteq 2 shader generated with NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>Demo 3: Discoteq 2.</template>
                        <template #zh>示例三：Discoteq 2。</template>
                    </LocalizedContent>
                </figure>
            </div>
            <LocalizedContent tag="p">
                <template #en>
                    For example, the core circuit structure of Demo 2 before pipelined implementation roughly looks like the figure below. This was generated directly from Python code.
                </template>
                <template #zh>
                    例如，示例二在流水化之前的核心电路结构大致如下图所示，它也是直接从 Python 代码生成出来的。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--medium">
                <img :src="phCombElaboratedSchematic" alt="The core circuits of Pretty Hip before pipelining" />
                <LocalizedContent tag="figcaption">
                    <template #en>
                        The core circuits of Demo 2 (Pretty Hip) before auto-pipelining. Five clear Multipliers can be seen in the diagram, which are automatically implemented.
                    </template>
                    <template #zh>
                        示例二（Pretty Hip）在自动流水化之前的核心电路图。图中可以看到清晰的五个乘法器，都是自动实现出来的。
                    </template>
                </LocalizedContent>
            </figure>
            <LocalizedContent tag="p">
                <template #en>
                    Manual programming would take a lot of design and debugging time, and the pipeline layout would be very tedious. But now, it can be programmed and simulated at the Python layer to generate the final product.
                </template>
                <template #zh>
                    如果手工编写这个示例，可以预见地会消耗大量设计和调试时间，流水线布局非常繁琐且难以调试修改。但现在可以在 Python 层完成编程和仿真，再直接生成最终结果。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--portrait">
                <img :src="platformPhoto" alt="The experiment FPGA platform" />
                <LocalizedContent tag="figcaption">
                    <template #en>The photo of the experiment FPGA platform.</template>
                    <template #zh>实验所用的 FPGA 平台实物图。</template>
                </LocalizedContent>
            </figure>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Project overview</template>
                <template #zh>项目概览</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    What I wanted here was not just another front end that prints HDL. The point was to build a workable middle layer for digital circuits, so that the circuit remains explicit and editable before code generation. That makes it possible to do structured reuse, automatic completion, timing analysis, and pipeline redistribution in one consistent flow.
                </template>
                <template #zh>
                    我想做的并不只是另一个输出 HDL 的组件，更关键的是建立一个可工作的数字电路中间层，使得电路在代码生成之前仍然保持显式、可编辑的结构。这样才能在统一流程里完成结构复用、自动补全、时序分析和流水线重分配。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    I divide the toolchain into three abstraction levels: a behavioral layer, a structural representation layer, and the HDL file model layer. The structural layer is the center. Upward, it can be built from Python-side behavior descriptions; downward, it maps to HDL files. Inside the toolchain, it is the layer where most transformations happen.
                </template>
                <template #zh>
                    我把工具链划分为三个抽象层级：行为层、结构表示层、以及 HDL 文件模型层。结构层是中心。向上它可以由 Python 侧的行为描述构造而来，向下它映射到 HDL 文件，工具链内部的大部分变换也都发生在这一层。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--medium">
                <img :src="abstractLevels" alt="Abstraction levels used in NodalHDL" />
                <LocalizedContent tag="figcaption">
                    <template #en>
                        The project is organized around a structure layer between Python-embedded behavior and emitted HDL.
                    </template>
                    <template #zh>
                        整个项目围绕位于 Python 行为描述与 HDL 输出之间的结构层组织。
                    </template>
                </LocalizedContent>
            </figure>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>The structural representation</template>
                <template #zh>结构表示层</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The core object is <code>Structure</code>, which corresponds to a module template. Inside it, ports, substructures, nodes, nets, and structured port bundles are all explicit objects. A structure can be instantiated into another structure, so hierarchy is represented directly instead of being flattened away from the beginning. We divide the circuit into basic elements such as <code>Structure</code>, <code>Node</code>, and <code>Net</code>, which reference each other, as shown in the diagram below:
                </template>
                <template #zh>
                    核心对象是 <code>Structure</code>，它对应一个模块模板。其内部的端口、子结构、节点、连线以及结构化端口束都是显式对象。一个 <code>Structure</code> 可以实例化到另一个 <code>Structure</code> 中，因此层次关系是直接表达的，而不是一开始就被拍平成一层。我们将电路划分为 <code>Structure</code>、<code>Node</code>、<code>Net</code> 等基本元素，它们之间的引用关系如下图所示：
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--medium">
                <img :src="structureRef" alt="Reference relationships between objects" />
                <LocalizedContent tag="figcaption">
                    <template #en>The reference relationships between objects.</template>
                    <template #zh>基本元素之间的引用关系。</template>
                </LocalizedContent>
            </figure>
            <LocalizedContent tag="p">
                <template #en>
                    This part matters because I wanted the representation to stay close to circuit block diagrams. The project uses substructures, ports, and nets to build signal paths, and a proxy interface makes substructure ports accessible through <code>IO</code> in a way that is much easier to work with than raw hierarchical references.
                </template>
                <template #zh>
                    这一部分很重要，因为我希望它尽可能接近电路框图的思维方式。项目通过子结构、端口和连线来构建信号路径，同时利用代理接口，让子结构端口可以通过 <code>IO</code> 来访问，比直接处理原始层级引用更自然。
                </template>
            </LocalizedContent>
            <div class="project-media-grid project-media-grid--three">
                <figure class="project-media">
                    <img :src="m2Diagram" alt="M2 structure diagram in NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>
                            A structured representation can stay close to a circuit block diagram instead of collapsing into raw HDL too early.
                        </template>
                        <template #zh>
                            结构化表示可以保持接近电路框图，而不会过早塌缩成原始 HDL。
                        </template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="m2ElaboratedSchematic" alt="Elaborated schematic for M2 in NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>
                            After elaboration, the same design can be expanded into a flatter schematic for later analysis and generation.
                        </template>
                        <template #zh>
                            在 elaboration 之后显示的电路框图。
                        </template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="refGraph" alt="M2 reference relationships" />
                    <LocalizedContent tag="figcaption">
                        <template #en>
                            For the example structure above, here are the reference relationships within <code>nodalhdl</code>.
                        </template>
                        <template #zh>
                            以上示例结构在 <code>nodalhdl</code> 内部的引用关系。
                        </template>
                    </LocalizedContent>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Type system, deduction and runtime information</template>
                <template #zh>类型系统、自动类型推导与运行时信息</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    To make parameterized design practical, the project includes a custom type system instead of relying only on plain bit vectors. It supports arbitrary-width integers, fixed-point numbers, floating-point numbers, bundles, and IO wrappers. One important point is that some type information can be left incomplete and then deduced later.
                </template>
                <template #zh>
                    为了实现大规模参数化设计，项目没有只依赖普通比特向量，而是实现了一套自定义的类型系统，支持任意位宽整数、定点数、bundle 和 IO wrapper。一个关键点是部分类型信息可以先不完整，使用 Auto 交由后续的自动类型推导。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    I keep that deduction-related information as runtime information attached to a structure instance rather than rewriting the original structure definition directly. That is what lets the same structure be safely reused in different places, while still allowing operations such as automatic type deduction, timing analysis, and later solidification of inferred information.
                </template>
                <template #zh>
                    这些与推导相关的信息，我将其附着在结构实例的运行时信息上，而不是直接改写原始结构定义。这使得同一个结构可以在不同地方安全复用，同时仍然支持自动类型推导、时序分析，以及后续把推导信息固化下来。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    To isolate runtime information between different instances and prevent runtime information of structures that are instantiated multiple times from being confused, I use Runtime ID as a unique identifier that can be uniquely derived from the Runtime ID of the upper-level structure.
                </template>
                <template #zh>
                    为了隔离不同实例之间的运行时信息，避免被多次实例化的结构相互混淆，我使用 Runtime ID 作为唯一标识，而且上层结构的 Runtime ID 可以唯一决定下层结构的 Runtime ID。
                </template>
            </LocalizedContent>
            <figure class="project-media project-media--small">
                <img :src="ridGraph" alt="Runtime ID information attached to structures" />
                <LocalizedContent tag="figcaption">
                    <template #en>
                        Latency and other runtime information are attached to structural objects according to the unique Runtime ID.
                    </template>
                    <template #zh>
                        延迟等运行时信息会按照唯一的 Runtime ID 绑定到结构对象上。
                    </template>
                </LocalizedContent>
            </figure>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Workflow, STA, and automatic pipelining</template>
                <template #zh>工作流、静态时序分析与自动流水化</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The repository exposes a fairly complete structural workflow: duplication and stripping, singletonization, substructure expansion, automatic type deduction, HDL generation, persistence, and static timing analysis. In the examples this usually appears as a sequence such as <code>singletonize()</code>, <code>expand()</code>, <code>deduction()</code>, <code>VivadoSTA.analyse()</code>, <code>pipelining()</code>, and finally <code>generation()</code>.
                </template>
                <template #zh>
                    仓库暴露了一套较完整的结构化工作流：复制、剥离、单例化、子结构展开、自动类型推导、HDL 生成、持久化存储以及静态时序分析。在示例中，它通常表现为一串流程：<code>singletonize()</code>、<code>expand()</code>、<code>deduction()</code>、<code>VivadoSTA.analyse()</code>、<code>pipelining()</code>，最后 <code>generation()</code>。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The automatic pipelining part is based on retiming. The implementation provides both a simple circuit model and an extended circuit model. The simple one is faster and works well for quick verification; the extended one models internal paths more carefully and can produce slightly better results. In both cases, the idea is not to blindly insert registers, but to add pipeline stages and then redistribute them through retiming so the final register layout is better balanced.
                </template>
                <template #zh>
                    自动流水化部分基于重定时技术。<code>nodalhdl</code> 中同时提供了简单电路模型和扩展电路模型。前者更快，适合快速验证；后者对内部路径建模更细致，结果也可能略好。两者的核心思路都是先插入流水级，再通过重定时把寄存器重新分布到更均衡的布局。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Static timing analysis (STA) is a prerequisite for automated pipelined timing information. I used Vivado's STA functionality to parse its ASCII-formatted reports to obtain timing information. To obtain timing information for each component, I needed to perform STA for each component individually, choosing multi-threading for synchronous execution to speed things up. To reduce the time consumption of this step, I implemented a caching system, allowing unmodified components to directly reuse previous STA results without needing to rerun.
                </template>
                <template #zh>
                    静态时序分析（STA）是自动流水化时序信息的前提。我使用 Vivado 的 STA 功能，并解析其 ASCII 格式的报告来提取时序数据。为了得到每个组件的时序信息，需要对组件逐个执行 STA，因此我采用多线程同步执行来加速这一过程。同时为了进一步减少耗时，我实现了一套缓存系统，让未修改组件可以直接复用过去的 STA 结果，不必重新运行。
                </template>
            </LocalizedContent>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="timingReport" alt="Timing report parsed by NodalHDL" />
                    <LocalizedContent tag="figcaption">
                        <template #en>
                            Static timing information is pulled back from Vivado and written into the structural workflow.
                        </template>
                        <template #zh>
                            静态时序信息会从 Vivado 中回填到结构化工作流里。
                        </template>
                    </LocalizedContent>
                </figure>
                <figure class="project-media">
                    <img :src="staCacheEx" alt="STA cache example" />
                    <LocalizedContent tag="figcaption">
                        <template #en>An example for STA cache management.</template>
                        <template #zh>STA 缓存管理示例。</template>
                    </LocalizedContent>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <LocalizedContent tag="h2">
                <template #en>Behavioral generation and the shader example</template>
                <template #zh>行为级描述与渲染示例</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    On top of the structural layer, I also tried to introduce some HLS-like behavior. The basic idea is to use Python execution itself to trace signal flow and build a computational graph, then turn that graph into structural objects. This part is mainly aimed at combinational datapaths; sequential logic and FSM generation are discussed, but not yet complete.
                </template>
                <template #zh>
                    在结构层之上，我也尝试引入一些类似 HLS 的行为描述。基本思路是利用 Python 自身的执行过程跟踪信号流，建立计算图，再把这张图转成结构对象。这一部分主要面向组合数据通路；顺序逻辑和 FSM 生成目前还并未完成。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    To illustrate further, as shown in Demo 2 above, its core circuitry was generated by executing the following Python code, and the VHDL it generates has tens of thousands of lines.
                </template>
                <template #zh>
                    进一步说明的话，如上面的示例二所示，其核心电路就是通过执行下面这段 Python 代码生成的，而最终生成的 VHDL 有数万行。
                </template>
            </LocalizedContent>
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
            <LocalizedContent tag="h2">
                <template #en>Discussion</template>
                <template #zh>讨论</template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    The project is still incomplete in several obvious places. The structural layer is expressive, but that also makes persistence and some integrations less lightweight. Timing analysis is currently tied mainly to Vivado. Sequential logic generation, generic simulation on the structure layer, richer board-support components, and more complete visual tooling are still future work.
                </template>
                <template #zh>
                    这个项目在一些明显的地方仍然不完整。结构层的表达能力很强，但这也让持久化和一些集成环节不够轻量。时序分析目前也主要依赖 Vivado。顺序逻辑生成、结构层通用仿真、更丰富的板级支持组件以及更完整的可视化工具，都还属于未来工作。
                </template>
            </LocalizedContent>
            <LocalizedContent tag="p">
                <template #en>
                    Even so, the main path I wanted is already usable: describe arithmetic-heavy behavior in Python, turn it into an explicit structure, run deduction and timing-driven pipelining on that structure, and emit HDL that can be pushed into a real FPGA validation flow.
                </template>
                <template #zh>
                    不过，在 Python 中描述计算密集型行为，把它转成显式结构表示，在该结构上执行推导与时序驱动的流水化，再输出能够进入真实 FPGA 验证流程的 HDL 的流程已经完整打通。
                </template>
            </LocalizedContent>
        </section>
    </div>
</template>
