<script setup>
import stackDiagram from './assets/stack.png'
import demoShot from './assets/demo01.png'
</script>

<template>
    <div class="project-article http-file-manager-article">
        <section class="project-article__section">
            <p class="detail-text">
                <strong>Features.</strong> This project starts from a hand-written HTTP server and then builds a usable file manager on top of it, including view and download, upload and delete, cookie / session handling, chunked transfer, range requests, and an optional encrypted transport mode.
            </p>
            <p class="detail-text">
                <strong>Stack.</strong> Python, sockets, selector-based event processing, custom HTTP request / response parsing, Flask-like route registration, HTML templates, frontend assets, and <code>pycryptodome</code> for the encrypted communication extension.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Representative result</h2>
            <p>
                The useful thing here is that it is not “just an HTTP parser” and not “just a file manager UI”. The protocol handling and the application layer were developed together, so every feature in the file manager forced the lower-level server to become more complete.
            </p>
            <div class="project-media-grid project-media-grid--two">
                <figure class="project-media">
                    <img :src="demoShot" alt="HTTP file manager interface screenshot" />
                    <figcaption>The final application exposes normal file-manager actions through the custom server stack.</figcaption>
                </figure>
                <figure class="project-media">
                    <img :src="stackDiagram" alt="HTTP file manager stack diagram" />
                    <figcaption>The repository is deliberately split into a reusable HTTP layer and the file-manager application built on top of it.</figcaption>
                </figure>
            </div>
        </section>

        <section class="project-article__section">
            <h2>Why I split it into two layers</h2>
            <p>
                The project is organized around <code>myhttp</code> and <code>file_manager</code>. I did that on purpose: the server should still make sense as a reusable HTTP framework, while the file manager should feel like an application that happens to run on that framework instead of a pile of request handlers with no structure.
            </p>
            <p>
                In practice, the lower layer owns sockets, connections, request and response messages, headers, and parsing; the upper layer owns directory views, stored resources, user-facing actions, and the page rendering logic. That separation is what made it possible to keep adding protocol features without turning the application code into raw byte handling.
            </p>
        </section>

        <section class="project-article__section">
            <h2>The custom HTTP core</h2>
            <p>
                The interesting part of the lower layer is not that it can answer a request at all, but that it tries to behave like a real server rather than a one-shot demo. The slides and code both revolve around persistent connections, request encapsulation, and target-oriented parsing: waiting for a fixed length when <code>Content-Length</code> is known, or waiting for explicit markers when parsing headers and chunk sizes.
            </p>
            <p>
                That means handling annoying but real cases such as partial requests in one <code>recv</code> buffer, multiple requests arriving back-to-back, and chunked transfer where the body cannot simply be read in one go. The message layer in <code>myhttp.message</code> formalizes URLs, request lines, status lines, headers, and full messages so parsing and serialization are not spread across the server codebase.
            </p>
            <p>
                On top of that, the request routing is exposed in a Flask-like style. That part matters because it keeps the application layer readable: APIs and page handlers are registered around the route tree instead of being buried in one central dispatch function.
            </p>
        </section>

        <section class="project-article__section">
            <h2>The file manager itself</h2>
            <p>
                Once the HTTP layer is stable enough, the application part becomes much more than “serve files”. The final feature set includes directory view and download, upload, delete, cookies and sessions for authenticated access, and boundary-case handling such as name collisions, missing folders, multiple uploaded files in one request, and root-folder protection.
            </p>
            <p>
                I also treated browser-facing details as part of the engineering problem instead of decoration. The repository has templates, CSS, frontend JavaScript, icon fonts, and a page-rendering path, so the UI is generated as an actual web application rather than raw response strings.
            </p>
        </section>

        <section class="project-article__section">
            <h2>Protocol features that forced the design to grow up</h2>
            <p>
                The bonus features are what pushed the server beyond the obvious baseline. Range transmission forced the response path to deal with partial file output in a more disciplined way. Chunked transfer made request parsing stateful. Cookies and sessions required a persistence path for user state and a consistent priority rule between cookie-based and authentication-based access.
            </p>
            <p>
                There is also an encrypted communication mode implemented by swapping the normal connection handler for <code>EncryptedHTTPConnectionHandler</code>. I like this part because it shows that the architecture was not frozen around a single transport assumption. Once the handler boundary is explicit, additional communication behaviors can be introduced without rewriting the whole application.
            </p>
        </section>

        <section class="project-article__section">
            <h2>What this project demonstrates</h2>
            <p>
                The value of this project is not just that I wrote an HTTP server from scratch. It is that I carried that server far enough that application-level requirements started shaping the protocol implementation, and protocol-level realities started shaping the application. That feedback loop is what makes it more useful than either a toy parser or a UI-only coursework submission.
            </p>
        </section>
    </div>
</template>
