import sys,struct,collections
sys.path.insert(0,'.')
from extract import *
def dec1(key,blk):
    c=Cipher(algorithms.AES(key),modes.ECB()).decryptor(); return c.update(blk)
def find(m):
    d,h=parse(m); lib=open(f'{A}libsomc_{m}.so','rb').read()
    # sample resource per flag value
    smp={}
    for k,(a,offs) in h.items():
        for i,o in enumerate(offs):
            fl,ln=struct.unpack_from('<II',d,o); smp.setdefault(fl,(d[o+8:o+24]))
    words=collections.defaultdict(list)
    for i in range(0,len(lib)-3,4): words[lib[i:i+4]].append(i)
    res={}
    for fl,c0 in smp.items():
        found=None
        for ko in range(0,len(lib)-32+1,4):
            x=dec1(lib[ko:ko+32],c0)
            # iv = x ^ plain ; plain[0:4]=0x8740, plain[8:12]=0xb10bcace
            iv0=bytes(a^b for a,b in zip(x[0:4],struct.pack('<I',0x8740)))
            for io in words.get(iv0,[]):
                iv=lib[io:io+16]
                if len(iv)<16: continue
                p=bytes(a^b for a,b in zip(x,iv))
                if struct.unpack_from('<I',p,8)[0]==0xb10bcace: found=(ko,io);break
            if found:break
        res[fl]=found
    return res
if __name__=='__main__':
    for m in sys.argv[1:]: print(m,find(m),flush=True)
