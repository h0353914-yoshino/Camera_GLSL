import sys,os,glob,pickle,collections,traceback
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3'); sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/rsc_all')
from batch import *
import pixg
import ir3_to_es100_m as M
import ir3_to_es100_bits as BB
BITS_SET={'bordeaux_BDX-p33','melonpan_MELP-p89','melonpan_MPHM-p4','melonpan_MPHM-p5'}
ROOT='/home/h/tmp/SemcCameraUI/.tmp/rsc_all'
def origbin(n):
    m,h=n.rsplit('_',1)[0],n.rsplit('_',1)[1]; h,p=h.split('-p'); return f'{ROOT}/{m}/{h}-p{int(p):03}.bin'
def allnames():
    return sorted(f"{f.split('/')[-2]}_{os.path.basename(f)[:-4].split('-p')[0]}-p{int(os.path.basename(f)[:-4].split('-p')[1])}" for f in glob.glob(ROOT+'/[a-z]*/[A-Z]*-p*.bin'))
def run(names,tag,order_of=None,out_of=None):
    gen={}; fail={}
    for n in names:
        try:
            L=(BB.LifterB if n in BITS_SET else M.LifterM)(n,order=(order_of or {}).get(n),out_half=(out_of or {}).get(n)); fs=L.generate(); gen[n]=(L.vertex(),fs,L.es3,L.out_uint)
        except Exception as e: fail[n]=(type(e).__name__+': '+str(e))[:90]
    res={}
    for es3 in (False,True):
        pairs=[(n,v,f) for n,(v,f,e,u) in gen.items() if e==es3]
        if not pairs: continue
        for i in range(0,len(pairs),60):
            r,log=compile_batch(pairs[i:i+60],'3' if es3 else '2'); res.update(r)
    items=[]
    for n in gen:
        if n in res:
            p=f'{ROOT}/pixtmp/{n}.bin'; os.makedirs(f'{ROOT}/pixtmp',exist_ok=True); open(p,'wb').write(res[n]); items.append((n,origbin(n),p,'u' if gen[n][3] else ''))
    pr={}
    for i in range(0,len(items),80):
        r,out=pixg.compare(items[i:i+80],3); pr.update(r)
    rows={}
    for n in names:
        if n in fail: rows[n]=('lift',fail[n])
        elif n not in res: rows[n]=('nocompile',)
        elif n not in pr: rows[n]=('nopix',)
        else:
            r=pr[n]; rows[n]=('PASS',) if (r[0]=='ok' and r[1]==0 and r[3]>0) else (('zero',) if r[0]=='ok' and r[1]==0 else ('diff',)+tuple(r[1:]))
    pickle.dump((gen,rows),open(f'{ROOT}/run2_{tag}.pkl','wb'))
    c=collections.Counter(v[0] for v in rows.values()); print(tag,c)
    return gen,rows
if __name__=='__main__':
    pre=sys.argv[2] if len(sys.argv)>2 else ''
    run([n for n in allnames() if n.startswith(pre)],sys.argv[1]+(pre or ''))
