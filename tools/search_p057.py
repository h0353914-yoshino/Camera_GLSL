import sys,itertools,time; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
from search_lib import evaluate
axis=sys.argv[1]   # x or y
name='raisin-p057' if axis=='x' else 'raisin-p058'
sz='inTexSize.x' if axis=='x' else 'inTexSize.y'
tc=('texCoord0.x','texCoord1.x') if axis=='x' else ('texCoord0.y','texCoord1.y')
HEAD='''#version 300 es
precision highp float;

in vec2 texCoord0;
in vec2 texCoord1;
uniform vec2 inTexSize;
uniform mediump int texDumpMode;
layout(location = 0) out vec4 FragColor;

'''
def build(c):
    K='(1.0 / 255.0)' if c['scale']=='mul' else None
    def sc(e): return f'{e} * {K}' if K else f'{e} / 255.0'
    fr=(lambda x:f'fract({x})') if c['fract']=='fract' else (lambda x:f'({x} - floor({x}))')
    up=(lambda x:f'{x} * (1.0 / 256.0)') if c['div']=='mul' else (lambda x:f'{x} / 256.0')
    body='void main()\n{\n    float size = %s;\n'%sz
    if c['pos']=='vec2':
        body+=f'    vec2 position = vec2({tc[0]}, {tc[1]}) * size - 0.5;\n'
        body+='    position = clamp(position, 0.0, size);\n' if c['clamp']=='clamp' else '    position = min(max(position, 0.0), size);\n'
        P=lambda i:f'position.{"xy"[i]}'; V=lambda e:f'({e})'
        lane=lambda f,p: f(p)
        def val(mode,p):  # p expression of position (vec2 or float)
            if mode==1: return f'floor({fr(p)} * 256.0)'
            if mode==2: return f'floor({fr(up(p))} * 256.0)'
            return f'floor({up(p)})'
        pv='position'
        if c['upper']=='var':
            body+=f'    vec2 upperPosition = {up(pv)};\n'
            def val(mode,p):
                if mode==1: return f'floor({fr(p)} * 256.0)'
                if mode==2: return f'floor({fr("upperPosition")} * 256.0)'
                return 'floor(upperPosition)'
        if c['assign']=='perbranch':
            def out(e): return f'FragColor = ({sc(e)}).xxyy;' if c['out']=='xxyy' else f'vec2 t = {sc(e)}; FragColor = vec4(t.x, t.x, t.y, t.y);'
            chain=[(1,'texDumpMode == 1'),(2,'texDumpMode == 2'),(3,None)]
            if c['order']=='rev': chain=[(3,'texDumpMode != 1 && texDumpMode != 2'),(2,'texDumpMode == 2'),(1,'texDumpMode == 1')]
            for n,(mode,cond) in enumerate(chain):
                kw='if' if n==0 else ('else if' if cond else 'else')
                head=f'    {kw} ({cond}) {{\n' if cond else f'    {kw} {{\n'
                body+=head+f'        {out(val(mode,pv))}\n    }}\n'
        else:
            body+='    vec2 code;\n    if (texDumpMode == 1) {\n        code = %s;\n    } else if (texDumpMode == 2) {\n        code = %s;\n    } else {\n        code = %s;\n    }\n'%(val(1,pv),val(2,pv),val(3,pv))
            body+=f'    FragColor = (code * {K}).xxyy;\n' if c['scale']=='mul' and c['out']=='xxyy' else (f'    FragColor = vec4(code.x, code.x, code.y, code.y) * {K};\n' if K else '    FragColor = code.xxyy / 255.0;\n')
    else:  # scalar lanes
        body+=f'    float p0 = {tc[0]} * size - 0.5;\n    float p1 = {tc[1]} * size - 0.5;\n'
        if c['clamp']=='clamp': body+='    p0 = clamp(p0, 0.0, size);\n    p1 = clamp(p1, 0.0, size);\n'
        else: body+='    p0 = min(max(p0, 0.0), size);\n    p1 = min(max(p1, 0.0), size);\n'
        def val(mode,p):
            if mode==1: return f'floor({fr(p)} * 256.0)'
            if mode==2: return f'floor({fr(up(p))} * 256.0)'
            return f'floor({up(p)})'
        chain=[(1,'texDumpMode == 1'),(2,'texDumpMode == 2'),(3,None)]
        if c['order']=='rev': chain=[(3,'texDumpMode != 1 && texDumpMode != 2'),(2,'texDumpMode == 2'),(1,'texDumpMode == 1')]
        if c['assign']=='perbranch':
            for n,(mode,cond) in enumerate(chain):
                kw='if' if n==0 else ('else if' if cond else 'else')
                head=f'    {kw} ({cond}) {{\n' if cond else f'    {kw} {{\n'
                a,b=sc(val(mode,'p0')),sc(val(mode,'p1'))
                body+=head+f'        FragColor = vec4({a}, {a}, {b}, {b});\n    }}\n'
        else:
            body+='    float c0;\n    float c1;\n'
            for n,(mode,cond) in enumerate(chain):
                kw='if' if n==0 else ('else if' if cond else 'else')
                head=f'    {kw} ({cond}) {{\n' if cond else f'    {kw} {{\n'
                body+=head+f'        c0 = {sc(val(mode,"p0"))};\n        c1 = {sc(val(mode,"p1"))};\n    }}\n'
            body+='    FragColor = vec4(c0, c0, c1, c1);\n'
    return HEAD+body+'}\n'
AX={'pos':['vec2','scalar'],'clamp':['clamp','maxmin'],'order':['fwd','rev'],'assign':['perbranch','codevar'],'upper':['inline','var'],'fract':['fract','manual'],'scale':['mul','div'],'div':['mul','divide'],'out':['xxyy','explicit']}
keys=list(AX)
cfgs=[dict(zip(keys,v)) for v in itertools.product(*AX.values())]
# prune equivalent combos
seen=set(); uniq=[]
for c in cfgs:
    f=build(c)
    if f in seen: continue
    seen.add(f); uniq.append((c,f))
print('candidates',len(uniq),flush=True)
t=time.time()
sc=evaluate(name,[f for _,f in uniq])
order=sorted(range(len(uniq)),key=lambda i:sc[i][0])
for i in order[:5]: print(sc[i],uniq[i][0])
for i in order:
    if sc[i][1]:
        open(f'/home/h/tmp/SemcCameraUI/.tmp/ir3/found_{name}.frag','w').write(uniq[i][1]); print('IDENTICAL',uniq[i][0]); break
print('secs',int(time.time()-t))
