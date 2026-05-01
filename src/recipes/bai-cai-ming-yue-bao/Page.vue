<script setup>
import braiseReady from './assets/11dcca46cec61d4e3124f71c6b34b5ab.jpg'
import resultA from './assets/06f80d1d74547e9c2e32243f2bdf796c.jpg'
import resultB from './assets/1e2eb1868e14bd08e050d090dedacfcc.jpg'
import resultC from './assets/1ff989542d8147bd3e85f001d2a26e40.jpg'
import resultD from './assets/720b0f2a236c145413d8994cd1e95846.jpg'
import resultE from './assets/cf3bb298401b9a66dc5806d73bc721b1.jpg'
</script>

<template>
    <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Prep</p>
                <h2>食材</h2>
            </div>
            <div class="section-body section-body--boxed recipe-ingredients-panel">
                <ul class="list-clean bullet-list">
                    <li>白菜，梗和叶都要，白菜梗尽量留作锅底。</li>
                    <li>鸡蛋，按人数或锅量煎成荷包蛋。</li>
                    <li>肉片、肉末或其他顺手的肉，猪肉、牛肉都可以。</li>
                    <li>盐、糖、蚝油和食用油。</li>
                </ul>
            </div>
    </section>

    <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Summary</p>
                <h2>概要</h2>
            </div>
            <div class="section-body project-article">
                <section class="project-article__section recipe-summary-panel">
                    <h2>简洁步骤</h2>
                    <ol class="recipe-steps">
                        <li>煎荷包蛋，数量随锅量和人数调整。</li>
                        <li>随便炒个肉，炒出香味后先盛出或推到一边。</li>
                        <li>白菜下锅翻炒到出水，用盐、糖、蚝油调味。</li>
                        <li>加入炒好的肉，铺上荷包蛋，转中小火焖到白菜梗软硬合适。</li>
                    </ol>
                </section>
            </div>
    </section>

    <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Details</p>
                <h2>细节</h2>
            </div>
            <div class="section-body project-article">
                <section class="project-article__section">
                    <h2>做法</h2>
                    <p>
                        先把鸡蛋煎成边缘略焦的荷包蛋。蛋不用煎得太嫩，后面会和白菜一起焖，边缘有一点脆香更好。
                    </p>
                    <p>
                        肉的形式很自由，肉片、肉末、剩下的熟肉都可以。先用油炒香，能出一点油脂和焦香即可。
                    </p>
                    <p>
                        白菜下锅后先大火翻炒，让叶片变软、白菜自身开始出水。调味以盐为主，少量糖提鲜，再加蚝油给底味。
                    </p>
                    <p>
                        把炒好的肉放回锅里拌匀，再把荷包蛋铺在上面，转中小火焖。焖的时间按白菜梗软硬程度决定，喜欢软烂就久一点，喜欢有口感就短一点。
                    </p>

                    <figure class="project-media project-media--large">
                        <img :src="braiseReady" alt="白菜和肉铺上荷包蛋，准备开始焖" />
                        <figcaption>铺上荷包蛋后转中小火焖，白菜梗最好铺在下面。</figcaption>
                    </figure>
                </section>

                <section class="project-article__section">
                    <h2>提醒</h2>
                    <ul class="recipe-tips">
                        <li>白菜梗尽量在下面，叶子和荷包蛋在上面，受热和出水会更顺。</li>
                        <li>焖的时候不要全程大火，白菜虽然会出水，但锅底仍然可能糊。</li>
                        <li>如果锅比较干，可以沿锅边补一点热水；如果出水太多，最后开盖收一下。</li>
                        <li>蚝油有咸味，盐可以分次加，最后再校正。</li>
                    </ul>
                </section>

                <section class="project-article__section">
                    <h2>几次成品</h2>
                    <p>
                        这道菜不太需要精确复刻，几次做出来的状态会随白菜含水量、蛋的数量和焖的时间变化。
                    </p>
                    <div class="project-media-grid project-media-grid--three recipe-result-grid">
                        <figure class="project-media">
                            <img :src="resultA" alt="白菜明月煲成品图一" />
                            <figcaption>成品记录 1</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="resultB" alt="白菜明月煲成品图二" />
                            <figcaption>成品记录 2</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="resultC" alt="白菜明月煲成品图三" />
                            <figcaption>成品记录 3</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="resultD" alt="白菜明月煲成品图四" />
                            <figcaption>成品记录 4</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="resultE" alt="白菜明月煲成品图五" />
                            <figcaption>成品记录 5</figcaption>
                        </figure>
                    </div>
                </section>
            </div>
    </section>
</template>
