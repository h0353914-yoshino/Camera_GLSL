import sys,difflib; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as s
from run_all import orig_code
from extract_code import *
VS=open('/home/h/tmp/SemcCameraUI/.tmp/adreno-glsl-compare/payload/shaders/alfort/passthrough.vert').read()
def go(name,files,full=False,vs=VS):
    res,out=s.compile_pairs([(f'c{i}',vs,open(f).read()) for i,f in enumerate(files)],version='2')
    A=[l.split('] ',1)[-1] for l in disasm(orig_code(name)[0][1])]
    for i,f in enumerate(files):
        k=f'c{i}'
        if k not in res: print(f,'FAIL',[l for l in out.splitlines() if 'ERROR' in l][:3]); continue
        o=stage_code(res[k][8:]); B=[l.split('] ',1)[-1] for l in disasm(o[0][1])]
        r=[a[1]==b[1] for a,b in zip(o,orig_code(name))]
        d=[l for l in difflib.unified_diff(A,B,lineterm='',n=0) if l[:1] in '+-' and l[:3] not in('---','+++')]
        print('==',f,len(A),len(B),r,'difflines',len(d))
        if full: print('\n'.join(d))
if __name__=='__main__': go(sys.argv[1],sys.argv[3:],sys.argv[2]=='1')
