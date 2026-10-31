import * as THREE from 'three';
import { asphaltMaps, concreteMaps, sidingMaps, vinylFloorMaps, ceilingMaps, roofMaps, graphicMaterial } from './tex.js';
import * as G from './graphics.js';
function cloneRepeat(t, rx, ry) {
    const c = t.clone();
    c.needsUpdate = true;
    c.repeat.set(rx, ry);
    c.wrapS = c.wrapT = THREE.RepeatWrapping;
    return c;
}
export function buildMaterials() {
    const asphalt = asphaltMaps([26, 18]);
    const concrete = concreteMaps([3, 3], '#9d9a91');
    const sid = sidingMaps([1, 1]);
    const vinyl = vinylFloorMaps([14, 16]);
    const ceil = ceilingMaps([9, 11]);
    const roof = roofMaps([5, 5]);
    const whiteAlu = new THREE.MeshStandardMaterial({ color: 0xe9e9e4, roughness: 0.36, metalness: 0.12, envMapIntensity: 0.7 });
    const whiteAluDull = new THREE.MeshStandardMaterial({ color: 0xdeded7, roughness: 0.52, metalness: 0.06 });
    const darkAlu = new THREE.MeshStandardMaterial({ color: 0x3c4045, roughness: 0.44, metalness: 0.45 });
    const stainless = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.28, metalness: 0.85, envMapIntensity: 1.1 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x1c1e20, roughness: 0.9 });
    const glass = new THREE.MeshPhysicalMaterial({
        color: 0xd2e2ec, metalness: 0.0, roughness: 0.03, transparent: true, opacity: 0.07,
        envMapIntensity: 1.5, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.03,
    });
    const glassDark = new THREE.MeshPhysicalMaterial({
        color: 0x8fa3b0, metalness: 0.1, roughness: 0.06, transparent: true, opacity: 0.22,
        envMapIntensity: 1.8, side: THREE.DoubleSide, depthWrite: false,
    });
    const wallInt = new THREE.MeshStandardMaterial({ color: 0xdcd7c9, roughness: 0.85 });
    const soffit = new THREE.MeshStandardMaterial({ color: 0xdedcd4, roughness: 0.7 });
    const concreteMat = new THREE.MeshStandardMaterial({ map: concrete.map, normalMap: concrete.normalMap, roughness: 0.86, metalness: 0.0, envMapIntensity: 0.4 });
    const asphaltMat = new THREE.MeshStandardMaterial({
        map: asphalt.map, normalMap: asphalt.normalMap, roughnessMap: asphalt.roughnessMap,
        roughness: 1.0, metalness: 0.02, envMapIntensity: 0.55, color: 0xffffff,
    });
    const whitePaint = new THREE.MeshStandardMaterial({ color: 0xf2f2ec, roughness: 0.55, metalness: 0.0 });
    const shelfWhite = new THREE.MeshStandardMaterial({ color: 0xf0eee6, roughness: 0.62 });
    const shelfGrey = new THREE.MeshStandardMaterial({ color: 0x9aa0a4, roughness: 0.5, metalness: 0.3 });
    const lightTube = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff4e2, emissiveIntensity: 1.8, roughness: 0.4 });
    const lightSoft = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1dc, emissiveIntensity: 0.85, roughness: 0.6 });
    const canopyLamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d4, emissiveIntensity: 2.0, roughness: 0.3 });
    const sidingMat = new THREE.MeshStandardMaterial({ map: sid.map, normalMap: sid.normalMap, roughness: 0.66, metalness: 0.05, envMapIntensity: 0.5 });
    const sidingMatTall = new THREE.MeshStandardMaterial({ map: cloneRepeat(sid.map, 1, 3), normalMap: cloneRepeat(sid.normalMap, 1, 3), roughness: 0.66, metalness: 0.05, envMapIntensity: 0.5 });
    const floorInt = new THREE.MeshStandardMaterial({ map: vinyl.map, roughnessMap: vinyl.roughnessMap, roughness: 0.55, metalness: 0.0, envMapIntensity: 0.35 });
    const ceilMat = new THREE.MeshStandardMaterial({ map: ceil.map, roughness: 0.8, metalness: 0.0 });
    const roofMat = new THREE.MeshStandardMaterial({ map: roof.map, roughness: 0.78, metalness: 0.03, envMapIntensity: 0.8, color: 0xb8bcc0, emissive: 0x14171a, emissiveIntensity: 0.9 });
    const apronMat = new THREE.MeshStandardMaterial({
        map: cloneRepeat(concrete.map, 10, 2), normalMap: cloneRepeat(concrete.normalMap, 10, 2),
        roughness: 0.62, metalness: 0.02, envMapIntensity: 0.55,
    });
    const fasciaMat = graphicMaterial(G.fasciaSignCanvas(), { emissive: 0.58, rough: 0.3 });
    const sideSignMat = graphicMaterial(G.sideSignCanvas(), { emissive: 0.55, rough: 0.3 });
    return {
        asphalt, concrete, vinyl, ceil,
        whiteAlu, whiteAluDull, darkAlu, stainless, rubber, glass, glassDark, wallInt, soffit,
        concreteMat, apronMat, asphaltMat, whitePaint, shelfWhite, shelfGrey, lightTube, lightSoft, canopyLamp,
        sidingMat, sidingMatTall, floorInt, ceilMat, roofMat, fasciaMat, sideSignMat,
    };
}
