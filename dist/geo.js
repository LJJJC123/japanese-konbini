import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export function box(w, h, d, mat, x, y, z, name) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (name)
        m.name = name;
    return m;
}
export function rbox(w, h, d, r, mat, x, y, z, seg = 3, name) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (name)
        m.name = name;
    return m;
}
export function plane(w, h, mat, x, y, z, rotY = 0, rotX = 0, name) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.set(rotX, rotY, 0);
    m.receiveShadow = true;
    if (name)
        m.name = name;
    return m;
}
export function cyl(rt, rb, h, seg, mat, x, y, z, name) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (name)
        m.name = name;
    return m;
}
export function tube(from, to, r, mat, seg = 6) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    m.castShadow = true;
    return m;
}
/** thin decal quad, nudged off a surface */
export function decal(w, h, mat, x, y, z, rotY = 0) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    return m;
}
