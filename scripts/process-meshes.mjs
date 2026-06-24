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

// 1) strip ALL textures FIRST (license plates / studio junk; body is solid paint) so
//    dedup never tries to size the bogus external images, then prune the orphans.
for (const mat of root.listMaterials()) {
  mat.setBaseColorTexture(null).setMetallicRoughnessTexture(null)
     .setNormalTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
}
await doc.transform(prune());

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

// 3) weld + decimate
await doc.transform(weld(), dedup());
const target = mode === 'modely' ? 70000 : 0;
if (target && tris() > target) {
  await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: target / tris(), error: 0.0015 }));
  await doc.transform(weld(), dedup());
}
await doc.transform(prune());

console.log(mode, 'out tris', tris(), '| mats', root.listMaterials().map(m => m.getName()).join(','));
await io.write(outPath, doc);
console.log(mode, 'wrote', (readFileSync(outPath).length / 1048576).toFixed(2) + 'MB');
