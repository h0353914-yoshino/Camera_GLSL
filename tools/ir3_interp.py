"""ir3 指令直譯器（fp16/fp32），用來當作語意基準，重現 pixel2.c 的亂數輸入。"""
import re,sys
import math,struct
sys.path.insert(0,'/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100 as T
SW='xyzw'
NAMES=["pixSize","paramslim","params1","params2","paramssft","paramskkd","fa_l","fa_r","fh_l","fh_r"]
PICKS=[0.0,0.25,0.5,1.0,2.0,3.0,-1.0,255.0,0.0625,0.125,8.0,0.75]
M=0xffffffff
OPT={'madround':False,'hc':0,'alpha':False}
class Rng:
    def __init__(s): s.v=987654321
    def a(s): s.v=(s.v*1664525+1013904223)&M; return s.v
    def b(s): s.v=(s.v*1103515245+12345)&M; return s.v
def f32(x):
    try: return struct.unpack('<f',struct.pack('<f',x))[0]
    except OverflowError: return math.copysign(math.inf,x)
def f16(x):
    x=f32(x)
    try: return struct.unpack('<e',struct.pack('<e',x))[0]
    except OverflowError: return math.copysign(math.inf,x)
class Interp:
    def __init__(s,name):
        s.L=T.Lifter(name); s.name=name
    def trials(s,n):
        L=s.L; present=[nm for nm in NAMES if nm in L.uniforms]
        rng=Rng(); out=[]
        for t in range(n):
            uni={}
            for nm in NAMES:
                c=[]
                for k in range(4):
                    r=rng.a()>>8
                    if (r&3)==0: c.append(f32(PICKS[(r>>2)%12]))
                    else: c.append(f32(((r>>2)&0xffff)/65535.0*(0.25 if nm=='pixSize' else 4.0)))
                if nm in L.uniforms: uni[nm]=c
            tex0=bytearray(1024)
            for i in range(1024): tex0[i]=(rng.b()>>16)&255
            tex1=bytearray(1024)
            for i in range(1024):
                r=rng.b(); tex1[i]=(r>>16)&255
                if ((r>>8)&3)<2: tex1[i]=255
            out.append(s.run(uni,tex0,tex1))
        return out
    def texel(s,tex,u,v):
        x=min(15,max(0,int(math.floor(f32(u)*16)))); y=min(15,max(0,int(math.floor(f32(v)*16))))
        return [f32(tex[(y*16+x)*4+c]/255.0) for c in range(4)]
    def run(s,uni,tex0,tex1):
        L=s.L; R={}; H={}; P=[False]
        def get(kind,idx):
            return (H if kind=='hr' else R).get(idx,f32(0))
        def put(kind,idx,v):
            if kind=='hr': H[idx]=f16(v)
            else: R[idx]=f32(v)
        # prefetch waku @ texCoord (0.5,0.5)
        region=s.texel(tex1,0.5,0.5)
        for i in range(4):
            if L.prefetch_mask&(1<<i): R[2+i]=f32(region[i])
        def cval(idx,kind):
            if kind=='hc' and OPT['hc']==1:
                full=idx//2; v=L.constants[full]
                import struct as _s
                m=re.fullmatch(r'uintBitsToFloat\(0x([0-9a-f]+)u\)',v)
                if m:
                    bits=int(m[1],16); h=(bits>>16) if idx%2 else bits&0xffff
                    return f32(_s.unpack('<e',_s.pack('<H',h))[0])
            v=L.constants[idx]
            m=re.fullmatch(r'uintBitsToFloat\(0x([0-9a-f]+)u\)',v)
            if m: val=f32(T.bits_to_float(int(m[1],16)))
            else:
                mm=re.fullmatch(r'(\w+)(?:\.([xyzw]))?',v); val=uni[mm[1]][SW.index(mm[2]) if mm[2] else 0]
            return f16(val) if kind=='hc' else val
        def src(tok,lane):
            tok=tok.strip(); mods=set()
            while True:
                m=re.match(r'\((r|neg|abs)\)',tok)
                if not m: break
                mods.add(m[1]); tok=tok[m.end():]
            if L.REG_RE.match(tok) if hasattr(L,'REG_RE') else T.REG.match(tok):
                kind,idx=L.reg(tok)
                if 'r' in mods: idx+=lane
                v=cval(idx,kind) if kind in('c','hc') else get(kind,idx)
            else:
                m=re.fullmatch(r'h?\((-?[\d.]+(?:e[-+]?\d+)?)\)',tok); v=f32(float(m[1]))
            if 'abs' in mods: v=abs(v)
            if 'neg' in mods: v=-v
            return f32(v)
        ins,labels=L.ins,L.labels
        pc=0; steps=0
        while pc<len(ins):
            if pc==getattr(s,'stop',None): break
            steps+=1
            if steps>200000: raise RuntimeError('loop')
            fl,op,rest=ins[pc]; pc+=1
            if op in('nop','bary.f'): continue
            if op=='end': break
            if op=='jump': pc=labels[re.search(r'#(l\d+)$',rest)[1]]; continue
            if op in('br','brac.0','brac.1'):
                m=re.match(r'(!?)p0\.x, #(l\d+)$',rest); take=P[0] if not m[1] else (not P[0])
                if take: pc=labels[m[2]]
                continue
            if op=='sam':
                m=re.fullmatch(r'\((f16|f32)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), (r\d+\.[xyzw]), s#(\d), t#\d',rest)
                _,mask,dk,dg,dc,coord,samp=m.groups(); ck,ci=L.reg(coord); d0=4*int(dg)+SW.index(dc)
                tx=s.texel(tex1 if int(samp)==0 else tex0, get(ck,ci), get(ck,ci+1))
                for i,ch in enumerate(mask): put(dk,d0+SW.index(ch),tx[SW.index(ch)])
                continue
            lanes=int(re.search(r'\(rpt(\d)\)',fl)[1])+1 if '(rpt' in fl else 1
            dst,*srcs=[x.strip() for x in re.split(r',\s*(?![^()]*\))',rest)]
            dm=re.match(r'(?:\(ei\))?(hr|r|p)(\d+)\.([xyzw])$',dst); kind,g,c=dm.groups(); didx=4*int(g)+SW.index(c)
            for lane in range(lanes):
                v=[src(x,lane) for x in srcs]
                if op in T.Lifter.CMP:
                    o=T.Lifter.CMP[op]; r={'>':v[0]>v[1],'<':v[0]<v[1],'==':v[0]==v[1],'>=':v[0]>=v[1],'<=':v[0]<=v[1],'!=':v[0]!=v[1]}[o]
                    if kind=='p': P[0]=bool(r)
                    else: put(kind,didx+lane,1.0 if r else 0.0)
                    continue
                if op in('sel.b32','sel.f16'): res=v[0] if v[1]!=0 else v[2]
                elif op in('add.f','add.s'): res=v[0]+v[1]
                elif op=='mul.f': res=v[0]*v[1]
                elif op=='max.f': res=max(v[0],v[1])
                elif op=='min.f': res=min(v[0],v[1])
                elif op=='floor.f': res=math.floor(v[0]) if math.isfinite(v[0]) else v[0]
                elif op=='trunc.f': res=math.trunc(v[0]) if math.isfinite(v[0]) else v[0]
                elif op=='rcp': res=1.0/v[0] if v[0]!=0 else math.inf
                elif op=='sqrt': res=math.sqrt(v[0]) if v[0]>=0 else math.nan
                elif op in('mad.f16','mad.f32'):
                    if OPT['madround'] and kind=='hr': res=f16(f16(float(v[0])*float(v[1]))+float(v[2]))
                    else: res=float(v[0])*float(v[1])+float(v[2])
                elif op in('cov.f32f16','cov.f16f32','cov.s16s32','cov.s32s16','cov.u16u32','mov.f16f16','mov.f32f32','mov.s32s32','absneg.f'): res=v[0]
                else: raise ValueError(op)
                put(kind,didx+lane,res)
        rgba=[]
        for i in range(3):
            x=float(get('hr',i)); x=min(1.0,max(0.0,x)) if x==x else 0.0; rgba.append(int(math.floor(x*255+0.5)))
        return rgba
if __name__=='__main__':
    name=sys.argv[1]; n=int(sys.argv[2])
    I=Interp(name); res=I.trials(n)
    kind,num=name.split('-p')
    import pixcmp
    sony=open('/home/h/tmp/SemcCameraUI/.tmp/ir3/pix_sony.raw','rb').read()
    ok=0; bad=[]
    for t,r in enumerate(res):
        px=list(sony[t*1024:t*1024+3])
        if px==r: ok+=1
        else: bad.append((t,px,r))
    print('interp==sony',ok,'/',n); print(bad[:8])
