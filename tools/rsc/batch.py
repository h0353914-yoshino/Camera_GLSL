import os,sys,subprocess,glob,pickle,shutil
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as s
s.SER='BH904YZF9A'
CMP=s.CMP; D=s.D
def compile_batch(pairs,version='2'):
    """pairs: [(name,vs,fs)] -> (res{name:bin}, log)."""
    tmp=CMP+'/stock_iter'; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp+'/iter'); os.makedirs(tmp+'/out')
    rows=[]
    for n,vs,fs in pairs:
        open(f'{tmp}/iter/{n}.vs','w').write(vs); open(f'{tmp}/iter/{n}.fs','w').write(fs)
        rows.append(f'{n}\titer/{n}.vs\titer/{n}.fs')
    open(f'{tmp}/iter.tsv','w').write('\n'.join(rows)+'\n')
    s.run('shell',f'rm -rf {D}/iter {D}/iter-out; mkdir -p {D}/iter-out')
    s.run('push',s.w(tmp+'/iter'),f'{D}/')
    s.run('push',s.w(tmp+'/iter.tsv'),f'{D}/iter.tsv')
    s.run('shell',f"printf '{version} iter\\n' > {D}/params")
    out=s.run('shell',f'cd {D}; LD_PRELOAD={D}/compile.so /system/bin/app_process32 2>&1; echo rc=$?').stdout
    s.run('pull',f'{D}/iter-out/.',s.w(tmp+'/out'))
    res={}
    for n,_,_ in pairs:
        p=f'{tmp}/out/{n}.bin'
        if os.path.exists(p): res[n]=open(p,'rb').read()
    return res,out
