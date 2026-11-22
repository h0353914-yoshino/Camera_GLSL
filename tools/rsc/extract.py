import re, struct, subprocess, sys, json, os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
A='/home/h/tmp/SemcCameraUI/.tmp/lineage_phone/all/'
OBJ='/home/h/lineageos/prebuilts/clang/host/linux-x86/clang-r596125/bin/llvm-objdump'
NM='/home/h/lineageos/prebuilts/clang/host/linux-x86/clang-r596125/bin/llvm-nm'
def w(d,a): return struct.unpack_from('<I',d,a)[0]
def br(d,a):
    o=w(d,a)&0xffffff
    if o&0x800000:o-=0x1000000
    return a+8+(o<<2)
def imm(x):
    s=((x>>8)&15)*2; v=x&255
    return ((v>>s)|(v<<(32-s)))&0xffffffff if s else v
def resource(d,a):
    i=w(d,a)
    if i==0xe3a00000: return None
    assert i&0xfffff000==0xe59f0000,hex(i)
    r=w(d,a+8+(i&0xfff)); a+=4
    assert w(d,a)==0xe08f0000
    r+=a+8; a+=4
    while w(d,a)!=0xe12fff1e:
        x=w(d,a); op=x&0xfffff000
        assert op in(0xe2800000,0xe2400000),hex(x)
        r+=imm(x)*(1 if op==0xe2800000 else -1); a+=4
    return r&0xffffffff
def parse(m):
    d=open(f'{A}libsomc_{m}rsc.so','rb').read()
    syms={}
    for l in subprocess.run([NM,'-D','--defined-only',f'{A}libsomc_{m}rsc.so'],capture_output=True,text=True).stdout.splitlines():
        p=l.split()
        if len(p)==3 and 'ShaderCodeHolder_' in p[2]: syms[p[2]]=int(p[0],16)
    holders={}
    for n,a in syms.items():
        h=re.search(r'ShaderCodeHolder_(\w+?)13getShader',n).group(1)
        c=w(d,a); assert c&0xfffff000==0xe3500000,(n,hex(c))
        cnt=imm(c)+1
        assert w(d,a+4)==0x908ff100,(n,hex(w(d,a+4)))
        offs=[]
        for i in range(cnt):
            t=br(d,a+12+4*i)
            offs.append(resource(d,t))
        holders[h]=(a,offs)
    return d,holders
def keycands(lib,fl_ct):
    pass
if __name__=='__main__':
    for m in sys.argv[1:]:
        d,h=parse(m)
        print(m,{k:(hex(v[0]),len(v[1]),sum(1 for o in v[1] if o is None)) for k,v in h.items()})
