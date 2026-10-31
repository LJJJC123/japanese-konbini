import * as THREE from 'three';
import { box, rbox, plane, cyl } from './geo.js';
import { graphicMaterial, panelTexture } from './tex.js';
import { tex } from './util.js';
import { JP, BRAND } from './graphics.js';
import * as G from './graphics.js';
export const H = {
    halfW: 6.8,
    front: 6.0,
    back: -9.8,
    floor: 0.18,
    ceil: 3.15,
    roof: 3.55,
    parapetTop: 4.42,
    glassTop: 3.06,
    transom: 2.46,
    doorHalf: 1.45,
    signBottom: 3.30,
    signTop: 4.24,
};
const MULLIONS = [-6.8, -5.02, -3.23, -1.45, 1.45, 3.23, 5.02, 6.8];
function aisleSignTexture(text, sub = '') {
    return panelTexture(768, 224, (ctx) => {
        ctx.fillStyle = '#f8f8f2';
        ctx.fillRect(0, 0, 768, 224);
        ctx.strokeStyle = BRAND.green;
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 756, 212);
        ctx.fillStyle = BRAND.green;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${sub ? 96 : 112}px ${JP}`;
        ctx.fillText(text, 384, sub ? 96 : 116);
        if (sub) {
            ctx.font = `500 46px ${JP}`;
            ctx.fillStyle = '#43524a';
            ctx.fillText(sub, 384, 176);
        }
    });
}
function clockTexture() {
    return panelTexture(256, 256, (ctx) => {
        ctx.fillStyle = '#f7f7f2';
        ctx.beginPath();
        ctx.arc(128, 128, 124, 0, 6.2832);
        ctx.fill();
        ctx.strokeStyle = '#2b2b2b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(128, 128, 120, 0, 6.2832);
        ctx.stroke();
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            ctx.strokeStyle = '#333';
            ctx.lineWidth = i % 3 === 0 ? 7 : 3;
            ctx.beginPath();
            ctx.moveTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96);
            ctx.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112);
            ctx.stroke();
        }
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 + 48, 128 - 30);
        ctx.stroke();
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(128, 128);
        ctx.lineTo(128 - 16, 128 - 78);
        ctx.stroke();
        ctx.fillStyle = BRAND.green;
        ctx.beginPath();
        ctx.arc(128, 128, 8, 0, 6.2832);
        ctx.fill();
    });
}
export function buildStore(m) {
    const g = new THREE.Group();
    g.name = 'store';
    const lights = [];
    const add = (o) => { g.add(o); return o; };
    /* ---------------- slab / plinth ---------------- */
    add(rbox(14.2, 0.18, 16.4, 0.02, m.concreteMat, 0, 0.09, -1.9, 2, 'plinth'));
    // exterior step in front of the entrance
    add(box(3.4, 0.06, 0.55, m.concreteMat, 0, 0.06, 6.45, 'thresholdStep'));
    /* ---------------- exterior walls ---------------- */
    const wallT = 0.16;
    add(box(wallT, 3.37, 15.8, m.sidingMatTall, 6.88, 1.865, -1.9, 'wallEast'));
    add(box(wallT, 3.37, 15.8, m.sidingMatTall, -6.88, 1.865, -1.9, 'wallWest'));
    add(box(13.76, 3.37, wallT, m.sidingMat, 0, 1.865, -9.88, 'wallRear'));
    // header wall above the storefront
    add(box(13.76, 0.5, wallT, m.whiteAlu, 0, 3.31, 6.0, 'headerFront'));
    // corner trims
    for (const sx of [-1, 1])
        add(box(0.18, 3.4, 0.22, m.whiteAlu, sx * 6.86, 1.87, 6.0, 'cornerTrim'));
    /* ---------------- base / sill / mullions ---------------- */
    add(box(13.62, 0.14, 0.24, m.whiteAluDull, 0, 0.25, 6.02, 'sillRail'));
    add(box(13.62, 0.12, 0.06, m.darkAlu, 0, 0.19, 6.13, 'sillGasket'));
    add(box(13.62, 0.12, 0.20, m.whiteAlu, 0, 3.0, 6.02, 'headRail'));
    add(box(13.62, 0.09, 0.15, m.whiteAlu, 0, H.transom, 6.03, 'transomRail'));
    for (const x of MULLIONS) {
        add(box(0.09, 2.9, 0.16, m.whiteAlu, x, 1.66, 6.03, 'mullion'));
    }
    // slim interior-side reveals
    add(box(13.5, 0.05, 0.02, m.whiteAluDull, 0, 2.5, 5.96));
    /* ---------------- glazing ---------------- */
    const sheenCv = panelTexture(256, 512, (ctx) => {
        ctx.clearRect(0, 0, 256, 512);
        const top = ctx.createLinearGradient(0, 0, 0, 512);
        top.addColorStop(0, 'rgba(214,232,255,0.30)');
        top.addColorStop(0.35, 'rgba(200,220,245,0.10)');
        top.addColorStop(0.7, 'rgba(190,210,235,0.03)');
        top.addColorStop(1, 'rgba(190,210,235,0.06)');
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, 256, 512);
        for (const [x, w, a] of [[40, 14, 0.22], [96, 8, 0.14], [150, 18, 0.10], [206, 10, 0.16]]) {
            const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
            g.addColorStop(0, 'rgba(255,248,235,0)');
            g.addColorStop(0.5, `rgba(255,248,235,${a})`);
            g.addColorStop(1, 'rgba(255,248,235,0)');
            ctx.fillStyle = g;
            ctx.fillRect(x - w, 0, w * 2, 512);
        }
    });
    const sheenTex = tex(sheenCv, { clamp: true });
    const sheenMat = new THREE.MeshBasicMaterial({ map: sheenTex, transparent: true, depthWrite: false, opacity: 0.16 });
    const glassGeo = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < MULLIONS.length - 1; i++) {
        const a = MULLIONS[i], b = MULLIONS[i + 1];
        if (a >= -1.5 && b <= 1.5)
            continue; // door bay
        const w = b - a - 0.09;
        const pane = new THREE.Mesh(glassGeo, m.glass);
        pane.scale.set(w, 2.72, 1);
        pane.position.set((a + b) / 2, 1.66, 6.03);
        pane.name = 'glassPane';
        add(pane);
        const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sheenMat);
        sh.scale.set(w * 0.98, 2.7, 1);
        sh.position.set((a + b) / 2, 1.66, 6.045);
        sh.name = 'glassSheen';
        add(sh);
    }
    // glass above the entrance
    const topPane = new THREE.Mesh(glassGeo, m.glass);
    topPane.scale.set(2.8, 0.5, 1);
    topPane.position.set(0, 2.76, 6.03);
    add(topPane);
    /* ---------------- automatic sliding doors ---------------- */
    const doorGlass = new THREE.MeshPhysicalMaterial({
        color: 0xd2e2ec, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.08,
        envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false,
    });
    for (const side of [-1, 1]) {
        const cx = side * 0.735;
        const z = side > 0 ? 6.10 : 6.055;
        const panel = new THREE.Group();
        panel.name = 'doorPanel';
        const w = 1.40, h = 2.16, cy = 0.26 + h / 2;
        // rails + stiles
        panel.add(box(w, 0.10, 0.05, m.whiteAlu, cx, 0.26 + h - 0.05, z));
        panel.add(box(w, 0.20, 0.05, m.whiteAlu, cx, 0.34, z));
        panel.add(box(0.06, h, 0.05, m.whiteAlu, cx - w / 2 + 0.03, cy, z));
        panel.add(box(0.06, h, 0.05, m.whiteAlu, cx + w / 2 - 0.03, cy, z));
        const gp = new THREE.Mesh(glassGeo, doorGlass);
        gp.scale.set(w - 0.12, h - 0.30, 1);
        gp.position.set(cx, cy + 0.04, z);
        panel.add(gp);
        // sweep
        panel.add(box(w - 0.04, 0.04, 0.07, m.rubber, cx, 0.245, z));
        add(panel);
    }
    // door threshold + sensor
    add(box(2.92, 0.02, 0.28, m.stainless, 0, 0.20, 6.05, 'doorThreshold'));
    add(box(0.62, 0.07, 0.10, m.darkAlu, 0, 2.52, 5.97, 'doorSensor'));
    add(box(0.10, 0.10, 0.10, m.darkAlu, -1.30, 2.52, 5.99));
    add(box(0.10, 0.10, 0.10, m.darkAlu, 1.30, 2.52, 5.99));
    /* ---------------- fascia lightbox ---------------- */
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(13.7, H.signTop - H.signBottom, 0.17), [m.whiteAlu, m.whiteAlu, m.whiteAlu, m.whiteAlu, m.fasciaMat, m.whiteAlu]);
    fascia.position.set(0, (H.signTop + H.signBottom) / 2, 6.055);
    fascia.castShadow = true;
    fascia.name = 'fasciaSign';
    add(fascia);
    add(box(13.74, 0.045, 0.20, m.darkAlu, 0, H.signBottom - 0.02, 6.05, 'fasciaTrimBottom'));
    add(box(13.70, 0.085, 0.03, new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.9 }), 0, 3.255, 6.03, 'signShadowGap'));
    add(box(13.74, 0.045, 0.20, m.darkAlu, 0, H.signTop + 0.02, 6.05, 'fasciaTrimTop'));
    /* ---------------- parapet + roof ---------------- */
    const parapetH = H.parapetTop - H.roof;
    for (const [x, z, w, d] of [
        [0, 5.94, 13.8, 0.14],
        [0, -9.74, 13.8, 0.14],
        [6.86, -1.9, 0.14, 15.8],
        [-6.86, -1.9, 0.14, 15.8],
    ]) {
        add(box(w, parapetH, d, m.whiteAlu, x, H.roof + parapetH / 2, z, 'parapet'));
        add(box(w + 0.12, 0.05, d + 0.12, new THREE.MeshStandardMaterial({ color: 0x2c3034, roughness: 0.7, metalness: 0.12 }), x, H.parapetTop + 0.025, z, 'parapetCap'));
    }
    const roof = plane(13.6, 15.6, m.roofMat, 0, H.roof, -1.9, 0, -Math.PI / 2, 'roofDeck');
    add(roof);
    /* rooftop plant */
    const acBody = m.whiteAluDull;
    for (const [x, z, ry] of [[4.1, -2.8, 0.1], [5.2, -4.2, 0.05], [-3.2, -6.4, -0.1]]) {
        const grp = new THREE.Group();
        grp.position.set(x, H.roof + 0.34, z);
        grp.rotation.y = ry;
        grp.add(box(0.92, 0.66, 0.42, acBody, 0, 0, 0));
        grp.add(cyl(0.24, 0.24, 0.03, 24, m.darkAlu, 0.18, 0, 0.22));
        grp.add(cyl(0.24, 0.24, 0.03, 24, m.darkAlu, 0.18, 0, -0.22));
        for (const sx of [-0.34, 0.34])
            for (const sz of [-0.14, 0.14])
                grp.add(box(0.07, 0.14, 0.07, m.darkAlu, sx, -0.39, sz));
        add(grp);
    }
    // roof hatch + skylight + antenna
    add(rbox(0.9, 0.34, 0.9, 0.02, m.whiteAluDull, 3.6, H.roof + 0.17, -7.4, 2, 'roofHatch'));
    add(box(1.5, 0.10, 1.1, m.whiteAlu, -1.2, H.roof + 0.05, -6.2));
    add(box(1.44, 0.08, 1.04, new THREE.MeshStandardMaterial({ color: 0x8fa4b4, roughness: 0.12, metalness: 0.3, envMapIntensity: 1.4 }), -1.2, H.roof + 0.10, -6.2, 'skylight'));
    add(cyl(0.03, 0.03, 2.6, 8, m.stainless, 5.6, H.roof + 1.3, -8.6, 'antennaMast'));
    for (const y of [0.9, 1.5, 2.1])
        add(box(0.8 - y * 0.15, 0.02, 0.02, m.stainless, 5.6, H.roof + y, -8.6));
    add(cyl(0.11, 0.11, 1.0, 12, m.stainless, -5.6, H.roof + 0.5, -8.2, 'ventPipe'));
    add(cyl(0.16, 0.16, 0.10, 12, m.darkAlu, -5.6, H.roof + 1.0, -8.2));
    /* ---------------- canopy ---------------- */
    const canopyZ = 6.78, canopyD = 1.56;
    add(box(13.66, 0.17, canopyD, m.whiteAlu, 0, 3.21, canopyZ, 'canopy'));
    add(box(13.66, 0.05, canopyD - 0.02, m.soffit, 0, 3.115, canopyZ, 'canopySoffit'));
    add(box(13.66, 0.22, 0.07, m.whiteAlu, 0, 3.21, 7.55, 'canopyFascia'));
    add(box(13.66, 0.05, 0.09, m.darkAlu, 0, 3.11, 7.555, 'canopyEdgeTrim'));
    for (const x of [-5.6, -3.35, -1.1, 1.15, 3.4, 5.65]) {
        add(cyl(0.115, 0.115, 0.02, 20, m.darkAlu, x, 3.088, 6.85, 'downlightTrim'));
        add(cyl(0.085, 0.085, 0.025, 20, m.canopyLamp, x, 3.078, 6.85, 'downlightLens'));
    }
    // canopy spots (soft pools on the forecourt)
    for (const x of [-4.5, -1.2, 1.2, 4.5]) {
        const s = new THREE.SpotLight(0xffe9c6, 26, 9.0, Math.PI * 0.22, 0.72, 1.9);
        s.position.set(x, 3.05, 6.9);
        s.target.position.set(x * 1.05, 0, 8.3);
        lights.push(s, s.target);
    }
    /* ---------------- side signage on east wall ---------------- */
    const sideSign = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.74, 3.4), [m.sideSignMat, m.sideSignMat, m.whiteAlu, m.whiteAlu, m.whiteAlu, m.whiteAlu]);
    sideSign.position.set(7.0, 3.78, 1.4);
    sideSign.rotation.y = 0;
    sideSign.name = 'sideSign';
    add(sideSign);
    add(box(0.10, 0.78, 3.46, m.darkAlu, 6.99, 3.78, 1.4).translateY(0));
    /* ---------------- interior shell ---------------- */
    add(plane(13.44, 15.6, m.floorInt, 0, H.floor + 0.002, -1.9, 0, -Math.PI / 2, 'storeFloor'));
    add(plane(13.44, 15.6, m.ceilMat, 0, H.ceil, -1.9, 0, Math.PI / 2, 'storeCeiling'));
    add(box(13.44, 2.97, 0.10, m.wallInt, 0, 1.665, -9.72, 'wallIntBack'));
    add(box(0.10, 2.97, 15.5, m.wallInt, 6.72, 1.665, -1.95, 'wallIntEast'));
    add(box(0.10, 2.97, 15.5, m.wallInt, -6.72, 1.665, -1.95, 'wallIntWest'));
    // baseboards
    add(box(13.44, 0.10, 0.03, m.darkAlu, 0, 0.23, -9.66));
    add(box(0.03, 0.10, 15.5, m.darkAlu, 6.66, 0.23, -1.95));
    add(box(0.03, 0.10, 15.5, m.darkAlu, -6.66, 0.23, -1.95));
    // interior header above the glazing
    add(box(13.5, 0.13, 0.08, m.wallInt, 0, 3.08, 5.95, 'intHeader'));
    /* ceiling light fixtures */
    const rows = [-4.75, -2.35, 1.05, 3.85];
    const zs = [2.15, 0.15, -1.85, -3.85, -5.85];
    for (const x of rows)
        for (const z of zs) {
            add(box(0.26, 0.05, 1.62, m.whiteAlu, x, H.ceil - 0.03, z, 'lightHousing'));
            add(box(0.17, 0.035, 1.5, m.lightTube, x, H.ceil - 0.065, z, 'fluorescentTube'));
        }
    /* hanging aisle signs */
    const signs = [
        ['おにぎり・お弁当', '', -3.6, 3.1],
        ['お菓子', '', -1.2, 0.6],
        ['飲料', '', -1.2, -3.3],
        ['日用品', '', 3.1, -1.0],
        ['雑誌・たばこ', '', 3.1, 3.4],
    ];
    for (const [t, sub, x, z] of signs) {
        const mat = graphicMaterial(aisleSignTexture(t, sub), { rough: 0.6, side: THREE.DoubleSide });
        const p = plane(1.25, 0.36, mat, x, 2.62, z, 0, 0, 'aisleSign');
        add(p);
        add(box(0.02, 0.20, 0.02, m.darkAlu, x - 0.45, 2.84, z));
        add(box(0.02, 0.20, 0.02, m.darkAlu, x + 0.45, 2.84, z));
    }
    /* clock + wall posters on the back wall */
    const clockMat = graphicMaterial(clockTexture(), { rough: 0.5 });
    add(plane(0.42, 0.42, clockMat, -2.4, 2.55, -9.66));
    add(cyl(0.22, 0.22, 0.03, 24, m.whiteAlu, -2.4, 2.55, -9.68).rotateX(Math.PI / 2));
    /* ---------------- window posters ---------------- */
    const posterDefs = [
        { cv: G.posterKaraage(), x: -5.95 },
        { cv: G.posterOden(), x: -4.15 },
        { cv: G.posterCoffee(), x: -2.35 },
        { cv: G.posterATM(), x: 2.35 },
        { cv: G.posterTobacco(), x: 4.15 },
        { cv: G.posterAlcohol(), x: 5.95 },
    ];
    for (const d of posterDefs) {
        const w = d.w ?? 0.52, h = d.h ?? 0.78;
        const mat = graphicMaterial(d.cv, { emissive: 0.16, rough: 0.62 });
        const y = d.y ?? 1.58;
        add(plane(w, h, mat, d.x, y, 5.995, 0, 0, 'windowPoster'));
        // tape strips
        add(box(w, 0.03, 0.004, m.whitePaint, d.x, y + h / 2 - 0.03, 5.985));
        add(box(w, 0.03, 0.004, m.whitePaint, d.x, y - h / 2 + 0.03, 5.985));
    }
    /* door / glass decals */
    const autoDoorMat = graphicMaterial(G.decalAutoDoor(), { emissive: 0.25, rough: 0.6, transparent: true });
    add(plane(0.66, 0.165, autoDoorMat, 0.73, 1.18, 6.135));
    add(plane(0.66, 0.165, autoDoorMat, -0.73, 1.18, 6.085));
    const secMat = graphicMaterial(G.decalSecurity(), { emissive: 0.18, rough: 0.6 });
    add(plane(0.34, 0.105, secMat, -3.2, 2.12, 5.99));
    const hoursMat = graphicMaterial(G.decalHours(), { emissive: 0.22, rough: 0.6 });
    add(plane(0.46, 0.23, hoursMat, 5.2, 2.15, 5.99));
    const addrMat = graphicMaterial(G.decalAddress(), { emissive: 0.1, rough: 0.7 });
    add(plane(0.62, 0.155, addrMat, 1.95, 3.28, 6.135));
    /* outside scraper mat */
    add(box(1.9, 0.02, 1.15, m.rubber, 0, 0.105, 6.9, 'scraperMat'));
    /* inside entrance mat */
    const mat = rbox(2.3, 0.025, 1.25, 0.01, new THREE.MeshStandardMaterial({ color: 0x5a5f61, roughness: 0.95 }), 0, 0.19, 5.15, 2, 'entranceMat');
    add(mat);
    /* ---------------- east wall details ---------------- */
    // service door
    add(box(0.06, 2.05, 0.95, m.darkAlu, 6.97, 1.20, -4.4, 'serviceDoor'));
    add(box(0.05, 1.95, 0.86, new THREE.MeshStandardMaterial({ color: 0x8d9499, roughness: 0.55, metalness: 0.35 }), 6.99, 1.18, -4.4));
    add(box(0.03, 0.22, 0.03, m.stainless, 7.03, 1.10, -3.98, 'doorPull'));
    const noEntry = graphicMaterial(G.decalSecurity(), { rough: 0.65 });
    void noEntry;
    // wall lamp over the door
    add(box(0.10, 0.10, 0.36, m.darkAlu, 7.02, 2.55, -4.4));
    add(box(0.04, 0.03, 0.30, m.lightSoft, 7.07, 2.50, -4.4));
    // meter box
    add(rbox(0.14, 0.48, 0.36, 0.02, m.whiteAluDull, 6.99, 1.55, -1.1, 2, 'meterBox'));
    // downpipes
    for (const z of [5.9, -9.7]) {
        add(cyl(0.05, 0.05, 3.45, 10, m.whiteAluDull, 6.99, 1.9, z, 'downpipe'));
        add(cyl(0.055, 0.055, 0.10, 10, m.darkAlu, 6.99, 3.62, z));
    }
    // security camera under the eave
    add(box(0.16, 0.10, 0.10, m.whiteAlu, 6.55, 3.02, 6.1, 'cameraBody'));
    add(cyl(0.05, 0.05, 0.14, 12, m.darkAlu, 6.55, 2.99, 6.0).rotateX(Math.PI / 2));
    // outdoor condenser units on the ground
    for (const z of [-6.4, -7.35]) {
        add(box(0.36, 0.62, 0.86, m.whiteAluDull, 7.16, 0.5, z, 'acCondenser'));
        add(cyl(0.22, 0.22, 0.02, 20, m.darkAlu, 7.35, 0.56, z).rotateZ(Math.PI / 2));
        add(box(0.30, 0.12, 0.10, m.darkAlu, 7.16, 0.16, z));
    }
    return { group: g, lights };
}
