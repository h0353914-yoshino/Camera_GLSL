# Sony 相機 HAL 的 GLSL 還原

已為 Xperia XZ1 原廠 Alfort 和 Raisin 資源庫的 141 個程式重建 GLSL，涵蓋 Alfort 73 個及 Raisin 68 個。程式以 Adreno 540 指令、反射資料與 ARM 呼叫端為依據。所有搭配通過本機 Mesa OpenGL ES 編譯與連結，也已在 XZ1 的新舊 32 位元 Adreno 驅動匯出 program binary。實機逐像素比對與 HAL 拍照流程仍待驗證。

## Alfort

資源索引等於 p 編號減一。離線抽出的 p001–p070 與 `.tmp/shdump/` 逐位元組相同。兩個 Adreno 頂點變體均以 `end` 結束，使用與已知直通頂點 GLSL 相同的輸入輸出映射。

| 傾印 | 片段 | 運算 |
| --- | --- | --- |
| p001 | [p001.frag](alfort/p001.frag) | 四個水平偏移位置的紅色分量依序打包成 RGBA |
| p002 | [p002.frag](alfort/p002.frag) | 同 p001，使用外部紋理 |
| p003 | [p003.frag](alfort/p003.frag) | 四角取樣，分別打包左右欄的 RG、BA 加總，乘以 0.25 |
| p004 | [p004.frag](alfort/p004.frag) | 同 p003，使用外部紋理 |
| p005–p070 | 各用同名片段檔 | 拍照或錄影對焦統計，偶數編號使用外部紋理 |
| p071 | [p071.frag](alfort/p071.frag) | 逐通道四次多項式校正與量化 |
| p072 | [p072.frag](alfort/p072.frag) | 四個水平位置的紅色分量打包 |
| p073 | [p073.frag](alfort/p073.frag) | 兩列十六點取樣，每四筆取平均 |

p001–p004、p071–p073 使用 GLSL ES 100 的 [passthrough.vert](alfort/passthrough.vert)。p005–p070 使用 GLSL ES 320 的 [passthrough_320.vert](alfort/passthrough_320.vert)。

`ModuleDown2PK2PK::init` 載入原廠資源 2、3，對應 p003、p004。呼叫端傳入 `pixSize = (0.5 / width, 0.5 / height)`，外部路徑透過 `IONMblTexture` 綁定 `GL_TEXTURE_EXTERNAL_OES`。p002、p004 的 shader 含有驅動加入的 `$YUVControlInt32` 與 `$YUVConversionMat4Array`，GLSL 以 `samplerExternalOES` 表達這條取樣路徑。

`ModuleStatsStill::initShaders` 使用 p005、p007 至 p025，`initEGLShaders` 使用 p006、p008 至 p026。p005 的預取描述及 ARM 上傳資料對應到 `wakuTexUnit` 的 Y、起始 X、區塊長度和權重。p005 的 `pixSize` 為 vec4，呼叫端傳入 `(1 / width, 0.5 / width, 0, 0)`。

p005 共有 546 條指令。指令 284–482 依段長迴圈水平取樣，527–545 合併極值與計數。常數暫存器 c8–c17 分別對應 `pixSize`、`params1`、`params2`、`paramskkd`、`fa_l`、`fa_r`、`fh_l`、`fh_r`、`paramslim`、`paramssft`。呼叫端位址與完整控制流摘要記於 `.tmp/glsl-alfort/ALFORT.md`。

## Raisin

資源索引等於 p 編號減一。離線抽出的 p001–p054 與 `.tmp/shdump2/` 的前 54 筆逐位元組相同。p055–p068 取自同一份原廠資源庫。以下頂點與片段檔均位於 `raisin/`。

| 傾印 | 頂點 | 片段 |
| --- | --- | --- |
| p001–p004 | `raisin_interleaved_coords_external.vert` | 使用同名片段檔 |
| p005–p008 | `raisin_interleaved_dual_coords_external.vert` | 使用同名片段檔 |
| p009、p010 | `raisin_interleaved_coords_external.vert` | 分別用 `p009.frag`、`p010.frag` |
| p011–p014 | `raisin_interleaved_coords_external.vert` | 使用同名片段檔 |
| p015–p018 | `raisin_interleaved_dual_coords_external.vert` | 使用同名片段檔 |
| p019–p022 | `raisin_coords.vert` | 使用同名片段檔 |
| p023 | `raisin_dual_coords.vert` | `p023.frag` |
| p024 | `raisin_dual_coords.vert` | `p024.frag` |
| p025 | `raisin_dual_coords.vert` | `p025.frag` |
| p026 | `raisin_dual_coords.vert` | `p026.frag` |
| p027、p028 | `raisin_coords.vert` | 分別用 `p027.frag`、`p028.frag` |
| p029、p031 | `raisin_dual_coords.vert` | `p029.frag` |
| p030、p032 | `raisin_dual_coords.vert` | `p030.frag` |
| p033、p035 | `raisin_interleaved_coords.vert` | 分別用 `p033.frag`、`p035.frag` |
| p034、p036 | `raisin_interleaved_coords_external.vert` | 分別用 `p034.frag`、`p036.frag` |
| p037、p053 | `raisin_interleaved_dual_coords.vert` | `p037.frag` |
| p038、p054 | `raisin_interleaved_dual_coords_external.vert` | `p038.frag` |
| p039 | `raisin_interleaved_dual_coords.vert` | `p039.frag` |
| p040 | `raisin_interleaved_dual_coords_external.vert` | `p040.frag` |
| p041、p042 | `raisin_interleaved_dual_coords_external.vert` | 分別用 `p005.frag`、`p006.frag` |
| p043、p044 | `raisin_interleaved_dual_coords_external.vert` | 分別用 `p043.frag`、`p044.frag` |
| p045、p046 | `raisin_interleaved_dual_coords_320.vert` | 分別用 `p045.frag`、`p046.frag` |
| p047、p048 | `raisin_interleaved_dual_coords_external.vert` | 分別用 `p015.frag`、`p016.frag` |
| p049 | `raisin_dual_coords_half_step.vert` | `p023.frag` |
| p050 | `raisin_dual_coords_half_step.vert` | `p024.frag` |
| p051、p052 | `raisin_dual_coords_half_step.vert` | 分別用 `p029.frag`、`p030.frag` |
| p055、p056 | `raisin_interleaved_coords_external.vert` | 使用同名片段檔 |
| p057、p058 | `raisin_interleaved_coords.vert` | 使用同名片段檔 |
| p059、p061、p063 | `raisin_passthrough_es300.vert` | 使用同名片段檔 |
| p060、p062、p064 | `raisin_passthrough_es100.vert` | 使用同名片段檔 |
| p065、p066 | `raisin_interleaved_dual_coords_external.vert` | 使用同名片段檔 |
| p067、p068 | `raisin_interleaved_dual_coords.vert` | 使用同名片段檔 |

座標輸出版本由片段的插值輸入、尺寸 uniform、`texDumpMode` 與立即常數還原。p009、p010 及 p043、p044 分別打包鏡頭校正後的 X、Y 座標。短片段的紋理取樣可由 type 2 子節 34 讀出。每筆描述包含插值來源的標量索引、目的暫存器索引與 RGBA 寫入遮罩。已用片段指令區僅有 `end` 的直通取樣對照組核對。外部取樣保留原廠 RGB 路徑或 YUV 轉換後選取的分量。p020、p034 取 RG，p022、p036 取 GR，p024、p038、p050、p054 取 R，p026、p040 取 G。

p011–p018 使用 `params0`–`params4` 做透視投影，將落點捨入後轉成來源紋理座標，再取樣並量化為 8 位元。p001–p008 在投影後加入 `texUnitLensParam` 紅色與 Alpha 分量的徑向查表與插值。p041／p042 的頂點與片段指令分別與 p005／p006 相同，p047／p048 分別與 p015／p016 相同。

Raisin p045、p046 分別有 544 與 887 條指令。兩者的 GLSL 保留各點取樣與權重運算，p046 另保留索引寫入、迴圈與每片段的暫存區。p055–p058、p065–p068 是座標傾印變體，p059–p064 是一點、兩點或四點取樣打包。

## 逐指令版本的驗證範圍

Alfort p005–p070 和 Raisin p045、p046 以原始暫存器和基本區塊表達資料流。GLSL ES 320 提供融合乘加以及半精度打包與解包。外部紋理使用 `GL_OES_EGL_image_external_essl3`，由驅動處理 RGB／YUV 轉色。原廠 `GLContextEGL::onInit` 在 ELF 位址 `0x2eef8` 呼叫 `eglCreateContext`，傳入 `EGL_CONTEXT_CLIENT_VERSION = 2`。整合端需要確認實際取得相容的 context，並沿用原廠的 texture、uniform 與 framebuffer 狀態。要確認與原廠的數值等價，仍需在 XZ1 比對 FP16 捨入、倒數近似、外部紋理轉色及最終輸出。

本機 Mesa GLES 3.2 完成 141 個資源對應的編譯與連結，涵蓋 133 種頂點與片段搭配。Alfort p005 用固定輸入繪製長度 0、1、4 的對焦區塊，三次輸出的 B 分量依序為 0、64、255。Raisin p045、p046 分別用一般紋理及外部 RGBA EGLImage 繪製固定像素，兩者皆輸出 RGBA `(64, 64, 64, 64)`。

## XZ1 實機 program binary 比對

2026-11-20 在 G8342 用程序私有掛載切換 19 個舊版 32 位元元件。舊驅動 V@331.0 與新版 V@0502.0 都以原廠相同的 `EGL_CONTEXT_CLIENT_VERSION = 2` 請求 context，實際回傳 GLES 3.2 與 GLSL ES 3.20。兩版各成功匯出 141 個重建程式與 5 個既有控制組。舊版與新版輸出的編譯器雜湊分別為 `0xb4a0ccc2` 和 `0xa5aec842`。

| 比對 | 完整 binary 相同 | 三個階段指令全相同 | 片段指令相同 | 頂點指令相同 |
| --- | ---: | ---: | ---: | ---: |
| 舊驅動重編與 Sony 原廠 | 0／141 | 12／141 | 20／141 | 246／282 |
| 新驅動重編與 Sony 原廠 | 0／141 | 12／141 | 20／141 | 246／282 |
| 新驅動重編與舊驅動重編 | — | 74／141 | 74／141 | 282／282 |

5 個控制組與先前舊驅動樣本共 15 個指令階段全部相同，控制組另計。Alfort 對焦核心 p005 的片段為原廠 546 條、舊驅動重編 962 條。Raisin p045 為 544／548 條，p046 為 887／1929 條。這次比較以 type 2 子節 10 的機器指令為準，像素等價仍待驗證。

原始匯出、雜湊與逐階段比對保存在 `.tmp/adreno-glsl-compare/`。測試程序的私有掛載在退出後消失。已清除手機端測試目錄，並核對全域新版函式庫雜湊、唯讀 `/vendor`、SELinux Enforcing 與一般 ADB shell 身分。

## 重現解碼

使用本機 Mesa freedreno 原始碼與 `.tmp/ir3/` 的產物。每個原始傾印有 8 位元組封裝標頭。程式的 type 2 區段包含內部子節表，每列 20 位元組。子節 10 提供長度及區段相對偏移，每條 Adreno 指令為 8 位元組。

```bash
bash .tmp/ir3/build-disasm540.sh
python3 .tmp/ir3/disassemble_programs.py -o .tmp/ir3/sony .tmp/shdump/p*.bin
python3 .tmp/ir3/disassemble_programs.py -o .tmp/ir3/sony2 .tmp/shdump2/p*.bin
PYTHONDONTWRITEBYTECODE=1 python3 .tmp/glsl-completion/extract_alfort.py
PYTHONDONTWRITEBYTECODE=1 python3 .tmp/glsl-completion/extract_raisin.py
python3 .tmp/ir3/disassemble_programs.py -o .tmp/glsl-completion/alfort-disasm .tmp/glsl-completion/alfort/p*.bin
python3 .tmp/ir3/disassemble_programs.py -o .tmp/glsl-completion/raisin-disasm .tmp/glsl-completion/raisin/p*.bin
```

兩批既有傾印共 140 個檔案，其中 `shdump2` 的 p055–p070 與第一批同編號檔案相同。依原廠載入器離線抽出的兩套資源共 141 個程式、423 個階段。5 組已知 GLSL 對照樣本在新舊 Adreno 驅動共 15 對指令區逐位元組相同。ARM 呼叫端的 REA 證據包括 Alfort 資源 2、3 的載入 `ev_99384f905a36c1f12fb4cdd246bb452ec77463ae239552c53f3088358873d782`，Still 統計介面 `ev_f94e54c94c89c317df3d19fd095d914bb9fce240c1955b06185a796fe401eeec`，以及 Raisin 資源解密 `ev_8eae701743dfbacd62e24520a5795dd70f972fc7b622ceb8d3085b23915633e9`。

## 完整 binary 的重複編譯差異

舊版驅動的控制組 c1 使用相同 GLSL、相同驅動版本與相同程式長度，兩次匯出的三個 GPU 指令階段逐位元組相同，但完整 binary 有 154 個位元組不同。差異包括名稱池排列、對名稱池的偏移，以及整份資料的完整性雜湊。Alfort p072 的三個指令階段與 Sony 原廠相同，完整 binary 仍有 233 個位元組不同，包含名稱池、參照偏移及其他中繼資料。這些結果來自 `.tmp/lab/out/old_c1.bin`、`.tmp/adreno-glsl-compare/old/control-c1.bin`、`.tmp/glsl-completion/alfort/p072.bin` 與 `.tmp/adreno-glsl-compare/old/alfort-p072.bin`。


## 目前還原狀態（以原廠 A9 實機編譯，全階段指令位元組比對）
- 全階段與原廠相同：67 / 141（raisin 64 / 68，alfort 3 / 73）。
- raisin 尚未相同（4）：045 046 057 058（p057/p058 只差指令排序；p045/p046 為 ES 3.20 大型機器翻譯版）。
- alfort 相同：001 002 072
- alfort 尚未相同（70）：p003、p004（只差取樣與加總排序）與 p005–p071 的大型機器翻譯版（`fullRegister[]` 模擬，需由演算法重寫成 ES 1.00）。
- 已知寫法規則見 progress-main.md：外部紋理取樣的輔助函數、逐點 `correct(vec2)`、逐 lane 函數 `lane(float)`、`encode()` 多分支 return、兩個 vec2 或 vec4 varying、分量逐一指定輸出等。

- 自動工具：`tools/ir3_to_es100.py` 可由原廠二進位產生 ES 1.00 版（`alfort_auto_es100/`，p005–p070 共 66 個，皆可在原廠 A9 編譯，指令數為原廠 0.95–1.28 倍（中位數 1.13），尚無全階段相同者，但經原廠 A9 上 8192 組隨機輸入的像素比對，66 個皆與原廠二進位輸出逐位元組相同）。
