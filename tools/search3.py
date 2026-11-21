import sys,itertools,time; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
from search_lib import evaluate
axis=sys.argv[1]; name='raisin-p057' if axis=='x' else 'raisin-p058'
sz=f'inTexSize.{axis}'; tc=(f'texCoord0.{axis}',f'texCoord1.{axis}')
HEAD='''#version 300 es
precision highp float;

in vec2 texCoord0;
in vec2 texCoord1;
uniform vec2 inTexSize;
uniform mediump int texDumpMode;
layout(location = 0) out vec4 FragColor;

'''
K='(1.0 / 255.0)'
def val(m,p):
    return {1:f'floor(fract({p}) * 256.0)',2:f'floor(fract({p} * (1.0 / 256.0)) * 256.0)',3:f'floor({p} * (1.0 / 256.0))'}[m]
def build(perm,lanemajor,scalepre,sel,vec):
    b='void main()\n{\n    float size = %s;\n'%sz
    if vec:
        b+=f'    vec2 position = clamp(vec2({tc[0]}, {tc[1]}) * size - 0.5, 0.0, size);\n'
        P=('position',)
    else:
        b+=f'    float p0 = clamp({tc[0]} * size - 0.5, 0.0, size);\n    float p1 = clamp({tc[1]} * size - 0.5, 0.0, size);\n'
    sc=(lambda e:f'{e} * {K}') if scalepre else (lambda e:e)
    lines=[]
    if vec:
        for m in perm: lines.append(f'    vec2 v{m} = {sc(val(m,"position"))};')
    else:
        order=[(m,l) for m in perm for l in (0,1)] if lanemajor==0 else [(m,l) for l in (0,1) for m in perm]
        for m,l in order: lines.append(f'    float v{m}_{l} = {sc(val(m,f"p{l}"))};')
    b+='\n'.join(lines)+'\n'
    fin=(lambda e:e) if scalepre else (lambda e:f'({e}) * {K}')
    if vec:
        def o(m): return f'FragColor = {fin(f"v{m}")}.xxyy;' if not scalepre else f'FragColor = v{m}.xxyy;'
        o=lambda m: f'FragColor = v{m}.xxyy;' if scalepre else f'FragColor = (v{m} * {K}).xxyy;'
    else:
        def o(m):
            a,c=f'v{m}_0',f'v{m}_1'
            if not scalepre: a,c=f'{a} * {K}',f'{c} * {K}'
            return f'FragColor = vec4({a}, {a}, {c}, {c});'
    if sel=='chain':
        b+=f'    if (texDumpMode == 1) {{\n        {o(1)}\n    }} else if (texDumpMode == 2) {{\n        {o(2)}\n    }} else {{\n        {o(3)}\n    }}\n'
    else:
        b+=f'    FragColor = {o(3)[len("FragColor = "):-1]};\n    if (texDumpMode == 2) {{ {o(2)} }}\n    if (texDumpMode == 1) {{ {o(1)} }}\n'
    return HEAD+b+'}\n'
cands=[]
for perm in itertools.permutations((1,2,3)):
    for lm in (0,1):
        for sp in (True,False):
            for sel in ('chain','seq'):
                for vec in (False,True):
                    if vec and lm: continue
                    cands.append(((perm,lm,sp,sel,vec),build(perm,lm,sp,sel,vec)))
print(len(cands),flush=True)
t=time.time(); sc=evaluate(name,[f for _,f in cands])
order=sorted(range(len(cands)),key=lambda i:sc[i][0])
for i in order[:6]: print(sc[i],cands[i][0])
for i in order:
    if sc[i][1]: open(f'/home/h/tmp/SemcCameraUI/.tmp/ir3/found_{name}.frag','w').write(cands[i][1]); print('IDENTICAL',cands[i][0]); break
print('secs',int(time.time()-t))
