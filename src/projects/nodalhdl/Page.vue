<script setup>
import abstractLevels from './assets/abstract-levels.jpg'
import nodesNets from './assets/nodes-nets.jpg'
import nodeLatencies from './assets/node-latencies.jpg'
import timingReport from './assets/timing-report.png'
import combinationalSchematic from './assets/ph-comb-elaborated-schematic.jpg'
import cornell267Result from './cover.gif'
import prettyHipResult from './assets/pretty-hip-example.gif'
import discoteq2Result from './assets/discoteq2-example.gif'
</script>

<template>
  <div class="project-article nodalhdl-article">
    <section class="project-article__section">
      <p class="detail-text">
        <strong>Key points.</strong> First, NodalHDL is not only a Python syntax experiment; it already
        has a concrete middle layer for circuit construction, type deduction, HDL generation, static
        timing analysis, and retiming-based pipelining. Second, the repository contains end-to-end
        examples that actually drive the flow into FPGA-facing output rather than stopping at an IR or
        graph visualisation.
      </p>
      <p class="detail-text">
        <strong>Stack.</strong> Python 3.12, a custom signal/type system, structural IR built around
        <code>Structure</code>/<code>Node</code>/<code>Net</code>, VHDL and Verilog emission, Vivado
        batch-mode STA through generated Tcl, and graph-based retiming infrastructure with
        <code>networkx</code>. The current implementation level is toolchain/core-library work rather
        than polished productisation.
      </p>
    </section>

    <section class="project-article__section">
      <h2>Rendered results</h2>
      <p>
        The repository is strongest when it stops talking about the toolchain and shows that the flow
        can actually drive nontrivial arithmetic-heavy shaders onto FPGA-backed output. The three demos
        below are all generated through the same overall path: Python-side behavioural description,
        structural lowering, timing analysis, automatic pipelining, HDL emission, and board-level
        integration outside the core repository.
      </p>
      <div class="project-media-grid project-media-grid--three">
        <figure class="project-media">
          <img :src="cornell267Result" alt="Cornell 267 shader running from the NodalHDL-generated pipeline" />
          <figcaption>Cornell 267 variant used as the main cover demonstration.</figcaption>
        </figure>
        <figure class="project-media">
          <img :src="prettyHipResult" alt="Pretty Hip shader rendered through the NodalHDL flow" />
          <figcaption>Pretty Hip, the example most explicitly documented in the README.</figcaption>
        </figure>
        <figure class="project-media">
          <img :src="discoteq2Result" alt="Discoteq 2 shader rendered through the NodalHDL flow" />
          <figcaption>Discoteq 2, showing the same flow on a different arithmetic pattern.</figcaption>
        </figure>
      </div>
    </section>

    <section class="project-article__section">
      <h2>What the project is actually trying to solve</h2>
      <p>
        The thesis and README are consistent on the main point: the target is an agile digital-circuit
        development toolchain for pipelined accelerator-style designs, not a generic HDL replacement.
        The intended workflow is to let Python describe behaviour or structure, lower that into an
        explicit structural representation, run type deduction and timing-related passes there, and
        only then emit HDL. That extra middle layer is the whole project, not an implementation detail.
      </p>
      <p>
        This is why the abstraction stack in the thesis is useful. The behavioural layer is allowed to
        look closer to Python; the bottom layer still has to correspond to generated HDL files; but the
        actual engineering work sits in the structure layer between them, because that is where reuse,
        flattening, type propagation, timing metadata, and retiming become manageable.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="abstractLevels" alt="Abstraction hierarchy used by NodalHDL from behaviour to structure to HDL" />
        <figcaption>
          The thesis frames the toolchain around an explicit structure layer between Python-facing
          description and emitted HDL.
        </figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>The core object model is the real contribution</h2>
      <p>
        The most important file in the repository is <code>nodalhdl/core/structure.py</code>. It does
        not implement a thin AST wrapper; it defines the working circuit representation. A
        <code>Structure</code> contains ports, internal nodes, substructures, runtime state, and the
        methods for deduction, expansion, generation, and persistence. A <code>Net</code> owns the
        connectivity set and driver/load relationship. A <code>Node</code> carries original type,
        latency, and structural identity. <code>StructuralNodes</code> then gives hierarchical access
        for bundled ports and nested interfaces.
      </p>
      <p>
        Two implementation choices matter here. First, the project separates structural information
        from runtime information using <code>RuntimeId</code>. Type deduction and timing-related data
        are attached per runtime instead of mutating the original structure immediately, which makes it
        possible to infer, reuse, and then optionally apply results back into the structure. Second,
        reusable structures are tracked through a pool keyed by unique names, so repeated submodules can
        be emitted and analysed as reusable units rather than duplicated blindly.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="nodesNets" alt="Diagram of nodes nets and substructures used in NodalHDL" />
        <figcaption>
          The thesis diagrams match the code closely: ports, nodes, nets, and substructures are
          explicit objects, not hidden behind a compiler pass.
        </figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>Type inference is implemented at the circuit level, not as a parser trick</h2>
      <p>
        The signal system in <code>core/signal.py</code> is more substantial than the README suggests.
        It defines a hierarchy for <code>Bits</code>, fixed-point, integer, floating-point, bundles,
        and input/output wrappers, with operations such as <code>merge</code>, <code>apply</code>,
        <code>io_flip</code>, and width derivation. In practice that means a port can start as
        <code>Auto</code>, then acquire width and subtype information from the connectivity graph
        rather than from a front-end parser annotation.
      </p>
      <p>
        The deduction path in <code>Structure.deduction()</code> is also fairly pragmatic. For each
        substructure instance, it synchronises the outside ports in the parent structure with the inside
        ports in the child, recursively runs deduction in the child runtime, and pushes the inferred
        information back outward. That is enough to support composite modules, bundled interfaces, and
        reusable arithmetic wrappers without forcing every intermediate signal width to be written out
        manually.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="nodeLatencies" alt="Diagram illustrating latency attached to nodes and ports in NodalHDL" />
        <figcaption>
          Latency is attached directly to structural ports and redistributed later, which is why timing
          passes can operate on the same IR instead of on a separate scheduling model.
        </figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>Timing analysis and pipelining are already wired into the flow</h2>
      <p>
        The repository does not leave timing as a future idea. <code>timing/sta.py</code> builds a
        temporary Vivado workspace, emits HDL for unique substructures, runs out-of-context synthesis
        through a generated Tcl script, parses <code>report_timing</code>, and caches repeated modules
        by hashing the emitted HDL. That is a fairly direct but effective way to pull real tool timing
        data back into the Python-side representation.
      </p>
      <p>
        Once timing data exists, <code>timing/pipelining.py</code> converts the structure into either a
        simple or extended circuit graph, solves a retiming problem, applies the latency adjustments to
        loads, and then normalises register placement through
        <code>transform_to_best_distribution()</code>. In other words, the flow is not "insert N
        pipeline stages everywhere". It is "derive a retiming solution from a graph model and then map
        that back onto the structure representation".
      </p>
      <figure class="project-media project-media--medium">
        <img :src="timingReport" alt="Example timing report used by NodalHDL static timing analysis" />
        <figcaption>
          The timing pass is not mocked; it parses actual Vivado timing reports and stores the results
          on substructures for later retiming.
        </figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>The shader examples are useful because they exercise the full path</h2>
      <p>
        The most convincing examples in the repository are the fragment-shader cases, especially
        <code>examples/test_py_shader_cornell267.py</code>. The script describes the shader in Python
        using the project&apos;s fixed-point and vector abstractions, instantiates a root
        <code>Structure</code>, lowers the compute graph into structural form, runs
        <code>singletonize()</code> and <code>expand()</code>, performs deduction, launches Vivado STA,
        applies automatic pipelining with 100 inserted input-side levels, and finally emits HDL plus a
        ready/valid chain.
      </p>
      <p>
        That matters because it shows what the current system can already do well: take arithmetic-heavy
        combinational logic, preserve it as a manipulable structure graph, ask a real vendor flow for
        timing information, and reinsert registers based on that result. The generated module is then
        sent into an external HDMI/DDR3 project for on-board validation, so the example is not just a
        unit test.
      </p>
      <figure class="project-media project-media--medium">
        <img :src="combinationalSchematic" alt="Combinational elaborated schematic before pipelining in NodalHDL" />
        <figcaption>
          One of the value points of the project is that large pre-pipelined structures can still be
          inspected explicitly before HDL emission.
        </figcaption>
      </figure>
    </section>

    <section class="project-article__section">
      <h2>Where it is still rough</h2>
      <p>
        The project is honest about its unfinished parts. The README and thesis both position the
        current code as a partial toolchain rather than a complete one. The behavioural front-end is
        strongest for combinational logic; state-machine generation is still mostly a plan. Memory
        systems, arbitration, board-support packaging, and richer peripheral automation are mentioned as
        future work rather than implemented subsystems.
      </p>
      <p>
        There are also some practical constraints visible in the code. STA is tightly coupled to Vivado
        batch mode. Several files still carry explicit TODOs around retiming efficiency, persistence,
        and broader operator support. The thesis itself says it is already somewhat out of date. So the
        current value of NodalHDL is not that it replaces a production HDL flow today; it is that the
        project has already crossed the line from concept to working infrastructure, especially on the
        structure representation and timing-driven pipelining side.
      </p>
    </section>
  </div>
</template>
