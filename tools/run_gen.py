import sys,traceback,json,statistics
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100 as T
import stockloop as st
from run_all import orig_code
from extract_code import *
from gdiff import VS
OUT='/home/h/tmp/SemcCameraUI/.tmp/ir3/gen_es100/'
import os; os.makedirs(OUT,exist_ok=True)
src={}; err={}
for n in range(int(sys.argv[1]),int(sys.argv[2])+1):
  name=f'alfort-p{n:03}'
  try:
    src[name]=T.Lifter(name).generate(); open(OUT+f'p{n:03}.frag','w').write(src[name])
  except Exception as e: err[name]=repr(e)[:150]
print('gen ok',len(src),'err',len(err))
for k,v in list(err.items())[:12]: print(k,v)
names=sorted(src); rows=[]
for i in range(0,len(names),12):
  ch=names[i:i+12]
  res,out=st.compile_pairs([(k,VS,src[k]) for k in ch],version='2')
  for k in ch:
    if k not in res: rows.append((k,None,None,None)); continue
    o=stage_code(res[k][8:]); A=orig_code(k)
    rows.append((k,len(o[0][1])//8,len(A[0][1])//8,all(a[1]==b[1] for a,b in zip(o,A))))
json.dump(rows,open(OUT+'summary.json','w'))
okc=[r for r in rows if r[1]]; print('compiled',len(okc),'of',len(rows),'identical',sum(1 for r in rows if r[3]))
if okc: print('ratio median',statistics.median(r[1]/r[2] for r in okc))
print([r[0] for r in rows if r[1] is None][:20], {k:err[k] for k in list(err)[:0]})
