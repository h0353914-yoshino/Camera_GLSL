# SemcCameraGLSL

Sony 相機 GPU 模組 raisin／alfort 的 shader 還原（GLSL 原始碼）。

- `raisin/`：raisin 的片段與頂點著色器（68 個程式中 56 個有原始碼）。
- `alfort/`：alfort 的原始碼。`p001`–`p004`、`p072` 為還原版；`p005`–`p071` 的 `.frag` 為舊的暫存器模擬版（已由 `auto_es100/` 取代）。
- `alfort/auto_es100/`：由原廠二進位自動生成的 ES 1.00 版（p005–p070）。
- `tools/`：反組譯、生成、編譯比對與像素驗證工具。
- `docs/`：還原過程紀錄與狀態（`STATUS.md`）。

分支：`glsl-restore`（完整還原資料）、`build`（只留編譯所需檔案與 manifest）。
