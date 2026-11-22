"""位元精確版：暫存器一律以 uint 位元型態保存，依指令型別重新解讀（ES 3.00）。
用於整數運算密集、浮點近似無法對上的 shader。"""
import re, sys
sys.path.insert(0, '/home/h/tmp/SemcCameraUI/.tmp/ir3')
import ir3_to_es100_m as M
from ir3_to_es100 import SW, fmt_float, bits_to_float

SPLIT = re.compile(r',\s*(?![^()]*\))')
TYP = {'f16': 'f', 'f32': 'f', 's16': 'i', 's32': 'i', 'u16': 'u', 'u32': 'u'}


def conv_read(t, tname):
    """把 uint 位元運算式 t 解讀成 tname(f/i/u)。"""
    return {'f': f'uintBitsToFloat({t})', 'i': f'int({t})', 'u': t}[tname]


def conv_write(e, tname):
    return {'f': f'floatBitsToUint({e})', 'i': f'uint({e})', 'u': f'({e})'}[tname]


class LifterB(M.LifterM):
    bits = True

    # ---- 型別推斷 ----
    FOPS = {'add.f': '{a}+{b}', 'mul.f': '{a}*{b}', 'max.f': 'max({a},{b})', 'min.f': 'min({a},{b})', 'floor.f': 'floor({a})',
            'trunc.f': 'trunc({a})', 'ceil.f': 'ceil({a})', 'fract.f': 'fract({a})', 'rcp': '(1.0/({a}))', 'sqrt': 'sqrt({a})',
            'rsq': 'inversesqrt({a})', 'exp2': 'exp2({a})', 'log2': 'log2({a})', 'sin': 'sin({a})', 'cos': 'cos({a})',
            'abs.f': 'abs({a})', 'absneg.f': '{a}', 'sign.f': 'sign({a})', 'rndne.f': 'roundEven({a})',
            'mad.f16': '({a}*{b}+{c})', 'mad.f32': '({a}*{b}+{c})'}
    IOPS = {'add.s': ('i', '{a}+{b}'), 'sub.s': ('i', '{a}-{b}'), 'mul.s24': ('i', '{a}*{b}'), 'min.s': ('i', 'min({a},{b})'),
            'max.s': ('i', 'max({a},{b})'), 'absneg.s': ('i', '{a}'), 'min.u': ('u', 'min({a},{b})'), 'max.u': ('u', 'max({a},{b})'),
            'ashr.b': ('i', '({a} >> {b})'), 'shr.b': ('u', '({a} >> uint({b}))'), 'shl.b': ('u', '({a} << uint({b}))'),
            'and.b': ('u', '({a} & {b})'), 'or.b': ('u', '({a} | {b})'), 'xor.b': ('u', '({a} ^ {b})'), 'not.b': ('u', '(~{a})'),
            'mull.u': ('u', '(({a} & 65535u) * ({b} & 65535u))'),
            'madsh.m16': ('i', '({c} + (((({a}) & 65535) * (({b}) >> 16)) << 16))'),
            'madsh.u16': ('u', '({c} + ((({a} & 65535u) * ({b} >> 16u)) << 16u))')}
    CMPT = {'f': 'f', 's': 'i', 'u': 'u'}

    def _lanes(self, flags):
        return int(re.search(r'\(rpt(\d)\)', flags)[1]) + 1 if '(rpt' in flags else 1

    def raw(self, tok, lane):
        """回傳 (uint 位元運算式)；處理 (r)/(neg)/(abs) 以外的修飾由 operand() 負責。"""
        t = tok.strip()
        m = M.LifterM.REL.fullmatch(t) if False else None
        if re.fullmatch(r'-?\d+', t):
            return f'uint({t})' if t.startswith('-') else f'{t}u'
        m = re.fullmatch(r'h?\((-?[\d.]+(?:e[-+]?\d+)?)\)', t)
        if m:
            v = m[1]
            return f'floatBitsToUint({v if ("." in v or "e" in v) else v + ".0"})'
        kind, idx = self.reg(t)
        if kind in ('c', 'hc'):
            return self.craw(idx + (lane if '__r' in t else 0))
        return self.var(kind, idx)

    def craw(self, idx):
        v = self.constants.get(idx)
        if v is None:
            return '0u'
        m = re.fullmatch(r'uintBitsToFloat\(0x([0-9a-f]+)u\)', v)
        if m:
            return f'0x{m[1]}u'
        base = re.match(r'(\w+)', v)[1]
        self.uni_kind.setdefault(base, set()).add('c')
        t = self.utypes.get(base, ('float', 1))[0]
        if t[0] in 'iu' and not t.startswith('mat'):
            return f'uint({v})' if t[0] == 'i' else f'{v}'
        if t.startswith('uvec'):
            return v
        return f'floatBitsToUint({v})'

    def operand(self, tok, lane, tname):
        t = tok.strip()
        mods = set()
        while True:
            m = re.match(r'\((r|neg|abs|bnot)\)', t)
            if not m:
                break
            mods.add(m[1]); t = t[m.end():]
        rel = self.RELC.fullmatch(t) or self.REL.fullmatch(t)
        if rel:
            self.uses_a0 = True
            base = int(rel[2] or 0)
            e = '0u'
            if rel[1] in ('c', 'hc'):
                for k in range(31, -1, -1):
                    if base + k in self.constants:
                        e = f'(a0_x == {k} ? {self.craw(base + k)} : {e})'
            else:
                for k in range(15, -1, -1):
                    e = f'(a0_x == {k} ? {self.var(rel[1], base + k)} : {e})'
            raw = e
        elif re.fullmatch(r'-?\d+', t) or re.fullmatch(r'h?\(-?[\d.]+(?:e[-+]?\d+)?\)', t):
            raw = self.raw(t, lane)
            if re.fullmatch(r'-?\d+', t) and tname == 'f':
                raw = f'floatBitsToUint({t}.0)'
        else:
            kind, idx = self.reg(t)
            if 'r' in mods:
                idx += lane
            raw = self.craw(idx) if kind in ('c', 'hc') else self.var(kind, idx)
        v = conv_read(raw, tname)
        if 'abs' in mods:
            v = f'abs({v})' if tname != 'u' else v
        if 'neg' in mods:
            v = f'(-{v})' if tname in ('f', 'i') else f'(~{v})'
        return v

    def pf_val(self, i, ch, slot):
        st = self.stypes.get(self.sampler(slot), 'sampler2D')
        return f'uint(samplePF{i}.{ch})' if st[0] in 'iu' else f'floatBitsToUint(samplePF{i}.{ch})'

    def dst(self, tok):
        m = re.match(r'((?:\((?:ei|even|sat)\))*)(hr|r|p)(\d+)\.([xyzw])$', tok.strip())
        fl, k, g, c = m.groups()
        return fl, k, 4 * int(g) + SW.index(c)

    def _emit_ins(self, pc, out, ind):
        flags, op, rest = self.ins[pc]
        pad = '    ' * ind
        if op in ('nop',) or op.startswith('bary') or op in ('sam', 'mova', 'getbit.b') or op.startswith(('stp', 'ldp')):
            return self._special(pc, out, ind)
        lanes = self._lanes(flags)
        parts = [x.strip() for x in SPLIT.split(rest)]
        dfl, dk, d0 = self.dst(parts[0])
        srcs = parts[1:]
        for lane in range(lanes):
            if op in self.FOPS:
                a = [self.operand(s, lane, 'f') for s in srcs] + ['0.0'] * 3
                e = self.FOPS[op].format(a=a[0], b=a[1], c=a[2])
                if '(sat)' in dfl:
                    e = f'clamp({e}, 0.0, 1.0)'
                w = conv_write(e, 'f')
            elif op in self.IOPS:
                tn, tpl = self.IOPS[op]
                a = [self.operand(s, lane, tn) for s in srcs] + ['0'] * 3
                if op in ('shr.b', 'shl.b', 'ashr.b'):
                    a[1] = self.operand(srcs[1], lane, 'u') if op != 'ashr.b' else f'int({self.operand(srcs[1], lane, "u")})'
                    if op in ('shr.b', 'shl.b'):
                        a[1] = self.operand(srcs[1], lane, 'u')
                e = tpl.format(a=a[0], b=a[1], c=a[2])
                w = conv_write(e, tn)
            elif op.startswith('cmps.'):
                _, tn, cc = op.split('.')
                tn = self.CMPT[tn]
                sym = {'gt': '>', 'lt': '<', 'ge': '>=', 'le': '<=', 'eq': '==', 'ne': '!='}[cc]
                a = [self.operand(s, lane, tn) for s in srcs]
                e = f'{a[0]} {sym} {a[1]}'
                if dk == 'p':
                    inv = '(sat)' in flags or '(sat)' in dfl
                    out.append(f'{pad}p{d0 + lane} = ' + (f'!({e});' if inv else f'{e};'))
                    continue
                w = f'(({e}) ? 1u : 0u)'
            elif op in ('sel.b32', 'sel.b16'):
                a = self.operand(srcs[0], lane, 'u'); c = self.operand(srcs[1], lane, 'u'); b = self.operand(srcs[2], lane, 'u')
                w = f'(({c}) != 0u ? {a} : {b})'
            elif op in ('sel.s32', 'sel.s16'):
                a = self.operand(srcs[0], lane, 'u'); c = self.operand(srcs[1], lane, 'i'); b = self.operand(srcs[2], lane, 'u')
                w = f'(({c}) > 0 ? {a} : {b})'
            elif op in ('sel.f16', 'sel.f32'):
                a = self.operand(srcs[0], lane, 'u'); c = self.operand(srcs[1], lane, 'f'); b = self.operand(srcs[2], lane, 'u')
                w = f'(({c}) < 0.0 ? {b} : {a})'
            elif op.startswith('mov.'):
                w = self.operand(srcs[0], lane, 'u')
                a = srcs[0].strip()
                if re.fullmatch(r'-?\d+', a):
                    w = f'uint({a})'
                elif re.fullmatch(r'h?\(-?[\d.]+(?:e[-+]?\d+)?\)', a):
                    w = self.raw(a, lane)
            elif op.startswith('cov.'):
                m = re.fullmatch(r'cov\.(f16|f32|s16|s32|u16|u32)(f16|f32|s16|s32|u16|u32)', op)
                sa, sb = m.groups()
                ta, tb = TYP[sa], TYP[sb]
                v = self.operand(srcs[0], lane, ta)
                if sa in ('s16',):
                    v = f'((int({v}) << 16) >> 16)'
                if sa in ('u16',):
                    v = f'({v} & 65535u)'
                if ta == 'f' and tb == 'i':
                    e = f'int(clamp({v}, -2147483648.0, 2147483520.0))'
                elif ta == 'f' and tb == 'u':
                    e = f'uint(clamp({v}, 0.0, 4294967040.0))'
                elif tb == 'f':
                    e = f'float({v})'
                elif ta == 'f':
                    e = v
                else:
                    e = v
                if sb == 's16':
                    e = f'(((int({e})) << 16) >> 16)'
                if sb == 'u16':
                    e = f'(uint({e}) & 65535u)'
                w = conv_write(e, tb) if tb != 'f' else conv_write(e, 'f')
            else:
                raise ValueError(f'未支援的指令 {pc}: {flags}{op} {rest}')
            if dk == 'p':
                out.append(f'{pad}p{d0 + lane} = ({w} != 0u);')
            else:
                out.append(f'{pad}{self.var(dk, d0 + lane)} = {w};')

    def _special(self, pc, out, ind):
        flags, op, rest = self.ins[pc]
        pad = '    ' * ind
        if op == 'nop':
            return
        if op == 'bary.f':
            m = re.match(r'(?:\(ei\))?(hr|r)(\d+)\.([xyzw]), \(r\)(\d+), r0\.x', rest) or re.match(r'(?:\(ei\))?(hr|r)(\d+)\.([xyzw]), (\d+), r0\.x', rest)
            k, g, c, idx = m.groups()
            lanes = self._lanes(flags)
            d0 = 4 * int(g) + SW.index(c)
            for l in range(lanes):
                v = int(idx) + l
                self.max_bary = max(self.max_bary, v + 1)
                out.append(f'{pad}{self.var(k, d0 + l)} = floatBitsToUint(texCoord.{"xyzw"[v]});')
            return
        if op == 'sam':
            m = re.fullmatch(r'\((f16|f32|s32|u32|s16|u16)\)\(([xyzw]+)\)(hr|r)(\d+)\.([xyzw]), (r\d+\.[xyzw]), s#(\d), t#\d', rest)
            prec, mask, dk, dg, dc, coord, samp = m.groups()
            ck, ci = self.reg(coord)
            d0 = 4 * int(dg) + SW.index(dc)
            nm = self.sampler(int(samp))
            st = self.stypes.get(nm, 'sampler2D')
            cx = f'uintBitsToFloat({self.var(ck, ci)})'; cy = f'uintBitsToFloat({self.var(ck, ci + 1)})'
            self.used_slots.add(int(samp))
            sv = f'sample{pc}'
            self.sample_vars.add(sv)
            fe = f'texture({nm}, vec2({cx}, {cy}))'
            if st[0] in 'iu':
                fe = f'vec4({fe})'
            for ch in mask:
                comp = f'{fe}.{ch}' if False else f'{sv}.{ch}'
            out.append(f'{pad}{sv} = {fe};')
            for ch in mask:
                if st[0] in 'iu':
                    w = f'uint({sv}.{ch})'
                else:
                    w = f'floatBitsToUint({sv}.{ch})'
                out.append(f'{pad}{self.var(dk, d0 + SW.index(ch))} = {w};')
            return
        if op == 'mova':
            m = re.match(r'a0\.x, (\S+)', rest)
            self.uses_a0 = True
            out.append(f'{pad}a0_x = int({self.operand(m[1], 0, "i")});')
            return
        if op == 'getbit.b':
            dst = rest.split(',')[0].strip()
            k, i = self.reg(dst)
            out.append(f'{pad}{self.var(k, i)} = 0u;')
            return
        raise ValueError(f'未支援的指令 {pc}: {flags}{op} {rest}')
