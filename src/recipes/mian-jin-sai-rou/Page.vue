<script setup>
import rouxian from './assets/572d5c85fc3f71e788ad99c25cb29cf8.jpg'
import guoli from './assets/d2054f74b67fb677868d0a1b8ff23f9e.jpg'
import xiaoqian from './assets/1444a7760c9f17268703aeb09c5a8db1.jpg'
import xiaohou from './assets/5fb88b05dcd2cfb2dc50e3e16ea523ec.jpg'
import cover from './assets/3f73cca64a85948806239fc41986ff6d.jpg'
</script>

<template>
    <section class="editorial-section">
            <div class="section-label">
                <p class="eyebrow">Ingredients</p>
                <h2>食材</h2>
            </div>
            <div class="section-body section-body--boxed recipe-ingredients-panel">
                <ul class="list-clean bullet-list">
                    <li>猪肉馅（比如 350g，生抽一勺、老抽半勺、蚝油一勺调味，可以打个蛋、少量鸡精、白糖、盐、五香粉、白胡椒等）</li>
                    <li>葱姜（花椒）水，开水泡后放凉</li>
                    <li>料汁（红烧汁，生抽一勺、老抽一勺、白糖半勺/冰糖，半碗温水）</li>
                    <li>葱、姜、干辣椒、桂皮、八角等香料</li>
                    <li>淀粉水</li>
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
                    <h3>简要步骤</h3>
                    <ol class="recipe-steps">
                        <li>开水泡葱、姜（、花椒）等待放凉。</li>
                        <li>肉馅调味后向一个方向搅拌上劲，分多次少量加入葱姜水搅匀吸收；装袋方便挤出。</li>
                        <li>油面筋抠洞将内部捏平，填到八九成满；填充完开口向下煎几秒封口，可以冷冻保存起来。</li>
                        <li>调好料汁备用。</li>
                        <li>大火下香料炒香，中小火朝下煎面筋塞肉封口，小火倒入料汁（没过一半），大火烧开。</li>
                        <li>盖上盖小火焖十五分钟，中途观察翻面淋汤汁确保浸透、上色。</li>
                        <li>转大火加淀粉水勾芡，撒葱花出锅。</li>
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
                    <h2>备注</h2>
                    <ul class="recipe-tips">
                        <li>肉馅需要肥瘦相间，全是瘦肉比较干；没有可以搅肉馅时加马蹄/葱花/香菜/淀粉等。</li>
                        <li>填充肉馅后过会可能又塌进去一些，可以再补满一点。</li>
                        <li>不要放冷藏/放外面太久，肉馅的水分会让油面筋壳软掉。</li>
                    </ul>
                </section>

                <section class="project-article__section">
                    <h2>图例</h2>
                    <div class="project-media-grid project-media-grid--three recipe-result-grid">
                        <figure class="project-media">
                            <img :src="rouxian" alt="肉馅" />
                            <figcaption>朝同一个方向使劲，搅出拉丝的感觉，图上这个水有点多了。</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="guoli" alt="焖" />
                            <figcaption>在锅里煮着，记得盖盖。</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="cover" alt="成品图" />
                            <figcaption>第一次成品图。</figcaption>
                        </figure>
                    </div>
                    <div class="project-media-grid project-media-grid--two recipe-result-grid">
                        <figure class="project-media">
                            <img :src="xiaoqian" alt="第二次" />
                            <figcaption>第二次做只买到很小的油面筋，倒也没大问题。</figcaption>
                        </figure>
                        <figure class="project-media">
                            <img :src="xiaohou" alt="第二次成品图" />
                            <figcaption>这次的结果，因为肉馅里掺了点香菜和淀粉，口感比第一次好一些。</figcaption>
                        </figure>
                    </div>
                </section>
            </div>
    </section>
</template>
