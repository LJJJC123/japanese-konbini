import * as THREE from 'three';
import { box, rbox, plane, cyl, tube } from './geo.js';
import { graphicMaterial, panelTexture } from './tex.js';
import { JP } from './graphics.js';
import { rng, canvas, tex } from './util.js';
import * as G from './graphics.js';
/* --------------------------------------------------------------- */
/* helpers                                                          */
/* --------------------------------------------------------------- */
function poolTexture(soft = 0.55, warm = '255,226,182') {
    const { c, ctx } = canvas(256, 256);
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, `rgba(${warm},${soft})`);
    g.addColorStop(0.45, `rgba(${warm},${soft * 0.45})`);
    g.addColorStop(1, `rgba(${warm},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return tex(c, { clamp: true });
}
function shadowTexture(strength = 0.6) {
    const { c, ctx } = canvas(128, 128);
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(0.55, `rgba(0,0,0,${strength * 0.42})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return tex(c, { clamp: true });
}
function additive(texMap, opacity = 1) {
    return new THREE.MeshBasicMaterial({
        map: texMap, transparent: true, opacity, blending: THREE.AdditiveBlending,
        depthWrite: false, toneMapped: true,
    });
}
function lineAlpha() {
    const { c, ctx } = canvas(512, 64);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 64);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 20, 512, 26);
    const R = rng(404);
    for (let i = 0; i < 260; i++) {
        ctx.clearRect(R() * 512, 24 + R() * 20, 1 + R() * 6, 1 + R() * 4);
    }
    return tex(c, { srgb: false });
}
function facadeMaterial(seed, litChance = 0.3, tint = '#3b3f42') {
    const R = rng(seed);
    const W = 512, H = 512;
    const col = canvas(W, H), emi = canvas(W, H);
    col.ctx.fillStyle = tint;
    col.ctx.fillRect(0, 0, W, H);
    emi.ctx.fillStyle = '#000';
    emi.ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5000; i++) {
        col.ctx.fillStyle = `rgba(255,255,255,${R() * 0.03})`;
        col.ctx.fillRect(R() * W, R() * H, 2, 2);
    }
    const cols = 4, rows = 5;
    const cw = W / cols, ch = H / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cw + cw * 0.18, y = r * ch + ch * 0.2;
            const w = cw * 0.64, h = ch * 0.52;
            const lit = R() < litChance;
            col.ctx.fillStyle = lit ? (R() < 0.5 ? '#f5dfae' : '#ffd48a') : '#1c2226';
            col.ctx.fillRect(x, y, w, h);
            col.ctx.strokeStyle = '#5d6265';
            col.ctx.lineWidth = 3;
            col.ctx.strokeRect(x, y, w, h);
            // mullion
            col.ctx.fillStyle = '#454a4d';
            col.ctx.fillRect(x + w / 2 - 1.5, y, 3, h);
            if (lit) {
                emi.ctx.fillStyle = R() < 0.5 ? '#f7e2b6' : '#ffcf8a';
                emi.ctx.fillRect(x, y, w, h);
                if (R() < 0.4) { // curtain / silhouette
                    emi.ctx.fillStyle = 'rgba(0,0,0,0.45)';
                    emi.ctx.fillRect(x + w * (0.2 + R() * 0.4), y, w * 0.25, h);
                }
            }
        }
    }
    const mt = tex(col.c, { repeat: [1, 1] });
    const et = tex(emi.c, { repeat: [1, 1] });
    return new THREE.MeshStandardMaterial({
        map: mt, emissiveMap: et, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.72, roughness: 0.8,
    });
}
/* --------------------------------------------------------------- */
/* props                                                            */
/* --------------------------------------------------------------- */
function vendingMachine(m, x, z) {
    const g = new THREE.Group();
    g.name = 'vendingMachine';
    const W = 0.95, D = 0.72, Hh = 1.83;
    const front = graphicMaterial(G.vendingFront(), { emissive: 0.52, rough: 0.32 });
    const side = graphicMaterial(G.vendingSide(), { emissive: 0.06, rough: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(D, Hh, W), [front, m.whiteAluDull, m.whiteAluDull, m.whiteAluDull, side, side]);
    body.position.set(0, Hh / 2 + 0.02, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    // thin perimeter frame only (never a panel across the lit front)
    const fx = D / 2 + 0.004;
    g.add(box(0.012, Hh - 0.16, 0.03, m.darkAlu, fx, Hh / 2 + 0.02, W / 2 - 0.03));
    g.add(box(0.012, Hh - 0.16, 0.03, m.darkAlu, fx, Hh / 2 + 0.02, -W / 2 + 0.03));
    g.add(box(0.012, 0.03, W - 0.06, m.darkAlu, fx, Hh - 0.06, 0));
    g.add(box(0.012, 0.03, W - 0.06, m.darkAlu, fx, 0.10, 0));
    g.add(box(0.03, 0.06, W, m.darkAlu, D / 2, 0.03, 0));
    g.add(box(D - 0.1, 0.03, W - 0.06, m.darkAlu, 0, Hh + 0.03, 0));
    g.position.set(x, 0, z);
    return g;
}
function iceChest(m, x, z) {
    const g = new THREE.Group();
    g.name = 'iceChest';
    const front = graphicMaterial(G.iceBoxFront(), { emissive: 0.28, rough: 0.42 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.98, 1.55), [front, m.whiteAluDull, m.whiteAluDull, m.whiteAluDull, m.whiteAluDull, m.whiteAluDull]);
    b.position.set(0, 0.49, 0);
    b.castShadow = true;
    b.receiveShadow = true;
    g.add(b);
    g.add(box(0.74, 0.06, 1.57, m.stainless, 0, 1.0, 0));
    g.add(box(0.76, 0.05, 1.56, m.darkAlu, 0, 0.03, 0));
    g.position.set(x, 0, z);
    return g;
}
function recycleStation(m, x, z) {
    const g = new THREE.Group();
    g.name = 'recycleStation';
    const kinds = ['can', 'bottle', 'pet'];
    kinds.forEach((k, i) => {
        const zz = z + (i - 1) * 0.46;
        g.add(box(0.38, 0.88, 0.44, new THREE.MeshStandardMaterial({ color: 0x39424a, roughness: 0.6 }), x, 0.44, zz));
        const face = graphicMaterial(G.recycleLabel(k), { emissive: 0.12, rough: 0.6 });
        g.add(plane(0.42, 0.42, face, x + 0.192, 0.62, zz, Math.PI / 2));
        g.add(box(0.40, 0.05, 0.46, m.darkAlu, x, 0.90, zz));
    });
    return g;
}
function noboriFlag(texture, x, z) {
    const g = new THREE.Group();
    g.name = 'nobori';
    g.add(cyl(0.018, 0.018, 3.0, 8, new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.45, metalness: 0.3 }), 0, 1.5, 0));
    g.add(box(0.28, 0.05, 0.02, new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.6 }), 0, 0.035, 0));
    g.add(box(0.02, 0.62, 0.02, new THREE.MeshStandardMaterial({ color: 0xd8d8d2, roughness: 0.45 }), 0, 2.62, 0.3));
    const mat = graphicMaterial(texture, { rough: 0.8, side: THREE.DoubleSide });
    const flag = plane(0.56, 1.62, mat, 0.29, 1.95, 0.0);
    g.add(flag);
    // slight curl of the fabric
    g.add(box(0.565, 1.62, 0.02, new THREE.MeshStandardMaterial({ color: 0xf4f0e4, roughness: 0.9, side: THREE.DoubleSide }), 0.29, 1.95, -0.014));
    g.position.set(x, 0, z);
    return g;
}
function aFrame(m, x, z, rot) {
    const g = new THREE.Group();
    g.name = 'aFrame';
    const mat = graphicMaterial(G.aframeBoard(), { rough: 0.7 });
    const board = new THREE.Group();
    for (const s of [-1, 1]) {
        const p = new THREE.Group();
        const b = plane(0.62, 0.78, s > 0 ? mat : new THREE.MeshStandardMaterial({ color: 0x2b2b28, roughness: 0.8 }), 0, 0.55, 0);
        b.rotation.x = s * 0.13;
        b.position.z = s * 0.1;
        p.add(b);
        p.rotation.y = s > 0 ? 0 : Math.PI;
        board.add(p);
    }
    board.position.y = 0.02;
    board.rotation.x = -0.14;
    g.add(board);
    g.add(box(0.66, 0.05, 0.34, new THREE.MeshStandardMaterial({ color: 0x3a3a36, roughness: 0.7 }), 0, 0.03, 0));
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    return g;
}
function keiCar(m, x, z, rot) {
    const g = new THREE.Group();
    g.name = 'keiCar';
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x4a5057, roughness: 0.24, metalness: 0.55, clearcoat: 0.9, clearcoatRoughness: 0.10, envMapIntensity: 1.5,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x080c10, roughness: 0.05, metalness: 0.2, envMapIntensity: 1.5 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x191b1d, roughness: 0.8 });
    const W = 1.46;
    // lower body
    g.add(rbox(W, 0.78, 3.34, 0.09, bodyMat, 0, 0.71, 0, 3));
    // upper body (boxy kei-van cabin)
    g.add(rbox(W - 0.02, 0.92, 3.16, 0.11, bodyMat, 0, 1.50, -0.06, 3));
    // glazing band
    for (const sx of [-1, 1]) {
        g.add(box(0.012, 0.52, 2.06, glassMat, sx * (W / 2 - 0.01), 1.60, 0.12));
        g.add(box(0.012, 0.42, 0.9, glassMat, sx * (W / 2 - 0.01), 1.58, -1.06));
    }
    // windscreen + rear hatch glass
    const ws = box(W - 0.14, 0.52, 0.02, glassMat, 0, 1.62, 1.53);
    ws.rotation.x = -0.16;
    g.add(ws);
    g.add(box(W - 0.18, 0.44, 0.02, glassMat, 0, 1.60, -1.62));
    // rear hatch frame + wiper
    g.add(box(W - 0.10, 0.03, 0.03, trimMat, 0, 1.38, -1.63));
    g.add(box(0.28, 0.02, 0.02, trimMat, -0.18, 1.50, -1.64));
    // pillars
    for (const sx of [-1, 1])
        g.add(box(0.05, 0.92, 0.06, bodyMat, sx * (W / 2 - 0.02), 1.50, 1.42));
    // door seams + slider rail
    for (const sx of [-1, 1]) {
        g.add(box(0.008, 0.62, 0.02, trimMat, sx * (W / 2), 0.86, 0.55));
        g.add(box(0.008, 0.62, 0.02, trimMat, sx * (W / 2), 0.86, -0.95));
        g.add(box(0.02, 0.03, 2.2, trimMat, sx * (W / 2 - 0.005), 1.10, -0.2));
    }
    // bumpers + arches
    g.add(box(W + 0.04, 0.26, 0.10, trimMat, 0, 0.44, 1.68));
    g.add(box(W + 0.04, 0.26, 0.10, trimMat, 0, 0.44, -1.68));
    for (const sx of [-1, 1])
        for (const sz of [-1.06, 1.06]) {
            g.add(box(0.06, 0.24, 0.78, trimMat, sx * (W / 2 + 0.01), 0.52, sz));
        }
    // wheels
    const tire = new THREE.MeshStandardMaterial({ color: 0x141618, roughness: 0.92 });
    const rim = new THREE.MeshStandardMaterial({ color: 0x6a7075, roughness: 0.35, metalness: 0.6 });
    for (const sx of [-1, 1])
        for (const sz of [-1.06, 1.06]) {
            const w = cyl(0.275, 0.275, 0.15, 18, tire, sx * 0.67, 0.29, sz);
            w.rotation.z = Math.PI / 2;
            g.add(w);
            const hub = cyl(0.115, 0.115, 0.155, 12, rim, sx * 0.67, 0.29, sz);
            hub.rotation.z = Math.PI / 2;
            g.add(hub);
        }
    // mirrors
    for (const sx of [-1, 1]) {
        g.add(box(0.14, 0.09, 0.05, trimMat, sx * (W / 2 + 0.07), 1.28, 1.36));
        g.add(box(0.05, 0.03, 0.03, trimMat, sx * (W / 2 + 0.01), 1.26, 1.36));
    }
    // lights
    for (const sx of [-1, 1]) {
        g.add(box(0.30, 0.15, 0.04, new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: 0xfff2d2, emissiveIntensity: 0.55 }), sx * 0.45, 0.74, 1.685));
        g.add(box(0.16, 0.34, 0.04, new THREE.MeshStandardMaterial({ color: 0x4a0b0b, emissive: 0x9a1d14, emissiveIntensity: 0.55 }), sx * 0.60, 1.02, -1.685));
    }
    // plate + rear garnish
    g.add(box(0.34, 0.13, 0.02, new THREE.MeshStandardMaterial({ color: 0xe8e8dc, roughness: 0.6 }), 0, 0.56, -1.70));
    g.add(box(W - 0.2, 0.03, 0.02, trimMat, 0, 0.90, -1.69));
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    return g;
}
function utilityPole(m, x, z, h = 9.4) {
    const g = new THREE.Group();
    g.name = 'utilityPole';
    const concrete = new THREE.MeshStandardMaterial({ color: 0x8b8c86, roughness: 0.9, metalness: 0.02 });
    g.add(cyl(0.11, 0.19, h, 12, concrete, 0, h / 2, 0));
    for (let i = 0; i < 4; i++) {
        g.add(box(0.02, 0.9, 0.02, new THREE.MeshStandardMaterial({ color: 0x6a6b66, roughness: 0.7 }), 0.0, 1.2 + i * 1.9, 0.16));
    }
    // crossarms
    for (const [y, len] of [[h - 0.7, 2.0], [h - 1.5, 1.6]]) {
        g.add(box(len, 0.09, 0.09, new THREE.MeshStandardMaterial({ color: 0x5c5f5a, roughness: 0.7 }), 0, y, 0));
        for (const sx of [-len / 2 + 0.15, 0, len / 2 - 0.15]) {
            g.add(cyl(0.05, 0.05, 0.14, 8, new THREE.MeshStandardMaterial({ color: 0xcfd4d2, roughness: 0.3 }), sx, y + 0.12, 0));
        }
    }
    // transformer
    g.add(cyl(0.26, 0.26, 0.8, 14, new THREE.MeshStandardMaterial({ color: 0x9aa09b, roughness: 0.55, metalness: 0.3 }), 0.33, h - 2.6, 0));
    g.add(box(0.3, 0.06, 0.3, m.darkAlu, 0.33, h - 2.2, 0));
    // street lamp arm
    const arm = new THREE.Group();
    arm.add(cyl(0.04, 0.04, 1.5, 8, new THREE.MeshStandardMaterial({ color: 0x9aa0a4, roughness: 0.4, metalness: 0.4 }), 0.75, 0, 0).rotateZ(Math.PI / 2));
    arm.add(box(0.5, 0.09, 0.22, new THREE.MeshStandardMaterial({ color: 0xb9c0c4, roughness: 0.4, metalness: 0.4 }), 1.45, -0.02, 0));
    arm.add(box(0.44, 0.02, 0.18, m.lightSoft, 1.45, -0.075, 0));
    arm.position.set(0, 6.4, 0.05);
    g.add(arm);
    // small signs on the pole
    g.add(plane(0.22, 0.62, graphicMaterial(panelTexture(128, 360, (ctx) => {
        ctx.fillStyle = '#f4f2e6';
        ctx.fillRect(0, 0, 128, 360);
        ctx.fillStyle = '#1f4f8f';
        ctx.textAlign = 'center';
        ctx.font = `700 44px ${JP}`;
        ctx.fillText('三丁目', 64, 60);
        ctx.fillStyle = '#333';
        ctx.font = `500 34px ${JP}`;
        ctx.fillText('2-14', 64, 120);
        ctx.fillText('ひかり', 64, 170);
        ctx.fillText('マート', 64, 215);
    }), { rough: 0.7 }), 0.14, 2.3, 0.02));
    g.position.set(x, 0, z);
    return g;
}
/* --------------------------------------------------------------- */
/* site                                                             */
/* --------------------------------------------------------------- */
export function buildSite(m) {
    const g = new THREE.Group();
    g.name = 'site';
    const lights = [];
    const add = (o) => { g.add(o); return o; };
    /* ground */
    const ground = plane(160, 160, m.asphaltMat, 0, 0, 0, 0, -Math.PI / 2, 'ground');
    ground.receiveShadow = true;
    add(ground);
    /* concrete apron in front of the store */
    add(box(19.6, 0.035, 4.1, m.apronMat, 0, 0.0175, 8.2, 'apron'));
    add(box(0.12, 0.045, 4.1, new THREE.MeshStandardMaterial({ color: 0xb4b2aa, roughness: 0.85 }), -9.86, 0.022, 8.2));
    add(box(0.12, 0.045, 4.1, new THREE.MeshStandardMaterial({ color: 0xb4b2aa, roughness: 0.85 }), 9.86, 0.022, 8.2));
    // kerb line where the apron meets the parking area
    add(box(19.8, 0.09, 0.16, new THREE.MeshStandardMaterial({ color: 0x9c9991, roughness: 0.9 }), 0, 0.045, 10.28, 'curb'));
    /* parking lines */
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xf4f1e6, roughness: 0.62, transparent: true, alphaMap: lineAlpha() });
    const xs = [-6.3, -3.8, -1.3, 1.2, 3.7];
    for (const x of xs)
        add(box(0.16, 0.012, 5.5, lineMat, x, 0.013, 13.0, 'parkingLine'));
    add(box(10.1, 0.012, 0.16, lineMat, -(6.3 - 3.7) / 2, 0.013, 15.7, 'parkingLine'));
    add(box(10.1, 0.012, 0.12, lineMat, -(6.3 - 3.7) / 2, 0.013, 10.35, 'parkingLineStop'));
    // wheel stops
    for (let i = 0; i < xs.length - 1; i++) {
        const cx = (xs[i] + xs[i + 1]) / 2;
        add(rbox(0.62, 0.13, 0.16, 0.03, new THREE.MeshStandardMaterial({ color: 0xb9b6aa, roughness: 0.9 }), cx, 0.065, 15.35, 2, 'wheelStop'));
        add(box(0.62, 0.03, 0.03, new THREE.MeshStandardMaterial({ color: 0xd8d4c4, roughness: 0.8 }), cx, 0.10, 15.28));
    }
    /* road strip + kerb at the front boundary */
    add(box(80, 0.03, 5.2, m.asphaltMat, 0, 0.015, 21.8, 'road'));
    add(box(80, 0.14, 0.3, new THREE.MeshStandardMaterial({ color: 0xa8a79f, roughness: 0.9 }), 0, 0.07, 19.45, 'kerb'));
    add(box(80, 0.012, 0.14, lineMat, 0, 0.032, 20.4, 'edgeLine'));
    /* ambient occlusion strips where the building meets the ground */
    const aoFrontCv = panelTexture(64, 256, (ctx) => {
        const grd = ctx.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0, 'rgba(0,0,0,0.9)');
        grd.addColorStop(0.30, 'rgba(0,0,0,0.45)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 256);
    });
    const aoFrontMat = new THREE.MeshBasicMaterial({ map: tex(aoFrontCv, { clamp: true }), transparent: true, opacity: 0.7, depthWrite: false });
    const aoFront = new THREE.Mesh(new THREE.PlaneGeometry(16.0, 1.15), aoFrontMat);
    aoFront.rotation.x = -Math.PI / 2;
    aoFront.position.set(0, 0.024, 6.85);
    add(aoFront);
    const aoSideCv = panelTexture(256, 64, (ctx) => {
        const grd = ctx.createLinearGradient(0, 0, 256, 0);
        grd.addColorStop(0, 'rgba(0,0,0,0.9)');
        grd.addColorStop(0.30, 'rgba(0,0,0,0.45)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 256, 64);
    });
    const aoSideMat = new THREE.MeshBasicMaterial({ map: tex(aoSideCv, { clamp: true }), transparent: true, opacity: 0.6, depthWrite: false });
    const aoSide = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 14.6), aoSideMat);
    aoSide.rotation.x = -Math.PI / 2;
    aoSide.position.set(7.42, 0.024, -2.0);
    add(aoSide);
    /* light pools (cheap area-light fake) */
    const pool = poolTexture(0.5);
    const wallPool = new THREE.Mesh(new THREE.PlaneGeometry(14.2, 3.0), additive(pool, 0.15));
    wallPool.rotation.x = -Math.PI / 2;
    wallPool.position.set(0, 0.045, 7.55);
    add(wallPool);
    const doorPool = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 4.6), additive(pool, 0.14));
    doorPool.rotation.x = -Math.PI / 2;
    doorPool.position.set(0, 0.046, 8.6);
    add(doorPool);
    const vendingPool = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), additive(poolTexture(0.42, '215,238,255'), 0.4));
    vendingPool.rotation.x = -Math.PI / 2;
    vendingPool.position.set(8.9, 0.047, 2.6);
    add(vendingPool);
    /* vending corner against the east wall */
    const vm1 = vendingMachine(m, 7.68, 4.40);
    vm1.rotation.y = -0.46;
    add(vm1);
    const vm2 = vendingMachine(m, 7.68, 3.36);
    vm2.rotation.y = -0.46;
    add(vm2);
    const ice = iceChest(m, 7.70, 2.22);
    ice.rotation.y = -0.30;
    add(ice);
    const rec = recycleStation(m, 7.78, 0.42);
    rec.rotation.y = -0.25;
    add(rec);
    // pads
    add(box(2.0, 0.06, 6.0, m.concreteMat, 7.55, 0.03, 2.2, 'vendingPad'));
    // wall-pack lights over the vending corner
    for (const z of [4.0, 1.2]) {
        add(box(0.16, 0.16, 0.34, m.darkAlu, 7.02, 2.62, z, 'wallPack'));
        add(box(0.05, 0.03, 0.28, m.lightSoft, 7.08, 2.55, z));
        const s = new THREE.SpotLight(0xffe6c0, 15, 8.0, Math.PI * 0.36, 0.7, 1.8);
        s.position.set(7.15, 2.55, z);
        s.target.position.set(8.5, 0, z + 0.2);
        lights.push(s, s.target);
    }
    /* entrance props */
    add(aFrame(m, -3.5, 7.45, 0.22));
    add(noboriFlag(G.nobori('onigiri'), -5.5, 7.5));
    add(noboriFlag(G.nobori('coffee'), -4.6, 7.8));
    const nb = noboriFlag(G.nobori('onigiri'), 6.1, 7.75);
    nb.scale.setScalar(0.9);
    add(nb);
    /* ashtray stand */
    const ashtray = new THREE.Group();
    ashtray.add(cyl(0.16, 0.19, 0.9, 12, new THREE.MeshStandardMaterial({ color: 0x4c4f52, roughness: 0.6, metalness: 0.3 }), 0, 0.45, 0));
    ashtray.add(cyl(0.19, 0.19, 0.08, 12, m.stainless, 0, 0.92, 0));
    ashtray.add(cyl(0.15, 0.15, 0.02, 12, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 }), 0, 0.965, 0));
    ashtray.position.set(2.35, 0, 7.05);
    add(ashtray);
    /* parking sign near the entrance of the lot */
    const psign = new THREE.Group();
    psign.add(cyl(0.035, 0.035, 2.4, 8, new THREE.MeshStandardMaterial({ color: 0x9aa0a4, roughness: 0.4, metalness: 0.4 }), 0, 1.2, 0));
    psign.add(plane(0.44, 0.44, graphicMaterial(G.parkingSign(), { emissive: 0.06, rough: 0.6 }), 0, 2.28, 0.02));
    psign.add(box(0.5, 0.5, 0.04, m.darkAlu, 0, 2.28, 0));
    psign.position.set(13.6, 0, 19.8);
    add(psign);
    /* bicycle rack + two simple bikes */
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x8a9094, roughness: 0.45, metalness: 0.5 });
    for (let i = 0; i < 3; i++) {
        const x = -8.9;
        const z = 12.6 + i * 0.9;
        const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 8, 20, Math.PI), rackMat);
        hoop.position.set(x, 0.35, z);
        hoop.rotation.y = Math.PI / 2;
        add(hoop);
    }
    const bike = new THREE.Group();
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x5d6a74, roughness: 0.4, metalness: 0.55 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1c1e, roughness: 0.85 });
    const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 8, 26), wheelMat);
    w1.position.set(0, 0.33, 0.52);
    bike.add(w1);
    const w2 = w1.clone();
    w2.position.z = -0.52;
    bike.add(w2);
    bike.add(tube(new THREE.Vector3(0, 0.33, 0.52), new THREE.Vector3(0, 0.78, 0.12), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 0.33, -0.52), new THREE.Vector3(0, 0.78, -0.18), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 0.78, -0.18), new THREE.Vector3(0, 0.78, 0.12), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 0.78, 0.12), new THREE.Vector3(0, 0.33, 0.52), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 0.78, -0.18), new THREE.Vector3(0, 0.33, 0.52), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 0.33, -0.52), new THREE.Vector3(0, 1.02, -0.62), 0.02, tubeMat));
    bike.add(tube(new THREE.Vector3(0, 1.02, -0.62), new THREE.Vector3(0, 1.02, -0.2), 0.018, tubeMat));
    bike.add(box(0.42, 0.04, 0.05, new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.6 }), 0, 1.06, 0.16));
    bike.add(box(0.18, 0.04, 0.12, new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.6 }), 0, 0.86, -0.3));
    bike.position.set(-8.3, 0, 13.0);
    bike.rotation.y = 0.12;
    add(bike);
    const bike2 = bike.clone();
    bike2.position.set(-8.15, 0, 14.1);
    bike2.rotation.y = -0.1;
    add(bike2);
    /* parked kei car */
    add(keiCar(m, -6.0, 12.9, Math.PI + 0.12));
    /* utility pole + wires + street light */
    add(utilityPole(m, -8.2, 13.4, 9.4));
    add(utilityPole(m, 25, -13.0, 9.0));
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.85 });
    const p1 = new THREE.Vector3(-8.2, 8.5, 13.4);
    const p2 = new THREE.Vector3(25, 8.2, -13.0);
    for (const dy of [0, -0.55, -1.1]) {
        const mid = p1.clone().lerp(p2, 0.5);
        mid.y -= 1.1;
        const curve = new THREE.CatmullRomCurve3([p1.clone().setY(p1.y + dy), mid.setY(mid.y + dy), p2.clone().setY(p2.y + dy)]);
        add(new THREE.Mesh(new THREE.TubeGeometry(curve, 26, 0.014, 5, false), wireMat));
    }
    // service drop to the store
    const drop = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8.2, 7.9, 13.4),
        new THREE.Vector3(-4.5, 6.0, 7.0),
        new THREE.Vector3(-1.0, 4.7, 5.2),
    ]);
    add(new THREE.Mesh(new THREE.TubeGeometry(drop, 22, 0.012, 5, false), wireMat));
    const lampLight = new THREE.SpotLight(0xffeccb, 55, 26, Math.PI * 0.32, 0.65, 1.7);
    lampLight.position.set(-6.75, 6.4, 13.45);
    lampLight.target.position.set(-1.5, 0, 15.0);
    lights.push(lampLight, lampLight.target);
    const lampPool = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), additive(poolTexture(0.4), 0.34));
    lampPool.rotation.x = -Math.PI / 2;
    lampPool.position.set(-2.2, 0.02, 15.0);
    add(lampPool);
    /* hedges + boundary walls */
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x1c2a1c, roughness: 0.95 });
    const R = rng(707);
    const hedge = (x, z, len, rotY = 0) => {
        const h = new THREE.Group();
        h.position.set(x, 0, z);
        h.rotation.y = rotY;
        h.add(rbox(0.8, 0.95, len, 0.3, hedgeMat, 0, 0.48, 0, 3));
        for (let i = 0; i < len * 2.2; i++) {
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.28 + R() * 0.16, 8, 6), hedgeMat);
            s.position.set((R() - 0.5) * 0.5, 0.95 + R() * 0.16, -len / 2 + R() * len);
            h.add(s);
        }
        return h;
    };
    add(hedge(11.9, 10.5, 8.5));
    add(hedge(-10.4, 13.5, 11.0));
    add(box(0.2, 0.55, 9.0, new THREE.MeshStandardMaterial({ color: 0x8d8a80, roughness: 0.9 }), 12.15, 0.28, 10.5, 'boundaryWall'));
    /* neighbouring buildings */
    // right: 3 storey apartment block
    const aptMat = facadeMaterial(11, 0.24, '#43474b');
    const apt = new THREE.Group();
    apt.add(box(9.0, 8.6, 15.0, aptMat, 0, 4.3, 0));
    for (let f = 1; f <= 3; f++) {
        apt.add(box(9.2, 0.14, 15.2, new THREE.MeshStandardMaterial({ color: 0x585c5f, roughness: 0.9 }), 0, f * 2.55, 0));
        // balcony slab + railing along the lot-facing side
        apt.add(box(1.05, 0.12, 14.6, new THREE.MeshStandardMaterial({ color: 0x6e7274, roughness: 0.85 }), -4.95, f * 2.55 + 0.05, 0));
        for (let k = 0; k < 18; k++) {
            apt.add(box(0.04, 0.9, 0.04, new THREE.MeshStandardMaterial({ color: 0x8b9092, roughness: 0.6, metalness: 0.3 }), -5.42, f * 2.55 + 0.55, -6.8 + k * 0.8));
        }
        apt.add(box(0.06, 0.06, 14.6, new THREE.MeshStandardMaterial({ color: 0x9aa0a2, roughness: 0.5, metalness: 0.4 }), -5.42, f * 2.55 + 1.0, 0));
    }
    apt.add(box(9.0, 0.3, 15.0, new THREE.MeshStandardMaterial({ color: 0x363a3d, roughness: 0.9 }), 0, 8.75, 0));
    apt.add(cyl(0.8, 0.8, 1.4, 14, new THREE.MeshStandardMaterial({ color: 0x9aa0a2, roughness: 0.7 }), 2.0, 9.6, -3.0));
    // entrance canopy + name plate
    apt.add(box(2.2, 0.12, 1.4, new THREE.MeshStandardMaterial({ color: 0x505456, roughness: 0.8 }), -4.6, 2.5, 5.6));
    apt.add(box(0.06, 1.0, 0.5, m.whiteAluDull, -4.55, 1.9, 5.6));
    apt.position.set(15.6, 0, 1.0);
    add(apt);
    // left: low shop / house with a gable roof
    const houseMat = facadeMaterial(29, 0.2, '#4a4740');
    const house = new THREE.Group();
    house.add(box(11, 5.2, 12, houseMat, 0, 2.6, 0));
    const roofGeo = new THREE.CylinderGeometry(0.001, 6.0, 2.0, 4, 1);
    const roofM = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x2a2b2c, roughness: 0.85 }));
    roofM.rotation.y = Math.PI / 4;
    roofM.scale.set(1.1, 1, 0.9);
    roofM.position.set(0, 6.2, 0);
    house.add(roofM);
    house.position.set(-19.5, 0, 1.5);
    add(house);
    // distant blocks
    for (let i = 0; i < 9; i++) {
        const w = 5 + R() * 9, h = 5 + R() * 12, d = 6 + R() * 8;
        const b = box(w, h, d, facadeMaterial(100 + i, 0.22, '#31363b'), -50 + i * 12 + R() * 4, h / 2, -38 - R() * 22);
        add(b);
    }
    /* wet ground streaks + drain + manhole */
    add(cyl(0.36, 0.36, 0.014, 24, new THREE.MeshStandardMaterial({ color: 0x33352f, roughness: 0.55, metalness: 0.4 }), -2.6, 0.012, 11.4, 'manhole'));
    add(box(0.5, 0.02, 0.9, new THREE.MeshStandardMaterial({ color: 0x1d1e1f, roughness: 0.7 }), 4.6, 0.014, 8.6));
    for (let i = 0; i < 5; i++) {
        add(box(0.6 + R() * 0.8, 0.002, 2.5 + R() * 1.4, new THREE.MeshStandardMaterial({
            color: 0x07090a, roughness: 0.22, transparent: true, opacity: 0.17,
        }), -6 + R() * 14, 0.008, 12 + R() * 4));
    }
    /* contact shadow blobs under props */
    const blob = (x, z, w, d) => {
        const mat = new THREE.MeshBasicMaterial({ map: shadowTexture(0.55), transparent: true, depthWrite: false });
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
        p.rotation.x = -Math.PI / 2;
        p.position.set(x, 0.04, z);
        add(p);
    };
    blob(7.6, 2.4, 2.6, 6.4);
    blob(-6.0, 12.9, 2.4, 4.0);
    blob(-2.2, 7.4, 2.2, 1.4);
    return { group: g, lights };
}
