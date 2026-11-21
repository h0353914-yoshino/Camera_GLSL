import sys,collections,re; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as st
from run_all import orig_code
from extract_code import *
from gdiff import VS
def hist(d):
    c=collections.Counter()
    for l in d:
        l=re.sub(r'^(\([a-z0-9]+\)\s*)+','',l.strip())
        if not l or l.endswith(':'): continue
        c[l.split()[0]]+=1
    return c
name,f=sys.argv[1],sys.argv[2]
res,_=st.compile_pairs([('q',VS,open(f).read())],version='2')
B=[l.split('] ',1)[-1] for l in disasm(stage_code(res['q'][8:])[0][1])]
A=[l.split('] ',1)[-1] for l in disasm(orig_code(name)[0][1])]
a,b=hist(A),hist(B)
print(len(A),len(B))
for k in sorted(set(a)|set(b),key=lambda k:-(b[k]-a[k]))[:12]: print(f'{k:12s} orig {a[k]:3d} ours {b[k]:3d} {b[k]-a[k]:+d}')
open('/home/h/tmp/SemcCameraUI/.tmp/ir3/_ours.txt','w').write('\n'.join(B)); open('/home/h/tmp/SemcCameraUI/.tmp/ir3/_orig.txt','w').write('\n'.join(A))
