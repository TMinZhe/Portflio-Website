import json, struct, io, sys
from PIL import Image
src, png, dst = sys.argv[1:4]
b = open(src,'rb').read()
jl = struct.unpack_from('<I', b, 12)[0]
j = json.loads(b[20:20+jl]); blob = bytearray(b[20+jl+8:])
img = Image.open(png).convert('RGB'); out = io.BytesIO(); img.save(out, 'JPEG', quality=88, optimize=True); data = out.getvalue()
while len(blob) % 4: blob.append(0)
j['bufferViews'].append({'buffer':0,'byteOffset':len(blob),'byteLength':len(data)}); blob += data
while len(blob) % 4: blob.append(0)
j['buffers'][0]['byteLength'] = len(blob)
j['images'] = [{'bufferView':len(j['bufferViews'])-1,'mimeType':'image/jpeg','name':'shaded'}]
j['samplers'] = [{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}]
j['textures'] = [{'source':0,'sampler':0}]
# Lighting is baked into the texture: render unlit.
j['materials'] = [{'name':'avatar','pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':1},'extensions':{'KHR_materials_unlit':{}}}]
j.setdefault('extensionsUsed',[]).append('KHR_materials_unlit')
print('meshes', len(j['meshes']), 'anims', [a['name'] for a in j['animations']], 'img', len(data))
js = json.dumps(j, separators=(',',':')).encode()
while len(js) % 4: js += b' '
with open(dst,'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 28+len(js)+len(blob))); f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(blob), 0x004E4942)); f.write(blob)
