import * as THREE from 'three';
import { canvas, tex, normalFromLuma, rng, JP, LAT, fitText, roundRect } from './util.js';
/* ================================================================== */
/*  surface textures                                                    */
/* ================================================================== */
export function asphaltMaps(repeat = [7, 5]) {
    const S = 1024, R = rng(7);
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#232427';
    ctx.fillRect(0, 0, S, S);
    // large scale mottling
    for (let i = 0; i < 90; i++) {
        const x = R() * S, y = R() * S, r = 60 + R() * 260;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const v = 24 + Math.floor(R() * 32);
        g.addColorStop(0, `rgba(${v},${v + 1},${v + 3},${0.05 + R() * 0.09})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // aggregate
    for (let i = 0; i < 26000; i++) {
        const x = R() * S, y = R() * S, r = 0.35 + R() * 1.35;
        const t = R();
        const col = t < 0.45 ? [58, 59, 62] : t < 0.75 ? [44, 45, 47] : t < 0.93 ? [76, 76, 78] : [96, 94, 90];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.25 + R() * 0.55})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fill();
    }
    // cracks
    for (let k = 0; k < 7; k++) {
        let x = R() * S, y = R() * S;
        ctx.strokeStyle = `rgba(14,14,16,${0.35 + R() * 0.3})`;
        ctx.lineWidth = 0.8 + R() * 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        const seg = 8 + Math.floor(R() * 12);
        for (let i = 0; i < seg; i++) {
            x += (R() - 0.5) * 70;
            y += (R() - 0.5) * 70;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    // oil / damp stains
    for (let i = 0; i < 14; i++) {
        const x = R() * S, y = R() * S, r = 30 + R() * 90;
        const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, 'rgba(10,10,12,0.34)');
        g.addColorStop(0.7, 'rgba(12,12,14,0.16)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * (0.6 + R() * 0.5), R() * 3, 0, 6.2832);
        ctx.fill();
    }
    // height / roughness
    const height = canvas(S, S), rough = canvas(S, S);
    const hd = height.ctx.createImageData(S, S);
    const rd = rough.ctx.createImageData(S, S);
    const cd = ctx.getImageData(0, 0, S, S).data;
    for (let i = 0; i < S * S; i++) {
        const lum = (cd[i * 4] * 0.299 + cd[i * 4 + 1] * 0.587 + cd[i * 4 + 2] * 0.114);
        const h = Math.max(0, Math.min(255, 90 + (lum - 36) * 2.2));
        hd.data[i * 4] = hd.data[i * 4 + 1] = hd.data[i * 4 + 2] = h;
        hd.data[i * 4 + 3] = 255;
        // dry-ish asphalt: fairly rough, a little variance
        const rr = 196 + (R() - 0.5) * 26;
        rd.data[i * 4] = rd.data[i * 4 + 1] = rd.data[i * 4 + 2] = rr;
        rd.data[i * 4 + 3] = 255;
    }
    // damp patches are smoother -> reflective
    for (let i = 0; i < 12; i++) {
        const x = R() * S, y = R() * S, r = 70 + R() * 150;
        const g = rough.ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(70,70,70,0.85)');
        g.addColorStop(0.65, 'rgba(110,110,110,0.45)');
        g.addColorStop(1, 'rgba(150,150,150,0)');
        rough.ctx.fillStyle = g;
        rough.ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    height.ctx.putImageData(hd, 0, 0);
    rough.ctx.putImageData(rd, 0, 0);
    return {
        map: tex(c, { repeat }),
        normalMap: tex(normalFromLuma(height.c, 1.1), { repeat, srgb: false }),
        roughnessMap: tex(rough.c, { repeat, srgb: false }),
    };
}
export function concreteMaps(repeat = [4, 4], tint = '#9c9a94') {
    const S = 512, R = rng(31);
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 160; i++) {
        const x = R() * S, y = R() * S, r = 8 + R() * 60;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const d = R() > 0.5 ? 1 : -1;
        g.addColorStop(0, `rgba(${d > 0 ? 255 : 0},${d > 0 ? 255 : 0},${d > 0 ? 250 : 0},${0.02 + R() * 0.05})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // broom finish
    for (let i = 0; i < 900; i++) {
        const y = R() * S;
        ctx.strokeStyle = `rgba(${R() > 0.5 ? 255 : 20},${R() > 0.5 ? 255 : 20},${R() > 0.5 ? 250 : 20},0.035)`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(S, y + (R() - 0.5) * 2);
        ctx.stroke();
    }
    // control joints (one vertical + one horizontal seam per tile)
    ctx.strokeStyle = 'rgba(40,40,38,0.5)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(S, 1);
    ctx.moveTo(1, 0);
    ctx.lineTo(1, S);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(S, 4);
    ctx.moveTo(4, 0);
    ctx.lineTo(4, S);
    ctx.stroke();
    const nrm = normalFromLuma(c, 0.55);
    return {
        map: tex(c, { repeat }),
        normalMap: tex(nrm, { repeat, srgb: false }),
        roughnessMap: tex(c, { repeat, srgb: false }),
    };
}
/** cream ribbed metal siding used on side + rear facades */
export function sidingMaps(repeat = [1, 1]) {
    const W = 512, H = 512, R = rng(99);
    const { c, ctx } = canvas(W, H);
    ctx.fillStyle = '#d6d4cc';
    ctx.fillRect(0, 0, W, H);
    const ribs = 8, rw = W / ribs;
    for (let i = 0; i < ribs; i++) {
        const x = i * rw;
        const g = ctx.createLinearGradient(x, 0, x + rw, 0);
        g.addColorStop(0.0, 'rgba(120,118,108,0.30)');
        g.addColorStop(0.10, 'rgba(255,255,252,0.55)');
        g.addColorStop(0.45, 'rgba(255,255,252,0.10)');
        g.addColorStop(0.85, 'rgba(150,148,138,0.18)');
        g.addColorStop(1.0, 'rgba(90,88,80,0.32)');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, rw, H);
    }
    for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(90,88,80,${0.01 + R() * 0.04})`;
        ctx.fillRect(R() * W, R() * H, 1 + R() * 3, 1 + R() * 2);
    }
    // horizontal panel seam
    ctx.fillStyle = 'rgba(70,68,62,0.28)';
    ctx.fillRect(0, H * 0.5, W, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(0, H * 0.5 + 2, W, 2);
    return {
        map: tex(c, { repeat }),
        normalMap: tex(normalFromLuma(c, 0.5), { repeat, srgb: false }),
    };
}
/** interior vinyl floor tile, 300mm pattern */
export function vinylFloorMaps(repeat = [12, 14]) {
    const S = 512, R = rng(5);
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#98948a';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 12000; i++) {
        const g = 120 + R() * 90;
        ctx.fillStyle = `rgba(${g},${g - 2},${g - 8},${0.06 + R() * 0.18})`;
        ctx.fillRect(R() * S, R() * S, 1.4, 1.4);
    }
    // 2x2 tiles per texture => 300mm * 2
    ctx.strokeStyle = 'rgba(120,116,106,0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(S, 1);
    ctx.moveTo(1, 0);
    ctx.lineTo(1, S);
    ctx.moveTo(S / 2, 0);
    ctx.lineTo(S / 2, S);
    ctx.moveTo(0, S / 2);
    ctx.lineTo(S, S / 2);
    ctx.stroke();
    return {
        map: tex(c, { repeat }),
        roughnessMap: tex(c, { repeat, srgb: false }),
    };
}
/** white ceiling grid panels */
export function ceilingMaps(repeat = [8, 10]) {
    const S = 256;
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#eceae4';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(150,148,140,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, S - 3, S - 3);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 4.5, S - 9, S - 9);
    return { map: tex(c, { repeat }) };
}
/** dark single-ply roof membrane */
export function roofMaps(repeat = [6, 6]) {
    const S = 256, R = rng(17);
    const { c, ctx } = canvas(S, S);
    ctx.fillStyle = '#5b5f62';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 3000; i++) {
        const g = 70 + R() * 36;
        ctx.fillStyle = `rgba(${g},${g + 2},${g + 4},0.35)`;
        ctx.fillRect(R() * S, R() * S, 1.5, 1.5);
    }
    ctx.strokeStyle = 'rgba(24,26,28,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, S / 2);
    ctx.lineTo(S, S / 2);
    ctx.stroke();
    return { map: tex(c, { repeat }) };
}
/** sky dome: blue hour gradient + city glow + faint stars */
export function skyTexture() {
    const W = 2048, H = 1024, R = rng(1234);
    const { c, ctx } = canvas(W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.00, '#03050a');
    g.addColorStop(0.16, '#060c16');
    g.addColorStop(0.30, '#0c1728');
    g.addColorStop(0.40, '#16243a');
    g.addColorStop(0.46, '#2c3648');
    g.addColorStop(0.485, '#5f564e');
    g.addColorStop(0.500, '#8f6f52');
    g.addColorStop(0.515, '#4a443c');
    g.addColorStop(0.56, '#222523');
    g.addColorStop(0.70, '#141618');
    g.addColorStop(1.00, '#0b0d0e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // faint stars above the city haze
    for (let i = 0; i < 1100; i++) {
        const y = Math.pow(R(), 1.5) * H * 0.43;
        const a = (1 - y / (H * 0.43)) * 0.6 * R();
        ctx.fillStyle = `rgba(214,228,255,${a.toFixed(3)})`;
        const sz = R() < 0.08 ? 2 : 1.1;
        ctx.fillRect(R() * W, y, sz, sz);
    }
    // thin cloud bands lit from below by the city
    for (let i = 0; i < 60; i++) {
        const y = H * (0.26 + R() * 0.22);
        const x = R() * W;
        const w = 180 + R() * 620, h = 6 + R() * 26;
        const gg = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
        const warm = 0.05 + R() * 0.09 * (y / (H * 0.48));
        gg.addColorStop(0, `rgba(146,146,158,${warm})`);
        gg.addColorStop(0.55, `rgba(96,104,120,${warm * 0.55})`);
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, h / w);
        ctx.translate(-x, -y);
        ctx.fillStyle = gg;
        ctx.fillRect(x - w / 2, y - w / 2, w, w);
        ctx.restore();
    }
    // sodium / LED city glow along the horizon
    for (let i = 0; i < 40; i++) {
        const x = R() * W;
        const w = 160 + R() * 520;
        const y = H * (0.49 + R() * 0.012);
        const gg = ctx.createRadialGradient(x, y, 0, x, y, w);
        const warm = 0.10 + R() * 0.09;
        gg.addColorStop(0, `rgba(255,176,116,${warm})`);
        gg.addColorStop(0.5, `rgba(210,140,96,${warm * 0.35})`);
        gg.addColorStop(1, 'rgba(255,150,90,0)');
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 0.34);
        ctx.translate(-x, -y);
        ctx.fillStyle = gg;
        ctx.fillRect(x - w, y - w, w * 2, w * 2);
        ctx.restore();
    }
    // distant city silhouettes with pin-point window lights (painted into the dome)
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 120; i++) {
        const bw = 12 + R() * 46, bh = 8 + R() * 52;
        const x = R() * W, y = H * 0.5;
        ctx.fillStyle = 'rgba(10,13,16,0.9)';
        ctx.fillRect(x, y - bh, bw, bh);
        for (let k = 0; k < 5; k++) {
            if (R() < 0.55) {
                ctx.fillStyle = R() < 0.6 ? 'rgba(255,214,158,0.75)' : 'rgba(190,220,255,0.55)';
                ctx.fillRect(x + 2 + R() * (bw - 4), y - bh + 2 + R() * (bh - 4), 1.4, 1.4);
            }
        }
    }
    ctx.globalAlpha = 1;
    return tex(c, { clamp: true, aniso: 1 });
}
/* ================================================================== */
/*  small graphic helpers                                               */
/* ================================================================== */
export function panelTexture(w, h, paint) {
    const { c, ctx } = canvas(w, h);
    paint(ctx);
    return c;
}
/** flat lit panel material (lightbox / poster / decal) */
export function graphicMaterial(cv, opts = {}) {
    const t = tex(cv, { clamp: true, aniso: 8 });
    const { emissive = 0.0, rough = 0.42, side = THREE.FrontSide, transparent = false, opacity = 1 } = opts;
    const m = new THREE.MeshStandardMaterial({
        map: t, roughness: rough, metalness: 0.0, side, transparent, opacity,
        emissive: new THREE.Color(0xffffff), emissiveMap: emissive > 0 ? t : null, emissiveIntensity: emissive,
    });
    return m;
}
export { THREE, JP, LAT, fitText, roundRect };
