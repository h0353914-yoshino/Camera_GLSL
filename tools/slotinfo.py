import sys; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/glsl-completion'); sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/lab')
import os; os.chdir('/home/h/tmp/SemcCameraUI')
import stockloop as st, lift_alfort
from fmt import load, secs, words
from extract_code import *
from gdiff import VS
def info(frags):
    res,out=st.compile_pairs([(f'v{i}',VS,f) for i,f in enumerate(frags)],version='2')
    r=[]
    for i in range(len(frags)):
        k=f'v{i}'
        if k not in res: r.append('FAIL '+str([l for l in out.splitlines() if 'ERROR' in l][:2])); continue
        open('/home/h/tmp/SemcCameraUI/.tmp/_q.bin','wb').write(res[k]); d=load('/home/h/tmp/SemcCameraUI/.tmp/_q.bin')
        _,section,*_=secs(d)[0]
        pf=[words(d,a,12)[:4] for a in lift_alfort.records(section=section,data=d,index=34)]
        sams=sorted(set(l.split('] ',1)[-1].split(',')[-2].strip() for l in disasm(stage_code(res[k][8:])[0][1]) if 'sam ' in l))
        r.append((pf,sams))
    return r
