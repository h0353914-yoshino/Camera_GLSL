import sys,os,struct,hashlib
sys.path.insert(0,'.')
from keys import *
tot=0
for m in sys.argv[1:]:
    d,h=parse(m); lib=open(f'{A}libsomc_{m}.so','rb').read(); kf=find(m)
    assert all(kf.values()),(m,kf)
    os.makedirs(m,exist_ok=True); rows=[]
    for hn,(a,offs) in h.items():
        for i,o in enumerate(offs):
            fl,ln=struct.unpack_from('<II',d,o); ko,io=kf[fl]
            c=Cipher(algorithms.AES(lib[ko:ko+32]),modes.CBC(lib[io:io+16])).decryptor()
            p=c.update(d[o+8:o+8+ln])+c.finalize()
            fmt,bl,magic=struct.unpack_from('<III',p)
            ok=(fmt==0x8740 and bl+8==len(p) and magic==0xb10bcace)
            open(f'{m}/{hn}-p{i+1:03}.bin','wb').write(p)
            rows.append((hn,i+1,fl,ln,hex(fmt),bl,ok,hashlib.sha1(p).hexdigest()[:8]))
    bad=[r for r in rows if not r[6]]
    print(m,len(rows),'unique',len({r[7] for r in rows}),'bad',len(bad),bad[:3]); tot+=len(rows)
print('total',tot)
