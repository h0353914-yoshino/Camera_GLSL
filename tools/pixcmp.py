import sys,os; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import stockloop as s
from gdiff import VS
D='/data/local/tmp/glpix'
R=s.ROOT
def setup():
    s.run('shell',f'mkdir -p {D}')
    s.run('push',s.w(R+'/.tmp/glsl-completion/pixel/pixel2.so'),f'{D}/pixel.so')
def run_bin(local_bin,tag,ext=False):
    s.run('push',s.w(local_bin),f'{D}/{tag}.bin')
    s.run('shell',f"printf '{D}/{tag}.bin {D}/{tag}.raw{" ext" if ext else ""}\\n' > {D}/params")
    out=s.run('shell',f'cd {D}; LD_PRELOAD={D}/pixel.so /system/bin/app_process32 2>&1; echo rc=$?').stdout
    p=f'{R}/.tmp/ir3/pix_{tag}.raw'
    if os.path.exists(p): os.remove(p)
    s.run('pull',f'{D}/{tag}.raw',s.w(p))
    return out,(open(p,'rb').read() if os.path.exists(p) else None)
def compare(name,frag_text,vs=VS,version='2'):
    kind,num=name.split('-p')
    res,_=s.compile_pairs([('g',vs,frag_text)],version=version)
    if 'g' not in res: return 'compile-fail'
    ours=f'{R}/.tmp/stock_gen.bin'; open(ours,'wb').write(res['g'])
    ext=('samplerExternalOES' in frag_text)
    o1,a=run_bin(f'{R}/.tmp/glsl-completion/{kind}/p{int(num):03}.bin','sony',ext)
    o2,b=run_bin(ours,'ours',ext)
    if a is None or b is None: return 'run-fail '+o1[-200:]+o2[-200:]
    n=len(a); diff=sum(1 for x,y in zip(a,b) if x!=y); mx=max((abs(x-y) for x,y in zip(a,b)),default=0)
    nonzero=sum(1 for x in a if x)
    return dict(bytes=n,diff=diff,maxdiff=mx,sony_nonzero=nonzero)
if __name__=='__main__':
    setup(); print(compare(sys.argv[1],open(sys.argv[2]).read()))
