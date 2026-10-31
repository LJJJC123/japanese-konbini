import * as THREE from 'three';
/* ------------------------------------------------------------------ */
/* deterministic rng + canvas helpers                                  */
/* ------------------------------------------------------------------ */
export function rng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}
export function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    return { c, ctx };
}
export function tex(c, opts = {}) {
    const t = new THREE.CanvasTexture(c);
    const { repeat = [1, 1], srgb = true, aniso = 8, clamp = false } = opts;
    t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = aniso;
    t.needsUpdate = true;
    return t;
}
/** Sobel a luminance canvas into a tangent-space normal map texture. */
export function normalFromLuma(src, strength = 2.0) {
    const w = src.width, h = src.height;
    const sctx = src.getContext('2d', { willReadFrequently: true });
    const sd = sctx.getImageData(0, 0, w, h).data;
    const out = canvas(w, h);
    const od = out.ctx.createImageData(w, h);
    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
        lum[i] = (sd[i * 4] * 0.299 + sd[i * 4 + 1] * 0.587 + sd[i * 4 + 2] * 0.114) / 255;
    }
    const at = (x, y) => lum[((y + h) % h) * w + ((x + w) % w)];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const tl = at(x - 1, y - 1), t = at(x, y - 1), tr = at(x + 1, y - 1);
            const l = at(x - 1, y), r = at(x + 1, y);
            const bl = at(x - 1, y + 1), b = at(x, y + 1), br = at(x + 1, y + 1);
            const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
            const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
            let nx = -dx * strength, ny = dy * strength, nz = 1;
            const len = Math.hypot(nx, ny, nz);
            nx /= len;
            ny /= len;
            nz /= len;
            const i = (y * w + x) * 4;
            od.data[i] = (nx * 0.5 + 0.5) * 255;
            od.data[i + 1] = (ny * 0.5 + 0.5) * 255;
            od.data[i + 2] = (nz * 0.5 + 0.5) * 255;
            od.data[i + 3] = 255;
        }
    }
    out.ctx.putImageData(od, 0, 0);
    return out.c;
}
export function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
}
/** Japanese-capable font stack for canvas painting. */
export const JP = '"Yu Gothic", "Yu Gothic UI", "Hiragino Kaku Gothic ProN", "Meiryo", "MS Gothic", sans-serif';
export const LAT = '"Helvetica Neue", "Arial", "Segoe UI", sans-serif';
export function fitText(ctx, text, maxW, startPx, font, weight = '') {
    let px = startPx;
    do {
        ctx.font = (weight ? weight + ' ' : '') + font(px);
        if (ctx.measureText(text).width <= maxW)
            break;
        px -= 2;
    } while (px > 6);
    return px;
}
/** Vertical (tategaki) text, one glyph per line. */
export function drawVertical(ctx, text, x, y, step, font, fill) {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = fill;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [...text].forEach((ch, i) => ctx.fillText(ch, x, y + i * step));
    ctx.restore();
}
