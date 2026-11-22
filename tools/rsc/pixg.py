import sys,os,shutil
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as s
s.SER='BH904YZF9A'
D='/data/local/tmp/glpix'
PIX='/home/h/tmp/SemcCameraUI/.tmp/glsl-completion/pixel'
def compare(items,ctx=3):
    """items: [(name, orig_bin_path, ours_bin_path)] -> {name: (status, ndiff, maxdiff, nz, info)}"""
    tmp='/home/h/tmp/SemcCameraUI/.tmp/rsc_all/pixwork'; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp+'/b')
    rows=[]
    for it in items:
        n,a,b=it[:3]; md=it[3] if len(it)>3 else ''
        shutil.copy(a,f'{tmp}/b/{n}.a'); shutil.copy(b,f'{tmp}/b/{n}.b')
        rows.append(f'{n}\t{D}/b/{n}.a\t{D}/b/{n}.b\t{md}')
    open(tmp+'/params','w').write('\n'.join(rows)+'\n')
    s.run('shell',f'rm -rf {D}; mkdir -p {D}')
    s.run('push',s.w(f'{PIX}/pixelg{ctx}.so'),f'{D}/pixel.so')
    s.run('push',s.w(tmp+'/b'),f'{D}/')
    s.run('push',s.w(tmp+'/params'),f'{D}/params')
    out=s.run('shell',f'cd {D}; LD_PRELOAD={D}/pixel.so /system/bin/app_process32 2>&1; echo rc=$?').stdout
    res={}
    for l in out.splitlines():
        p=l.split('\t')
        if len(p)>=3 and p[1]=='ok': res[p[0]]=('ok',int(p[2]),int(p[3]),int(p[4]),p[7] if len(p)>7 else '',int(p[8]) if len(p)>8 else -1)
        elif len(p)>=2 and p[1]=='nolink': res[p[0]]=('nolink',p[2],p[3])
    return res,out
