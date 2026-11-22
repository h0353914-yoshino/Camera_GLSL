"""Raisin 版 ir3 → ES 1.00（texCoord0/1 varying、外部紋理 + 鏡頭表、私有記憶體溢出、相對暫存器寫入）。

用法：python3 ir3_to_es100_raisin.py raisin-p046 > p046.frag
與 Alfort 版差異：
  - 介面由資源表直接讀取（無 waku 預取）。
  - `bary.f` 轉成 texCoord0/1 的分量讀取。
  - `getbit.b ..., c12.x, n`（$YUVControlInt32）視為 0：關閉原廠內嵌的 YUV 轉換，改由驅動針對
    samplerExternalOES 自行加入。
  - `stp.f32`/`ldp.f32`（p[r47.w-N]）以具名變數表示；`mova a0.x` 與 `mov r<a0.x>` 以 if 串列表示。
"""
import re, struct, sys
sys.path.insert(0, '/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100 as B
from ir3_to_es100 import Lifter, SW, fmt_float, bits_to_float, parse_lines, REG
from fmt import load, secs, words
import lift_alfort
from run_all import orig_code
from pathlib import Path

ROOT = B.ROOT


def generic_interface(data):
    _, section, *_ = secs(data)[0]
    kind, resources, stride, count, *_ = secs(data)[1]
    bindings = [words(data, a, 12) for a in lift_alfort.records(data, section, 13)]
    base, *other = [e[0] for e in bindings if e[1] == 1 and e[3] == 15]
    constants = {}
    for a in lift_alfort.records(data, section, 6):
        bits, _, _, _, reg = words(data, a, 5)
        constants[reg] = f'uintBitsToFloat(0x{bits:08x}u)'
    types = {4: 'float', 8: 'vec2', 12: 'vec3', 16: 'vec4'}
    uniforms, samplers = {}, []
    for i in range(count):
        d = words(data, resources + i * stride, 25)
        name = data[d[19]:].split(b'\0', 1)[0].decode()
        if name.startswith('$'):
            continue
        if d[22]:
            _, _, _, offset, size = words(data, d[22], 5)
            uniforms[name] = types[size]
            for c in range(size // 4):
                constants[base + offset // 4 + c] = f'{name}.{SW[c]}' if size != 4 else name
        elif name.startswith('tex') or name.endswith('TexUnit'):
            samplers.append(name)
    return uniforms, constants, samplers


class LifterR(Lifter):
    FUN = dict(Lifter.FUN)
    FUN.update({'cov.f16u32': '{0}', 'cov.u32f32': '{0}', 'cov.f32u32': '{0}', 'and.b': '{0}'})

    def __init__(self, name):
        kind, num = name.split('-p')
        self.name = name
        self.code = orig_code(name)[0][1]
        data = load(str(ROOT / f'.tmp/glsl-completion/{kind}/p{int(num):03}.bin'))
        self.uniforms, self.constants, self.samplers = generic_interface(data)
        self.prefetch_mask = 0
        self.ins, self.labels = parse_lines(self.code)
        self.used = set()
        self.uni_kind = {}
        self.samples = 0
        self.sample_vars = set()
        self.sample_prec = {}
        self.ext_pc = None
        self.external = False
        self.stop_pc = None
        self.spills = set()
        self.uses_a0 = False

    # 私有記憶體溢出位置
    def spill(self, off):
        n = f'sp{abs(off)}' if off <= 0 else f'spp{off}'
        self.used.add(('r', n))
        return n

    def const(self, idx, kind='c'):
        if idx not in self.constants:
            return '0.0'
        return super().const(idx, kind)

    def sampler(self, idx):
        return {0: 'texUnitLensParam', 1: 'texUnit0'}[idx]

    def src(self, tok, lane):
        t = tok.strip()
        if re.fullmatch(r'-?\d+', t):
            return t + '.0'
        return super().src(tok, lane)

    def emit_ins(self, pc, out, ind):
        flags, op, rest = self.ins[pc]
        pad = '    ' * ind
        if op == 'bary.f':
            m = re.match(r'(?:\(ei\))?(hr|r)(\d+)\.([xyzw]), \(r\)(\d+), r0\.x', rest)
            if not m:
                return
            k, g, c, idx = m.groups()
            lanes = int(re.search(r'\(rpt(\d)\)', flags)[1]) + 1 if '(rpt' in flags else 1
            d0 = 4 * int(g) + SW.index(c)
            for l in range(lanes):
                v = int(idx) + l
                out.append(f'{pad}{self.var(k, d0 + l)} = texCoord{v // 4}.{SW[v % 4]};')
            return
        if op == 'sam':
            m = re.fullmatch(r'\((f16|f32)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), (r\d+\.[xyzw]), s#(\d), t#\d', rest)
            prec, mask, dk, dg, dc, coord, samp = m.groups()
            ck, ci = self.reg(coord)
            d0 = 4 * int(dg) + SW.index(dc)
            sample = f'sample{pc}'
            self.sample_vars.add(sample)
            self.sample_prec[pc] = 'mediump' if prec == 'f16' else 'highp'
            if int(samp) == 1:
                self.ext_pc = pc
            fn = 'fetchLens' if int(samp) == 0 else 'fetchExt'
            out.append(f'{pad}{sample} = {fn}(vec2({self.var(ck, ci)}, {self.var(ck, ci + 1)}));')
            for ch in mask:
                out.append(f'{pad}{self.var(dk, d0 + SW.index(ch))} = {sample}.{ch};')
            return
        if op == 'stp.f32':
            m = re.match(r'p\[r47\.w([+-]\d+)\], (\S+), (\d+)', rest)
            off, reg, cnt = int(m[1]), m[2], int(m[3])
            k, i = self.reg(reg)
            for j in range(cnt):
                out.append(f'{pad}{self.spill(off + 4 * j)} = {self.var(k, i + j)};')
            return
        if op == 'ldp.f32':
            m = re.match(r'(\S+), p\[r47\.w([+-]\d+)\], (\d+)', rest)
            reg, off, cnt = m[1], int(m[2]), int(m[3])
            k, i = self.reg(reg)
            for j in range(cnt):
                out.append(f'{pad}{self.var(k, i + j)} = {self.spill(off + 4 * j)};')
            return
        if op == 'mova':
            m = re.match(r'a0\.x, (\S+)', rest)
            self.uses_a0 = True
            out.append(f'{pad}a0_x = {self.src(m[1], 0)};')
            return
        if op == 'mov.s32s32' and rest.startswith('r<a0.x>'):
            v = self.src(rest.split(',', 1)[1], 0)
            self.uses_a0 = True
            for j, ch in enumerate('xyzw'):
                kw = 'if' if j == 0 else 'else if'
                out.append(f'{pad}{kw} (a0_x == {j}.0) {{ {self.var("r", j)} = {v}; }}')
            return
        if op == 'getbit.b':
            dst = rest.split(',')[0].strip()
            k, i = self.reg(dst)
            out.append(f'{pad}{self.var(k, i)} = 0.0;')
            return
        return super().emit_ins(pc, out, ind)

    def generate(self):
        body = []
        self.structure(0, len(self.ins), body, 1)
        for ch in SW:
            self.used.add(('hr', f'hr0_{ch}'))
        decl = [f'    {"mediump" if k == "hr" else "highp"} float {n};' for k, n in sorted(self.used)]
        if self.uses_a0:
            decl.append('    highp float a0_x;')
        head = ['#version 100', '#extension GL_OES_EGL_image_external : require', 'precision highp float;', '']
        head += ['uniform highp sampler2D texUnitLensParam;', 'uniform highp samplerExternalOES texUnit0;']
        head += [f'uniform {"mediump" if self.uni_kind.get(n) == {"hc"} else "highp"} {t} {n};' for n, t in self.uniforms.items()]
        head += ['varying highp vec4 texCoord0;', 'varying highp vec4 texCoord1;', '']
        head += ['highp vec4 fetchLens(vec2 uv)', '{', '    return texture2D(texUnitLensParam, uv);', '}', '']
        head += [f'{self.sample_prec.get(self.ext_pc, "highp")} vec4 fetchExt(vec2 uv)', '{', '    return texture2D(texUnit0, uv);', '}', '']
        head += ['void main()', '{', '    bool p0;', '    bool p1;']
        head += [f'    {self.sample_prec.get(int(v[6:]), "highp")} vec4 {v};' for v in sorted(self.sample_vars)]
        head += decl + body
        head += ['    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);', '}', '']
        return '\n'.join(head)


if __name__ == '__main__':
    print(LifterR(sys.argv[1]).generate())
