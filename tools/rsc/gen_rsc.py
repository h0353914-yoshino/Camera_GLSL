#!/usr/bin/env python3
"""開發者工具：產生 rsc 替代函式庫的 .c / _res.S（結果提交進版本庫，建置時不需要此腳本）。

資源記錄與原廠格式相同：[旗標 u32][長度 u32][資料]。旗標 0＝未加密 GLSL 原始碼，
呼叫端會直接交給 createProgram。資料：[vs 長度][vs\\0][fs 長度][fs\\0]。
GLSL 用 .incbin 從同倉庫根目錄嵌入，長度由組譯器以標籤相減算出，
所以只改 GLSL 內容不必重新產生；增減程式或改檔名才需要重跑。
用法：python3 tools/rsc/gen_rsc.py <輸出目錄>
在本倉庫根目錄執行；輸出的 .c／_res.S 提交到 lineage-24.0 分支的 src/。
.incbin 路徑相對於 lineage-24.0 分支根目錄（即 vendor/sony/camera 的子模組 rsc）。
"""
import json, os, sys

T = os.path.dirname(os.path.abspath(__file__))
G = os.path.dirname(os.path.dirname(T))   # 倉庫根目錄（含 manifest*.tsv 與各模組 GLSL）
R = sys.argv[1]
mods = json.load(open(os.path.join(T, 'modules.json')))

# 讀子模組內的三份 manifest，名稱正規化成 modules.json 使用的形式
src = {}
for f, norm in (('manifest.tsv', False), ('manifest_rsc.tsv', True), ('manifest_rsc_unverified.tsv', True)):
    for line in open(os.path.join(G, f)):
        p = line.rstrip('\n').split('\t')
        if len(p) < 4 or p[0].startswith('#'):
            continue
        name = p[0]
        if norm:
            m, rest = name.split('-', 1)
            h, pn = rest.split('-p')
            name = '%s_%s-p%d' % (m, h, int(pn))
        src[name] = (p[2], p[3])

for m in mods:
    lib = m['lib']
    s = ['// 自動產生（rsc/gen_rsc.py），請勿手動修改。', '.section .rodata,"a"']
    c = ['// 自動產生（rsc/gen_rsc.py），請勿手動修改。\n']
    for h in m['holders']:
        hn = h['name']; n = len(h['programs'])
        for i, p in enumerate(h['programs']):
            vs, fs = src[p]
            assert os.path.exists(os.path.join(G, vs)) and os.path.exists(os.path.join(G, fs)), p
            t = '%s_%d' % (hn, i)
            s += ['.balign 16', '.globl res_%s' % t, '.hidden res_%s' % t, 'res_%s:' % t,
                  '.long 0', '.long (e_%s - d_%s)' % (t, t),
                  'd_%s:' % t,
                  '.long (ve_%s - vs_%s)' % (t, t),
                  'vs_%s:' % t, '.incbin "%s"' % vs, '.byte 0', 've_%s:' % t,
                  '.long (fe_%s - fs_%s)' % (t, t),
                  'fs_%s:' % t, '.incbin "%s"' % fs, '.byte 0', 'fe_%s:' % t,
                  'e_%s:' % t]
        c.append(''.join('extern const unsigned char res_%s_%d[];\n' % (hn, i) for i in range(n)))
        c.append('static const void *const kTable_%s[%d] = { %s };\n' % (hn, n, ','.join('res_%s_%d' % (hn, i) for i in range(n))))
        c.append('__attribute__((visibility("default"))) const void *holder_%s(int index) asm("%s");\n' % (hn, h['sym']))
        c.append('const void *holder_%s(int index) { return (index >= 0 && index < %d) ? kTable_%s[index] : (const void *)0; }\n' % (hn, n, hn))
    disp = ''.join('    if (tag == 0x%x) return holder_%s(index);\n' % (int.from_bytes(h['name'].encode(), 'big'), h['name']) for h in m['holders'])
    c.append('__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("%s");\n' % m['ns_shader'])
    c.append('const void *shaderdata(int tag, int index) {\n%s    return (const void *)0;\n}\n' % disp)
    c.append('__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("%s");\n' % m['ns_kernel'])
    c.append('const void *kerneldata(int tag, int index) { return (const void *)0; }\n')
    os.makedirs(R, exist_ok=True)
    open(os.path.join(R, lib + '.c'), 'w').write(''.join(c))
    open(os.path.join(R, lib + '_res.S'), 'w').write('\n'.join(s) + '\n')
    print(lib, sum(len(h['programs']) for h in m['holders']))
