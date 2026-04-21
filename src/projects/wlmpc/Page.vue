<script setup>
import InlineMath from '../../components/InlineMath.vue'
import ProjectTypst from '../../components/ProjectTypst.vue'

import horizonSweep from './assets/horizon_sweep.png'
import linearDemoMultiexposure from './assets/linear_demo_multiexposure.png'
import linearDemoX3m from './assets/linear_demo_x3m.png'
import linearMpcVsLqr from './assets/linear_mpc_vs_lqr.png'
import lyapunovBoundarySample from './assets/lyapunov_boundary_sample.png'
import modelUrdf from './assets/model_urdf.png'
import nonlinearRegulationInputs from './assets/nonlinear_regulation_inputs.png'
import nonlinearRegulationStates from './assets/nonlinear_regulation_states.png'
import offsetfreeVsNominal from './assets/offsetfree_vs_nominal.png'
import terminalSetSections from './assets/terminal_set_sections.png'
import weightSweep from './assets/weight_sweep.png'
</script>

<template>
    <div class="project-article wlmpc-article">
        <section class="project-article__section">
            <h2>Abstract</h2>
            <p>
                This report presents a model predictive control framework for the wheel-legged robot TRON1 in MuJoCo. A reduced-order nonlinear model is formulated, locally linearized and discretized around a selected standing configuration. Based on this model, a state-feedback regulation MPC is constructed with explicit state and input constraints, a quadratic terminal cost, a Riccati-based terminal controller, and an ellipsoidal terminal set. Asymptotic stability of the regulation MPC problem is established by verifying the necessary assumptions. In addition, an output-tracking and offset-free extension using augmented-state disturbance estimation and online target selection (OTS) is described. Numerical simulations demonstrate standing recovery, constrained performance, optimal maneuver, and the offset-free tracking behavior.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Introduction</h2>
            <p>
                This project studies the problem of controlling a wheel-legged robot TRON1 in MuJoCo through a model predictive control (MPC) approach. We begin by deriving the dynamics model, then proceed step by step through linearization, discretization, the design of the MPC control law and the terminal set, and finally perform numerical simulations. At the same time, we conduct the asymptotic stability analysis of the controllers designed, cross-validating our findings with the theoretical knowledge. The repository is hosted on GitHub in [1].
            </p>
        </section>

        <section class="project-article__section">
            <h2>Robot Morphology and Parameters</h2>
            <p>
                TRON1 shown in Fig. 1 consists of two leg-wheel branches. Each branch includes an abduction/adduction (ABAD) joint, a hip joint, a knee joint, and a wheel actuator. For simplicity, the ABAD joints are excluded from the dynamics through high-gain locking, so that each leg is reduced to a planar two-link mechanism in the sagittal plane; and the wheel center is treated as the contact point of the corresponding leg.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="modelUrdf" alt="Schematic robot morphology used in the report" />
                <figcaption>Fig. 1. Schematic robot morphology used in the report.</figcaption>
            </figure>
            <figure class="project-media project-media--medium">
                <table class="wlmpc-table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Value</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><InlineMath code="$M$" /></td><td>22.273 kg</td><td>total mass</td></tr>
                        <tr><td><InlineMath code='$M_"body"$' /></td><td>9.595 kg</td><td>body mass</td></tr>
                        <tr><td><InlineMath code="$R$" /></td><td>0.127 m</td><td>wheel radius</td></tr>
                        <tr><td><InlineMath code="$d_y$" /></td><td>0.297 m</td><td>track width</td></tr>
                        <tr><td><InlineMath code="$l_0$" /></td><td>0.51962 m</td><td>nominal virtual-leg length</td></tr>
                        <tr><td><InlineMath code='$h_"com"$' /></td><td>0.44058 m</td><td>CoM height above wheel axle</td></tr>
                        <tr><td><InlineMath code="$I_(x x)$" /></td><td>4.14493 kg m^2</td><td>equivalent roll inertia</td></tr>
                        <tr><td><InlineMath code="$I_(y y)$" /></td><td>4.00145 kg m^2</td><td>equivalent pitch inertia</td></tr>
                        <tr><td><InlineMath code="$I_(z z)$" /></td><td>0.37034 kg m^2</td><td>equivalent yaw inertia</td></tr>
                    </tbody>
                </table>
                <figcaption>Table I. Main physical parameters extracted from the URDF model. CoM: Center of Mass.</figcaption>
            </figure>
        </section>

        <section class="project-article__section">
            <h2>States and Inputs</h2>
            <p>The state used by the regulation MPC is</p>
            <ProjectTypst :framed="false">
                $
                x = [theta, dot(theta), x_b, dot(x)_b, phi, dot(phi), gamma, dot(gamma), psi, dot(psi), z_b, dot(z)_b]^top in RR^12
                $
            </ProjectTypst>
            <p>
                where <InlineMath code="$theta$" /> is the average virtual-leg angle, <InlineMath code="$x_b$" /> is the forward body position, and <InlineMath code="$phi$" />, <InlineMath code="$gamma$" />, and <InlineMath code="$psi$" /> denote pitch, roll, and yaw, respectively.
            </p>
            <p>The generalized input is</p>
            <ProjectTypst :framed="false">
                $
                u = [T_s, T_(p s), T_d, Delta F, delta F_z]^top in RR^5
                $
            </ProjectTypst>
            <p>
                where <InlineMath code="$T_s = T_(w L) + T_(w R)$" /> is the sum of wheel torques; <InlineMath code="$T_(p s) = T_(p L) + T_(p R)$" /> is the sum of the virtual pitch torques of the two legs; <InlineMath code="$T_d = T_(w L) - T_(w R)$" /> is the differential wheel torque; <InlineMath code="$Delta F = F_L - F_R$" /> is the left-right support-force difference; and <InlineMath code="$delta F_z = (F_L + F_R) - M g$" /> is the total vertical support-force deviation.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Nonlinear Dynamics, Linearization and Discretization</h2>
            <h3>Reduced-Order Nonlinear Dynamics</h3>
            <p>The model used in MPC is written as</p>
            <ProjectTypst :framed="false">
                $
                dot(x) = f(x, u)
                $
            </ProjectTypst>
            <p>In the sagittal plane the dynamics are</p>
            <ProjectTypst :framed="false">
                $
                M_x dot.double(x)_b + M_x l_0 cos(theta) dot.double(theta) - M_x l_0 sin(theta) dot(theta)^2 = T_s / R
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                J_theta dot.double(theta) + M_x l_0 cos(theta) dot.double(x)_b = M_x g l_0 sin(theta) - T_(p s)
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                J_phi dot.double(phi) = T_(p s)
                $
            </ProjectTypst>
            <p>The roll, yaw, and height behaviors are modeled by</p>
            <ProjectTypst :framed="false">
                $
                dot.double(gamma) = (M g h_"com") / I_(x x) sin(gamma) + d_y / (2 I_(x x)) Delta F
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                dot.double(psi) = (2 R) / (I_(z z) d_y) T_d
                $
            </ProjectTypst>
            <ProjectTypst :framed="false">
                $
                dot.double(z)_b = 1 / M delta F_z
                $
            </ProjectTypst>

            <h3>Planar-Leg Kinematics VMC Mapping</h3>
            <p>
                For one sagittal-plane leg, define the joint coordinate vector <InlineMath code="$q_ell = [q_h, q_k]^top$" />, <InlineMath code="$ell in {L, R}$" />, where <InlineMath code="$q_h$" />, <InlineMath code="$q_k$" /> are the generalized position for the hip joint and knee joint respectively. Let the geometry vectors of the upper and lower links in the local <InlineMath code="$x-z$" /> plane be <InlineMath code="$r_1 = [x_1, z_1]^top$" />, <InlineMath code="$r_2 = [x_2, z_2]^top$" />. Standardize the sign conventions for the left and right legs and convert to the relative angles <InlineMath code="$alpha_1 = s_h q_h$" />, <InlineMath code="$alpha_2 = alpha_1 + s_k q_k$" />, where <InlineMath code="$s_h, s_k in {-1, +1}$" />.
            </p>
            <p>The wheel-center position relative to the hip joint can be derived as</p>
            <ProjectTypst :framed="false">
                $
                p(q_ell) = [p_x, p_z]^top = R_(x z)(alpha_1) r_1 + R_(x z)(alpha_2) r_2
                $
            </ProjectTypst>
            <p>with the Jacobian</p>
            <ProjectTypst :framed="false">
                $
                J(q_ell) = [s_h ((dif R_(x z)(alpha_1)) / (dif alpha_1)) r_1 + s_h ((dif R_(x z)(alpha_2)) / (dif alpha_2)) r_2, s_k ((dif R_(x z)(alpha_2)) / (dif alpha_2)) r_2]
                $
            </ProjectTypst>
            <p>where</p>
            <ProjectTypst :framed="false">
                $
                R_(x z)(alpha) = mat(delim: "[", cos(alpha), sin(alpha); -sin(alpha), cos(alpha))
                $
            </ProjectTypst>
            <p>
                The virtual-leg length and angle can be defined by <InlineMath code="$L = norm(p)$" />, <InlineMath code='$theta = "atan2"(-p_x, -p_z)$' />. The unit vectors along and orthogonal to the virtual leg are <InlineMath code="$hat(e)_L = p / norm(p)$" />, <InlineMath code="$hat(e)_T = R_(x z)(-pi / 2) hat(e)_L$" />. Use virtual model control (VMC) approach to map the generalized input for each leg to the corresponding joint torques through virtual work principle:
            </p>
            <ProjectTypst :framed="false">
                $
                tau_ell = J(q_ell)^top F_("virtual", ell) = J(q_ell)^top (F_ell hat(e)_(L, ell) + T_(p ell) / L_0 hat(e)_(T, ell))
                $
            </ProjectTypst>
            <p>
                where <InlineMath code="$L_0$" /> is the chosen virtual leg length.
            </p>
            <p>
                Moreover, states only retain the average angle <InlineMath code="$theta$" />, instead of the individual leg configurations and therefore cannot directly suppress "scissoring". To stabilize this unmodeled differential mode, a low-level PD action is introduced to penalize the left-right joint-coordinate difference. These differential leg states are not lifted into the MPC model because in the experiment associated VMC and actuation chain introduce non-negligible delay and is difficult to make accurate regulation.
            </p>

            <h3>Local Linearization and Discretization</h3>
            <p>
                The nominal point <InlineMath code="$(x^*, u^*)$" /> for linearization used in the implementation is an estimate of a strict equilibrium point located near a selected standing configuration. In fact, we can linearize the leg-length values in segments and then interpolate them to create a parameterized linearized model, thereby achieving efficient control under different leg lengths.
            </p>
            <p>The deviation coordinates are defined as <InlineMath code="$tilde(x) = x - x^*$" /> and <InlineMath code="$tilde(u) = u - u^*$" />. The continuous-time local linear model is</p>
            <ProjectTypst :framed="false">
                $
                dot(tilde(x)) = A_c tilde(x) + B_c tilde(u), quad A_c = lr((partial f) / (partial x) |)_(x^*, u^*), quad B_c = lr((partial f) / (partial u) |)_(x^*, u^*)
                $
            </ProjectTypst>
            <p>Finally, discretize the model using the sampling time <InlineMath code='$T_s = 0.02 "s"$' /> as</p>
            <ProjectTypst :framed="false">
                $
                tilde(x)_(k+1) = A_d tilde(x)_k + B_d tilde(u)_k
                $
            </ProjectTypst>
            <p>
                In the implementation, the linearized matrices are obtained by numerical identification around <InlineMath code="$(x^*, u^*)$" /> since the reduced-order model does not fully capture the real model, e.g., leg internal dynamics, contact-force, etc. The current identified model has the full controllability rank <InlineMath code='$"rank"(cal(C)) = 12$' />, and the open-loop spectral radius <InlineMath code="$rho(A_d) = max_i abs(lambda_i(A_d)) approx 1.1060 > 1$" />, which contains unstable modes.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Model Predictive Control Design</h2>
            <h3>State-Feedback Regulation MPC Problem</h3>
            <p>
                We consider a receding horizon MPC strategy with control horizon <InlineMath code="$N$" /> to make the robot stand in place. The problem is written as the standard discrete-time MPC problem
            </p>
            <ProjectTypst :framed="false" size="13pt">
                $
                min_(tilde(bold(u))_N) sum_(k=0)^(N-1) (tilde(x)_k^top Q tilde(x)_k + tilde(u)_k^top R tilde(u)_k) + tilde(x)_N^top P tilde(x)_N
                $
            </ProjectTypst>
            <ProjectTypst :framed="false" size="13pt">
                $
                "s.t." quad tilde(x)_(k+1) = A_d tilde(x)_k + B_d tilde(u)_k, quad tilde(x)_0 = x_0 - x^*, quad x in XX, quad u in UU, quad tilde(x)_N in tilde(XX)_f
                $
            </ProjectTypst>
            <p>
                where the input sequence is <InlineMath code="$tilde(bold(u))_N = [tilde(u)_0, tilde(u)_1, dots, tilde(u)_(N-1)]^top$" />; <InlineMath code="$tilde(XX)_f$" /> is the terminal set which will be introduce in the following section; the state constraint box is
            </p>
            <ProjectTypst :framed="false" size="13pt">
                $
                XX = {x: abs(theta) <= 0.25, abs(dot(theta)) <= 1.0, abs(dot(x_b)) <= 3.0, abs(phi) <= 0.25, abs(dot(phi)) <= 1.5, abs(gamma) <= 0.18, abs(dot(gamma)) <= 1.5, abs(dot(psi)) <= 1.5, abs(tilde(z)_b) <= 0.06, abs(dot(tilde(z))_b) <= 0.4}
                $
            </ProjectTypst>
            <p>and the input constraint box is</p>
            <ProjectTypst :framed="false" size="13pt">
                $
                UU = {u: abs(T_s) <= 60, abs(T_(p s)) <= 60, abs(T_d) <= 40, abs(Delta F) <= 80, abs(delta F_z) <= 80}
                $
            </ProjectTypst>
            <p>In the problem, the stage cost and the terminal cost are formulated as</p>
            <ProjectTypst :framed="false">
                $
                l(tilde(x), tilde(u)) = 1 / 2 (tilde(x)^top Q tilde(x) + tilde(u)^top R tilde(u))
                $
            </ProjectTypst>
            <p>and</p>
            <ProjectTypst :framed="false">
                $
                V_f(tilde(x)) = 1 / 2 tilde(x)^top P tilde(x)
                $
            </ProjectTypst>
            <p>And the baseline weights are selected as below:</p>
            <ProjectTypst :framed="false">
                $
                Q = "diag"(15, 4, 200, 8, 120, 12, 120, 12, 12, 3, 80, 8), quad R = "diag"(0.04, 0.06, 0.03, 0.02, 0.02)
                $
            </ProjectTypst>

            <h3>Terminal Ingredients</h3>
            <p>We employ an ellipsoidal sublevel set of <InlineMath code="$V_f$" /> as the terminal set</p>
            <ProjectTypst :framed="false">
                $
                tilde(XX)_f = {tilde(x) in RR^12 | V_f(tilde(x)) <= c / 2}
                $
            </ProjectTypst>
            <p>Within the terminal set, an unconstrained LQR approximation can be applied to stabilize the system:</p>
            <ProjectTypst :framed="false">
                $
                kappa_f(tilde(x)) = -K tilde(x), quad K = (B_d^top P B_d + R)^(-1) B_d^top P A_d
                $
            </ProjectTypst>
            <p>
                where the matrix <InlineMath code="$P$" /> is the solution of the discrete algebraic Riccati equation (DARE), i.e., <InlineMath code='$P = "DARE"(A_d, B_d, Q, R)$' />.
            </p>
            <p>Subject to the constraints, <InlineMath code="$c = c^* approx 5.0518$" /> is selected such that</p>
            <ProjectTypst :framed="false">
                $
                tilde(XX)_f subset.eq tilde(XX), quad K tilde(XX)_f subset.eq tilde(UU)
                $
            </ProjectTypst>
            <p>
                where <InlineMath code="$tilde(XX) = {tilde(x): x^* + tilde(x) in XX}$" /> and <InlineMath code="$tilde(UU) = {tilde(u): u^* + tilde(u) in UU}$" />.
            </p>

            <h3>Offset-Free Output-Feedback MPC</h3>
            <p>
                Suppose that only six zero-order generalized coordinates can be measured directly, the remaining six first-order generalized velocities must be estimated using an observer. Construct the measurement output model:
            </p>
            <ProjectTypst :framed="false">
                $
                y_k^((m)) = [theta, x_b, phi, gamma, psi, z_b]^top = C_m x_k
                $
            </ProjectTypst>
            <p>To consider constant unknown disturbances, we adopt a state-additive disturbance model:</p>
            <ProjectTypst :framed="false">
                $
                tilde(x)_(k+1) = A_d tilde(x)_k + B_d tilde(u)_k + E_d d_k + w_k, quad tilde(y)_k^((m)) = C_m tilde(x)_k + v_k
                $
            </ProjectTypst>
            <p>where the disturbance is modeled as nearly constant:</p>
            <ProjectTypst :framed="false">
                $
                d_(k+1) = d_k + w_(d, k)
                $
            </ProjectTypst>
            <p>
                As an example, in our settings disturbances exist only in the three input channels <InlineMath code="$T_s$" />, <InlineMath code="$T_(p s)$" />, and <InlineMath code="$delta F_z$" />, so <InlineMath code="$E_d in RR^(12 times 3)$" /> is built from the three corresponding columns in <InlineMath code="$B_d in RR^(12 times 5)$" />.
            </p>
            <p>Reformulate the corresponding system in an augmented form:</p>
            <ProjectTypst :framed="false" size="13pt">
                $
                mat(delim: "[", tilde(x)_(k+1); d_(k+1)) = mat(delim: "[", A_d, E_d; 0, I) mat(delim: "[", tilde(x)_k; d_k) + mat(delim: "[", B_d; 0) tilde(u)_k + mat(delim: "[", w_k; w_(d,k))
                $
            </ProjectTypst>
            <ProjectTypst :framed="false" size="13pt">
                $
                tilde(y)_k^((m)) = mat(delim: "[", C_m, 0) mat(delim: "[", tilde(x)_k; d_k) + v_k
                $
            </ProjectTypst>
            <p>Obviously, <InlineMath code="$(A_d, C_m)$" /> is observable; also, it can be numerically verified that</p>
            <ProjectTypst :framed="false">
                $
                "rank"(mat(delim: "[", I - A_d, -E_d; C_m, 0)) = 15 = 12 + 3
                $
            </ProjectTypst>
            <p>So we can design the augmented-state Luenberger observer as</p>
            <ProjectTypst :framed="false" size="13pt">
                $
                mat(delim: "[", hat(tilde(x))_(k+1); hat(d)_(k+1)) = mat(delim: "[", A_d, E_d; 0, I) mat(delim: "[", hat(tilde(x))_k; hat(d)_k) + mat(delim: "[", B_d; 0) tilde(u)_k + L (tilde(y)_k^((m)) - mat(delim: "[", C_m, 0) mat(delim: "[", hat(tilde(x))_k; hat(d)_k))
                $
            </ProjectTypst>

            <h3>Optimal Target Selection and Reference Tracking</h3>
            <p>Consider the tracking task in the sagittal plane, where we track the three states <InlineMath code="$x_b$" />, <InlineMath code="$phi$" />, and <InlineMath code="$z_b$" />. Construct a reduced output model:</p>
            <ProjectTypst :framed="false">
                $
                y_k = [x_b, phi, z_b]^top = C x_k
                $
            </ProjectTypst>
            <p>The optimal target selection (OTS) problem is solved online as</p>
            <ProjectTypst :framed="false" size="12pt">
                $
                min_(tilde(x)_r, tilde(u)_r) tilde(x)_r^top Q tilde(x)_r + tilde(u)_r^top R tilde(u)_r
                $
            </ProjectTypst>
            <ProjectTypst :framed="false" size="12pt">
                $
                "s.t." quad mat(delim: "[", I - A_d, -B_d; C, 0) mat(delim: "[", tilde(x)_r; tilde(u)_r) = mat(delim: "[", E_d hat(d)_k; y_(r,k)), quad (tilde(x)_r, tilde(u)_r) in tilde(ZZ) := tilde(XX) times tilde(UU), quad C tilde(x)_r in tilde(YY)
                $
            </ProjectTypst>
            <p>
                Then use the error coordinates <InlineMath code="$e_k = tilde(x)_k - tilde(x)_r$" />, <InlineMath code="$v_k = tilde(u)_k - tilde(u)_r$" /> around the online steady-state target <InlineMath code="$(tilde(x)_r, tilde(u)_r)$" /> to solve the regulation MPC problem.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Asymptotic Stability</h2>
            <p>
                In this section, we prove the closed-loop asymptotically stability for the regulation MPC controller designed in Section II.A. The proof follows [2] and applies Theorem 2.24 to the regulation problem. To match the statement, define
            </p>
            <ProjectTypst :framed="false">
                $
                tilde(x)^+ = f(tilde(x), tilde(u)) = A_d tilde(x) + B_d tilde(u), quad y = h(tilde(x)) = tilde(x)
                $
            </ProjectTypst>
            <p>with</p>
            <ProjectTypst :framed="false">
                $
                l(y, tilde(u)) = 1 / 2 (y^top Q y + tilde(u)^top R tilde(u)), quad V_f(tilde(x)) = 1 / 2 tilde(x)^top P tilde(x)
                $
            </ProjectTypst>
            <p>
                Furthermore, since we aim to prove the stability of the closed-loop system after linearization near the operating point, we assume that sets such as <InlineMath code="$XX$" /> in the theorem correspond to sets such as <InlineMath code="$tilde(XX)$" /> in this report.
            </p>
            <p>The assumptions to be verified and the theorem used are listed as below:</p>
            <ol class="wlmpc-list">
                <li><strong>Assumption 2.2</strong> (Continuity of system and cost). The functions <InlineMath code="$f: ZZ -> XX$" />, <InlineMath code="$l: ZZ -> RR_(>=0)$" /> and <InlineMath code="$V_f: XX_f -> RR_(>=0)$" /> are continuous, <InlineMath code="$f(0,0)=0$" />, <InlineMath code="$l(0,0)=0$" /> and <InlineMath code="$V_f(0)=0$" />.</li>
                <li><strong>Assumption 2.3</strong> (Properties of constraint sets). The set <InlineMath code="$ZZ$" /> is closed and the set <InlineMath code="$XX_f subset.eq XX$" /> is compact. Each set contains the origin. If <InlineMath code="$UU$" /> is bounded (hence compact), the set <InlineMath code="$UU(x)$" /> is compact for all <InlineMath code="$x in XX$" />. If <InlineMath code="$UU$" /> is unbounded, the function <InlineMath code="$bold(u) |-> V_N(x, bold(u))$" /> is coercive, i.e., <InlineMath code="$V_N(x, bold(u)) -> infinity$" /> as <InlineMath code="$abs(bold(u)) -> infinity$" /> for all <InlineMath code="$x in XX$" />.</li>
                <li><strong>Assumption 2.17</strong> (Weak controllability). There exists a <InlineMath code="$cal(K)_oo$" /> function <InlineMath code="$alpha$" /> such that <InlineMath code="$V_N^0(x) <= alpha(abs(x))$" />, <InlineMath code="$forall x in X_N$" />.</li>
                <li><strong>Assumption 2.23</strong> (Modified basic stability assumption). <InlineMath code="$V_f$" />, <InlineMath code="$XX_f$" /> and <InlineMath code="$l$" /> satisfy the terminal decrease and bounding conditions stated in the report.</li>
                <li><strong>Theorem 2.24</strong> (Asymptotic stability with stage cost <InlineMath code="$l(y, u)$" />). Suppose Assumptions 2.2, 2.3, 2.17 and 2.23 are satisfied, and the system <InlineMath code="$x^+ = f(x, u), y = h(x)$" /> is IOSS. Then there exists a Lyapunov function in <InlineMath code="$X_N$" /> for the closed-loop system <InlineMath code="$x^+ = f(x, kappa_N(x))$" />, and the origin is asymptotically stable in <InlineMath code="$X_N$" />.</li>
            </ol>

            <h3>Verification of Assumptions 2.2 and 2.3</h3>
            <p>
                The linearized dynamics around the operating point are linear without bias terms, so <InlineMath code="$f(0, 0) = 0$" />. Both the stage cost and the terminal cost are quadratic forms and are therefore continuous and vanish at the origin, i.e., <InlineMath code="$l(0, 0) = 0$" />, <InlineMath code="$V_f(0) = 0$" />. Thus Assumption 2.2 holds.
            </p>
            <p>
                The sets <InlineMath code="$tilde(XX)$" /> and <InlineMath code="$tilde(UU)$" /> are bounded boxes. Hence both are compact. The joint constraint set <InlineMath code="$tilde(ZZ) = tilde(XX) times tilde(UU)$" /> is therefore closed. The terminal set <InlineMath code="$tilde(XX)_f = {tilde(x) in RR^12: tilde(x)^top P tilde(x) <= c^*}$" /> is an ellipsoid and is thus compact. All these sets contain the origin because they are deviation-coordinate admissible sets centered at the operating point.
            </p>
            <p>
                Moreover, in our design <InlineMath code="$tilde(UU)$" /> is bounded. For each <InlineMath code="$tilde(x) in tilde(XX)$" />, the set <InlineMath code="$tilde(UU)(tilde(x)) = {tilde(u) in tilde(UU): (tilde(x), tilde(u)) in tilde(ZZ)}$" /> is a closed subset of the compact set <InlineMath code="$tilde(UU)$" />, and is therefore compact. Thus Assumption 2.3 holds.
            </p>

            <h3>Verification of Assumption 2.17</h3>
            <p>
                For a linear system with compact constraints and finite horizon, the value function <InlineMath code="$V_N^0(tilde(x))$" /> is continuous on the feasible set <InlineMath code="$cal(tilde(X))_N$" /> and satisfies <InlineMath code="$V_N^0(0) = 0$" />. Since <InlineMath code="$cal(tilde(X))_N$" /> is compact, the radius of the circumcircle of the feasible set <InlineMath code="$cal(tilde(X))_N$" /> is
            </p>
            <ProjectTypst :framed="false">
                $
                R_N = max_(tilde(x) in cal(tilde(X))_N) abs(tilde(x))
                $
            </ProjectTypst>
            <p>For <InlineMath code="$0 <= r <= R_N$" />, define</p>
            <ProjectTypst :framed="false">
                $
                beta(r) = max { V_N^0(tilde(x)) : tilde(x) in cal(tilde(X))_N, abs(tilde(x)) <= r }
                $
            </ProjectTypst>
            <p>
                and this maximum exists because <InlineMath code="$cal(tilde(X))_N$" /> is compact and <InlineMath code="$V_N^0$" /> is continuous. Moreover, <InlineMath code="$beta(0) = 0$" />, and for every <InlineMath code="$tilde(x) in cal(tilde(X))_N$" /> one has
            </p>
            <ProjectTypst :framed="false">
                $
                V_N^0(tilde(x)) <= beta(abs(tilde(x)))
                $
            </ProjectTypst>
            <p>Then we construct</p>
            <ProjectTypst :framed="false">
                $
                alpha(r) = beta(min{r, R_N}) + r^2
                $
            </ProjectTypst>
            <p>
                Because <InlineMath code="$beta$" /> is nondecreasing and <InlineMath code="$r^2$" /> is strictly increasing, <InlineMath code="$alpha$" /> is continuous, strictly increasing, <InlineMath code="$alpha(0) = 0$" />, and is unbounded. Hence <InlineMath code="$alpha in cal(K)_oo$" />. And then for all <InlineMath code="$tilde(x) in cal(tilde(X))_N$" /> we have
            </p>
            <ProjectTypst :framed="false">
                $
                V_N^0(tilde(x)) <= beta(abs(tilde(x))) <= alpha(abs(tilde(x)))
                $
            </ProjectTypst>
            <p>Hence Assumption 2.17 is satisfied.</p>

            <h3>Verification of Assumption 2.23</h3>
            <p>The LQR terminal control law is shown above, and its closed-loop matrix is</p>
            <ProjectTypst :framed="false">
                $
                A_"cl" = A_d - B_d K, quad rho(A_"cl") approx 0.9713 < 1
                $
            </ProjectTypst>
            <p>which is numerically verified to be asymptotically stable.</p>
            <p>The terminal set is</p>
            <ProjectTypst :framed="false">
                $
                tilde(XX)_f = {tilde(x): tilde(x)^top P tilde(x) <= c^*}, quad c^* approx 5.0518, quad tilde(XX)_f subset.eq tilde(XX), quad K tilde(XX)_f subset.eq tilde(UU)
                $
            </ProjectTypst>
            <p>where <InlineMath code="$P$" /> is the solution of DARE, so we have</p>
            <ProjectTypst :framed="false">
                $
                P = A_d^top P A_d - A_d^top P B_d (R + B_d^top P B_d)^(-1) B_d^top P A_d + Q
                $
            </ProjectTypst>
            <p>with the LQR controller and the closed-loop matrix, it can be written as</p>
            <ProjectTypst :framed="false">
                $
                A_"cl"^top P A_"cl" - P = -(Q + K^top R K)
                $
            </ProjectTypst>
            <p>Using <InlineMath code="$V_f(tilde(x)) = 1 / 2 tilde(x)^top P tilde(x)$" />, this yields</p>
            <ProjectTypst :framed="false">
                $
                V_f(tilde(x)^+) - V_f(tilde(x)) = -l(tilde(x), -K tilde(x))
                $
            </ProjectTypst>
            <p>Therefore, for every <InlineMath code="$tilde(x) in tilde(XX)_f$" /> we have</p>
            <ProjectTypst :framed="false">
                $
                V_f(f(tilde(x), kappa_f(tilde(x)))) - V_f(tilde(x)) <= -l(h(tilde(x)), kappa_f(tilde(x)))
                $
            </ProjectTypst>
            <p>
                Also, because <InlineMath code="$XX_f subset.eq XX$" /> and <InlineMath code="$K XX_f subset.eq UU$" />, the pair <InlineMath code="$(tilde(x), kappa_f(tilde(x)))$" /> is admissible. Since the terminal cost is nonincreasing,
            </p>
            <ProjectTypst :framed="false">
                $
                V_f(f(tilde(x), kappa_f(tilde(x)))) <= V_f(tilde(x)) <= c^*
                $
            </ProjectTypst>
            <p>which implies</p>
            <ProjectTypst :framed="false">
                $
                f(tilde(x), kappa_f(tilde(x))) in XX_f
                $
            </ProjectTypst>
            <p>Hence Assumption 2.23 (a) holds.</p>
            <p>Then verify 2.23 (b). Because <InlineMath code="$Q$" /> and <InlineMath code="$R$" /> are positive definite, the stage cost in quadratic form satisfies</p>
            <ProjectTypst :framed="false">
                $
                l(y, tilde(u)) >= 1 / 2 min{lambda_"min"(Q), lambda_"min"(R)} (abs(y)^2 + abs(tilde(u))^2)
                $
            </ProjectTypst>
            <p>Thus we can choose</p>
            <ProjectTypst :framed="false">
                $
                alpha_1(r) = 1 / 2 min(lambda_"min"(Q), lambda_"min"(R)) r^2
                $
            </ProjectTypst>
            <p>Similarly, <InlineMath code="$P$" /> is positive definite, so</p>
            <ProjectTypst :framed="false">
                $
                V_f(tilde(x)) <= 1 / 2 lambda_"max"(P) abs(tilde(x))^2
                $
            </ProjectTypst>
            <p>so we can choose</p>
            <ProjectTypst :framed="false">
                $
                alpha_f(r) = 1 / 2 lambda_"max"(P) r^2
                $
            </ProjectTypst>
            <p>Hence Assumption 2.23 (b) also holds.</p>

            <h3>Conclusion from Theorem 2.24</h3>
            <p>
                IOSS means input/output-to-state stability, namely that the state can be bounded by a decaying term of the initial condition together with suitable functions of the input and output signals. In our case we have <InlineMath code="$h(tilde(x)) = tilde(x)$" />, so the output is exactly the full state. Therefore the IOSS requirement is satisfied trivially.
            </p>
            <p>
                All requirements of Theorem 2.24 are satisfied for the regulation MPC with explicit terminal ingredients. Therefore, the origin is asymptotically stable in the feasible set <InlineMath code="$cal(tilde(X))_N$" /> for the standard MPC formulation with the terminal constraint <InlineMath code="$tilde(x)_N in XX_f$" />.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Numerical Simulations</h2>
            <p>
                In this section, we will conduct several numerical simulations and analyze the results. The simulation environment is MuJoCo with an integration step of <InlineMath code='$Delta t_"sim" = 0.001 "s"$' />; the MPC sampling period is <InlineMath code='$T_s = 0.02 "s" ~ 50 "Hz"$' />.
            </p>
            <p>To make the effect of constraints visible, some of the following experiments are carried out under tighter input bounds:</p>
            <ProjectTypst :framed="false" size="13pt">
                $
                UU_"tight" = {u: abs(T_s) <= 20, abs(T_(p s)) <= 15, abs(T_d) <= 10, abs(Delta F) <= 25, abs(delta F_z) <= 20}
                $
            </ProjectTypst>

            <h3>Standing Regulation</h3>
            <p>
                The first experiment applies an initial pitch disturbance of <InlineMath code="$0.08$" /> rad to the robot and lets the standing controller recover. The state plot in Fig. 2 illustrates <InlineMath code="$x_b$" />, <InlineMath code="$phi$" /> and <InlineMath code="$theta$" />, while the input plot Fig. 3 illustrates <InlineMath code="$T_s$" /> and <InlineMath code="$T_(p s)$" />.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="nonlinearRegulationStates" alt="Representative state responses in the standing regulation experiment" />
                    <figcaption>Fig. 2. Representative state responses in the standing regulation experiment.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="nonlinearRegulationInputs" alt="Representative input responses in the standing regulation experiment" />
                    <figcaption>Fig. 3. Representative input responses in the standing regulation experiment.</figcaption>
                </figure>
            </div>
            <p>
                It can be observed that the states are almost stabilized after <InlineMath code='$4 "s"$' />. The robot therefore remains standing and suppresses roll and yaw effectively.
            </p>

            <h3>Effect of the Prediction Horizon</h3>
            <p>
                Using the tightened-constraint setting, the horizon is swept over <InlineMath code="$N in {3, 5, 10, 20}$" />. The responses of <InlineMath code="$theta$" /> are shown in Fig. 4.
            </p>
            <p>
                The result shows that <InlineMath code="$N = 3$" /> and <InlineMath code="$N = 5$" /> fail to stabilize the constrained system, while <InlineMath code="$N = 10$" /> and <InlineMath code="$N = 20$" /> both produce stable responses. Once the horizon exceeds the minimum length needed for stabilization, increasing it further yields better curves.
            </p>
            <figure class="project-media project-media--medium">
                <img :src="horizonSweep" alt="Effect of the prediction horizon on the virtual-leg-angle response" />
                <figcaption>Fig. 4. Effect of the prediction horizon on the virtual-leg-angle response.</figcaption>
            </figure>

            <h3>Comparison with LQR Controller</h3>
            <p>
                Under the same constraints, the performance of the MPC and saturated LQR controllers in disturbed recovering standing task are compared. The initial condition is chosen as
            </p>
            <ProjectTypst :framed="false">
                $
                dot(x)_(b,0) = 1.0, quad phi_0 = 0.15, quad z_(b,0) = 0.03
                $
            </ProjectTypst>
            <p>and zero otherwise. The responses of the two simulations are shown in Fig. 5.</p>
            <figure class="project-media project-media--large">
                <img :src="linearMpcVsLqr" alt="Comparison between the responses of constrained MPC and saturated LQR" />
                <figcaption>Fig. 5. Comparison between the responses of constrained MPC and saturated LQR.</figcaption>
            </figure>
            <p>
                Under this constraint-dominated scenario, the MPC remains bounded and convergent, while the saturated LQR diverges and most of its control inputs are truncated. This demonstrates that once the constraints truly determine the closed-loop behavior, the practical advantages of MPC (or constrained LQR) over saturated LQR become significant.
            </p>

            <h3>Effect of the Weight Matrices</h3>
            <p>
                To keep the interpretation clean, <code>R = R_0</code> is fixed and only the state weighting matrix <code>Q</code> is scaled to evaluate the effect of the weight matrices:
            </p>
            <ProjectTypst :framed="false">
                $
                Q = alpha_Q Q_0, quad alpha_Q in {0.25, 1, 4}
                $
            </ProjectTypst>
            <p>
                And for each value of <code>alpha_Q</code>, the DARE is solved again so that the terminal cost matrix <code>P</code> remains consistent with the stage cost.
            </p>
            <figure class="project-media project-media--large">
                <img :src="weightSweep" alt="Influence of the state-weight scaling on the pitch response and the pitch-torque channel" />
                <figcaption>Fig. 6. Influence of the state-weight scaling on the pitch response and the pitch-torque channel.</figcaption>
            </figure>
            <p>
                The results are shown in Fig. 6. Increasing the state weight shortens the settling time, but once the controller is already limited by input saturation, further enlarging <code>Q</code> may have diminishing returns.
            </p>

            <h3>Terminal Set and Lyapunov Decrease</h3>
            <p>
                In addition to the algebraic proof, there are some numerical sample results for the terminal ingredients in Fig. 7 and Fig. 8.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="terminalSetSections" alt="Terminal set projections in angle and height planes" />
                    <figcaption>Fig. 7. Terminal set projections in <InlineMath code="$(theta, dot(theta))$" />, <InlineMath code="$(z_b, dot(z)_b)$" /> and <InlineMath code="$(phi, dot(phi))$" /> planes.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="lyapunovBoundarySample" alt="Lyapunov decrease along a terminal set boundary sample" />
                    <figcaption>Fig. 8. Lyapunov decrease along a terminal set boundary sample using the LQR control sequence as the input sequence. The two curves are almost identical just as predicted by the theoretical derivation.</figcaption>
                </figure>
            </div>

            <h3>Linear Sagittal Maneuver Example</h3>
            <p>
                To visualize the forward-leaning acceleration and backward-leaning deceleration postures naturally resulting from optimal control, a linear maneuver is designed: (1) first, the robot remains still for <InlineMath code='$t < 1 "s"$' />; (2) it accelerates and moves forward for <InlineMath code='$1 "s"$' /> to <InlineMath code='$3 "s"$' />; (3) and then it settles at the target position.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="linearDemoX3m" alt="Linear sagittal maneuver showing states and pitch torque" />
                    <figcaption>Fig. 9. Linear sagittal maneuver showing <InlineMath code="$x_b$" />, <InlineMath code="$dot(x)_b$" />, <InlineMath code="$theta$" />, and <InlineMath code="$T_(p s)$" />. The fluctuations near the starting point are caused by standing regulation instead of the maneuvering.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="linearDemoMultiexposure" alt="Visualization of the acceleration, cruising, and braking postures" />
                    <figcaption>Fig. 10. Visualization of the acceleration, cruising, and braking postures.</figcaption>
                </figure>
            </div>
            <p>
                The resulting state trajectories in Fig. 9 and the rendered scenes in Fig. 10 show the expected behavior: the robot leans forward to generate acceleration and reverses the posture tendency when it needs to decelerate and settle, in order to achieve the best performance.
            </p>

            <h3>Offset-Free Output MPC Under Constant Input Disturbance</h3>
            <p>
                The offset-free output MPC is demonstrated through a simple diagnostic tracking test. The observer reconstructs the missing velocity states and estimates an unknown constant disturbance from zero-order measurements only. In the current benchmark, the disturbance is injected as a constant bias in the <InlineMath code="$T_s$" /> channel.
            </p>
            <figure class="project-media project-media--large">
                <img :src="offsetfreeVsNominal" alt="Diagnostic comparison with and without offset-free compensation" />
                <figcaption>Fig. 11. Diagnostic comparison with and without offset-free compensation.</figcaption>
            </figure>
            <p>
                As shown in Fig. 11, without offset-free compensation, the steady-state position error remains around <InlineMath code="$0.166$" /> m; with offset-free compensation, the position error is reduced to about <InlineMath code="$0.018$" /> m, and the disturbance estimate converges toward the true injected bias. This confirms that the observer-based disturbance-rejection mechanism is active in the experimental setting.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Conclusion</h2>
            <p>
                This project has developed a model-based MPC framework for the TRON1 wheel-legged robot, with emphasis on a standing regulation controller that is analytically tractable and numerically verifiable. The reduced-order formulation, local discrete-time model, Riccati-based terminal ingredients, and ellipsoidal terminal set together support a rigorous asymptotic-stability argument for the nominal regulation problem. MuJoCo simulations confirm that the controller can maintain standing and recover from representative disturbances, while linear studies clarify the influence of horizon length, weight selection, and active constraints. The output-tracking and offset-free extension further demonstrates the feasibility of disturbance estimation and steady-state target selection, providing a consistent basis for subsequent refinement toward more reliable nonlinear tracking performance.
            </p>
        </section>

        <section class="project-article__section">
            <h2>References</h2>
            <ol class="wlmpc-list">
                <li>
                    Z. Wang and X. Ju, “Gralerfics/TUD-SC42125-Model-Predictive-Control-Project.” Available:
                    <a href="https://github.com/Gralerfics/TUD-SC42125-Model-Predictive-Control-Project" target="_blank" rel="noreferrer">
                        https://github.com/Gralerfics/TUD-SC42125-Model-Predictive-Control-Project
                    </a>
                </li>
                <li>J. Rawlings and D. Mayne, <em>Model Predictive Control: Theory and Design</em>. Nob Hill Publishing, 2008.</li>
            </ol>
        </section>
    </div>
</template>
