import sys,difflib,itertools,time
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as s
from run_all import manifest, orig_code
from extract_code import *
def evaluate(name,frags,vs=None,version=None,chunk=24):
    m=manifest()[name]; vs=vs or m[1]; version=version or ('3' if m[0]=='es3' else '2')
    A=[l.split('] ',1)[-1] for l in disasm(orig_code(name)[0][1])]
    ref=orig_code(name); scores=[]
    for i in range(0,len(frags),chunk):
        ch=frags[i:i+chunk]
        res,out=s.compile_pairs([(f'c{j}',vs,f) for j,f in enumerate(ch)],version=version)
        for j,f in enumerate(ch):
            k=f'c{j}'
            if k not in res: scores.append((10**6,False)); continue
            o=stage_code(res[k][8:])
            ident=len(o)==len(ref) and all(a[1]==b[1] for a,b in zip(o,ref))
            B=[l.split('] ',1)[-1] for l in disasm(o[0][1])]
            d=sum(1 for l in difflib.unified_diff(A,B,lineterm='',n=0) if l[:1] in '+-' and l[:3] not in('---','+++'))
            scores.append((0 if ident else d,ident))
    return scores
