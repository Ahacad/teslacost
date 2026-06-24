// Web-prep for the real Tesla source meshes → public/models/{model3,modely}.glb.
// The committed GLBs are the output of this; re-run only to re-derive from source.
//
// PROVENANCE (see also docs/superpowers/ASSETS.md):
//   model3: Tesla Model 3 by OneSteven (Sketchfab), CC-BY-NC-4.0. Pulled as
//     scene.gltf+bin+textures from github.com/MigrantCaravan/Tesla-CyberTruck-
//     Model3-Paint-Selector, packed to a GLB with `npx gltf-pipeline`.
//   modely: Tesla Model Y by 3D Hawk (downloadfree3d.com), free/non-commercial,
//     no explicit license. Shipped as .3ds; converted to GLB with assimpjs.
//
// What this does, and why:
//   - strip textures FIRST (license-plate / studio-backdrop junk; the body is
//     solid paint recolored at runtime) so dedup never sizes the bogus images.
//   - canonicalize ONE `body` material and neutralize any other name matching the
//     app's recolor regex, so paint recolor binds the shell alone. The Model Y's
//     painted shell is the `vision03` material (+ vision02/08 mirror caps),
//     identified by color-coding each material and rendering — not its name.
//   - weld + decimate the .3ds export, which lands ~178k unindexed tris / ~20 MB.
//
// Deps (dev-only, not app deps): npm i -D @gltf-transform/core
//   @gltf-transform/functions meshoptimizer ; plus assimpjs + gltf-pipeline for
//   the source conversion above.
// Run: node scripts/process-meshes.mjs <in.glb> <out.glb> <model3|modely>

import { NodeIO } from '@gltf-transform/core';
import { weld, dedup, prune, simplify } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import { readFileSync } from 'node:fs';

const [,, inPath, outPath, mode] = process.argv;
const io = new NodeIO();
const doc = await io.read(inPath);
const root = doc.getRoot();
await MeshoptSimplifier.ready;
const RECOLOR = /body|paint|car|exterior/i;
const tris = () => {
  let t = 0;
  for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
    const i = p.getIndices(), pos = p.getAttribute('POSITION');
    t += (i ? i.getCount() : pos.getCount()) / 3;
  }
  return Math.round(t);
};
console.log(mode, 'in tris', tris());

// The .3ds Model Y has four wheel-arch splash-guard panels (material vision13) that
// bulge outboard PAST the bodywork and render as ugly dark blobs around the wheels.
// Drop them: vision13 primitives that touch the ground AND sit far outboard (outer X
// edge well beyond a normal panel). Central vision13 trim (front lip, cowl) and the
// higher mirror caps don't match, so they stay.
function dropWheelFlaps(root) {
  const a = [0, 0, 0];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity;
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, a); minX = Math.min(minX, a[0]); maxX = Math.max(maxX, a[0]); minZ = Math.min(minZ, a[2]);
    }
  }
  const cx = (minX + maxX) / 2, spanX = maxX - minX;
  let dropped = 0;
  for (const mesh of root.listMeshes()) for (const prim of [...mesh.listPrimitives()]) {
    if (prim.getMaterial()?.getName() !== 'vision13') continue;
    const pos = prim.getAttribute('POSITION');
    let pMinX = Infinity, pMaxX = -Infinity, pMinZ = Infinity;
    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, a); pMinX = Math.min(pMinX, a[0]); pMaxX = Math.max(pMaxX, a[0]); pMinZ = Math.min(pMinZ, a[2]);
    }
    if (pMinZ < minZ + 2 && Math.max(pMaxX - cx, cx - pMinX) > 0.34 * spanX) {
      mesh.removePrimitive(prim); prim.dispose(); dropped++;
    }
  }
  console.log('modely dropped', dropped, 'wheel-arch flaps');
}

// Recompute smooth vertex normals, welded by position WITHIN each material group.
// The .3ds source + decimation leave noisy/faceted normals that read as blotchy
// "dents" on the painted shell. Coincident verts sharing a material average to one
// smooth field (adjacent body panels blend); verts on a panel GAP have unique
// positions so creases stay crisp, and body↔glass edges stay hard (different mats).
function smoothNormals(root) {
  const groups = new Map();
  for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
    const name = prim.getMaterial()?.getName() ?? '__none';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(prim);
  }
  const KEY = (x, y, z) => `${Math.round(x*1e4)},${Math.round(y*1e4)},${Math.round(z*1e4)}`;
  for (const prims of groups.values()) {
    const acc = new Map(); // position key -> summed face normals (length = 2*area, so area-weighted)
    for (const prim of prims) {
      const pos = prim.getAttribute('POSITION'), idx = prim.getIndices();
      const count = idx ? idx.getCount() : pos.getCount();
      const get = (i) => pos.getElement(idx ? idx.getScalar(i) : i, [0, 0, 0]);
      for (let i = 0; i < count; i += 3) {
        const a = get(i), b = get(i + 1), c = get(i + 2);
        const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
        const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
        for (const p of [a, b, c]) {
          const k = KEY(p[0], p[1], p[2]), e = acc.get(k);
          if (e) { e[0]+=nx; e[1]+=ny; e[2]+=nz; } else acc.set(k, [nx, ny, nz]);
        }
      }
    }
    for (const prim of prims) {
      const pos = prim.getAttribute('POSITION'), nrm = prim.getAttribute('NORMAL');
      if (!nrm) continue;
      for (let i = 0; i < pos.getCount(); i++) {
        const p = pos.getElement(i, [0, 0, 0]);
        const [nx, ny, nz] = acc.get(KEY(p[0], p[1], p[2])) ?? [0, 0, 1];
        const len = Math.hypot(nx, ny, nz) || 1;
        nrm.setElement(i, [nx/len, ny/len, nz/len]);
      }
    }
  }
}

// 1) strip ALL textures FIRST (license plates / studio junk; body is solid paint) so
//    dedup never tries to size the bogus external images, then prune the orphans.
for (const mat of root.listMaterials()) {
  mat.setBaseColorTexture(null).setMetallicRoughnessTexture(null)
     .setNormalTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
}
await doc.transform(prune());

// 1.5) drop the ugly outboard wheel-arch flaps (Model Y only)
if (mode === 'modely') dropWheelFlaps(root);

// 2) canonicalize the body material + neutralize decoys so recolor only ever hits `body`
if (mode === 'modely') {
  const bodyMat = doc.createMaterial('body')
    .setBaseColorFactor([0.914, 0.914, 0.918, 1]).setMetallicFactor(0.6).setRoughnessFactor(0.45);
  const white = new Set(['vision03', 'vision02', 'vision08']);
  for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
    const mat = p.getMaterial();
    if (mat && white.has(mat.getName())) p.setMaterial(bodyMat);
  }
}
if (mode === 'model3') {
  for (const mat of root.listMaterials()) if (mat.getName() === 'CAR_PAINT') mat.setName('body');
}
for (const mat of root.listMaterials()) {
  const n = mat.getName();
  if (n !== 'body' && RECOLOR.test(n)) mat.setName(n.replace(/body|paint|car|exterior/gi, 'z'));
}

// 3) weld + decimate. Keep the error bound TIGHT: a loose bound (0.0015) lets meshopt
//    collapse interior edges of the big curved body panels into a lumpy, "dented" surface
//    — most visible on the rear quarters. 0.0004 preserves the shell (smooth) and still
//    sheds the dense interior/underbody/wheel tris.
await doc.transform(weld(), dedup());
const target = mode === 'modely' ? 70000 : 0;
if (target && tris() > target) {
  await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: target / tris(), error: 0.0004 }));
  await doc.transform(weld(), dedup());
}
await doc.transform(prune());

// 4) recompute smooth normals (Model 3 ships clean normals; only the .3ds Model Y needs it)
if (mode === 'modely') smoothNormals(root);

console.log(mode, 'out tris', tris(), '| mats', root.listMaterials().map(m => m.getName()).join(','));
await io.write(outPath, doc);
console.log(mode, 'wrote', (readFileSync(outPath).length / 1048576).toFixed(2) + 'MB');
