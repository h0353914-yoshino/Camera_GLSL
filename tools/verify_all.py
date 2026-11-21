import sys,json,time; sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100 as T, pixcmp
pixcmp.setup()
lo,hi=int(sys.argv[1]),int(sys.argv[2]); res={}
for n in range(lo,hi+1):
    name=f'alfort-p{n:03}'
    try:
        frag=T.Lifter(name).generate(); open(f'/home/h/tmp/SemcCameraUI/.tmp/ir3/gen_es100/p{n:03}.frag','w').write(frag)
        r=pixcmp.compare(name,frag)
    except Exception as e: r='ERR '+repr(e)[:100]
    res[name]=r; print(name,r,flush=True)
json.dump(res,open(f'/home/h/tmp/SemcCameraUI/.tmp/ir3/gen_es100/verify_{lo}_{hi}.json','w'),default=str)
