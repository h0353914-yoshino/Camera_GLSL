import struct,subprocess,sys,os
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/glsl-raisin')
import raisin_index
B='/home/h/tmp/SemcCameraUI/.tmp/'
BINS=sys.argv[1]            # directory of per-program binaries
OUT=sys.argv[2]
CL='/home/h/lineageos/prebuilts/clang/host/linux-x86/clang-r596125/bin/clang'
cfg={'raisin':(68,0x52534e,'_ZN20ShaderCodeHolder_RSN13getShaderDataEi',{1:(0x5a2e0,0x5a320),2:(0x5a300,0x5a330)}),
     'alfort':(73,0x414c4654,'_ZN21ShaderCodeHolder_ALFT13getShaderDataEi',{1:(0x5ff00,0x5ff40),2:(0x5ff20,0x5ff50)})}
os.makedirs(OUT,exist_ok=True)
USE=os.environ.get('USE_OURS','all'); NAMES=os.environ.get('LIBS','raisin,alfort').split(',')
usen=None if USE=='all' else set(int(x) for x in USE.split(',') if x)
for name,(n,tag,holder,keys) in cfg.items():
    if name not in NAMES: continue
    rsc=open(f'{B}lineage_phone/orig_backup/libsomc_{name}rsc.so','rb').read(); lib=open(f'{B}lineage_phone/libsomc_{name}.so','rb').read()
    raisin_index.data=rsc
    d=f'{OUT}/{name}'; os.makedirs(d,exist_ok=True)
    asm=['.section .rodata,"a"','.balign 16']
    for i in range(n):
        off=raisin_index.resource(i); fl,ln=struct.unpack_from('<II',rsc,off); key,iv=keys[(fl>>1)&3]
        nb=open(f'{BINS}/{name}-p{i+1:03}.bin','rb').read(); fmt=struct.unpack_from('<I',nb)[0]; body=nb[8:]
        exact=len(body)
        body+=b'\0'*((-(len(body)+8))%16)
        plain=struct.pack('<II',fmt,exact)+body
        ct=subprocess.run(['openssl','enc','-aes-256-cbc','-nopad','-K',lib[key:key+32].hex(),'-iv',lib[iv:iv+16].hex()],input=plain,stdout=subprocess.PIPE,check=True).stdout
        if usen is not None and (i+1) not in usen:
            open(f'{d}/r{i}.bin','wb').write(rsc[off:off+8+ln])
        else:
            open(f'{d}/r{i}.bin','wb').write(struct.pack('<II',fl,len(ct))+ct)
        asm+= [f'.balign 16','.globl res%d'%i,'.hidden res%d'%i,f'res{i}:',f'.incbin "{d}/r{i}.bin"']
    open(f'{d}/res.S','w').write('\n'.join(asm)+'\n')
    ext=''.join(f'extern const unsigned char res{i}[];\n' for i in range(n))
    tbl=','.join(f'res{i}' for i in range(n))
    c=f'''{ext}
static const void *const kTable[{n}] = {{ {tbl} }};
__attribute__((visibility("default"))) const void *holder(int index) asm("{holder}");
const void *holder(int index) {{ return (index >= 0 && index < {n}) ? kTable[index] : (const void *)0; }}
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN{len(name)}{name}13getShaderDataEii");
const void *shaderdata(int tag, int index) {{ return tag == 0x{tag:x} ? holder(index) : (const void *)0; }}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN{len(name)}{name}13getKernelDataEii");
const void *kerneldata(int tag, int index) {{ return (const void *)0; }}
'''
    open(f'{d}/shim.c','w').write(c)
    r=subprocess.run([CL,'--target=armv7a-linux-androideabi21','-shared','-fPIC','-nostdlib','-O2',f'-Wl,-soname,libsomc_{name}rsc.so','-Wl,--hash-style=both','-o',f'{OUT}/libsomc_{name}rsc.so',f'{d}/shim.c',f'{d}/res.S'],capture_output=True,text=True)
    print(name,'rc',r.returncode,r.stderr[:300],os.path.getsize(f'{OUT}/libsomc_{name}rsc.so'))
