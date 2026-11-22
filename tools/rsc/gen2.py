"""為八個 rsc 模組產生替代函式庫：通過驗證者用自己編的二進位，其餘沿用原廠加密資源。
用法：python3 gen2.py <輸出目錄> [模組...]"""
import struct,subprocess,sys,os,re,pickle
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/rsc_all')
import extract, keys
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
B='/home/h/tmp/SemcCameraUI/.tmp/'
R=B+'rsc_all/'
CL='/home/h/lineageos/prebuilts/clang/host/linux-x86/clang-r596125/bin/clang'
NM='/home/h/lineageos/prebuilts/clang/host/linux-x86/clang-r596125/bin/llvm-nm'
OUT=sys.argv[1]; MODS=sys.argv[2:] or ['marble','melonpan','toppo','bordeaux','canele','spica','mugichoco','yummy']
rows=pickle.load(open(R+'run2_all10.pkl','rb'))[1]; sane=pickle.load(open(R+'sane_pass.pkl','rb'))
verified={n for n,v in rows.items() if v[0] in ('PASS','zero') or n in sane}
os.makedirs(OUT,exist_ok=True)
for m in MODS:
    d,holders=extract.parse(m)
    lib=open(f'{extract.A}libsomc_{m}.so','rb').read(); kf=keys.find(m)
    syms=subprocess.run([NM,'-D','--defined-only',f'{extract.A}libsomc_{m}rsc.so'],capture_output=True,text=True).stdout
    ns_shader=re.search(r'(_ZN\d+\w+13getShaderDataEii)',syms)[1]; ns_kernel=re.search(r'(_ZN\d+\w+13getKernelDataEii)',syms)[1]
    hsym={h:re.search(rf'(_ZN\d+ShaderCodeHolder_{h}13getShaderDataEi)\b',syms)[1] for h in holders}
    wd=f'{OUT}/{m}'; os.makedirs(wd,exist_ok=True)
    asm=['.section .rodata,"a"','.balign 16']; cdef=[]; tables=[]; used=ours=0
    for h,(addr,offs) in holders.items():
        for i,o in enumerate(offs):
            fl,ln=struct.unpack_from('<II',d,o); name=f'{m}_{h}-p{i+1}'
            if name in verified and os.path.exists(f'{R}pixtmp/{name}.bin'):
                nb=open(f'{R}pixtmp/{name}.bin','rb').read(); fmt=struct.unpack_from('<I',nb)[0]; body=nb[8:]
                exact=len(body); body+=b'\0'*((-(len(body)+8))%16); plain=struct.pack('<II',fmt,exact)+body
                ko,io=kf[fl]
                ct=Cipher(algorithms.AES(lib[ko:ko+32]),modes.CBC(lib[io:io+16])).encryptor().update(plain)
                rec=struct.pack('<II',fl,len(ct))+ct; ours+=1
            else:
                rec=d[o:o+8+ln]
            used+=1
            fn=f'{wd}/{h}_{i}.bin'; open(fn,'wb').write(rec)
            asm+=['.balign 16',f'.globl res_{h}_{i}',f'.hidden res_{h}_{i}',f'res_{h}_{i}:',f'.incbin "{fn}"']
        cdef.append((h,len(offs)))
    open(f'{wd}/res.S','w').write('\n'.join(asm)+'\n')
    c=''
    for h,n in cdef:
        c+=''.join(f'extern const unsigned char res_{h}_{i}[];\n' for i in range(n))
        c+=f'static const void *const kTable_{h}[{n}] = {{ '+','.join(f'res_{h}_{i}' for i in range(n))+' };\n'
        c+=f'__attribute__((visibility("default"))) const void *holder_{h}(int index) asm("{hsym[h]}");\nconst void *holder_{h}(int index) {{ return (index >= 0 && index < {n}) ? kTable_{h}[index] : (const void *)0; }}\n'
    disp=''.join(f'    if (tag == 0x{int.from_bytes(h.encode(),"big"):x}) return holder_{h}(index);\n' for h,n in cdef)
    c+=f'__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("{ns_shader}");\nconst void *shaderdata(int tag, int index) {{\n{disp}    return (const void *)0;\n}}\n'
    c+=f'__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("{ns_kernel}");\nconst void *kerneldata(int tag, int index) {{ return (const void *)0; }}\n'
    open(f'{wd}/shim.c','w').write(c)
    r=subprocess.run([CL,'--target=armv7a-linux-androideabi21','-shared','-fPIC','-nostdlib','-O2',f'-Wl,-soname,libsomc_{m}rsc.so','-Wl,--hash-style=both','-o',f'{OUT}/libsomc_{m}rsc.so',f'{wd}/shim.c',f'{wd}/res.S'],capture_output=True,text=True)
    print(m,'rc',r.returncode,r.stderr[:200],'resources',used,'ours',ours,os.path.getsize(f'{OUT}/libsomc_{m}rsc.so'))
