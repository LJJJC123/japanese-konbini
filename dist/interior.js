import * as THREE from 'three';
import { box, rbox, plane, cyl } from './geo.js';
import { graphicMaterial, panelTexture } from './tex.js';
import { JP, LAT, BRAND } from './graphics.js';
import * as G from './graphics.js';
import { rng, tex } from './util.js';
const PROD_COLORS = [
    0xd0392c, 0xf0e6cf, 0xe0a22a, 0x3f8f5c, 0x2f74b5, 0x8a55a8, 0x7a4a28,
    0xf4efe0, 0x2a2c30, 0xd06a86, 0x3fa0a0, 0xe8c84a, 0xc4262f, 0x1f5f9a,
    0xefe4c8, 0xbba36e, 0xf0e6cf, 0xa8382c,
];
function label(text, opts = {}) {
    const { bg = '#ffffff', fg = '#222222', w = 512, h = 256, px = 90 } = opts;
    return graphicMaterial(panelTexture(w, h, (ctx) => {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = fg;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${px}px ${JP}`;
        ctx.fillText(text, w / 2, h / 2);
    }), { rough: 0.6 });
}
/* four packaging looks, built once and shared by every shelf run */
let PROD_MATS = null;
function productMaterials() {
    if (PROD_MATS)
        return PROD_MATS;
    const designs = [
        // red snack box
        (ctx) => {
            ctx.fillStyle = '#f4efe0';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#c0272d';
            ctx.fillRect(0, 0, 256, 96);
            ctx.fillStyle = '#fff';
            ctx.font = `700 46px ${JP}`;
            ctx.textAlign = 'center';
            ctx.fillText('お菓子', 128, 66);
            ctx.fillStyle = '#e8b23a';
            ctx.beginPath();
            ctx.ellipse(128, 166, 68, 46, 0, 0, 6.2832);
            ctx.fill();
            ctx.fillStyle = '#7a3f24';
            ctx.beginPath();
            ctx.ellipse(128, 166, 46, 28, 0, 0, 6.2832);
            ctx.fill();
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(30, 226, 120, 5);
            ctx.fillRect(30, 238, 80, 4);
        },
        // blue drink carton
        (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, '#2d74b8');
            g.addColorStop(1, '#e9f2fa');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(0, 150);
            ctx.bezierCurveTo(70, 120, 170, 190, 256, 140);
            ctx.lineTo(256, 256);
            ctx.lineTo(0, 256);
            ctx.fill();
            ctx.fillStyle = '#123a63';
            ctx.font = `700 40px ${JP}`;
            ctx.textAlign = 'center';
            ctx.fillText('つめた〜い', 128, 80);
            ctx.fillStyle = '#e8b23a';
            ctx.beginPath();
            ctx.arc(128, 210, 26, 0, 6.2832);
            ctx.fill();
        },
        // cream noodle cup
        (ctx) => {
            ctx.fillStyle = '#f6f0dc';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#b8332c';
            ctx.fillRect(0, 46, 256, 24);
            ctx.fillStyle = '#2a2a2a';
            ctx.font = `700 44px ${JP}`;
            ctx.textAlign = 'center';
            ctx.fillText('カップ麺', 128, 122);
            ctx.fillStyle = '#c98a2a';
            ctx.fillRect(52, 146, 152, 70);
            ctx.fillStyle = '#fff';
            ctx.font = `600 30px ${LAT}`;
            ctx.fillText('HOT', 128, 194);
            ctx.fillStyle = '#8a6a2a';
            ctx.fillRect(30, 232, 196, 4);
        },
        // orange pouch
        (ctx) => {
            const g = ctx.createLinearGradient(0, 0, 256, 256);
            g.addColorStop(0, '#e8912b');
            g.addColorStop(1, '#c8412a');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#fff';
            ctx.fillRect(24, 82, 208, 92);
            ctx.fillStyle = '#2a2a2a';
            ctx.font = `700 40px ${JP}`;
            ctx.textAlign = 'center';
            ctx.fillText('スナック', 128, 142);
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(48 + i * 40, 214, 12, 0, 6.2832);
                ctx.fill();
            }
        },
    ];
    PROD_MATS = designs.map((paint) => new THREE.MeshStandardMaterial({
        map: tex(panelTexture(256, 256, paint), { clamp: true }),
        roughness: 0.48, metalness: 0.03,
    }));
    return PROD_MATS;
}
/* one gondola shelving run with instanced products */
function gondola(m, x, zFrom, zTo, w = 1.0, h = 1.44) {
    const g = new THREE.Group();
    g.name = 'gondola';
    const len = zTo - zFrom, zc = (zFrom + zTo) / 2;
    const base = 0.18;
    g.add(box(w, 0.14, len, m.shelfWhite, x, base + 0.07, zc, 'gondolaDeck'));
    g.add(box(w - 0.06, 0.06, len - 0.06, m.shelfGrey, x, base + 0.01, zc));
    g.add(box(0.07, h, len, m.shelfWhite, x, base + h / 2, zc, 'gondolaSpine'));
    g.add(box(w + 0.02, 0.05, len + 0.02, m.shelfGrey, x, base + h + 0.02, zc, 'gondolaTop'));
    const levels = [0.36, 0.70, 1.04, 1.34];
    const rnd = rng(Math.round(x * 100 + zFrom * 7 + 13));
    const items = [];
    levels.forEach((lv, li) => {
        for (const side of [-1, 1]) {
            const shelfX = x + side * w * 0.25;
            const depth = w * 0.46;
            g.add(box(depth, 0.022, len, m.shelfWhite, shelfX, base + lv, zc, 'gondolaShelf'));
            // price rail
            g.add(box(0.02, 0.055, len - 0.04, m.whitePaint, shelfX + side * (depth / 2 + 0.005), base + lv + 0.01, zc, 'priceRail'));
            // products
            let z = zFrom + 0.08;
            let runLeft = 0;
            let runColor = PROD_COLORS[0];
            let runH = 0.16;
            while (z < zTo - 0.08) {
                if (runLeft <= 0) {
                    runLeft = 2 + Math.floor(rnd() * 4);
                    runColor = PROD_COLORS[Math.floor(rnd() * PROD_COLORS.length)];
                    runH = 0.16 + rnd() * 0.13 + (li === 0 ? 0.04 : 0);
                }
                runLeft--;
                const bw = 0.085 + rnd() * 0.05;
                const bh = runH * (0.82 + rnd() * 0.12);
                const bd = depth * (0.62 + rnd() * 0.3);
                const px = shelfX + side * (depth * 0.02) + (rnd() - 0.5) * 0.02;
                items.push({
                    pos: [px, base + lv + 0.017 + bh / 2, z + bw / 2],
                    scale: [bd, bh, bw],
                    color: runColor,
                });
                z += bw + 0.012 + rnd() * 0.012;
            }
        }
    });
    const mats = productMaterials();
    const buckets = [[], [], [], []];
    items.forEach((it, i) => buckets[i % 4].push(it));
    const dummy = new THREE.Object3D();
    buckets.forEach((list, vi) => {
        if (!list.length)
            return;
        const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mats[vi], list.length);
        list.forEach((it, i) => {
            dummy.position.set(...it.pos);
            dummy.rotation.set(0, (i % 3 - 1) * 0.03, 0);
            dummy.scale.set(...it.scale);
            dummy.updateMatrix();
            inst.setMatrixAt(i, dummy.matrix);
        });
        inst.instanceMatrix.needsUpdate = true;
        inst.name = 'products';
        g.add(inst);
    });
    return g;
}
function magazineRack(m, x0, z, bays = 5) {
    const g = new THREE.Group();
    g.name = 'magazineRack';
    const W = 0.62, H = 1.06;
    const totalW = bays * 1.02;
    g.add(box(totalW, 0.10, W, m.shelfWhite, x0 + totalW / 2 - 0.5, 0.23, z));
    g.add(box(totalW, 0.06, W - 0.08, m.shelfGrey, x0 + totalW / 2 - 0.5, 0.30, z));
    const coverMats = Array.from({ length: 8 }, (_, i) => graphicMaterial(G.magazineCover(i), { rough: 0.65 }));
    for (let b = 0; b < bays; b++) {
        const cx = x0 + b * 1.02;
        // rack frame: back panel with tilted shelves
        g.add(box(0.96, 0.95, 0.05, m.shelfWhite, cx, 0.66, z - 0.22));
        for (let row = 0; row < 3; row++) {
            const y = 0.40 + row * 0.30;
            const tilt = -0.42;
            const shelf = box(0.94, 0.03, 0.30, m.shelfWhite, cx, y, z - 0.10);
            shelf.rotation.x = tilt;
            g.add(shelf);
            for (let c = 0; c < 4; c++) {
                const covW = 0.205, covH = 0.285;
                const cover = plane(covW, covH, coverMats[(b * 4 + row + c) % coverMats.length], cx - 0.36 + c * 0.225, y + 0.155, z - 0.055 + row * 0.012, 0, 0);
                cover.rotation.x = tilt;
                cover.position.y = y + 0.16;
                g.add(cover);
            }
        }
    }
    // side cheeks
    g.add(box(0.05, 1.0, W, m.shelfWhite, x0 - 0.5, 0.68, z));
    g.add(box(0.05, 1.0, W, m.shelfWhite, x0 + totalW - 0.5, 0.68, z));
    // header sign
    const hdr = graphicMaterial(panelTexture(1024, 128, (ctx) => {
        ctx.fillStyle = BRAND.green;
        ctx.fillRect(0, 0, 1024, 128);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 72px ${JP}`;
        ctx.fillText('雑誌・コミック', 512, 92);
    }), { rough: 0.6 });
    const hs = plane(totalW - 0.1, 0.16, hdr, x0 + totalW / 2 - 0.5, 1.16, z + 0.055);
    g.add(hs);
    return g;
}
function drinkWall(m, x0, x1, z) {
    const g = new THREE.Group();
    g.name = 'drinkWall';
    const W = x1 - x0, doors = 6, dw = W / doors;
    const y0 = 0.18, h = 2.16;
    // carcass shell (open front)
    g.add(box(W, h, 0.05, m.shelfWhite, (x0 + x1) / 2, y0 + h / 2, z - 0.34));
    g.add(box(0.06, h, 0.74, m.shelfWhite, x0, y0 + h / 2, z - 0.01));
    g.add(box(0.06, h, 0.74, m.shelfWhite, x1, y0 + h / 2, z - 0.01));
    g.add(box(W, 0.08, 0.74, m.shelfWhite, (x0 + x1) / 2, y0 + h - 0.03, z - 0.01));
    g.add(box(W, 0.12, 0.74, m.shelfWhite, (x0 + x1) / 2, y0 + 0.05, z - 0.01));
    // bright back panel
    g.add(box(W - 0.08, h - 0.20, 0.02, new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xf2fbff, emissiveIntensity: 0.55, roughness: 0.5,
    }), (x0 + x1) / 2, y0 + h / 2, z - 0.30, 'fridgeGlow'));
    const rnd = rng(77);
    const bottleGeo = new THREE.CylinderGeometry(0.036, 0.04, 0.20, 10);
    const capGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8);
    const bottleMat = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05 });
    const shelves = [0.42, 0.86, 1.30, 1.72, 2.02];
    const cols = Math.floor(W / 0.115);
    const bottles = new THREE.InstancedMesh(bottleGeo, bottleMat, cols * shelves.length);
    const caps = new THREE.InstancedMesh(capGeo, bottleMat, cols * shelves.length);
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    let bi = 0;
    for (let s = 0; s < shelves.length; s++) {
        for (let c = 0; c < cols; c++) {
            const bx = x0 + 0.07 + c * ((W - 0.14) / cols);
            const by = y0 + shelves[s] + 0.11;
            dummy.position.set(bx, by, z - 0.20 + (rnd() - 0.5) * 0.05);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 0.85 + rnd() * 0.3, 1);
            dummy.updateMatrix();
            bottles.setMatrixAt(bi, dummy.matrix);
            col.setHex(PROD_COLORS[Math.floor(rnd() * PROD_COLORS.length)]);
            bottles.setColorAt(bi, col);
            dummy.position.set(bx, by + 0.115, dummy.position.z);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            caps.setMatrixAt(bi, dummy.matrix);
            col.offsetHSL(0, 0, 0.12);
            caps.setColorAt(bi, col);
            bi++;
        }
        // shelf glass plate + price strip
        g.add(box(W - 0.1, 0.03, 0.5, new THREE.MeshPhysicalMaterial({
            color: 0xdff0f7, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.35,
        }), (x0 + x1) / 2, y0 + shelves[s], z - 0.16));
        g.add(box(W - 0.1, 0.05, 0.02, m.whitePaint, (x0 + x1) / 2, y0 + shelves[s] + 0.02, z + 0.24));
    }
    bottles.count = bi;
    caps.count = bi;
    bottles.instanceMatrix.needsUpdate = true;
    g.add(bottles, caps);
    // door frames + glass
    for (let d = 0; d <= doors; d++) {
        g.add(box(0.05, h, 0.06, m.whiteAlu, x0 + d * dw, y0 + h / 2, z + 0.30));
    }
    g.add(box(W, 0.10, 0.10, m.whiteAlu, (x0 + x1) / 2, y0 + h - 0.02, z + 0.30));
    g.add(box(W, 0.14, 0.10, m.whiteAlu, (x0 + x1) / 2, y0 + 0.06, z + 0.30));
    for (let d = 0; d < doors; d++) {
        const cx = x0 + dw * (d + 0.5);
        const pane = plane(dw - 0.07, h - 0.3, m.glassDark, cx, y0 + h / 2, z + 0.295);
        g.add(pane);
        g.add(box(0.03, 0.42, 0.05, m.stainless, cx + dw / 2 - 0.09, y0 + 1.28, z + 0.335, 'fridgeHandle'));
    }
    // top light strip
    g.add(box(W - 0.2, 0.05, 0.06, m.lightSoft, (x0 + x1) / 2, y0 + 2.10, z + 0.26));
    // little brand strip
    const brand = graphicMaterial(panelTexture(2048, 128, (ctx) => {
        ctx.fillStyle = '#f7f8f2';
        ctx.fillRect(0, 0, 2048, 128);
        ctx.fillStyle = BRAND.green;
        ctx.fillRect(0, 104, 2048, 24);
        ctx.fillStyle = '#26332c';
        ctx.textAlign = 'left';
        ctx.font = `700 62px ${JP}`;
        ctx.fillText('つめた〜い 飲みもの', 40, 78);
        ctx.fillStyle = '#c8342c';
        ctx.textAlign = 'right';
        ctx.font = `700 52px ${JP}`;
        ctx.fillText('100円〜', 2000, 78);
    }), { emissive: 0.15, rough: 0.55 });
    g.add(plane(W - 0.2, 0.13, brand, (x0 + x1) / 2, y0 + 2.255, z + 0.305));
    return g;
}
function frozenCase(m, x0, x1, z) {
    const g = new THREE.Group();
    g.name = 'frozenCase';
    const W = x1 - x0, h = 1.0, y0 = 0.18;
    g.add(rbox(W, h, 0.9, 0.02, m.whiteAluDull, (x0 + x1) / 2, y0 + h / 2, z));
    const glassTop = new THREE.MeshPhysicalMaterial({ color: 0xcfe6ef, roughness: 0.07, metalness: 0, transparent: true, opacity: 0.3 });
    g.add(plane(W - 0.1, 0.8, glassTop, (x0 + x1) / 2, y0 + h + 0.005, z, 0, -Math.PI / 2));
    g.add(box(W, 0.06, 0.06, m.stainless, (x0 + x1) / 2, y0 + h - 0.02, z + 0.45));
    const mats = [0xdfe9f2, 0xf6e6c8, 0xe8d9c0, 0xf2e2e2];
    const rnd = rng(303);
    for (let i = 0; i < 26; i++) {
        const cw = 0.16 + rnd() * 0.1, ch = 0.10 + rnd() * 0.1;
        const mesh = box(cw, ch, 0.2, m.whitePaint, x0 + 0.2 + rnd() * (W - 0.4), y0 + 0.35 + rnd() * 0.3, z - 0.2 + rnd() * 0.3);
        mesh.material = new THREE.MeshStandardMaterial({ color: mats[Math.floor(rnd() * mats.length)], roughness: 0.6 });
        g.add(mesh);
    }
    // cold blue underglow
    g.add(box(W - 0.2, 0.04, 0.7, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9fd8f0, emissiveIntensity: 0.5 }), (x0 + x1) / 2, y0 + 0.24, z));
    return g;
}
function counterRun(m, xFront, z0, z1, depth = 0.95) {
    const g = new THREE.Group();
    g.name = 'counter';
    const h = 0.9, y0 = 0.18;
    const len = z1 - z0, zc = (z0 + z1) / 2;
    g.add(box(depth, h, len, new THREE.MeshStandardMaterial({ color: 0xc9b291, roughness: 0.5 }), xFront + depth / 2, y0 + h / 2, zc, 'counterBody'));
    // kick recess
    g.add(box(depth - 0.12, 0.12, len, m.darkAlu, xFront + depth / 2 + 0.04, y0 + 0.06, zc));
    // stainless top with rolled front edge
    g.add(box(depth + 0.06, 0.05, len + 0.04, m.stainless, xFront + depth / 2, y0 + h + 0.025, zc, 'counterTop'));
    g.add(cyl(0.025, 0.025, len + 0.04, 10, m.stainless, xFront - 0.02, y0 + h + 0.02, zc).rotateX(Math.PI / 2));
    return g;
}
/** A low-poly shopper / clerk: silhouettes with believable proportions. */
function person(o) {
    const g = new THREE.Group();
    g.name = 'person';
    const H = o.h ?? 1.68;
    const s = H / 1.68;
    const skin = new THREE.MeshStandardMaterial({ color: 0xc5a189, roughness: 0.72 });
    const coat = new THREE.MeshStandardMaterial({ color: o.coat, roughness: 0.82 });
    const trouser = new THREE.MeshStandardMaterial({ color: o.trousers, roughness: 0.86 });
    const hair = new THREE.MeshStandardMaterial({ color: o.hair ?? 0x15100e, roughness: 0.9 });
    const shoe = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.7 });
    // legs
    for (const sx of [-0.085, 0.085]) {
        g.add(cyl(0.062 * s, 0.075 * s, 0.82 * s, 8, trouser, sx * s, 0.41 * s, 0));
        const sh = box(0.10 * s, 0.055 * s, 0.25 * s, shoe, sx * s, 0.028 * s, 0.03 * s);
        g.add(sh);
    }
    // torso (coat)
    g.add(rbox(0.36 * s, 0.52 * s, 0.22 * s, 0.05 * s, coat, 0, 1.09 * s, 0, 2));
    // shirt / apron hint
    if (o.shirt !== undefined)
        g.add(box(0.22 * s, 0.24 * s, 0.015, new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.8 }), 0, 1.24 * s, 0.11 * s));
    if (o.apron !== undefined)
        g.add(box(0.30 * s, 0.44 * s, 0.02, new THREE.MeshStandardMaterial({ color: o.apron, roughness: 0.85 }), 0, 1.02 * s, 0.115 * s));
    // shoulders / arms
    for (const sx of [-0.20, 0.20]) {
        const arm = cyl(0.05 * s, 0.045 * s, 0.56 * s, 8, coat, sx * s, 1.02 * s, 0.01 * s);
        arm.rotation.z = sx > 0 ? -0.07 : 0.07;
        g.add(arm);
        g.add(cyl(0.038 * s, 0.038 * s, 0.12 * s, 6, skin, sx * s * 1.06, 0.70 * s, 0.015 * s));
    }
    // neck + head + hair
    g.add(cyl(0.05 * s, 0.05 * s, 0.07 * s, 8, skin, 0, 1.38 * s, 0));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105 * s, 14, 12), skin);
    head.position.set(0, 1.475 * s, 0.005 * s);
    head.scale.set(0.92, 1.08, 0.95);
    g.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.112 * s, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hair);
    cap.position.set(0, 1.487 * s, -0.005 * s);
    cap.rotation.x = -0.18;
    g.add(cap);
    // contact shadow
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.7 * s, 0.55 * s), new THREE.MeshBasicMaterial({
        map: tex(panelTexture(64, 64, (ctx) => {
            const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
            grd.addColorStop(0, 'rgba(0,0,0,0.55)');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 64, 64);
        }), { clamp: true }),
        transparent: true, depthWrite: false,
    }));
    sh.rotation.x = -Math.PI / 2;
    sh.position.set(0, 0.004, 0);
    g.add(sh);
    g.position.set(o.x, 0.18, o.z);
    g.rotation.y = o.ry;
    return g;
}
export function buildInterior(m) {
    const g = new THREE.Group();
    g.name = 'interior';
    const lights = [];
    const add = (o) => { g.add(o); return o; };
    /* ---------- gondola runs ---------- */
    add(gondola(m, -4.1, -6.5, 0.75));
    add(gondola(m, -1.85, -6.5, 0.75));
    add(gondola(m, 0.55, -6.5, -2.2, 0.9));
    /* ---------- magazine corner ---------- */
    add(magazineRack(m, -6.1, 4.95, 5));
    /* ---------- promotion table ---------- */
    const promo = new THREE.Group();
    promo.name = 'promoTable';
    promo.add(box(1.7, 0.06, 0.85, m.shelfWhite, 3.6, 0.96, 4.5));
    for (const [dx, dz] of [[-0.78, -0.35], [0.78, -0.35], [-0.78, 0.35], [0.78, 0.35]]) {
        promo.add(cyl(0.025, 0.025, 0.78, 8, m.darkAlu, 3.6 + dx, 0.57, 4.5 + dz));
    }
    promo.add(box(1.6, 0.10, 0.75, m.shelfWhite, 3.6, 0.87, 4.5));
    const rnd = rng(515);
    for (let i = 0; i < 22; i++) {
        const mesh = box(0.16, 0.14, 0.12, m.whitePaint, 2.95 + rnd() * 1.3, 1.06 + Math.floor(rnd() * 2) * 0.13, 4.15 + rnd() * 0.7);
        mesh.material = new THREE.MeshStandardMaterial({ color: PROD_COLORS[Math.floor(rnd() * PROD_COLORS.length)], roughness: 0.5 });
        promo.add(mesh);
    }
    const promoSign = graphicMaterial(panelTexture(512, 768, (ctx) => {
        ctx.fillStyle = '#f7d34a';
        ctx.fillRect(0, 0, 512, 768);
        ctx.fillStyle = '#c8342c';
        ctx.textAlign = 'center';
        ctx.font = `800 100px ${JP}`;
        ctx.fillText('新発売', 256, 160);
        ctx.fillStyle = '#20241f';
        ctx.font = `800 84px ${JP}`;
        ctx.fillText('からあげ', 256, 300);
        ctx.fillText('フェア', 256, 400);
        ctx.fillStyle = '#c8342c';
        ctx.font = `800 120px ${LAT}`;
        ctx.fillText('¥216', 256, 580);
        ctx.fillStyle = '#20241f';
        ctx.font = `500 34px ${JP}`;
        ctx.fillText('揚げたて 16時より', 256, 680);
    }), { emissive: 0.12, rough: 0.6 });
    promo.add(box(0.5, 0.72, 0.02, m.shelfWhite, 3.6, 1.5, 4.5));
    promo.add(plane(0.48, 0.70, promoSign, 3.6, 1.5, 4.515));
    add(promo);
    /* ---------- drink wall + frozen case ---------- */
    add(drinkWall(m, -6.3, 0.75, -9.25));
    add(frozenCase(m, 1.15, 5.9, -9.25));
    /* ---------- service counter ---------- */
    add(counterRun(m, 2.45, -3.9, 1.9, 0.95));
    // low return at the far end
    add(box(1.35, 0.9, 0.95, new THREE.MeshStandardMaterial({ color: 0xe8e5da, roughness: 0.55 }), 4.35, 0.63, -3.9));
    add(box(1.35, 0.05, 0.95, m.stainless, 4.35, 1.10, -3.9));
    // cigarette wall behind the counter
    const cigMat = graphicMaterial(G.cigaretteWall(), { emissive: 0.16, rough: 0.4 });
    add(box(0.12, 1.62, 3.5, m.darkAlu, 6.56, 1.94, -1.2, 'cigaretteWall'));
    add(plane(3.44, 1.56, cigMat, 6.49, 1.94, -1.2, -Math.PI / 2));
    add(box(0.05, 0.06, 3.5, m.lightSoft, 6.45, 2.78, -1.2));
    add(box(0.35, 0.06, 3.5, m.stainless, 6.45, 1.12, -1.2));
    // back counter under the cigarette wall
    add(box(0.55, 0.9, 3.5, m.shelfWhite, 6.33, 0.63, -1.2));
    add(box(0.6, 0.05, 3.55, m.stainless, 6.33, 1.10, -1.2));
    /* ---------- staff shelving along the east wall ---------- */
    for (let zI = 0; zI < 4; zI++) {
        const z = -7.2 + zI * 0.9;
        add(box(0.42, 1.9, 0.92, m.shelfWhite, 6.5, 1.13, z));
        for (let r = 0; r < 3; r++) {
            add(box(0.44, 0.03, 0.9, m.shelfGrey, 6.5, 0.52 + r * 0.55, z));
            for (let k = 0; k < 4; k++) {
                const c = box(0.22, 0.20, 0.16, m.whitePaint, 6.42, 0.64 + r * 0.55, z - 0.32 + k * 0.2);
                c.material = new THREE.MeshStandardMaterial({ color: [0xd8d2c0, 0xc9b48a, 0xe8e4d8, 0x9aa6ad][(r + k) % 4], roughness: 0.6 });
                add(c);
            }
        }
    }
    /* ---------- counter equipment ---------- */
    // POS
    const pos = new THREE.Group();
    pos.name = 'pos';
    pos.add(box(0.34, 0.26, 0.05, m.darkAlu, 0, 0.30, 0.02));
    pos.add(box(0.30, 0.22, 0.02, new THREE.MeshStandardMaterial({ color: 0x1b2733, emissive: 0x2b6a8f, emissiveIntensity: 0.55, roughness: 0.3 }), 0, 0.30, 0.05));
    pos.add(box(0.30, 0.04, 0.22, m.darkAlu, 0, 0.02, 0.06));
    pos.add(box(0.05, 0.16, 0.05, m.darkAlu, 0, 0.16, 0.02));
    pos.position.set(2.95, 1.12, -1.05);
    pos.rotation.y = -0.35;
    add(pos);
    // card terminal
    add(box(0.13, 0.10, 0.18, m.darkAlu, 2.75, 1.19, -0.55).rotateY(-0.2));
    // hot snack warmer
    const warmer = new THREE.Group();
    warmer.name = 'hotWarmer';
    warmer.add(box(0.62, 0.42, 0.40, new THREE.MeshStandardMaterial({ color: 0x8d9298, roughness: 0.35, metalness: 0.6 }), 0, 0.21, 0));
    warmer.add(box(0.56, 0.30, 0.34, new THREE.MeshPhysicalMaterial({ color: 0xfff4dc, roughness: 0.05, transparent: true, opacity: 0.28, emissive: 0xffd28a, emissiveIntensity: 0.35 }), 0, 0.34, 0));
    for (let i = 0; i < 9; i++) {
        const fy = 0.26 + Math.floor(i / 3) * 0.09;
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), new THREE.MeshStandardMaterial({ color: 0xb8752c, roughness: 0.72 }));
        f.position.set(-0.19 + (i % 3) * 0.19, fy, -0.06 + Math.floor(i / 6) * 0.12);
        f.scale.set(1, 0.8, 1.15);
        warmer.add(f);
    }
    warmer.position.set(3.05, 1.15, 1.25);
    add(warmer);
    // oden pot
    const oden = new THREE.Group();
    oden.name = 'odenPot';
    oden.add(box(0.55, 0.16, 0.34, m.stainless, 0, 0.08, 0));
    oden.add(box(0.51, 0.02, 0.30, new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.25, metalness: 0.1 }), 0, 0.15, 0));
    for (let i = 0; i < 8; i++) {
        const it = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), new THREE.MeshStandardMaterial({ color: [0xe8dcc0, 0xd8b878, 0x8a6a42, 0xf2e6cc][i % 4], roughness: 0.6 }));
        it.position.set(-0.21 + (i % 4) * 0.14, 0.17, i < 4 ? -0.07 : 0.07);
        oden.add(it);
    }
    oden.add(box(0.06, 0.04, 0.10, m.stainless, 0, 0.18, 0.2));
    oden.position.set(2.95, 1.15, 1.62);
    add(oden);
    // coffee machine
    const coffee = new THREE.Group();
    coffee.name = 'coffeeMachine';
    coffee.add(box(0.42, 0.66, 0.44, new THREE.MeshStandardMaterial({ color: 0x2c3136, roughness: 0.4, metalness: 0.4 }), 0, 0.33, 0));
    coffee.add(box(0.34, 0.26, 0.02, new THREE.MeshStandardMaterial({ color: 0x14304a, emissive: 0x3d8fc0, emissiveIntensity: 0.5, roughness: 0.3 }), 0, 0.44, 0.23));
    coffee.add(box(0.30, 0.16, 0.22, m.darkAlu, 0, 0.14, 0.12));
    coffee.add(cyl(0.035, 0.035, 0.10, 8, m.stainless, -0.06, 0.10, 0.30));
    coffee.add(cyl(0.035, 0.035, 0.10, 8, m.stainless, 0.06, 0.10, 0.30));
    for (let i = 0; i < 5; i++)
        coffee.add(cyl(0.032, 0.032, 0.05, 8, m.whitePaint, 0.02 + i * 0.005, 0.28 + i * 0.02, 0.18).rotateX(0.4));
    coffee.position.set(4.15, 1.15, 0.55);
    add(coffee);
    // promo sticker on the counter face
    const counterPop = graphicMaterial(panelTexture(512, 256, (ctx) => {
        ctx.fillStyle = '#f6f2e2';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#c8342c';
        ctx.lineWidth = 10;
        ctx.strokeRect(6, 6, 500, 244);
        ctx.fillStyle = '#c8342c';
        ctx.textAlign = 'center';
        ctx.font = `800 74px ${JP}`;
        ctx.fillText('からあげ', 256, 106);
        ctx.fillStyle = '#20241f';
        ctx.font = `600 44px ${JP}`;
        ctx.fillText('揚げたて 216円', 256, 176);
        ctx.fillStyle = '#8a8375';
        ctx.font = `400 26px ${JP}`;
        ctx.fillText('16時より 順次販売', 256, 220);
    }), { rough: 0.7, emissive: 0.05 });
    add(plane(0.7, 0.36, counterPop, 2.44, 0.78, 0.35, -Math.PI / 2));
    /* ---------- baskets + umbrella stand ---------- */
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xd94a3a, roughness: 0.6 });
    const basketStack = new THREE.Group();
    basketStack.name = 'baskets';
    for (let i = 0; i < 7; i++)
        basketStack.add(box(0.44, 0.055, 0.32, basketMat, 0, 0.04 + i * 0.055, 0));
    basketStack.position.set(1.85, 0.18, 4.95);
    add(basketStack);
    const umb = new THREE.Group();
    umb.name = 'umbrellaStand';
    umb.add(cyl(0.16, 0.14, 0.45, 14, m.stainless, 0, 0.225, 0));
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const u = cyl(0.014, 0.014, 0.95, 6, new THREE.MeshStandardMaterial({ color: i % 2 ? 0x2b3a4a : 0x6a2a2a, roughness: 0.5 }), Math.cos(a) * 0.055, 0.72, Math.sin(a) * 0.055);
        u.rotation.z = Math.cos(a) * 0.12;
        u.rotation.x = -Math.sin(a) * 0.12;
        umb.add(u);
    }
    umb.position.set(-1.95, 0.18, 5.15);
    add(umb);
    /* ---------- ATM / copy / parcel ---------- */
    const atm = new THREE.Group();
    atm.name = 'atm';
    atm.add(rbox(0.62, 1.55, 1.02, 0.02, m.whiteAluDull, 0, 0.775, 0));
    const atmFace = graphicMaterial(G.atmFront(), { emissive: 0.2, rough: 0.45 });
    atm.add(plane(0.95, 1.35, atmFace, 0.315, 0.85, 0, Math.PI / 2));
    atm.add(box(0.1, 0.10, 0.6, m.lightSoft, 0.30, 1.62, 0));
    atm.position.set(-6.28, 0.18, 1.15);
    atm.rotation.y = 0;
    add(atm);
    // copy machine
    const copier = new THREE.Group();
    copier.name = 'copier';
    copier.add(rbox(0.66, 1.02, 1.15, 0.02, new THREE.MeshStandardMaterial({ color: 0xe7e8e4, roughness: 0.55 }), 0, 0.51, 0));
    copier.add(box(0.58, 0.05, 0.42, m.darkAlu, 0.02, 0.92, -0.1));
    copier.add(box(0.52, 0.22, 0.05, new THREE.MeshStandardMaterial({ color: 0x1a2b3a, emissive: 0x2f6c96, emissiveIntensity: 0.45, roughness: 0.3 }), 0.06, 0.72, 0.59));
    copier.add(box(0.3, 0.1, 0.18, m.darkAlu, 0.06, 0.45, 0.55));
    copier.add(box(0.44, 0.3, 0.02, m.whitePaint, -0.02, 0.35, 0.575));
    copier.position.set(-6.24, 0.18, -0.55);
    add(copier);
    // parcel counter sign on the west wall
    const parcelSign = graphicMaterial(panelTexture(512, 160, (ctx) => {
        ctx.fillStyle = '#f4c31d';
        ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = '#20242a';
        ctx.textAlign = 'center';
        ctx.font = `800 68px ${JP}`;
        ctx.fillText('宅配便 受付', 256, 108);
    }), { emissive: 0.1, rough: 0.6 });
    add(plane(1.0, 0.31, parcelSign, -6.63, 2.05, -0.55, Math.PI / 2));
    // floor guide arrows
    const arrowMat = graphicMaterial(panelTexture(256, 256, (ctx) => {
        ctx.fillStyle = '#f4f2e8';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = BRAND.green;
        ctx.beginPath();
        ctx.moveTo(128, 40);
        ctx.lineTo(210, 150);
        ctx.lineTo(46, 150);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(100, 150, 56, 60);
    }), { rough: 0.7 });
    add(plane(0.55, 0.55, arrowMat, 0.1, 0.185, 5.55, 0, -Math.PI / 2));
    /* ---------- people ---------- */
    // shopper browsing the magazines, seen from behind
    add(person({ x: -3.15, z: 3.86, ry: Math.PI + 0.28, coat: 0x232a35, trousers: 0x171a1f, hair: 0x100c0a, h: 1.63 }));
    // clerk behind the till
    add(person({ x: 3.95, z: -2.15, ry: -Math.PI / 2 - 0.25, coat: 0xdfe3dd, trousers: 0x1b1d22, shirt: 0xf2f3ee, apron: 0x2f6b4a, hair: 0x120e0c, h: 1.72 }));
    /* ---------- contact shadows (cheap AO) ---------- */
    const shadowCanvas = panelTexture(128, 128, (ctx) => {
        const grd = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
        grd.addColorStop(0, 'rgba(0,0,0,0.62)');
        grd.addColorStop(0.55, 'rgba(0,0,0,0.30)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 128, 128);
    });
    const shadowTex = tex(shadowCanvas, { clamp: true });
    const aoMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.9, depthWrite: false });
    const ao = (x, z, w, d) => {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), aoMat);
        p.rotation.x = -Math.PI / 2;
        p.position.set(x, 0.186, z);
        add(p);
    };
    ao(-4.1, -2.9, 2.2, 8.5);
    ao(-1.85, -2.9, 2.2, 8.5);
    ao(0.55, -4.35, 2.0, 5.2);
    ao(-3.5, 4.95, 5.6, 1.5);
    ao(3.05, -1.0, 1.8, 6.6);
    ao(4.35, -3.9, 1.6, 1.4);
    ao(3.6, 4.5, 2.3, 1.4);
    /* ---------- impulse buy + endcap near the till ---------- */
    const endcap = new THREE.Group();
    endcap.name = 'endcap';
    endcap.add(box(1.05, 0.06, 0.5, m.shelfWhite, 0, 0.55, 0));
    endcap.add(box(1.0, 0.04, 0.46, m.shelfGrey, 0, 0.16, 0));
    for (const y of [0.58, 0.88, 1.18]) {
        endcap.add(box(1.05, 0.03, 0.48, m.shelfWhite, 0, y, 0));
        endcap.add(box(1.0, 0.05, 0.02, m.whitePaint, 0, y, 0.25));
        for (let i = 0; i < 8; i++) {
            const c = box(0.10, 0.13, 0.10, m.whitePaint, -0.45 + i * 0.128, y + 0.08, 0.02);
            c.material = new THREE.MeshStandardMaterial({ color: PROD_COLORS[(i * 3 + Math.floor(y * 10)) % PROD_COLORS.length], roughness: 0.5 });
            endcap.add(c);
        }
    }
    endcap.add(box(0.05, 1.1, 0.05, m.shelfWhite, -0.5, 0.75, -0.2));
    endcap.add(box(0.05, 1.1, 0.05, m.shelfWhite, 0.5, 0.75, -0.2));
    endcap.position.set(-4.1, 0.18, 1.02);
    add(endcap);
    /* ---------- hanging promo banners ---------- */
    const bannerDefs = [
        ['新発売', 'からあげ 216円', '#c8342c'],
        ['ポイント', '2倍キャンペーン', '#1a4f9c'],
        ['ホット', 'コーヒー 110円', '#5a3a20'],
    ];
    bannerDefs.forEach(([a, b, col], i) => {
        const cv = panelTexture(384, 900, (ctx) => {
            ctx.fillStyle = '#fbfaf4';
            ctx.fillRect(0, 0, 384, 900);
            ctx.fillStyle = col;
            ctx.fillRect(0, 0, 384, 210);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = `800 96px ${JP}`;
            ctx.fillText(a, 192, 143);
            ctx.fillStyle = '#20241f';
            ctx.font = `700 74px ${JP}`;
            const chars = [...b];
            let line = '';
            const lines = [];
            for (const ch of chars) {
                line += ch;
                if (ctx.measureText(line).width > 320) {
                    lines.push(line);
                    line = '';
                }
            }
            if (line)
                lines.push(line);
            lines.forEach((l, k) => ctx.fillText(l, 192, 330 + k * 100));
            ctx.fillStyle = col;
            ctx.fillRect(0, 830, 384, 70);
            ctx.fillStyle = '#fff';
            ctx.font = `600 40px ${JP}`;
            ctx.fillText('ひかりマート', 192, 878);
        });
        const mat = graphicMaterial(cv, { rough: 0.7, side: THREE.DoubleSide, emissive: 0.08 });
        const x = [2.6, -3.0, 5.0][i];
        const z = [2.05, 1.35, 4.6][i];
        add(plane(0.44, 1.05, mat, x, 2.02, z, 0, 0, 'promoBanner'));
        add(box(0.01, 0.36, 0.01, m.darkAlu, x - 0.2, 2.72, z));
        add(box(0.01, 0.36, 0.01, m.darkAlu, x + 0.2, 2.72, z));
    });
    /* ---------- till sign ---------- */
    const tillMat = graphicMaterial(panelTexture(512, 160, (ctx) => {
        ctx.fillStyle = '#f7f7f0';
        ctx.fillRect(0, 0, 512, 160);
        ctx.strokeStyle = BRAND.green;
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, 502, 150);
        ctx.fillStyle = BRAND.green;
        ctx.textAlign = 'center';
        ctx.font = `700 86px ${JP}`;
        ctx.fillText('レジ・お会計', 256, 112);
    }), { rough: 0.6, side: THREE.DoubleSide });
    add(plane(1.0, 0.31, tillMat, 3.2, 2.45, -2.2, 0, 0, 'tillSign'));
    /* ---------- floor promo board ---------- */
    const board = graphicMaterial(panelTexture(384, 512, (ctx) => {
        ctx.fillStyle = '#f4d03a';
        ctx.fillRect(0, 0, 384, 512);
        ctx.fillStyle = '#c8342c';
        ctx.textAlign = 'center';
        ctx.font = `800 84px ${JP}`;
        ctx.fillText('おでん', 192, 150);
        ctx.fillText('全品', 192, 250);
        ctx.font = `800 110px ${LAT}`;
        ctx.fillText('70円', 192, 380);
        ctx.fillStyle = '#20241f';
        ctx.font = `500 34px ${JP}`;
        ctx.fillText('1品からどうぞ', 192, 450);
    }), { rough: 0.7, emissive: 0.06 });
    add(box(0.42, 0.60, 0.02, m.shelfWhite, 1.55, 0.48, 3.4));
    add(plane(0.4, 0.58, board, 1.55, 0.48, 3.415));
    // vestibule downlight so the doorway reads bright from outside
    {
        const v = new THREE.PointLight(0xfff0d6, 5, 6.5, 2.0);
        v.position.set(0, 2.55, 4.7);
        lights.push(v);
    }
    /* ---------- interior lighting ---------- */
    for (const [x, z, i] of [[-3.4, 1.4, 33], [1.4, 1.2, 33], [-3.4, -4.2, 29], [1.6, -4.6, 29], [4.6, 1.0, 21], [-5.4, 1.6, 15], [5.2, 1.8, 14]]) {
        const p = new THREE.PointLight(0xfff0d8, i, 10.5, 1.8);
        p.position.set(x, 3.0, z);
        lights.push(p);
    }
    // low 'bounce' fills: light the vertical package faces, not just shelf tops
    for (const [x, z] of [[-3.6, 0.4], [0.0, 1.0], [2.2, -3.2], [-3.6, -5.2]]) {
        const b = new THREE.PointLight(0xffe9cd, 5.0, 7.0, 2.0);
        b.position.set(x, 1.15, z);
        lights.push(b);
    }
    // cool light near the fridges
    const fridgeLight = new THREE.PointLight(0xd8f0ff, 5.5, 8, 1.9);
    fridgeLight.position.set(-2.8, 2.2, -8.4);
    lights.push(fridgeLight);
    return { group: g, lights };
}
