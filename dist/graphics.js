import { JP, LAT, rng, roundRect, drawVertical } from './util.js';
import { panelTexture } from './tex.js';
export { JP, LAT };
export const BRAND = {
    green: '#0d6a45',
    greenLight: '#2f9a63',
    orange: '#f2911c',
    cream: '#f5f6f0',
    ink: '#232a26',
    blue: '#1a4f9c',
    red: '#c8342c',
};
/* ---------------- brand mark --------------------------------------- */
function brandMark(ctx, x, y, s, fg = '#ffffff', accent = BRAND.orange) {
    ctx.save();
    ctx.translate(x, y);
    // white ring + rising sun + leaf slash
    ctx.strokeStyle = fg;
    ctx.lineWidth = s * 0.13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.40, Math.PI * 0.78, Math.PI * 2.22);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = fg;
    ctx.lineWidth = s * 0.10;
    ctx.beginPath();
    ctx.moveTo(-s * 0.52, s * 0.30);
    ctx.quadraticCurveTo(-s * 0.10, s * 0.44, s * 0.50, s * 0.10);
    ctx.stroke();
    ctx.restore();
}
/* ---------------- main fascia lightbox ----------------------------- */
export function fasciaSignCanvas() {
    const W = 4096, H = 280;
    return panelTexture(W, H, (ctx) => {
        // backlit white acrylic
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#fbfcf7');
        bg.addColorStop(0.55, '#f6f7f0');
        bg.addColorStop(1, '#eef0e7');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // brand colour band along the base
        ctx.fillStyle = BRAND.green;
        ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = BRAND.orange;
        ctx.fillRect(0, H - 38, W, 8);
        // logo tile
        ctx.fillStyle = BRAND.green;
        roundRect(ctx, 46, 34, 254, 186, 30);
        ctx.fill();
        brandMark(ctx, 173, 122, 190);
        // wordmark
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#14312a';
        ctx.font = `800 128px ${LAT}`;
        ctx.fillText('HIKARI MART', 338, 146);
        ctx.font = `500 52px ${JP}`;
        ctx.fillStyle = '#4a5b52';
        ctx.fillText('ひかりマート', 342, 208);
        // right: 24h badge
        const bx = W - 720;
        ctx.fillStyle = BRAND.green;
        roundRect(ctx, bx, 46, 300, 160, 22);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 104px ${LAT}`;
        ctx.fillText('24h', bx + 150, 160);
        ctx.font = `600 30px ${JP}`;
        ctx.fillText('年中無休', bx + 150, 192);
        ctx.fillStyle = '#1f2a25';
        ctx.textAlign = 'left';
        ctx.font = `700 62px ${JP}`;
        ctx.fillText('ATM・コピー・宅配便', bx - 620, 130);
        ctx.fillStyle = '#6c7a71';
        ctx.font = `500 34px ${JP}`;
        ctx.fillText('たばこ ・ 公共料金 ・ チケット', bx - 618, 180);
    });
}
export function sideSignCanvas() {
    const W = 1024, H = 256;
    return panelTexture(W, H, (ctx) => {
        ctx.fillStyle = '#f7f8f1';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = BRAND.green;
        ctx.fillRect(0, H - 26, W, 26);
        ctx.fillStyle = BRAND.orange;
        ctx.fillRect(0, H - 33, W, 7);
        ctx.fillStyle = BRAND.green;
        roundRect(ctx, 26, 30, 196, 168, 26);
        ctx.fill();
        brandMark(ctx, 124, 114, 150);
        ctx.fillStyle = '#14312a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = `800 96px ${LAT}`;
        ctx.fillText('HIKARI MART', 250, 132);
        ctx.font = `500 42px ${JP}`;
        ctx.fillStyle = '#54655c';
        ctx.fillText('ひかりマート', 252, 188);
    });
}
/* ---------------- window posters ----------------------------------- */
function posterBase(ctx, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, 768);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 768);
}
export function posterKaraage() {
    return panelTexture(512, 768, (ctx) => {
        posterBase(ctx, '#d8342a', '#8c1610');
        // starburst
        ctx.save();
        ctx.translate(256, 430);
        ctx.fillStyle = 'rgba(255,206,64,0.85)';
        for (let i = 0; i < 26; i++) {
            ctx.rotate((Math.PI * 2) / 26);
            ctx.beginPath();
            ctx.moveTo(0, -40);
            ctx.lineTo(60, -300);
            ctx.lineTo(-60, -300);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        // drumstick
        ctx.save();
        ctx.translate(256, 430);
        ctx.rotate(-0.5);
        ctx.fillStyle = '#a9601f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 118, 92, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#c97a2c';
        ctx.beginPath();
        ctx.ellipse(-12, -14, 96, 68, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#e8c39a';
        ctx.beginPath();
        ctx.roundRect(58, -30, 90, 60, 28);
        ctx.fill();
        ctx.fillStyle = '#f7f2e4';
        ctx.beginPath();
        ctx.arc(150, -2, 30, 0, 6.2832);
        ctx.fill();
        ctx.restore();
        // copy
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = `800 74px ${JP}`;
        ctx.fillText('新発売', 256, 96);
        ctx.fillStyle = '#ffe45e';
        ctx.font = `800 104px ${JP}`;
        ctx.fillText('やみつき', 256, 200);
        ctx.fillStyle = '#fff';
        ctx.font = `800 96px ${JP}`;
        ctx.fillText('からあげ', 256, 300);
        ctx.fillStyle = '#1a1a1a';
        roundRect(ctx, 96, 640, 320, 96, 16);
        ctx.fill();
        ctx.fillStyle = '#ffe45e';
        ctx.font = `800 72px ${LAT}`;
        ctx.fillText('¥216', 256, 712);
        ctx.fillStyle = '#fff';
        ctx.font = `500 26px ${JP}`;
        ctx.fillText('税込 ・ 1個', 256, 748);
    });
}
export function posterOden() {
    return panelTexture(512, 768, (ctx) => {
        posterBase(ctx, '#f4ead6', '#dcc9a6');
        ctx.fillStyle = '#22303f';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 64px ${JP}`;
        ctx.fillText('おでん はじめました', 256, 84);
        // pot
        ctx.fillStyle = '#4b5259';
        ctx.beginPath();
        ctx.ellipse(256, 470, 168, 56, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#6a737b';
        ctx.beginPath();
        ctx.ellipse(256, 456, 168, 56, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#b98b52';
        ctx.beginPath();
        ctx.ellipse(200, 450, 40, 30, 0, 0, 6.2832);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(300, 444, 34, 26, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#efe3c8';
        ctx.beginPath();
        ctx.ellipse(250, 430, 30, 24, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#8d5a35';
        ctx.beginPath();
        ctx.ellipse(330, 470, 44, 22, -0.3, 0, 6.2832);
        ctx.fill();
        // steam
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const x = 180 + i * 80;
            ctx.moveTo(x, 390);
            ctx.bezierCurveTo(x - 30, 340, x + 30, 320, x, 270);
            ctx.stroke();
        }
        ctx.fillStyle = '#22303f';
        ctx.textAlign = 'center';
        ctx.font = `800 60px ${JP}`;
        ctx.fillText('1品 70円〜', 256, 610);
        ctx.fillStyle = '#7a4a24';
        ctx.font = `500 30px ${JP}`;
        ctx.fillText('だいこん ・ 卵 ・ こんにゃく ・ 牛すじ', 256, 660);
    });
}
export function posterCoffee() {
    return panelTexture(512, 768, (ctx) => {
        posterBase(ctx, '#3a2418', '#140b06');
        ctx.fillStyle = '#f2e2c8';
        ctx.textAlign = 'center';
        ctx.font = `700 44px ${JP}`;
        ctx.fillText('淹れたて', 256, 92);
        ctx.font = `800 86px ${JP}`;
        ctx.fillText('コーヒー', 256, 178);
        // cup
        ctx.fillStyle = '#f0ece2';
        roundRect(ctx, 150, 300, 212, 210, 18);
        ctx.fill();
        ctx.fillStyle = '#d9d2c4';
        ctx.beginPath();
        ctx.ellipse(256, 300, 106, 30, 0, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#4a2b1a';
        ctx.beginPath();
        ctx.ellipse(256, 306, 90, 22, 0, 0, 6.2832);
        ctx.fill();
        ctx.strokeStyle = '#efe6d6';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(376, 396, 46, -1.2, 1.2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        for (let i = 0; i < 2; i++) {
            const x = 220 + i * 70;
            ctx.beginPath();
            ctx.moveTo(x, 270);
            ctx.bezierCurveTo(x - 26, 230, x + 26, 210, x, 168);
            ctx.stroke();
        }
        ctx.fillStyle = '#f3b23c';
        ctx.font = `800 58px ${LAT}`;
        ctx.fillText('HOT  ¥110', 256, 600);
        ctx.fillStyle = '#cbb79c';
        ctx.font = `500 30px ${JP}`;
        ctx.fillText('Sサイズ ・ レジにて', 256, 648);
    });
}
export function posterATM() {
    return panelTexture(512, 768, (ctx) => {
        ctx.fillStyle = '#f2f4f6';
        ctx.fillRect(0, 0, 512, 768);
        ctx.fillStyle = BRAND.blue;
        ctx.fillRect(0, 0, 512, 150);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 96px ${LAT}`;
        ctx.fillText('ATM', 256, 106);
        ctx.fillStyle = '#2b4a6f';
        ctx.font = `700 40px ${JP}`;
        ctx.fillText('24時間 ご利用いただけます', 256, 210);
        // cash machine drawing
        ctx.fillStyle = '#dfe4e9';
        roundRect(ctx, 116, 260, 280, 300, 14);
        ctx.fill();
        ctx.fillStyle = '#233243';
        roundRect(ctx, 146, 292, 220, 120, 8);
        ctx.fill();
        ctx.fillStyle = '#8fd0e8';
        ctx.font = `500 26px ${JP}`;
        ctx.fillText('お引出し', 256, 360);
        ctx.fillStyle = '#9aa7b4';
        roundRect(ctx, 156, 440, 90, 60, 6);
        ctx.fill();
        ctx.fillStyle = '#6f7d8a';
        roundRect(ctx, 300, 440, 66, 46, 6);
        ctx.fill();
        ctx.fillStyle = '#233243';
        ctx.font = `500 28px ${JP}`;
        ctx.fillText('現金 ・ お振込', 256, 520);
        ctx.fillStyle = '#5c6d7e';
        ctx.font = `500 26px ${JP}`;
        ctx.fillText('提携金融機関のカードが使えます', 256, 640);
        ctx.fillStyle = BRAND.green;
        ctx.font = `600 30px ${JP}`;
        ctx.fillText('ひかりマート', 256, 700);
    });
}
export function posterTobacco() {
    return panelTexture(512, 768, (ctx) => {
        ctx.fillStyle = '#f6f4ee';
        ctx.fillRect(0, 0, 512, 768);
        ctx.fillStyle = BRAND.red;
        ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 96px ${JP}`;
        ctx.fillText('たばこ', 256, 118);
        ctx.font = `600 30px ${JP}`;
        ctx.fillText('各種取り揃えております', 256, 206);
        // packs
        const cols = ['#c0392b', '#2d6a9f', '#e0a02c', '#3c7d55', '#8e44ad', '#cfd8dc'];
        for (let r = 0; r < 2; r++)
            for (let c = 0; c < 3; c++) {
                const x = 70 + c * 128, y = 250 + r * 150;
                ctx.fillStyle = cols[r * 3 + c];
                roundRect(ctx, x, y, 104, 132, 6);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillRect(x + 6, y + 96, 92, 30);
                ctx.fillStyle = '#333';
                ctx.font = `500 13px ${JP}`;
                ctx.fillText('20本', x + 52, y + 116);
            }
        ctx.fillStyle = '#3a3a3a';
        ctx.font = `500 22px ${JP}`;
        ctx.fillText('20歳未満の者の喫煙は法律で禁止されています', 256, 620);
        ctx.fillText('たばこの吸い殻は灰皿で', 256, 656);
    });
}
export function posterAlcohol() {
    return panelTexture(512, 768, (ctx) => {
        ctx.fillStyle = '#fbfaf5';
        ctx.fillRect(0, 0, 512, 768);
        ctx.strokeStyle = BRAND.red;
        ctx.lineWidth = 10;
        ctx.strokeRect(22, 22, 468, 724);
        ctx.fillStyle = BRAND.red;
        ctx.textAlign = 'center';
        ctx.font = `800 74px ${JP}`;
        ctx.fillText('お酒は', 256, 210);
        ctx.fillText('20歳から', 256, 310);
        ctx.fillStyle = '#333';
        ctx.font = `500 34px ${JP}`;
        ctx.fillText('お酒はほどほどに', 256, 430);
        ctx.font = `400 26px ${JP}`;
        ctx.fillText('飲酒運転は犯罪です', 256, 500);
        ctx.fillStyle = '#e8dcc4';
        ctx.beginPath();
        ctx.arc(256, 610, 90, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#c8a86a';
        ctx.beginPath();
        ctx.arc(256, 610, 66, 0, 6.2832);
        ctx.fill();
    });
}
export function posterDelivery() {
    return panelTexture(512, 768, (ctx) => {
        ctx.fillStyle = '#f4c31d';
        ctx.fillRect(0, 0, 512, 768);
        ctx.fillStyle = '#20242a';
        ctx.fillRect(0, 0, 512, 190);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 78px ${JP}`;
        ctx.fillText('宅配便', 256, 92);
        ctx.font = `600 34px ${JP}`;
        ctx.fillText('受付中', 256, 152);
        ctx.fillStyle = '#8a6a2a';
        roundRect(ctx, 120, 300, 272, 200, 10);
        ctx.fill();
        ctx.fillStyle = '#b08a48';
        roundRect(ctx, 96, 270, 272, 200, 10);
        ctx.fill();
        ctx.fillStyle = '#d8b878';
        ctx.fillRect(206, 270, 24, 200);
        ctx.fillStyle = '#20242a';
        ctx.font = `800 52px ${LAT}`;
        ctx.fillText('¥ 380〜', 256, 590);
        ctx.font = `500 28px ${JP}`;
        ctx.fillText('サイズ・地域により異なります', 256, 642);
        ctx.fillStyle = '#20242a';
        ctx.font = `600 30px ${JP}`;
        ctx.fillText('ひかりマート 三丁目店', 256, 712);
    });
}
/* ---------------- door + misc decals -------------------------------- */
export function decalAutoDoor() {
    return panelTexture(512, 128, (ctx) => {
        ctx.fillStyle = BRAND.green;
        roundRect(ctx, 4, 4, 504, 120, 16);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.font = `700 62px ${JP}`;
        ctx.fillText('自動ドア', 40, 88);
        ctx.textAlign = 'right';
        ctx.font = `700 58px ${LAT}`;
        ctx.fillText('▶▶', 476, 86);
    });
}
export function decalSecurity() {
    return panelTexture(512, 160, (ctx) => {
        ctx.fillStyle = '#f7f7f2';
        ctx.fillRect(0, 0, 512, 160);
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 144);
        ctx.fillStyle = '#c8342c';
        ctx.beginPath();
        ctx.arc(66, 80, 34, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 34px ${LAT}`;
        ctx.fillText('!', 66, 94);
        ctx.fillStyle = '#222';
        ctx.textAlign = 'left';
        ctx.font = `600 34px ${JP}`;
        ctx.fillText('防犯カメラ', 118, 70);
        ctx.fillText('作動中', 118, 118);
    });
}
export function decalHours() {
    return panelTexture(512, 256, (ctx) => {
        ctx.fillStyle = 'rgba(255,255,255,0.94)';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = BRAND.green;
        ctx.lineWidth = 8;
        ctx.strokeRect(6, 6, 500, 244);
        ctx.fillStyle = BRAND.green;
        ctx.textAlign = 'center';
        ctx.font = `800 74px ${JP}`;
        ctx.fillText('24時間営業', 256, 108);
        ctx.fillStyle = '#3a3a3a';
        ctx.font = `500 40px ${JP}`;
        ctx.fillText('年中無休', 256, 172);
        ctx.font = `400 26px ${JP}`;
        ctx.fillStyle = '#666';
        ctx.fillText('ひかりマート 三丁目店', 256, 220);
    });
}
export function decalAddress() {
    return panelTexture(512, 128, (ctx) => {
        ctx.fillStyle = '#eceae2';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#30302c';
        ctx.textAlign = 'center';
        ctx.font = `500 30px ${JP}`;
        ctx.fillText('ひかりマート 三丁目店', 256, 48);
        ctx.font = `400 24px ${JP}`;
        ctx.fillStyle = '#5a5a52';
        ctx.fillText('東京都杉並区三丁目 2-14-6', 256, 88);
    });
}
/* ---------------- vending machine face ------------------------------ */
export function vendingFront() {
    const W = 512, H = 1024, R = rng(88);
    return panelTexture(W, H, (ctx) => {
        // body
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#f3f6f8');
        bg.addColorStop(0.5, '#e7ecf1');
        bg.addColorStop(1, '#cdd6de');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // top brand band
        ctx.fillStyle = '#123b6e';
        ctx.fillRect(0, 0, W, 96);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.font = `800 46px ${LAT}`;
        ctx.fillText('COOL DRINK', 24, 62);
        ctx.fillStyle = '#ff6f3c';
        ctx.fillRect(300, 24, 8, 48);
        ctx.fillStyle = '#cfd9e4';
        ctx.font = `500 26px ${JP}`;
        ctx.textAlign = 'right';
        ctx.fillText('つめた〜い', 486, 60);
        // product display
        ctx.fillStyle = '#fbfdff';
        ctx.fillRect(16, 116, 420, 620);
        const cols = 4, rows = 3;
        const labelCols = ['#2b6fb5', '#c8342c', '#e0a52c', '#2f8a55', '#8e44ad', '#e07a2c', '#3fa9c9', '#c94f7c', '#6b7b8c', '#4b8a3a', '#d9b23a', '#a83a2a'];
        for (let r = 0; r < rows; r++) {
            const rowY = 128 + r * 204;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(20, rowY + 176, 412, 26);
            for (let c = 0; c < cols; c++) {
                const x = 36 + c * 104;
                const kind = (r * cols + c) % 3;
                const col = labelCols[(r * cols + c) % labelCols.length];
                if (kind === 2) { // can
                    ctx.fillStyle = '#d9dee2';
                    roundRect(ctx, x + 12, rowY + 42, 60, 128, 8);
                    ctx.fill();
                    ctx.fillStyle = col;
                    ctx.fillRect(x + 12, rowY + 60, 60, 84);
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.fillRect(x + 18, rowY + 88, 48, 22);
                }
                else { // bottle
                    ctx.fillStyle = col;
                    roundRect(ctx, x + 18, rowY + 30, 52, 146, 14);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.82)';
                    ctx.fillRect(x + 18, rowY + 82, 52, 30);
                    ctx.fillStyle = '#f0f4f8';
                    ctx.fillRect(x + 30, rowY + 12, 28, 26);
                }
                ctx.strokeStyle = 'rgba(0,0,0,0.10)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, rowY + 8, 84, 172);
                // price
                ctx.fillStyle = '#1c2b3a';
                ctx.textAlign = 'center';
                ctx.font = `700 28px ${LAT}`;
                ctx.fillText('¥130', x + 42, rowY + 200);
            }
        }
        // button column
        ctx.fillStyle = '#dfe6ec';
        ctx.fillRect(444, 116, 52, 620);
        for (let r = 0; r < 6; r++) {
            ctx.fillStyle = r % 2 ? '#3c6fa8' : '#b8322b';
            roundRect(ctx, 452, 132 + r * 100, 36, 62, 8);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = `600 18px ${LAT}`;
            ctx.textAlign = 'center';
            ctx.fillText(String(r + 1), 470, 170 + r * 100);
        }
        // lower panel
        ctx.fillStyle = '#f1f4f7';
        ctx.fillRect(0, 748, W, 276);
        ctx.fillStyle = '#123b6e';
        roundRect(ctx, 20, 764, 300, 70, 10);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `700 34px ${JP}`;
        ctx.textAlign = 'left';
        ctx.fillText('現金・IC 対応', 40, 812);
        // coin / bill
        ctx.fillStyle = '#20272e';
        roundRect(ctx, 352, 772, 60, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#8b98a4';
        roundRect(ctx, 352, 800, 120, 34, 6);
        ctx.fill();
        ctx.fillStyle = '#20272e';
        roundRect(ctx, 352, 856, 130, 40, 6);
        ctx.fill();
        ctx.fillStyle = '#5b6672';
        ctx.fillRect(368, 866, 98, 6);
        // pickup port
        ctx.fillStyle = '#2a3138';
        roundRect(ctx, 40, 880, 280, 108, 12);
        ctx.fill();
        ctx.fillStyle = '#151a1f';
        roundRect(ctx, 58, 898, 244, 72, 8);
        ctx.fill();
        ctx.fillStyle = '#aab6c1';
        ctx.font = `500 24px ${JP}`;
        ctx.textAlign = 'center';
        ctx.fillText('取出口', 180, 948);
        // bottom trim
        ctx.fillStyle = '#1b232b';
        ctx.fillRect(0, 1000, W, 24);
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fillRect(0, 736, W, 4);
        // reflections in glass
        const sheen = ctx.createLinearGradient(0, 116, 440, 736);
        sheen.addColorStop(0, 'rgba(255,255,255,0.30)');
        sheen.addColorStop(0.35, 'rgba(255,255,255,0.04)');
        sheen.addColorStop(0.55, 'rgba(255,255,255,0.16)');
        sheen.addColorStop(1, 'rgba(255,255,255,0.02)');
        ctx.fillStyle = sheen;
        ctx.fillRect(16, 116, 420, 620);
        void R;
    });
}
export function vendingSide() {
    return panelTexture(256, 1024, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 256, 0);
        g.addColorStop(0, '#c3ccd4');
        g.addColorStop(0.45, '#eef2f6');
        g.addColorStop(1, '#aab5bf');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 1024);
        ctx.fillStyle = '#123b6e';
        ctx.fillRect(0, 0, 256, 96);
        ctx.save();
        ctx.translate(128, 520);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#5d6b78';
        ctx.textAlign = 'center';
        ctx.font = `800 66px ${LAT}`;
        ctx.fillText('COOL DRINK', 0, 20);
        ctx.restore();
        ctx.fillStyle = '#1b232b';
        ctx.fillRect(0, 1000, 256, 24);
    });
}
/* ---------------- ice chest / recycle / signage --------------------- */
export function iceBoxFront() {
    return panelTexture(512, 256, (ctx) => {
        ctx.fillStyle = '#f4f7fa';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#1f7fbf';
        ctx.fillRect(0, 0, 512, 96);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 64px ${JP}`;
        ctx.fillText('アイス', 256, 70);
        ctx.fillStyle = '#0f4f78';
        ctx.font = `800 52px ${LAT}`;
        ctx.fillText('ROCK ICE / CRUSHED ICE', 256, 160);
        ctx.fillStyle = '#6f7c88';
        ctx.font = `500 28px ${JP}`;
        ctx.fillText('1kg ・ 2kg ・ 3kg', 256, 208);
        ctx.fillStyle = '#c3ced8';
        ctx.fillRect(20, 226, 472, 10);
    });
}
export function recycleLabel(kind) {
    return panelTexture(256, 256, (ctx) => {
        ctx.fillStyle = '#f2f3ee';
        ctx.fillRect(0, 0, 256, 256);
        const col = kind === 'can' ? '#c8342c' : kind === 'bottle' ? '#2f7a3f' : '#1f6fa8';
        ctx.fillStyle = col;
        ctx.fillRect(0, 0, 256, 74);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 34px ${JP}`;
        ctx.fillText(kind === 'can' ? 'カン' : kind === 'bottle' ? 'ビン' : 'ペットボトル', 128, 50);
        ctx.fillStyle = col;
        ctx.strokeStyle = col;
        ctx.lineWidth = 8;
        if (kind === 'can') {
            ctx.strokeRect(78, 106, 100, 108);
            ctx.fillRect(96, 96, 64, 12);
        }
        else if (kind === 'bottle') {
            ctx.beginPath();
            ctx.moveTo(108, 96);
            ctx.lineTo(108, 126);
            ctx.lineTo(88, 150);
            ctx.lineTo(88, 214);
            ctx.lineTo(168, 214);
            ctx.lineTo(168, 150);
            ctx.lineTo(148, 126);
            ctx.lineTo(148, 96);
            ctx.closePath();
            ctx.fill();
        }
        else {
            ctx.fillRect(104, 118, 48, 96);
            ctx.fillRect(118, 96, 20, 24);
            ctx.fillStyle = '#fff';
            ctx.fillRect(112, 74, 32, 8);
        }
        ctx.fillStyle = '#3a3a3a';
        ctx.font = `500 22px ${JP}`;
        ctx.fillText('ゴミは分別に', 128, 242);
    });
}
export function nobori(kind) {
    return panelTexture(256, 768, (ctx) => {
        const red = kind === 'onigiri';
        ctx.fillStyle = red ? '#f7f5ec' : '#f4efe2';
        ctx.fillRect(0, 0, 256, 768);
        ctx.fillStyle = red ? '#c8342c' : '#5a3a20';
        ctx.fillRect(0, 0, 256, 92);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 40px ${JP}`;
        ctx.fillText(red ? 'できたて' : '淹れたて', 128, 62);
        drawVertical(ctx, red ? '手づくりおにぎり' : 'ホットコーヒー', 128, 150, 74, `800 62px ${JP}`, red ? '#20140f' : '#2b1a0f');
        ctx.fillStyle = red ? '#c8342c' : '#8a5a2a';
        ctx.font = `800 44px ${LAT}`;
        ctx.textAlign = 'center';
        ctx.fillText(red ? '¥120〜' : '¥110', 128, 690);
        ctx.font = `600 26px ${JP}`;
        ctx.fillText('ひかりマート', 128, 736);
    });
}
export function aframeBoard() {
    return panelTexture(512, 640, (ctx) => {
        ctx.fillStyle = '#2b2b28';
        ctx.fillRect(0, 0, 512, 640);
        ctx.fillStyle = '#f6f4ea';
        ctx.fillRect(14, 14, 484, 612);
        ctx.fillStyle = '#20241f';
        ctx.fillRect(14, 14, 484, 92);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `700 44px ${JP}`;
        ctx.fillText('本日のおすすめ', 256, 76);
        ctx.strokeStyle = '#c9c4b4';
        ctx.lineWidth = 3;
        const items = [
            ['からあげ', '216'],
            ['おにぎり 2個', '240'],
            ['Lコーヒー', '150'],
            ['肉まん', '130'],
        ];
        items.forEach(([n, p], i) => {
            const y = 180 + i * 104;
            ctx.fillStyle = '#2b2b28';
            ctx.textAlign = 'left';
            ctx.font = `600 42px ${JP}`;
            ctx.fillText(n, 52, y);
            ctx.textAlign = 'right';
            ctx.font = `700 44px ${LAT}`;
            ctx.fillText('¥' + p, 460, y);
            ctx.beginPath();
            ctx.moveTo(40, y + 26);
            ctx.lineTo(472, y + 26);
            ctx.stroke();
        });
        ctx.fillStyle = '#8a8375';
        ctx.textAlign = 'center';
        ctx.font = `400 22px ${JP}`;
        ctx.fillText('表示価格は税込です', 256, 596);
    });
}
export function cigaretteWall() {
    const W = 1024, H = 512, R = rng(44);
    return panelTexture(W, H, (ctx) => {
        ctx.fillStyle = '#14171b';
        ctx.fillRect(0, 0, W, H);
        const cols = ['#c0392b', '#2d6a9f', '#e0a02c', '#3c7d55', '#8e44ad', '#cfd8dc', '#c96a2b', '#2f8f8f'];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 12; c++) {
                const x = 20 + c * 84, y = 26 + r * 122;
                ctx.fillStyle = cols[(r * 12 + c) % cols.length];
                roundRect(ctx, x, y, 64, 96, 4);
                ctx.fill();
                ctx.fillStyle = 'rgba(245,245,240,0.92)';
                ctx.fillRect(x + 4, y + 58, 56, 32);
                ctx.fillStyle = 'rgba(40,40,40,0.8)';
                ctx.fillRect(x + 8, y + 72, 48, 4);
                ctx.fillStyle = 'rgba(255,255,255,0.16)';
                ctx.fillRect(x + 2, y, 6, 96);
                void R;
            }
        }
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, W, 12);
    });
}
export function atmFront() {
    return panelTexture(512, 640, (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 640);
        g.addColorStop(0, '#c9d4dd');
        g.addColorStop(1, '#95a3af');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 640);
        ctx.fillStyle = '#123b6e';
        ctx.fillRect(0, 0, 512, 120);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.font = `800 62px ${LAT}`;
        ctx.fillText('ATM', 28, 84);
        ctx.font = `500 30px ${JP}`;
        ctx.textAlign = 'right';
        ctx.fillText('24時間', 486, 82);
        ctx.fillStyle = '#1d2733';
        roundRect(ctx, 24, 140, 300, 220, 10);
        ctx.fill();
        ctx.fillStyle = '#8fd0e8';
        ctx.font = `500 34px ${JP}`;
        ctx.textAlign = 'center';
        ctx.fillText('お引出し', 174, 230);
        ctx.fillText('お預入れ', 174, 292);
        ctx.fillStyle = '#c7d1da';
        roundRect(ctx, 344, 150, 144, 200, 10);
        ctx.fill();
        ctx.fillStyle = '#5b6672';
        for (let r = 0; r < 4; r++)
            for (let c = 0; c < 3; c++) {
                ctx.fillRect(360 + c * 42, 168 + r * 44, 32, 32);
            }
        ctx.fillStyle = '#232b33';
        roundRect(ctx, 30, 400, 210, 26, 8);
        ctx.fill();
        ctx.fillStyle = '#8b98a4';
        roundRect(ctx, 30, 444, 300, 60, 8);
        ctx.fill();
        ctx.fillStyle = '#2b333b';
        roundRect(ctx, 30, 530, 300, 80, 10);
        ctx.fill();
    });
}
export function parkingSign() {
    return panelTexture(256, 256, (ctx) => {
        ctx.fillStyle = '#1a4f9c';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = `800 150px ${LAT}`;
        ctx.fillText('P', 128, 168);
        ctx.font = `500 24px ${JP}`;
        ctx.fillText('ひかりマート', 128, 214);
    });
}
export function magazineCover(i) {
    const R = rng(900 + i);
    const palettes = [
        ['#e63946', '#ffd166', '#1d3557'], ['#2a9d8f', '#e9c46a', '#264653'],
        ['#8e44ad', '#f1c40f', '#ffffff'], ['#e76f51', '#f4a261', '#264653'],
        ['#457b9d', '#a8dadc', '#1d3557'], ['#264653', '#e9c46a', '#e63946'],
        ['#f4a261', '#fff1e6', '#6d4c41'], ['#1b998b', '#fffd82', '#2d3047'],
    ];
    const [a, b, c] = palettes[i % palettes.length];
    return panelTexture(256, 352, (ctx) => {
        ctx.fillStyle = '#f6f5f0';
        ctx.fillRect(0, 0, 256, 352);
        // photo block
        const g = ctx.createLinearGradient(0, 0, 256, 260);
        g.addColorStop(0, a);
        g.addColorStop(0.6, b);
        g.addColorStop(1, c);
        ctx.fillStyle = g;
        ctx.fillRect(0, 40, 256, 240);
        for (let k = 0; k < 6; k++) {
            ctx.fillStyle = `rgba(255,255,255,${0.08 + R() * 0.16})`;
            ctx.beginPath();
            ctx.arc(40 + R() * 190, 60 + R() * 190, 16 + R() * 50, 0, 6.2832);
            ctx.fill();
        }
        // masthead
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = `800 46px ${JP}`;
        ctx.fillText(['週刊', '月刊', 'CITY', 'an', 'Hanako', 'BRUTUS', 'Ray', 'GINZA'][i % 8], 10, 34);
        ctx.fillStyle = '#101010';
        ctx.font = `800 40px ${JP}`;
        ctx.textAlign = 'left';
        ctx.fillText(['大特集', '美しい', '新しい', '夏色', '静かな', '週末の', 'わたし', '東京'][i % 8], 10, 320);
        ctx.fillStyle = '#c8342c';
        ctx.font = `700 26px ${JP}`;
        ctx.fillText('特別価格', 10, 346);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 46, 244, 228);
    });
}
export function pricePop(text, color = '#ffe14d') {
    return panelTexture(256, 160, (ctx) => {
        ctx.fillStyle = color;
        roundRect(ctx, 4, 4, 248, 152, 10);
        ctx.fill();
        ctx.fillStyle = '#c8342c';
        ctx.textAlign = 'center';
        ctx.font = `800 78px ${LAT}`;
        ctx.fillText(text, 128, 104);
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 3;
        roundRect(ctx, 4, 4, 248, 152, 10);
        ctx.stroke();
    });
}
export function neonOpen() {
    return panelTexture(512, 256, (ctx) => {
        ctx.fillStyle = '#0b0d10';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#ff4a3d';
        ctx.textAlign = 'center';
        ctx.font = `800 108px ${LAT}`;
        ctx.fillText('OPEN', 256, 130);
        ctx.fillStyle = '#ffd166';
        ctx.font = `700 54px ${JP}`;
        ctx.fillText('24 HOURS', 256, 198);
    });
}
