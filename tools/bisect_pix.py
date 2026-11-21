import sys,os,subprocess
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import patchbin,pixcmp,ir3_to_es100 as T
import stockloop as s
from gdiff import VS
R='/home/h/tmp/SemcCameraUI'
def defined(L,k):
    import re
    d=set()
    for pc in range(k):
        fl,op,rest=L.ins[pc]
        if op in('nop','bary.f','jump','br','end') or op.startswith('brac'): continue
        lanes=int(re.search(r'\(rpt(\d)\)',fl)[1])+1 if '(rpt' in fl else 1
        if op=='sam':
            m=re.fullmatch(r'\((f16|f32)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), .*',rest); _,mask,dk,dg,dc=m.groups()
            if dk=='hr':
                d0=4*int(dg)+'xyzw'.index(dc)
                for i in range(len(mask)): d.add(d0+i)
            continue
        dst=re.split(r',\s*(?![^()]*\))',rest)[0].strip(); m=re.match(r'(?:\(ei\))?(hr|r|p)(\d+)\.([xyzw])$',dst)
        if not m or m[1]!='hr': continue
        i0=4*int(m[2])+'xyzw'.index(m[3])
        for l in range(lanes): d.add(i0+l)
    return [c for c in range(3) if c in d]
def probe(name,k,trials=64):
    kind,num=name.split('-p'); src=f'{R}/.tmp/glsl-completion/{kind}/p{int(num):03}.bin'
    out=f'{R}/.tmp/ir3/patched.bin'; patchbin.patch_end(src,out,k)
    L=T.Lifter(name); L.stop_pc=k; frag=L.generate()
    res,_=s.compile_pairs([('g',VS,frag)],version='2')
    if 'g' not in res: return None
    open(f'{R}/.tmp/stock_gen.bin','wb').write(res['g'])
    o1,a=pixcmp.run_bin(out,'sony'); o2,b=pixcmp.run_bin(f'{R}/.tmp/stock_gen.bin','ours')
    if a is None or b is None: return ('runfail',o1[-150:],o2[-150:])
    ch=defined(L,k)
    bad=sum(1 for t in range(len(a)//4) if any(a[t*1024+c]!=b[t*1024+c] for c in ch))
    return bad,len(a)//4,ch
if __name__=='__main__':
    pixcmp.setup(); name=sys.argv[1]
    for k in map(int,sys.argv[2:]): print(k,probe(name,k),flush=True)
