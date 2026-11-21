"""ir3 反組譯 → ES 1.00 片段著色器的自動還原工具（Alfort 一般紋理版）。

用法：python3 ir3_to_es100.py alfort-p007 > p007.frag
流程：
  1. 以 run_all.orig_code 取得原廠指令區並反組譯。
  2. 以 lift_alfort.shader_interface 從二進位名稱／常數表取得 uniform 與 c 暫存器對應。
  3. 把指令轉成 float 變數（r = highp、hr = mediump）的指令序列，(rptN) 展開成逐 lane。
  4. 以標籤／分支還原 if、if/else、迴圈（for + break），不使用 switch 狀態機。
"""
import os, re, struct, sys
from pathlib import Path

ROOT = Path('/home/h/tmp/SemcCameraUI')
sys.path.insert(0, str(ROOT / '.tmp/ir3'))
sys.path.insert(0, str(ROOT / '.tmp/lab'))
os.chdir(ROOT)
sys.path.insert(0, str(ROOT / '.tmp/glsl-completion'))
from run_all import orig_code            # noqa: E402
from extract_code import disasm          # noqa: E402
import lift_alfort                       # noqa: E402
from fmt import load                     # noqa: E402

SW = 'xyzw'
REG = re.compile(r'(hr|hc|r|c|p)(\d+)\.([xyzw])$')
FLAGS = re.compile(r'^((?:\([a-z0-9]+\))*)')


def bits_to_float(bits):
    return struct.unpack('<f', struct.pack('<I', bits))[0]


def fmt_float(v):
    if v != v:
        return '0.0'
    s = repr(float(v))
    if 'e' in s or 'inf' in s:
        s = '%.9g' % v
        if '.' not in s and 'e' not in s:
            s += '.0'
    return s


def parse_lines(code):
    """回傳指令清單 [(flags, op, operands)] 與標籤 {name: 指令索引}。"""
    ins, labels = [], {}
    for raw in disasm(code):
        line = raw.split('] ', 1)[-1].strip()
        if re.fullmatch(r'l\d+:', line):
            labels[line[:-1]] = len(ins)
            continue
        m = re.match(r'((?:\([a-z0-9]+\)\s*)*)(\S+)(?:\s+(.*))?$', line)
        flags, op, rest = m.groups()
        ins.append((flags, op, rest or ''))
    return ins, labels


class Lifter:
    def __init__(self, name):
        kind, num = name.split('-p')
        self.name = name
        self.code = orig_code(name)[0][1]
        path = ROOT / f'.tmp/glsl-completion/{kind}/p{int(num):03}.bin'
        data = load(str(path))
        self.uniforms, self.constants, self.prefetch_mask = lift_alfort.shader_interface(data)
        self.ins, self.labels = parse_lines(self.code)
        self.used = set()
        self.uni_kind = {}
        self.samples = 0
        self.sample_vars = set()
        self.sample_prec = {}
        self.ext_pc = None
        self.external = int(name.split('-p')[1]) % 2 == 0 and name.startswith('alfort') and name != 'alfort-p072'
        self.convert_external()
        self.stop_pc = None

    def convert_external(self):
        if not self.external:
            return
        ins = self.ins
        sample_pc = None
        for pc, (fl, op, rest) in enumerate(ins):
            if op == 'sam':
                sample_pc = pc
            elif op.startswith('brac.'):
                assert sample_pc is not None
                start = self.labels[re.search(r'#(l\d+)$', rest)[1]]
                assert ins[start - 1][1] == 'jump'
                end = self.labels[re.search(r'#(l\d+)$', ins[start - 1][2])[1]]
                repl = []
                for f2, o2, r2 in ins[start:end]:
                    dst, *srcs = [x.strip() for x in re.split(r',\s*(?![^()]*\))', r2)] if r2 else ['']
                    if o2 == 'mov.f16f16':
                        ch = 'w'
                    elif o2 == 'mad.f16' and re.fullmatch(r'hc8\.[xyz]', srcs[0]):
                        ch = srcs[0][-1]
                    else:
                        continue
                    repl.append((dst, ch))
                for i in range(pc, end):
                    ins[i] = ('', 'nop', '')
                for i, (dst, ch) in enumerate(repl):
                    ins[pc + i] = ('', 'converted', f'{dst}|{sample_pc}|{ch}')

    # ---------------- 運算元 ----------------
    def reg(self, tok):
        m = REG.match(tok)
        kind, group, ch = m.groups()
        return kind, 4 * int(group) + SW.index(ch)

    def var(self, kind, idx):
        g, c = divmod(idx, 4)
        name = f'{kind}{g}_{SW[c]}'
        self.used.add((kind, name))
        return name

    def const(self, idx, kind='c'):
        v = self.constants[idx]
        base = re.match(r'(\w+)', v)[1]
        if base in self.uniforms:
            self.uni_kind.setdefault(base, set()).add(kind)
        m = re.fullmatch(r'uintBitsToFloat\(0x([0-9a-f]+)u\)', v)
        if m:
            return fmt_float(bits_to_float(int(m[1], 16)))
        return v

    def src(self, tok, lane):
        tok = tok.strip()
        mods = set()
        while True:
            m = re.match(r'\((r|neg|abs)\)', tok)
            if not m:
                break
            mods.add(m[1])
            tok = tok[m.end():]
        if REG.match(tok):
            kind, idx = self.reg(tok)
            if 'r' in mods:
                idx += lane
            if kind in ('c', 'hc'):
                val = self.const(idx, kind)
            elif kind == 'p':
                raise ValueError('predicate source')
            else:
                val = self.var(kind, idx)
        else:
            m = re.fullmatch(r'h?\((-?[\d.]+(?:e[-+]?\d+)?)\)', tok)
            assert m, tok
            val = m[1] if '.' in m[1] or 'e' in m[1] else m[1] + '.0'
        if 'abs' in mods:
            val = f'abs({val})'
        if 'neg' in mods:
            val = f'(-{val})'
        return val

    # ---------------- 指令 ----------------
    FUN = {
        'add.f': '{0} + {1}', 'mul.f': '{0} * {1}', 'max.f': 'max({0}, {1})', 'min.f': 'min({0}, {1})',
        'floor.f': 'floor({0})', 'trunc.f': 'float(int({0}))', 'rcp': '1.0 / {0}', 'sqrt': 'sqrt({0})',
        'add.s': '{0} + {1}', 'sub.s': '{0} - {1}', 'mul.s24': '{0} * {1}', 'absneg.f': '{0}', 'abs.f': 'abs({0})', 'sign.f': 'sign({0})', 'ceil.f': 'ceil({0})', 'fract.f': 'fract({0})', 'rsq': 'inversesqrt({0})', 'exp2': 'exp2({0})', 'log2': 'log2({0})', 'sin': 'sin({0})', 'cos': 'cos({0})', 'mad.f16': '{0} * {1} + {2}', 'mad.f32': '{0} * {1} + {2}',
        'cov.f32f16': '{0}', 'cov.f16f32': '{0}', 'mov.f16f16': '{0}', 'mov.f32f32': '{0}',
        'cov.s16s32': '{0}', 'cov.s32s16': '{0}', 'cov.u16u32': '{0}', 'mov.s32s32': '{0}',
    }
    CMP = {'cmps.s.gt': '>', 'cmps.s.lt': '<', 'cmps.s.eq': '==', 'cmps.s.ge': '>=', 'cmps.s.le': '<=', 'cmps.s.ne': '!=', 'cmps.f.gt': '>', 'cmps.f.lt': '<', 'cmps.f.eq': '==', 'cmps.f.ge': '>=', 'cmps.f.le': '<=', 'cmps.f.ne': '!='}

    def emit_ins(self, pc, out, ind):
        flags, op, rest = self.ins[pc]
        pad = '    ' * ind
        if op in ('nop', 'bary.f'):
            return
        if op == 'converted':
            dst, spc, ch = rest.split('|')
            kind, idx = self.reg(dst)
            out.append(f'{pad}{self.var(kind, idx)} = sample{spc}.{ch};')
            return
        if op == 'sam':
            m = re.fullmatch(r'\((f16|f32)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), (r\d+\.[xyzw]), s#(\d), t#\d', rest)
            assert m, rest
            prec, mask, dk, dg, dc, coord, samp = m.groups()
            self.sample_prec[pc] = 'mediump' if prec == 'f16' else 'highp'
            ck, ci = self.reg(coord)
            d0 = 4 * int(dg) + SW.index(dc)
            sample = f'sample{pc}'
            self.sample_vars.add(sample)
            self.last_sample = pc
            fn = 'fetchExt' if (self.external and int(samp) == 1) else 'texture2D'
            if fn == 'fetchExt':
                self.ext_pc = pc
                out.append(f'{pad}{sample} = fetchExt(vec2({self.var(ck, ci)}, {self.var(ck, ci + 1)}));')
            else:
                out.append(f'{pad}{sample} = texture2D({self.sampler(int(samp))}, vec2({self.var(ck, ci)}, {self.var(ck, ci + 1)}));')
            for i, ch in enumerate(mask):
                out.append(f'{pad}{self.var(dk, d0 + SW.index(ch))} = {sample}.{ch};')
            return
        if op in self.CMP or op in self.FUN or op in ('sel.b32', 'sel.f16'):
            lanes = int(re.search(r'\(rpt(\d)\)', flags)[1]) + 1 if '(rpt' in flags else 1
            dst, *srcs = [s.strip() for s in re.split(r',\s*(?![^()]*\))', rest)]
            dm = re.match(r'(?:\(ei\))?(hr|r|p)(\d+)\.([xyzw])$', dst)
            kind, g, c = dm.groups()
            didx = 4 * int(g) + SW.index(c)
            for lane in range(lanes):
                vals = [self.src(s, lane) for s in srcs]
                if op in self.CMP:
                    expr = f'{vals[0]} {self.CMP[op]} {vals[1]}'
                    if kind == 'p':
                        out.append(f'{pad}p{didx} = {expr};')
                    else:
                        out.append(f'{pad}{self.var(kind, didx + lane)} = ({expr}) ? 1.0 : 0.0;')
                    continue
                if op == 'sel.f16':
                    expr = f'({vals[1]} < 0.0) ? {vals[2]} : {vals[0]}'
                elif op == 'sel.b32':
                    expr = f'({vals[1]} != 0.0) ? {vals[0]} : {vals[2]}'
                elif op in ('add.f', 'add.s') and re.fullmatch(r'\(-[^()]*(?:\([^()]*\))?[^()]*\)', vals[1]):
                    expr = f'{vals[0]} - {vals[1][2:-1]}'
                elif op in ('add.f', 'add.s') and re.fullmatch(r'\(-[^()]*(?:\([^()]*\))?[^()]*\)', vals[0]):
                    expr = f'{vals[1]} - {vals[0][2:-1]}'
                else:
                    expr = self.FUN[op].format(*vals)
                out.append(f'{pad}{self.var(kind, didx + lane)} = {expr};')
            return
        raise ValueError(f'未支援的指令 {pc}: {flags}{op} {rest}')

    def sampler(self, idx):
        return {0: 'wakuTexUnit', 1: 'texUnit'}[idx]

    # ---------------- 控制流 ----------------
    def target(self, rest):
        return self.labels[re.search(r'#(l\d+)$', rest)[1]]

    def structure(self, lo, hi, out, ind, loop_end=None, loops=None):
        pad = '    ' * ind
        loops = loops or {}
        pc = lo
        header_of = {}
        for p, (f, op, rest) in enumerate(self.ins):
            if op in ('jump', 'br'):
                t = self.target(rest)
                if t <= p:
                    header_of.setdefault(t, p)
        while pc < hi:
            if pc in header_of and header_of[pc] >= pc and pc not in loops:
                end = header_of[pc]
                out.append(f'{pad}while (true)')
                out.append(f'{pad}{{')
                inner = dict(loops); inner[pc] = end
                self.structure(pc, end, out, ind + 1, loop_end=end + 1, loops=inner)
                if self.ins[end][1] == 'br':
                    m2 = re.match(r'(!?)p0\.x, #l\d+$', self.ins[end][2])
                    again = 'p0' if not m2[1] else '!p0'
                    out.append(f'{pad}    if (!({again})) break;')
                out.append(f'{pad}}}')
                pc = end + 1
                continue
            if pc == self.stop_pc:
                out.append(f'{pad}gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);')
                out.append(f'{pad}return;')
            flags, op, rest = self.ins[pc]
            if op == 'end':
                return
            if op == 'jump':
                t = self.target(rest)
                if loop_end is not None and t >= loop_end:
                    out.append(f'{pad}break;')
                elif t < pc:
                    out.append(f'{pad}continue;')
                else:
                    raise ValueError(f'未結構化的 jump @{pc} → {t}')
                pc += 1
                continue
            if op in ('br', 'brac.0', 'brac.1'):
                m = re.match(r'(!?)p0\.x, #(l\d+)$', rest)
                cond, label = m.groups()
                t = self.labels[label]
                # br p0.x → p0 為真時跳走；fallthrough 於 p0 為假時執行
                take = f'p0' if not cond else '!p0'
                fall = '!p0' if not cond else 'p0'
                if loop_end is not None and t >= loop_end:
                    out.append(f'{pad}if ({take}) break;')
                    pc += 1
                    continue
                assert t > pc, f'向後條件跳躍 @{pc}'
                last = self.ins[t - 1]
                if last[1] == 'jump' and self.target(last[2]) > t and self.target(last[2]) <= hi:
                    m_end = self.target(last[2])
                    out.append(f'{pad}if ({fall})')
                    out.append(f'{pad}{{')
                    self.structure(pc + 1, t - 1, out, ind + 1, loop_end, loops)
                    out.append(f'{pad}}}')
                    out.append(f'{pad}else')
                    out.append(f'{pad}{{')
                    self.structure(t, m_end, out, ind + 1, loop_end, loops)
                    out.append(f'{pad}}}')
                    pc = m_end
                else:
                    out.append(f'{pad}if ({fall})')
                    out.append(f'{pad}{{')
                    self.structure(pc + 1, t, out, ind + 1, loop_end, loops)
                    out.append(f'{pad}}}')
                    pc = t
                continue
            self.emit_ins(pc, out, ind)
            pc += 1

    # ---------------- 輸出 ----------------
    def generate(self):
        body = []
        region = []
        if self.prefetch_mask:
            region.append('    vec4 region = ' + ('fetchWaku(texCoord);' if self.external else 'texture2D(wakuTexUnit, texCoord);'))
            for i, ch in enumerate(SW):
                if self.prefetch_mask & (1 << i):
                    region.append(f'    {self.var("r", 2 + i)} = region.{ch};')
        self.structure(0, len(self.ins), body, 1)
        for ch in SW:
            self.used.add(('hr', f'hr0_{ch}'))
        decl = [f'    {"mediump" if k == "hr" else "highp"} float {n};' for k, n in sorted(self.used)]
        head = ['#version 100'] + (['#extension GL_OES_EGL_image_external : require'] if self.external else []) + ['precision highp float;', '']
        head += ['uniform highp sampler2D wakuTexUnit;', 'uniform highp samplerExternalOES texUnit;' if self.external else 'uniform highp sampler2D texUnit;']
        head += [f'uniform {"mediump" if self.uni_kind.get(n) == {"hc"} else "highp"} {t} {n};' for n, t in self.uniforms.items()]
        head += ['varying highp vec2 texCoord;', ''] + (['highp vec4 fetchWaku(vec2 uv)', '{', '    return texture2D(wakuTexUnit, uv);', '}', '', f'{self.sample_prec.get(self.ext_pc, "highp")} vec4 fetchExt(vec2 uv)', '{', '    return texture2D(texUnit, uv);', '}', ''] if self.external else []) + ['void main()', '{', '    bool p0;'] + [f'    {self.sample_prec.get(int(v[6:]), "highp")} vec4 {v};' for v in sorted(self.sample_vars)] + decl + region + body
        head += ['    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);', '}', '']
        return '\n'.join(head)


if __name__ == '__main__':
    print(Lifter(sys.argv[1]).generate())
