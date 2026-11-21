# Adreno ir3 反組譯器（Mesa）狀態，2026-11-20

- 建置：`/home/h/tmp/SemcCameraUI/.tmp/ir3/mesa-build`，目標 `src/freedreno/isa/ir3-disasm`，已成功（meson 最小設定：`-Dtools=freedreno`，其餘驅動關閉；使用 `.tmp/ir3/venv` 內的 mako、packaging）。
- 用法：`ir3-disasm -c 05040001 <原始 ir3 位元組檔>`（05040001 = Adreno 540）。
- 驗證：Sony `alfort/p001` 的 type2 區段中，第 225–244 條指令可正確解碼（`bary.f`、`add.f`、`mov.f32f32`、`sam (f16)...`、`end`）。
- 自動抽取：`.tmp/ir3/listings/`，對 70 個 Alfort 程式的 type2 區段掃描，找到 30 個以 `end` 結尾的著色器主體（共 30 段）。其餘 40 個程式需要更好的區段定位（目前以「向前走到 no match 或全零指令為止」切割，對含 nop/全零的段落會切短或漏掉）。
- 限制：反組譯只得到組合語言，GLSL 仍需人工還原；區段表格式與 `pgmdump2.c` 不同，定位是用指令內容啟發式找出來的。

## 後續進度

已定位 type 2 區段的子節表。表格從區段內標頭指定的相對位址開始，每列 20 位元組，依序記錄子節編號、相對偏移、長度、數量與步幅。子節 10 提供指令範圍，每條指令 8 位元組，因此可保留區段中的零值 `nop`，並完整擷取頂點與片段階段。

執行 `python3 .tmp/ir3/disassemble_programs.py -o .tmp/ir3/sony .tmp/shdump/p*.bin` 已擷取 70 個 Alfort 程式的 210 個階段，解碼結果均無 unknown opcode。每個階段另以 Mesa 官方 `ir3-disasm -c 05040001` 重新解碼，忽略行首縮排後全部一致。結果與 SHA-256 索引位於 `.tmp/ir3/sony/manifest.json`，各階段的 `.bin` 與 `.asm` 位於同一目錄。這取代先前只找到 30 個主體的啟發式結果。
