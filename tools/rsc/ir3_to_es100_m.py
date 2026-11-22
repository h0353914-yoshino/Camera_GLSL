"""泛用版 ir3 → ES 1.00：marble/melonpan/toppo/bordeaux/canele/spica/mugichoco/yummy。
介面(uniform/sampler)由資源表讀取；varying 固定為 texCoord(vec2)；取樣器宣告順序可指定。"""
import re, sys
sys.path.insert(0, '/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100 as B
import ir3_to_es100_raisin as R
from ir3_to_es100 import SW
from fmt import load, secs, words
import lift_alfort
from run_all import orig_code
from pathlib import Path
ROOT = B.ROOT


def interface(data, utypes=None, si=(0, 1)):
    utypes = utypes or {}
    _, section, *_ = secs(data)[si[0]]
    kind, resources, stride, count, *_ = secs(data)[si[1]]
    bindings = [words(data, a, 12) for a in lift_alfort.records(data, section, 13)]
    bases = [e[0] for e in bindings if e[1] == 1 and e[3] == 15]
    base = bases[0] if bases else 8
    running = 0
    constants = {}
    for a in lift_alfort.records(data, section, 6):
        bits, _, _, _, reg = words(data, a, 5)
        constants[reg] = f'uintBitsToFloat(0x{bits:08x}u)'
    types = {4: 'float', 8: 'vec2', 12: 'vec3', 16: 'vec4'}
    uniforms, samplers = {}, []
    hints = {}
    uorder = {}
    seen_ubo = False
    for i in range(count):
        d = words(data, resources + i * stride, 25)
        name = data[d[19]:].split(b'\0', 1)[0].decode()
        if name == '$DefaultUBO':
            seen_ubo = True
            continue
        if name.startswith('$') or not seen_ubo:
            continue
        if d[22]:
            _, _, _, offset, size = words(data, d[22], 5)
            if offset == 0xffffffff:
                offset = running
            running = max(running, offset + size)
            uniforms[name] = types.get(size, 'vec4')
            ty = utypes.get(name, ('', 1))[0]
            uorder[name] = offset
            for c in range(size // 4):
                if ty.startswith('mat'):
                    n = int(ty[3]); ref = f'{name}[{c // n}][{c % n}]'
                elif size > 16 and ty in ('float', 'int', 'uint'):
                    ref = f'{name}[{c}]'
                elif size > 16 and ty in ('vec2', 'ivec2', 'uvec2'):
                    ref = f'{name}[{c // 2}].{SW[c % 2]}'
                elif size > 16:
                    ref = f'{name}[{c // 4}].{SW[c % 4]}'
                else:
                    ref = name if size == 4 else f'{name}.{SW[c]}'
                constants[base + offset // 4 + c] = ref
        else:
            samplers.append(name)
            hints[name] = d[13] & 0xff if (d[9] & 0xffff) != 0xf else None
    interface.hints = hints
    interface.uorder = uorder
    return uniforms, constants, samplers


GT = {'1406':'float','8b50':'vec2','8b51':'vec3','8b52':'vec4','1404':'int','8b53':'ivec2','8b54':'ivec3','8b55':'ivec4',
      '1405':'uint','8dc6':'uvec2','8dc7':'uvec3','8dc8':'uvec4','8b5e':'sampler2D','8d66':'samplerExternalOES','8b5a':'mat2','8b5b':'mat3','8b5c':'mat4','8dca':'isampler2D','8dd2':'usampler2D'}
_INTRO = None
def introspect(name):
    global _INTRO
    if _INTRO is None:
        _INTRO = {}
        for l in open('/home/h/tmp/SemcCameraUI/.tmp/rsc_all/introspect3.txt'):
            if l.startswith('Ua '):
                p = l.split(); n = p[1]; d = []
                for u in p[2:]:
                    nm, t, sz = u.rsplit(':', 2)
                    d.append((nm[:-3] if nm.endswith('[0]') else nm, GT.get(t, t), int(sz)))
                _INTRO[n] = d
    return _INTRO[name]


class LifterM(R.LifterR):
    FUN = dict(R.LifterR.FUN)
    FUN.update({
        'cov.f32s32': 'float(int({0}))', 'cov.f16s32': 'float(int({0}))', 'cov.f32s16': 'float(int({0}))',
        'cov.f16s16': 'float(int({0}))', 'cov.f32u16': 'float(int({0}))', 'cov.f32u32': 'float(int({0}))',
        'cov.s32f32': '{0}', 'cov.s16f16': '{0}', 'cov.u32u16': '{0}', 'cov.u16f16': '{0}', 'cov.u32f32': '{0}',
        'cov.s16f32': '{0}', 'cov.u16f32': '{0}', 'cov.s32u16': '{0}', 'cov.u16u32': '{0}',
        'mov.s16s16': '{0}', 'mov.u16u16': '{0}', 'mov.u32u32': '{0}', 'mov.f32f16': '{0}',
        'absneg.s': '{0}', 'ashr.b': 'floor({0} / exp2({1}))', 'not.b': '(-{0} - 1.0)', 'min.s': 'min({0}, {1})', 'max.s': 'max({0}, {1})',
        'min.u': 'min({0}, {1})', 'max.u': 'max({0}, {1})', 'mull.u': '{0} * {1}', 'rndne.f': 'rndne({0})', 'and.b': '{0}',
        'or.b': 'float(int({0}) | int({1}))', 'xor.b': 'float(int({0}) ^ int({1}))',
        'shl.b': '{0} * exp2({1})', 'shr.b': 'floor({0} / exp2({1}))',
    })

    def __init__(self, name, order=None, out_half=None):
        kind, num = name.rsplit('-p', 1)
        self.name = name
        self.code = orig_code(name)[0][1]
        data = load(str(ROOT / f'.tmp/glsl-completion/{kind}/p{int(num):03}.bin'))
        self.utypes = {}; self.stypes = {}
        for nm, t, sz in introspect(name):
            if 'sampler' in t: self.stypes[nm] = t
            else: self.utypes[nm] = (t, sz)
        self.uniforms, self.constants, self.samplers = interface(data, self.utypes)
        self.hints = dict(interface.hints)
        self.uorder = dict(interface.uorder)
        self.samplers = [n for n in self.samplers if n in self.stypes] + [n for n in self.stypes if n not in self.samplers]
        self.uniforms = {n: v for n, v in self.uniforms.items() if n in self.utypes}
        self.prefetch_mask = 0
        self.ins, self.labels = B.parse_lines(self.code)
        self.used = set(); self.uni_kind = {}; self.samples = 0
        self.sample_vars = set(); self.sample_prec = {}
        self.ext_pc = None; self.external = False; self.stop_pc = None
        self.spills = set(); self.uses_a0 = False
        self.used_slots = set(); self.max_bary = 0
        self.order = order  # 取樣器宣告順序(名稱清單)
        _, section, *_ = secs(data)[0]
        _o = lift_alfort.records(data, section, 3)
        self.outinfo = tuple(words(data, _o[0] + 0x50, 12))
        self.out_half = (self.outinfo[2] == 1 or self.outinfo[0] == 0xe0000000) if out_half is None else out_half
        self.prefetch = [tuple(words(data, a, 12)) for a in lift_alfort.records(data, section, 34)]
        self.es3 = False; self.declared_all = set()

    def const(self, idx, kind='c'):
        v = R.LifterR.const(self, idx, kind)
        base = re.match(r'(\w+)', v)
        if base and base[1] in self.utypes and not v.startswith('uintBits'):
            t = self.utypes[base[1]][0]
            if t[0] in 'iu' or t.startswith('uvec') or t.startswith('ivec'):
                return f'float({v})'
        return v

    def static_slots(self):
        u = {pf[1] for pf in self.prefetch}
        for f, o, r in self.ins:
            if o == 'sam':
                m = re.search(r's#(\d+)', r)
                if m:
                    u.add(int(m[1]))
        return sorted(u)

    def slot_names(self):
        if isinstance(self.order, dict):
            top = max(self.order) if self.order else -1
            return [self.order.get(i) for i in range(top + 1)]
        if self.order == 'hint':
            hints = self.hints
            fixed = {h: n for n, h in hints.items() if h is not None}
            rest = [n for n in self.samplers if hints[n] is None]
            out, k = [], 0
            top = max(list(fixed) + [len(self.samplers) - 1]) if self.samplers else -1
            for slot in range(top + 1):
                if slot in fixed:
                    out.append(fixed[slot])
                elif rest:
                    out.append(rest.pop(0))
                else:
                    out.append(None)
            return out
        return self.order or self.samplers

    def sampler(self, idx):
        return self.slot_names()[idx]

    REL = re.compile(r'(hr|r)<a0\.x(?: \+ (\d+))?>')
    RELC = re.compile(r'(hc|c)<a0\.x(?: \+ (\d+))?>')

    def src(self, tok, lane):
        t = tok.strip()
        m = self.REL.fullmatch(re.sub(r'^(\((?:r|neg|abs)\))+', '', t))
        if m:
            self.uses_a0 = True
            base = int(m[2] or 0)
            expr = '0.0'
            for k in range(15, -1, -1):
                expr = f'(a0_x == {k}.0 ? {self.var(m[1], base + k)} : {expr})'
            return expr
        m = self.RELC.fullmatch(re.sub(r'^(\((?:r|neg|abs)\))+', '', t))
        if m:
            self.uses_a0 = True
            base = int(m[2] or 0)
            expr = '0.0'
            for k in range(31, -1, -1):
                if base + k in self.constants:
                    expr = f'(a0_x == {k}.0 ? {self.const(base + k, m[1])} : {expr})'
            mods = re.match(r'^((?:\((?:r|neg|abs)\))*)', t)[1]
            if '(abs)' in mods: expr = f'abs({expr})'
            if '(neg)' in mods: expr = f'(-{expr})'
            return expr
        return R.LifterR.src(self, tok, lane)

    def emit_ins(self, pc, out, ind):
        flags, op, rest = self.ins[pc]
        pad = '    ' * ind
        if op == 'bary.f':
            m = re.match(r'(?:\(ei\))?(hr|r)(\d+)\.([xyzw]), \(r\)(\d+), r0\.x', rest) or re.match(r'(?:\(ei\))?(hr|r)(\d+)\.([xyzw]), (\d+), r0\.x', rest)
            if not m:
                raise ValueError('bary ' + rest)
            k, g, c, idx = m.groups()
            lanes = int(re.search(r'\(rpt(\d)\)', flags)[1]) + 1 if '(rpt' in flags else 1
            d0 = 4 * int(g) + SW.index(c)
            for l in range(lanes):
                v = int(idx) + l
                self.max_bary = max(self.max_bary, v + 1)
                out.append(f'{pad}{self.var(k, d0 + l)} = texCoord.{"xyzw"[v]};')
            return
        if op == 'sam':
            m = re.fullmatch(r'\((f16|f32|s32|u32|s16|u16)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), (r\d+\.[xyzw]), s#(\d), t#\d', rest)
            if not m:
                raise ValueError('sam形式 ' + rest)
            prec, mask, dk, dg, dc, coord, samp = m.groups()
            ck, ci = self.reg(coord)
            d0 = 4 * int(dg) + SW.index(dc)
            sample = f'sample{pc}'
            self.sample_vars.add(sample)
            self.sample_prec[pc] = 'mediump' if prec == 'f16' else 'highp'
            self.used_slots.add(int(samp))
            fetch = f'texture2D({self.sampler(int(samp))}, vec2({self.var(ck, ci)}, {self.var(ck, ci + 1)}))'
            if prec[0] in 'su' or (self.stypes.get(self.sampler(int(samp))) or '')[:1] in ('u', 'i'):
                fetch = f'vec4({fetch})'
            out.append(f'{pad}{sample} = {fetch};')
            for ch in mask:
                out.append(f'{pad}{self.var(dk, d0 + SW.index(ch))} = {sample}.{ch};')
            return
        if op == 'getbit.b':
            return R.LifterR.emit_ins(self, pc, out, ind)
        return R.LifterR.emit_ins(self, pc, out, ind)

    def generate(self):
        body = []
        for i, (vary, slot, tex, dest, mask, kind, *_) in enumerate(self.prefetch):
            self.sample_vars.add(f'samplePF{i}')
            fe = f'texture2D({self.sampler(slot)}, texCoord.xy)'
            if (self.stypes.get(self.sampler(slot)) or '')[:1] in ('u', 'i'):
                fe = f'vec4({fe})'
            body.append(f'    samplePF{i} = {fe};')
            self.max_bary = max(self.max_bary, 2)
            for b in range(4):
                if mask & (1 << b):
                    body.append(f'    {self.var("hr" if kind == 0 else "r", dest + b)} = samplePF{i}.{SW[b]};')
        self.structure(0, len(self.ins), body, 1)
        ok = 'hr' if self.out_half else 'r'
        oreg = [self.var(ok, self.outinfo[3] * 4 + c) for c in self.outinfo[6:10]]
        decl = [f'    {"mediump" if k == "hr" else "highp"} float {n};' for k, n in sorted(self.used)]
        if self.uses_a0:
            decl.append('    highp float a0_x;')
        self.es3 = any(t[0] in 'iu' for t, _ in self.utypes.values() if t != 'mat2') or any(t in ('isampler2D', 'usampler2D') for t in self.stypes.values()) or not self.out_half or any(o in ('or.b', 'xor.b') for _, o, _ in self.ins) or getattr(self, 'force_es3', False)
        head = ['#version 300 es' if self.es3 else '#version 100', 'precision highp float;', '']
        if self.es3: head.insert(1, 'precision highp int;')
        if any(t == 'samplerExternalOES' for t in self.stypes.values()):
            head.insert(1, '#extension GL_OES_EGL_image_external_essl3 : require' if self.es3 else '#extension GL_OES_EGL_image_external : require')
        head += [f'uniform highp {self.stypes[n]} {n};' if n else f'uniform highp sampler2D unusedSampler{i};' for i, n in enumerate(self.slot_names())]
        for n, (t, sz) in sorted(self.utypes.items(), key=lambda kv: (-1 if __import__('os').environ.get('REV') else 1) * self.uorder.get(kv[0], 1 << 30)):
            if n not in self.uniforms and n not in self.declared_all:
                continue
            p = 'mediump' if self.uni_kind.get(n) == {'hc'} else 'highp'
            head.append(f'uniform {p} {t} {n}' + (f'[{sz}];' if sz > 1 else ';'))
        head += [(f'in highp {"vec2" if self.max_bary <= 2 else "vec4"} texCoord;' if self.es3 else f'varying highp {"vec2" if self.max_bary <= 2 else "vec4"} texCoord;')] + ([f'out {"mediump" if self.out_half else "highp"} vec4 fragColor;'] if self.es3 else []) + ['']
        if any(o == 'rndne.f' for _, o, _ in self.ins):
            head += ['float rndne(float x)', '{', '    float f = floor(x + 0.5);', '    return (f - x == 0.5 && mod(f, 2.0) != 0.0) ? f - 1.0 : f;', '}', '']
        head += ['void main()', '{', '    bool p0;', '    bool p1;']
        head += [f'    {self.sample_prec.get(int(v[6:]), "highp") if v[6:].isdigit() else "highp"} vec4 {v};' for v in sorted(self.sample_vars)]
        head += decl
        head += [f'    {n};' for n, _ in sorted(self.uorder.items(), key=lambda kv: kv[1]) if n in self.uniforms]
        head += body
        head += [f'    {"fragColor" if self.es3 else "gl_FragColor"} = vec4({oreg[0]}, {oreg[1]}, {oreg[2]}, {oreg[3]});', '}', '']
        text = '\n'.join(head)
        if self.es3:
            text = text.replace('texture2D(', 'texture(')
        return text

    def vertex_code(self):
        from run_all import stage_code
        st = stage_code(open(f'{ROOT}/.tmp/glsl-completion/{self.name.rsplit("-p", 1)[0]}/p{int(self.name.rsplit("-p", 1)[1]):03}.bin', 'rb').read()[8:])
        return st[1][1]

    def vertex(self):
        code = self.vertex_code()
        ins, labels = B.parse_lines(code)
        txt = ' ; '.join(f'{o} {r}' for f, o, r in ins)
        if len(code) <= 8 or txt.startswith('mov.f32f32 r1.x, (0.0)') or txt.startswith('mov.f32f32 r0.z, (0.0)'):
            return self.vertex_plain()
        data = load(str(ROOT / f'.tmp/glsl-completion/{self.name.rsplit("-p", 1)[0]}/p{int(self.name.rsplit("-p", 1)[1]):03}.bin'))
        vu, vc, _ = interface(data, self.utypes, si=(3, 4))
        sv = (self.constants, self.used, self.uni_kind, self.ins, self.labels, self.uniforms)
        self.constants, self.used, self.uni_kind, self.ins, self.labels = vc, set(), {}, ins, labels
        body = []
        self.structure(0, len(ins), body, 1)
        used = self.used; vkind = self.uni_kind
        self.constants, self.used, self.uni_kind, self.ins, self.labels, self.uniforms = sv
        names = {re.match(r'(\w+)', v)[1] for v in vc.values()} & set(self.utypes)
        w = 'vec2'
        used |= {('r', f'r{g}_{c}') for g in (0, 1) for c in 'xyzw'}
        decl = [f'    highp float {n};' for k, n in sorted(used)]
        lines = ['#version 300 es' if self.es3 else '#version 100']
        lines += ['in highp vec4 vPosition;' if self.es3 else 'attribute highp vec4 vPosition;', 'in highp vec2 inTexCoord;' if self.es3 else 'attribute highp vec2 inTexCoord;']
        lines += ['out highp vec2 texCoord;' if self.es3 else 'varying highp vec2 texCoord;']
        for n in sorted(names, key=lambda n: vu.get(n, '')):
            t, sz = self.utypes[n]
            fk = self.uni_kind.get(n)
            lines.append(f'uniform {"mediump" if fk == {"hc"} else "highp"} {t} {n}' + (f'[{sz}];' if sz > 1 else ';'))
        lines += ['', 'void main()', '{']
        lines += decl
        lines += ['    r0_x = vPosition.x;', '    r0_y = vPosition.y;', '    r0_z = vPosition.z;', '    r0_w = vPosition.w;', '    r1_x = inTexCoord.x;', '    r1_y = inTexCoord.y;']
        lines += body
        lines += ['    gl_Position = vec4(r0_x, r0_y, r0_z, r0_w);', '    texCoord = vec2(r1_x, r1_y);', '}', '']
        return '\n'.join(lines)

    def vertex_plain(self):
        w = 'vec2' if self.max_bary <= 2 else 'vec4'
        if self.es3:
            return f'#version 300 es\nin highp vec4 vPosition;\nin highp {w} inTexCoord;\nout highp {w} texCoord;\n\nvoid main()\n{{\n    gl_Position = vPosition;\n    texCoord = inTexCoord;\n}}\n'
        return f'#version 100\nattribute highp vec4 vPosition;\nattribute highp {w} inTexCoord;\nvarying highp {w} texCoord;\n\nvoid main()\n{{\n    gl_Position = vPosition;\n    texCoord = inTexCoord;\n}}\n'


if __name__ == '__main__':
    print(LifterM(sys.argv[1]).generate())
