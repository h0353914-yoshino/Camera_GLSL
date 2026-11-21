import sys,random,time,json; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
from search_lib import evaluate
axis=sys.argv[1]; N=int(sys.argv[2]); seed=int(sys.argv[3]) if len(sys.argv)>3 else 1
name='raisin-p057' if axis=='x' else 'raisin-p058'
sz=f'inTexSize.{axis}'; tc=(f'texCoord0.{axis}',f'texCoord1.{axis}')
HEAD='''#version 300 es
precision highp float;

in vec2 texCoord0;
in vec2 texCoord1;
uniform vec2 inTexSize;
uniform mediump int texDumpMode;
layout(location = 0) out vec4 FragColor;

'''
G={'posexpr':['a','b','c'],'clampf':['clamp','maxmin','minmax'],'swap':[0,1],'m1':['floorfract','fl256','floor256f'],'up':['mul','div','lit'],'sc':['mul','div','lit'],'out':['vec','comp','xxyy'],'cond':['std','flip'],'ret':['chain','early'],'prec':['','highp ']}
def build(c):
    def P(t): 
        return {'a':f'{t} * size - 0.5','b':f'({t} - 0.5 / size) * size','c':f'{t} * size + (-0.5)'}[c['posexpr']]
    def CL(v): return {'clamp':f'{v} = clamp({v}, 0.0, size);','maxmin':f'{v} = min(max({v}, 0.0), size);','minmax':f'{v} = max(min({v}, size), 0.0);'}[c['clampf']]
    pr=c['prec']
    decl=[f'    {pr}float p0 = {P(tc[0])};',f'    {pr}float p1 = {P(tc[1])};']
    cl=[f'    {CL("p0")}',f'    {CL("p1")}']
    if c['swap']: decl=decl[::-1]; cl=cl[::-1]
    body='void main()\n{\n    float size = %s;\n'%sz+'\n'.join(decl)+'\n'+'\n'.join(cl)+'\n'
    up=lambda p:{'mul':f'{p} * (1.0 / 256.0)','div':f'{p} / 256.0','lit':f'{p} * 0.00390625'}[c['up']]
    def val(m,p):
        if m==1: return {'floorfract':f'floor(fract({p}) * 256.0)','fl256':f'floor(256.0 * fract({p}))','floor256f':f'floor((fract({p})) * 256.0)'}[c['m1']]
        if m==2: return f'floor(fract({up(p)}) * 256.0)'
        return f'floor({up(p)})'
    sc=lambda e:{'mul':f'{e} * (1.0 / 255.0)','div':f'{e} / 255.0','lit':f'{e} * 0.003921569'}[c['sc']]
    def out(m):
        a,b=sc(val(m,'p0')),sc(val(m,'p1'))
        if c['out']=='vec': return f'FragColor = vec4({a}, {a}, {b}, {b});'
        if c['out']=='comp': return f'FragColor.x = {a};\n        FragColor.y = {a};\n        FragColor.z = {b};\n        FragColor.w = {b};'
        return f'FragColor = vec2({a}, {b}).xxyy;'
    eq=(lambda n:f'texDumpMode == {n}') if c['cond']=='std' else (lambda n:f'{n} == texDumpMode')
    if c['ret']=='chain':
        body+=f'    if ({eq(1)}) {{\n        {out(1)}\n    }} else if ({eq(2)}) {{\n        {out(2)}\n    }} else {{\n        {out(3)}\n    }}\n'
    else:
        body+=f'    if ({eq(1)}) {{\n        {out(1)}\n        return;\n    }}\n    if ({eq(2)}) {{\n        {out(2)}\n        return;\n    }}\n    {out(3)}\n'
    return HEAD+body+'}\n'
rnd=random.Random(seed); seen=set(); cands=[]
while len(cands)<N:
    c={k:rnd.choice(v) for k,v in G.items()}; f=build(c)
    if f in seen: continue
    seen.add(f); cands.append((c,f))
t=time.time(); sc=evaluate(name,[f for _,f in cands])
order=sorted(range(len(cands)),key=lambda i:sc[i][0])
for i in order[:4]: print(sc[i],cands[i][1] and cands[i][0])
for i in order:
    if sc[i][1]: open(f'/home/h/tmp/SemcCameraUI/.tmp/ir3/found_{name}.frag','w').write(cands[i][1]); print('IDENTICAL',cands[i][0]); break
print('secs',int(time.time()-t))
