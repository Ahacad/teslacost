# 3D car assets — provenance & licensing

The viewer shows real, recognizable Tesla meshes. Both are third-party assets,
web-prepped by `scripts/process-meshes.mjs`. Credits render in the page footer
alongside a "Not affiliated with or endorsed by Tesla, Inc." disclaimer; this app
is a personal, non-commercial purchase-decision tool.

## Model 3 — `public/models/model3.glb`
- **Author / license:** OneSteven (Sketchfab), **CC-BY-NC-4.0** (attribution, non-commercial).
- **Source:** `tesla-model-3-117d7dbdd6f94df9886c42995cdd06db` on Sketchfab, mirrored as
  `scene.gltf`+`scene.bin`+textures in
  `github.com/MigrantCaravan/Tesla-CyberTruck-Model3-Paint-Selector`.
- **Pipeline:** `npx gltf-pipeline -i scene.gltf -o model3.glb` → `process-meshes.mjs model3`.
  Result: ~17k tris, ~0.43 MB. Body material `CAR_PAINT` → `body`.

## Model Y — `public/models/modely.glb`
- **Author / license:** 3D Hawk, via downloadfree3d.com. **No explicit license** is
  bundled (the page only credits "3D Hawk"); treated as free / non-commercial. The
  cleanest CC-BY Model Y alternatives (e.g. SandyMontage, 40k tris) are Sketchfab
  login-gated — swap one in here if stricter licensing is wanted; it's data-only.
- **Source:** `tesla-model-y-free-download.zip` (a `.3ds`).
- **Pipeline:** assimpjs `.3ds`→GLB → `process-meshes.mjs modely` (weld + decimate
  178k→117k tris, strip textures, merge the painted shell `vision03`+mirrors into one
  `body` material). Result: ~117k tris, ~3.5 MB.

## Why not procedural / why these
A from-scratch low-poly read as a generic car, not a Tesla. Sourcing real meshes is
the only way to be recognizable. The Model Y is the hard one: no no-auth, web-weight,
cleanly-licensed Model Y GLB exists (GitHub has none; all real ones are Sketchfab-gated
or, like this, unlicensed) — so this is the pragmatic pick, transparently credited.
