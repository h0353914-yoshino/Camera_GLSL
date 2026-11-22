import sys,itertools,pickle,os
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3'); sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/rsc_all')
import run2, ir3_to_es100_m as M, pixg
from batch import compile_batch
LIMIT=5
def search(names):
    """對每個 shader 列舉「已用槽位 ← 取樣器名稱」的排列，回傳 {name: order dict} (通過者)"""
    cand=[]  # (key, name, order)
    for n in names:
        try: L=M.LifterM(n)
        except Exception: continue
        U=L.static_slots(); S=L.samplers
        if len(U)>LIMIT or len(S)<len(U): continue
        for p in itertools.permutations(S,len(U)):
            cand.append((f'k{len(cand)}',n,dict(zip(U,p))))
    print('candidates',len(cand),flush=True)
    good={}
    for i in range(0,len(cand),200):
        chunk=cand[i:i+200]; gen={}
        for k,n,o in chunk:
            try:
                L=M.LifterM(n,order=o); gen[k]=(L.vertex(),L.generate(),L.es3,n)
            except Exception as e: pass
        res={}
        for es3 in (False,True):
            pairs=[(f'c{j}',v,f) for j,(k,(v,f,e,n)) in enumerate(gen.items()) if e==es3]
            keys=[k for k,(v,f,e,n) in gen.items() if e==es3]
            for a in range(0,len(pairs),60):
                r,_=compile_batch(pairs[a:a+60],'3' if es3 else '2')
                for j,(nm,_,_) in enumerate(pairs[a:a+60]):
                    if nm in r: res[keys[a+j]]=r[nm]
        items=[]
        for k,b in res.items():
            f=f'{run2.ROOT}/pixtmp/{abs(hash(k))}.bin'; os.makedirs(f'{run2.ROOT}/pixtmp',exist_ok=True); open(f,'wb').write(b)
            items.append((k,run2.origbin(gen[k][3]),f))
        for a in range(0,len(items),80):
            r,out=pixg.compare(items[a:a+80],3)
            for k,v in r.items():
                if v[0]=='ok' and v[1]==0 and v[3]>0:
                    kk,nm,o=[c for c in cand if c[0]==k][0]
                    if nm not in good: good[nm]=o
        print('chunk',i,'good',len(good),flush=True)
    return good
if __name__=='__main__':
    rows=pickle.load(open(run2.ROOT+'/run2_all6.pkl','rb'))[1]
    names=[n for n,v in rows.items() if v[0] in ('diff','lift') or n.startswith('canele')]
    good=search(names); pickle.dump(good,open(run2.ROOT+'/perm2_good.pkl','wb')); print('GOOD',len(good))
