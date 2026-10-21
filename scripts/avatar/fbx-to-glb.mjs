// Builds public/lab/avatar/me.glb from the Mixamo export (avatar/Waving.fbx: rig,
// skin and wave clip) and the baked-light texture avatar/shaded.png (the texture
// of lod_basic_shaded.fbx; both FBX files share the same mesh and UVs).
//
//   node scripts/avatar/fbx-to-glb.mjs avatar/Waving.fbx .avatar-tmp/raw.glb
//   python scripts/avatar/add-texture.py .avatar-tmp/raw.glb avatar/shaded.png .avatar-tmp/tex.glb
//   npx @gltf-transform/cli@4.2.1 weld .avatar-tmp/tex.glb .avatar-tmp/weld.glb
//   npx @gltf-transform/cli@4.2.1 resample .avatar-tmp/weld.glb .avatar-tmp/res.glb
//   npx @gltf-transform/cli@4.2.1 meshopt .avatar-tmp/res.glb public/lab/avatar/me.glb
//
// The first clip is renamed "wave" (gestures.ts refers to it by that name).
import fs from "fs";
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ style:{}, addEventListener(){}, removeEventListener(){} }) };
globalThis.FileReader = class { readAsArrayBuffer(b){ b.arrayBuffer().then(r=>{ this.result=r; this.onloadend?.(); this.onload?.({target:this}); }); } readAsDataURL(b){ b.arrayBuffer().then(r=>{ this.result='data:application/octet-stream;base64,'+Buffer.from(r).toString('base64'); this.onloadend?.(); }); } };
const THREE = await import('three');
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
const buf = fs.readFileSync(process.argv[2]);
const obj = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
obj.traverse(o => { if (o.isMesh) { const uv = o.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); o.material = new THREE.MeshStandardMaterial({ name: 'avatar' }); o.name = 'avatar'; } });
const clip = obj.animations[0]; clip.name = 'wave';
const glb = await new GLTFExporter().parseAsync(obj, { binary: true, animations: [clip] });
fs.writeFileSync(process.argv[3], Buffer.from(glb));
console.log('wrote', process.argv[3], glb.byteLength);
