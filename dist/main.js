import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { buildMaterials } from './mats.js';
import { skyTexture } from './tex.js';
import { buildStore } from './building.js';
import { buildInterior } from './interior.js';
import { buildSite } from './site.js';
const params = new URLSearchParams(location.search);
const uiVisible = params.get('ui') !== '0';
/* ------------------------------------------------------------------ */
/* renderer                                                            */
/* ------------------------------------------------------------------ */
const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d141d, 0.0055);
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.06, 320);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.target.set(0, 2.0, 2.0);
controls.minDistance = 1.2;
controls.maxDistance = 75;
controls.maxPolarAngle = THREE.MathUtils.degToRad(88);
controls.minPolarAngle = THREE.MathUtils.degToRad(12);
controls.autoRotateSpeed = 0.32;
/* ------------------------------------------------------------------ */
/* sky + environment                                                   */
/* ------------------------------------------------------------------ */
const sky = skyTexture();
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(280, 48, 32), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide, fog: false, toneMapped: true }));
skyDome.rotation.y = -0.6;
scene.add(skyDome);
const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();
function environmentScene() {
    const s = new THREE.Scene();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 20), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide }));
    s.add(dome);
    // warm horizon glow (the storefront / city bounce, reflected by glass and metal)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x9a6c44 });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(46, 7), glowMat);
    glow.position.set(0, 3, -28);
    s.add(glow);
    const glow2 = new THREE.Mesh(new THREE.PlaneGeometry(26, 5), new THREE.MeshBasicMaterial({ color: 0x30465e }));
    glow2.position.set(-22, 6, 18);
    glow2.rotation.y = 1.2;
    s.add(glow2);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.4), new THREE.MeshBasicMaterial({ color: 0xbfae96 }));
    strip.position.set(14, 3.2, -22);
    strip.rotation.y = -0.5;
    s.add(strip);
    return s;
}
scene.environment = pmrem.fromScene(environmentScene(), 0.06).texture;
scene.environmentIntensity = 0.5;
/* ------------------------------------------------------------------ */
/* lights                                                              */
/* ------------------------------------------------------------------ */
scene.add(new THREE.HemisphereLight(0x3d5b82, 0x14171b, 0.20));
const moon = new THREE.DirectionalLight(0x9db6d8, 0.30);
moon.position.set(-26, 30, 22);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -30;
moon.shadow.camera.right = 30;
moon.shadow.camera.top = 26;
moon.shadow.camera.bottom = -22;
moon.shadow.camera.near = 1;
moon.shadow.camera.far = 90;
moon.shadow.bias = -0.0006;
moon.shadow.normalBias = 0.03;
moon.shadow.radius = 4;
scene.add(moon);
const skyFill = new THREE.DirectionalLight(0x8ba4c8, 0.07);
skyFill.position.set(16, 12, -24);
scene.add(skyFill);
/* ------------------------------------------------------------------ */
/* model                                                               */
/* ------------------------------------------------------------------ */
const mats = buildMaterials();
const store = buildStore(mats);
const interior = buildInterior(mats);
const site = buildSite(mats);
scene.add(site.group);
scene.add(store.group);
scene.add(interior.group);
for (const l of [...store.lights, ...interior.lights, ...site.lights])
    scene.add(l);
const ptScale = Number(params.get('pt') || 1);
const spScale = Number(params.get('sp') || 1);
const dirScale = Number(params.get('ds') || 1);
scene.traverse((o) => {
    const l = o;
    if (l.isPointLight)
        l.intensity *= ptScale;
    if (l.isSpotLight)
        l.intensity *= spScale;
    if (l.isDirectionalLight)
        l.intensity *= dirScale;
});
window.__KONBINI_LIGHTS__ = true;
/* ------------------------------------------------------------------ */
/* post                                                                */
/* ------------------------------------------------------------------ */
const dpr = renderer.getPixelRatio();
const rt = new THREE.WebGLRenderTarget(Math.floor(window.innerWidth * dpr), Math.floor(window.innerHeight * dpr), { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(dpr);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.28, 0.52, 0.95);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const photoShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uVignette: { value: 0.26 },
        uGrain: { value: 0.030 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uResolution;
    uniform float uVignette; uniform float uGrain; varying vec2 vUv;
    void main() {
      vec2 d = vUv - 0.5;
      float ca = 0.0016 * dot(d, d);
      vec3 col;
      col.r = texture2D(tDiffuse, vUv + d * ca * 4.0).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - d * ca * 4.0).b;
      float v = smoothstep(0.92, 0.28, length(d * vec2(1.04, 1.0)));
      col *= mix(1.0, v, uVignette);
      float n = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
      col += (n - 0.5) * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};
const photoPass = new ShaderPass(photoShader);
composer.addPass(photoPass);
window.__photoPass = photoPass;
const VIEWS = {
    hero: { pos: [10.4, 2.1, 17.4], target: [-0.5, 2.08, 2.4], fov: 43 },
    entrance: { pos: [1.4, 1.70, 18.2], target: [-0.6, 2.05, 5.6], fov: 40 },
    inside: { pos: [-0.9, 1.62, 4.4], target: [4.6, 1.45, -7.2], fov: 62, expo: 0.25 },
    aerial: { pos: [21.0, 15.0, 24.0], target: [0.2, 1.6, -0.6], fov: 36 },
    street: { pos: [-13.0, 2.35, 18.6], target: [2.2, 2.5, 4.4], fov: 44 },
    detail: { pos: [11.1, 1.62, 8.4], target: [7.35, 1.05, 2.9], fov: 45 },
    lot: { pos: [14.2, 3.1, 23.5], target: [0.2, 2.0, 1.0], fov: 38 },
    corner: { pos: [12.2, 1.75, 15.6], target: [2.0, 2.1, 4.6], fov: 47 },
};
const baseExposure = Number(params.get('expo') || 1.05);
function setView(name, immediate = true) {
    const v = VIEWS[name] || VIEWS.hero;
    renderer.toneMappingExposure = v.expo ?? baseExposure;
    camera.fov = v.fov;
    camera.updateProjectionMatrix();
    camera.position.set(...v.pos);
    controls.target.set(...v.target);
    controls.update();
    if (immediate) {
        composer.render();
    }
}
const camParam = params.get('cam');
const tgtParam = params.get('tgt');
if (camParam && tgtParam) {
    VIEWS.custom = {
        pos: camParam.split(',').map(Number),
        target: tgtParam.split(',').map(Number),
        fov: Number(params.get('fov') || 40),
    };
}
setView(params.get('view') || (VIEWS.custom ? 'custom' : 'hero'));
/* ------------------------------------------------------------------ */
/* interactivity                                                       */
/* ------------------------------------------------------------------ */
let autoRotate = false;
let bloomOn = true;
if (uiVisible) {
    document.querySelectorAll('#hud [data-view]').forEach((b) => {
        b.addEventListener('click', () => {
            document.querySelectorAll('#hud [data-view]').forEach((x) => x.classList.remove('active'));
            b.classList.add('active');
            setView(b.dataset.view);
        });
    });
    document.querySelector('#hud [data-view]')?.classList.add('active');
    document.getElementById('spin')?.addEventListener('click', (e) => {
        autoRotate = !autoRotate;
        controls.autoRotate = autoRotate;
        e.currentTarget.classList.toggle('active', autoRotate);
    });
    document.getElementById('quality')?.addEventListener('click', (e) => {
        bloomOn = !bloomOn;
        bloom.enabled = bloomOn;
        e.currentTarget.classList.toggle('active', bloomOn);
        composer.render();
    });
    document.getElementById('reset')?.addEventListener('click', () => setView('hero'));
    document.getElementById('quality')?.classList.add('active');
}
else {
    document.getElementById('hud')?.remove();
    document.querySelector('.hint')?.remove();
}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down = { x: 0, y: 0 };
renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5)
        return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([store.group, interior.group, site.group], true);
    const el = document.getElementById('picked');
    if (!el)
        return;
    if (!hits.length) {
        el.innerHTML = 'Click a part to inspect';
        return;
    }
    let o = hits[0].object;
    const chain = [];
    while (o && o !== scene) {
        if (o.name)
            chain.push(o.name);
        o = o.parent;
    }
    el.innerHTML = `<b>${chain[0] || 'part'}</b><br><span>${chain.slice(1, 4).join(' · ') || 'model'}</span>`;
});
/* ------------------------------------------------------------------ */
/* loop                                                                */
/* ------------------------------------------------------------------ */
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloom.setSize(window.innerWidth, window.innerHeight);
    photoShader.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
let frames = 0;
function tick() {
    controls.update();
    photoShader.uniforms.uTime.value = (performance.now() * 0.001) % 10;
    composer.render();
    frames++;
    if (frames === 2) {
        document.getElementById('loading')?.remove();
        window.__KONBINI_READY__ = true;
    }
    requestAnimationFrame(tick);
}
tick();
window.__KONBINI__ = {
    setView, scene, camera, renderer, composer, controls, bloom, params,
    setBloom: (on) => { bloomOn = on; bloom.enabled = on; },
    map: mats,
};
