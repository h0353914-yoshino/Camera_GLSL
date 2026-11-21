# Worker C 進度（Raisin 剩餘程式），2026-11-20

範圍：raisin-p001–p068 中尚未所有階段指令逐位元組相同者。

## 結果
- Raisin 相同數：13 → **14／68**（新增 p062）。
- p062 修正：片段改為 `mediump vec4 c = vec4(0.0); c.r = texture2D(texUnit0, texCoord).r; gl_FragColor = c;`，已寫入 `md/camera_shader_glsl/raisin/p062.frag`，經 payload 路徑重新驗證為 all-stage identical。

## 嘗試但未成功
- p027（stock-context）：控制流三種寫法 × 輸出封裝三種寫法（9 組）皆不相同，最接近差 237 行差異。原廠會在 `floor(upperPosition)` 之前先算 `floor(position)` 的一組中間值，寫法順序尚未找到。
- p059：片段原廠 14 條、ours 15 條，原廠使用 `sam (f32)(xw)` 與 `mov` 重排，尚未搜尋。
- p063：原廠的 `mov` 與 `mad` 交錯順序與 `(rpt2)` 不同，尚未搜尋。
- p023–p026、p029–p032、p049–p052 的頂點階段（stage 1、2）仍有 25 vs 24 條的差異，先前對 p024 的 22 種寫法皆失敗。

## 剩餘待辦（依片段指令差異由小到大，未全部處理）
p059、p063、p027、p028、p057、p058、p064、p020、p022、p023–p026、p029–p032、p049–p052、p067、p068、p065、p060、p066、p011–p017、p047、p055、p056、p001–p010、p041–p048（p045、p046 差異最大）。

## 工具
- 工作腳本：`.tmp/ir3/workerC_todo.txt`、`workerC_bins.pkl`、`wc_try.py`（通用多變體試驗，回傳是否逐位元組相同）。
- 裝置存取一律經 `devloop.compile_pairs`（已加檔案鎖 `.tmp/ir3/device.lock`）。
