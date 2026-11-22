import sys,pickle,os,hashlib
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3'); sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/rsc_all')
import run2, ir3_to_es100_m as M
R=run2.ROOT+'/'
OUT=sys.argv[1]
gen,rows=pickle.load(open(R+'run2_all7.pkl','rb'))
good=pickle.load(open(R+'perm2_good.pkl','rb'))
passed=sorted(n for n,v in rows.items() if v[0]=='PASS')
man=[]
vseen={}
for n in passed:
    m,hp=n.rsplit('_',1); h,p=hp.split('-p'); p=int(p)
    L=M.LifterM(n,order=good.get(n)); fs=L.generate(); vs=L.vertex()
    d=f'{OUT}/{m}'; os.makedirs(d,exist_ok=True)
    vh=hashlib.sha1(vs.encode()).hexdigest()[:8]
    vn=f'{m}/vertex_{vh}.vert'
    if vn not in vseen:
        open(f'{OUT}/{vn}','w').write(vs); vseen[vn]=1
    fn=f'{m}/{h}-p{p:03}.frag'
    open(f'{OUT}/{fn}','w').write(fs)
    man.append(f'{m}-{h}-p{p:03}\t{"gles3" if L.es3 else "gles2"}\t{vn}\t{fn}')
open(f'{OUT}/manifest_rsc.tsv','w').write('\n'.join(man)+'\n')
print(len(man),'exported;',len(vseen),'vertex files')
