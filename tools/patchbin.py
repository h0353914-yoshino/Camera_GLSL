import struct,sys
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
from extract_code import secs
def H(b):
    h=0
    for x in b:
        x=(h^x)&0xff if False else None
    return None
def rotl(v,n): return ((v<<n)|(v>>(32-n)))&0xffffffff
def hash_bytes(b):
    h=0
    for c in b:
        h=rotl((h^c)&0xffffffff,7)
    return h
def code_span(b,stage=0):
    es=[e for e in secs(b) if e[0]==2][stage]
    w=struct.unpack_from('<%dI'%(es[2]//4),b,es[1]); N=w[6]-1
    for r in range(N):
        row=w[13+5*r:18+5*r]
        if row[4]==0xb and row[1]: return es[1]+row[0], row[1]
def load_raw(path):
    d=open(path,'rb').read(); return struct.unpack('<II',d[:8]),bytearray(d[8:])
def patch_end(path_in,path_out,k,stage=0):
    (fmt,ln),b=load_raw(path_in)
    assert bytes(b[:4])==struct.pack('<I',0xb10bcace)
    off,size=code_span(bytes(b),stage)
    endins=bytes(b[off+size-8:off+size])
    b[off+8*k:off+8*k+8]=endins
    struct.pack_into('<I',b,0x24,0)
    struct.pack_into('<I',b,0x24,hash_bytes(bytes(b)))
    open(path_out,'wb').write(struct.pack('<II',fmt,len(b))+bytes(b))
    return size//8
def check(path):
    (fmt,ln),b=load_raw(path); old=struct.unpack_from('<I',b,0x24)[0]
    c=bytearray(b); struct.pack_into('<I',c,0x24,0)
    return old,hash_bytes(bytes(c))
if __name__=='__main__':
    print(check(sys.argv[1]))
