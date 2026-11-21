# Worker G：alfort-p071 手動還原

- 開始：2026-11-21 00:41:33（CST）
- 結束：2026-11-21 00:42:48（CST），實際耗時約 1.3 分鐘（時限 20 分鐘，未用完）
- 編譯迭代次數：6 次手寫候選（g_p071.py 3 個、g_p071b.py 2 個、一次臨時 3 個），每次都是整批編譯比對
- 結果：未達成。最接近的候選指令數 35–38，原廠 34；所有候選第 0 階段指令都不相同。
- 原廠結構（由 asm 讀出）：無紋理取樣；x 經 bary + mad + floor；x²、x³、x⁴ 以乘法鏈計算；多項式 c8.x·x⁴ + c8.y·x³ + c8.z·x² + c8.w·x，加 c9.x，clamp 到 [0, c12.z]，再 c12.w·a + c12.y 與 floor；之後 cov、乘 hc10.w、floor、min c12.x、乘 hc13.x。
- 未解：第一個 mad 的常數 hc12.x/hc12.y 與 pixSize、texCoord 的對應；clamp 上限與 hc10.w、hc13.x 的常數來源。
- 未修改 md/camera_shader_glsl/alfort/p071.frag（保持原內容），未 commit。
