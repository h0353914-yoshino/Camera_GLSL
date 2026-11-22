import sys,os,hashlib,collections,pickle
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/rsc_all')
from batch import compile_batch
G='/home/h/tmp/SemcCameraGLSL/'
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
rows=[]
for line in open(G+'manifest.tsv'):
    p=line.rstrip('\n').split('\t')
    if len(p)>=4 and not p[0].startswith('#'): rows.append((p[0],p[1],p[2],p[3]))
for f in ('manifest_rsc.tsv','manifest_rsc_unverified.tsv'):
    for line in open(G+f):
        p=line.rstrip('\n').split('\t')
        if len(p)>=4:
            m,rest=p[0].split('-',1)   # marble-CMBL-p001 -> marble, CMBL-p001
            h,pn=rest.split('-p'); rows.append((f'{m}_{h}-p{int(pn)}',p[1],p[2],p[3]))
print(len(rows),'programs')
uniq={}; owner={}
for n,api,vs,fs in rows:
    key=(api,open(G+vs).read(),open(G+fs).read()); uniq.setdefault(key,[]).append(n)
keys=list(uniq)
print(len(keys),'unique pairs')
done={}
for api in ('gles2','gles3'):
    ks=[k for k in keys if k[0]==api]
    for i in range(0,len(ks),50):
        pairs=[(f'u{j}',k[1],k[2]) for j,k in enumerate(ks[i:i+50])]
        res,log=compile_batch(pairs,'3' if api=='gles3' else '2')
        for j,k in enumerate(ks[i:i+50]):
            if f'u{j}' in res: done[k]=res[f'u{j}']
        print(api,i,len(res),'/',len(pairs),flush=True)
fail=[]
for k,names in uniq.items():
    for n in names:
        if k in done: open(f'{OUT}/{n}.bin','wb').write(done[k])
        else: fail.append(n)
print('FAILED',len(fail),fail[:20])
