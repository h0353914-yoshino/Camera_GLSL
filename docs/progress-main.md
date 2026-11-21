# 逐個還原進度（以 A9 原廠機 SOV36 驗證，所有階段指令與 Sony 原廠相同）

2026-11-21 01:16–01:26，約 10 分鐘：17 → 25／141。

新對齊：
- Raisin p059：`l = texture(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0)); r = texture(..., texCoord + vec2(0.5 * pixSize, 0.0)); FragColor = vec4(l.ra, r.ra);`
- Raisin p063：四個純量取樣，負偏移寫 `texCoord - vec2(k * pixSize, 0.0)`，正偏移寫 `+`。
- Raisin p023–p026、p049、p050（頂點著色器）：`vec4 a = inTexCoord.xyxx + vec4(dx0, dy, dx1, dx2)`，再 `a * scale.xyxx + offset.xyxx`，另一個純量 `b = inTexCoord.x + dx3` 單獨算。改 `raisin_dual_coords.vert`、`raisin_dual_coords_half_step.vert`。

未解（紀錄）：
- Raisin p057 / p058 / p027 / p028（texDumpMode 選擇）：已試約 200 種寫法，最接近 253／328 位元組相同。原廠把 `fract` 展開成 `x - floor(x)`，且 `upperPosition` 另用一個 `mul` 再 `floor`；我們的編譯結果會把部分運算合併成 `mad`。
- Alfort p071：原廠直接用暫存器讀取目前像素，沒有取樣指令；用 `gl_LastFragData` 會變成 `isamm`（44 條 vs 34 條）。
- Alfort p003、Raisin p060、p064、p067、p068、p029–p032 等：尚未解。

## 01:27–01:32 補充
- Raisin p020 / p022（外部紋理，只取 .rg / .gr）：原廠把兩個取樣做成預取（指令中沒有 `sam`），YUV 轉換只算 2 個通道（`c8.x,c8.y` …）；我們的編譯會多算第 3 個通道（`c8.z` …，共 49 條，原廠 44–46 條）。試過 18 種精度組合（取樣器、預設浮點、varying 精度）與 5 種運算式寫法，沒有一個相同。mediump 取樣器 + mediump 預設精度可以得到 44 條，但會改成半精度運算，與原廠的 f32 不同。
- 目前總數維持 25／141。

## 01:28–01:35 p020 / p022 的 YUV 通道數
- 同一份外部紋理在不同取用方式下的 YUV 轉換通道數（A9 原廠機實測）：只取 `.r` → 只用 `c8.x`；只取 `.g` → 只用 `c8.y`；取 `.rg`（一個或兩個取樣）→ `c8.x`、`c8.y`、`c8.z` 三條通道都算，第三條（z）最後沒被用到，但沒有被編譯器刪除。
- 原廠 p020 / p022 只有 x、y 兩條通道，所以原廠的寫法不是我們用的 `.rg` 一起取。已試：`.rg`、`.xy`、先取 vec4 再拆、分成 `.r` 與 `.g` 兩次取、ES 3.0 `texture()`（`GL_OES_EGL_image_external_essl3`），全部是 3 條通道。
- 尚未找到能讓編譯器只算 2 條通道的寫法。

## p020 / p022 已解決（全階段相同）
- 觀察：將取樣寫在輔助函數裡可重現原廠指令；原始 GLSL 寫法無法直接從這項實驗確定。候選寫法為（`vec2 fetch(vec2 uv){ return texture2D(texUnit, uv).rg; }`）。這樣編譯器在展開函數後才看到外部紋理 YUV 轉換，所以會把沒用到的 z 通道刪掉，只剩 2 條通道。直接在 main 裡寫 `.rg` 時，YUV 轉換會整組算 3 條通道，z 通道成為死碼卻沒被刪除（原廠 p034 正是這種寫法，與我們原本的 p020 編出一模一樣的碼）。
- 反證：pragma optimize/debug、lowp/mediump 區域變數、迴圈、mat4、clamp 都還是 3 條通道；mediump 預設精度會改走 f16 + brac 路徑。
- 線索：其餘程式若有「多算一個死通道」或指令數略多的現象，可以先試著把取樣包進函數。

## 2026-11-21 輔助函數包裝試驗（外部紋理 p004/p006/p008/p012/p014/p016/p018/p060/p064）
- 把 `texture2D(texUnit0, …)` 改成 `fetchExt(…)`（輔助函數回傳 vec4）後，九個程式的片段階段仍與原廠不同（頂點與其餘階段相同）。
- p060 另試 `- vec2(…)` 寫法、分量寫法 `vec2(texCoord.x ± …, texCoord.y)`、不用輔助函數：片段 40–46 條指令，皆與原廠 39 條不同；原廠的 sam 前後排程與 YUV 運算順序不同。
- 結論：包裝函數只解決 p020/p022 這種「只取兩通道、z 通道死碼」的情況；其餘外部紋理程式需要另外找寫法。尚未套用任何候選到 md 原始碼。

## p060 續查（未解）
- 另試 16 種精度組合（sampler / varying / pixSize 各 highp 或 mediump）、輔助函數包 offset、提取 offset 變數、分量寫法：片段 34–49 條指令，沒有一個與原廠 39 條相同。
- 原廠的特徵：pixSize 以 `mov` 從 c16.x 載入，兩個取樣的 offset 都用同一個常數 c20.x（符號相反，`(neg)c20.x`）；我們的寫法會把 ±0.5 拆成 c20.x 與 c20.z 兩個常數。這個常數共用的結構沒有在任何候選中重現。
- 下一步可考慮：找原廠 ARM 呼叫端（libsomc_raisin.so）對 p060 uniform 的設定方式，或改用 p059 那種已匹配的單取樣結構作類比。

## 2026-11-21 呼叫端與候選續查

- `libsomc_raisin.so` 的 `RsnShaderLoaderClassMethods::getPrecompiledShaderTypeCount`（ELF `0x12824`）回傳 54，`getPrecompiledShaderType`（`0x12758`）的表在 `0x5a202`，內容為 0–53。p060、p064 對應資源索引 59、63，不在此 loader 的預編譯清單。
- 已查原廠 `vendor/lib` 下 `libsomc_*.so` 的動態符號，只有 `libsomc_raisin.so` 匯入 `raisin::getShaderData`。該庫無 `pixSize` 字串與 `glUniform1f` 動態匯入。這項搜尋涵蓋該 loader 與上述動態符號，其他模組或動態查找路徑尚未排除。
- p060 另有 64 組候選在原廠 A9 舊版驅動成功編譯，片段指令皆不相同。候選與結果位於 `.tmp/ir3/p060-project/`。
- Alfort p004 交叉測試 24 種取樣順序、4 種直接或 helper 寫法及 2 種加總順序，共 192 組在原廠 A9 成功編譯。片段指令皆不相同，最高有 453 個對應 byte 相同，候選為 87 條指令，原廠為 86 條。候選與結果位於 `.tmp/ir3/p004-project/`，完整紀錄為 `.tmp/ir3/p004-project.log`。
- `.tmp/ir3/stock_identical.txt` 目前有 27 行，27 個名稱皆唯一。p020、p022 的輔助函式是能重現指令的候選寫法，原廠原始 GLSL 實際寫法仍未取得。

## p060 / p064 已解決（全階段相同，手動分析）
- 座標：左側用 `texCoord - vec2(k * pixSize, 0.0)`、右側用 `+ vec2(k * pixSize, 0.0)`；原廠兩邊共用同一個常數 c20.x（減號變成 `(neg)`），右側保留 `+ 0.0`（`add.f r, y, (0.0)`）。
- p060：原廠是全部 `sel`、沒有分支也沒有 `cmps` 的唯一一支。寫成四個獨立的 `texture2D(...).r / .g`（同座標各取一次，由編譯器合併取樣）才會兩次 YUV 轉換都 if-convert 成 sel；`.rg` 一次取兩個分量時，第二次一定會變分支。
- p064：四個 `.r` 取樣要寫成 `gl_FragColor.r = …; .g = …; .b = …; .a = …;` 逐分量指定，前三個輸出的 cov 才會排在第 4 個 YUV 分支之前；`vec4(...)` 或 float 區域變數都差在尾段排程。取樣順序必須 0,1,2,3。

## 交錯座標家族（p001–p004、p009–p014、p055、p056）已解決，全階段相同
- 根因 1：原廠的 varying 是兩個 vec2 `texCoord0`、`texCoord1`（名稱池可見，另有 `$gv0`），不是一個 vec4 `texCoord`。已改 `raisin_interleaved_coords.vert`、`raisin_interleaved_coords_external.vert` 及其全部 18 個片段；p033–p036 改名後仍全相同（之前指令相同但名稱不符）。
- 根因 2：座標校正寫成逐點函數 `correct(vec2 p)`（以 float 運算），在 main 對 texCoord0、texCoord1 各呼叫一次。
- 寫法細節：先算 `depthOffset = params4.z * params1.y`、`yOffset = params4.z * params1.z`（決定常數暫存器分配順序）；`rotatedDepth * params2.y` 運算元順序；半徑用 `length(vec2(projectedX, projectedY))`（sqrt 不帶 abs）；`tableFraction = fract(tablePosition)`、`tableColumn = (tablePosition - tableFraction + 0.5) * params4.x`。
- p009/p010/p055/p056：texDumpMode 編碼寫成 `vec4 encode(vec2)` 函數，各分支 `return floor(...).xxyy * (1.0 / 255.0);`，才會保留真的分支（否則被 if-convert 成 sel）。
- 未解：p057/p058（ES3，int texDumpMode）。最接近的寫法是每個分支直接寫 `FragColor = floor(...).xxyy * (1.0 / 255.0)`、upperPosition 內嵌，常數池順序已一致，但 44 vs 41 條，差在排程與 fract(upper) 運算元順序；switch、分支順序、手寫 fract 都試過。
- 另發現：alfort 原廠名稱池是 ES 1.00 的 `gl_FragColor`，還有 `fa_l/fa_r/fh_l/fh_r/paramskkd/paramslim/paramssft/wakuTexUnit` 等名稱；我們的 alfort 重建是 ES3 `out fragColor`，需整批重新檢查。

## 雙座標家族（p005–p008、p015–p018）已解決，全階段相同
- 與 p012 同款逐點函數 `correct(vec2 p)`（有鏡頭校正者用 p001 版），main 以四個 `texels.x/y/z/w = texture2D(texUnit0, correct(texCoord0.xy / .zw, texCoord1.xy / .zw)).r|g|a` 逐分量指定；向量寬度的寫法會少 18 條指令。
- 下一步：同樣的 vec4 varying 結構還有 p041–p048、p065、p066（rpt3 bary），可套用同一模板。

## p041/p042/p047/p048 與 p043/p044/p065/p066
- p041、p042、p047、p048 與 p005、p006、p015、p016 共用片段檔，上一輪改完後同時全階段相同（已確認）。
- p043/p044/p065/p066（vec4 的 texDump 版，含 p043/p044 的鏡頭校正）：向量寬度寫法 + `depthOffset/yOffset` 提取 + `rotatedDepth * params2.y` 運算元順序 + `vec4 encode(vec4)` 帶多分支 return，已縮到 p065 差 24 行、p066 差 36 行（原廠 111/113 行）。剩餘差異只在排程：原廠的 `cmps texDumpMode==1` 排在 clamp 之後，`inTexSize*256` 的 mul 位置也不同。把 clamp 搬進 encode、改寫 clamp 表達式（min/max、先提取上界、乘法運算元順序）都沒有改變結果。逐點函數（四次呼叫）版會膨脹到 194 行，不是原廠寫法。
- p043/p044 差距較大（原廠 266/263 行，向量寬度版 213/210 行），鏡頭校正與 texDump 混合的寫法尚未找到。

## p043/p044/p065/p066 已解決（全階段相同）
- p065/p066（無鏡頭校正）：向量寬度前段放進 `vec4 correct()`，`pack` + `encode` 也放在函數內；`main` 只剩 `gl_FragColor = encode(correct());`。重點是 `cmps texDumpMode==1.0` 要留在最後一個函數邊界內，直接在 main 先算 packedPosition 時編譯器會把比較提前。
- p043/p044（含鏡頭校正）：前段改回 p009 的逐點 `float correct(vec2)`，四次呼叫組成 vec4 `pixels`，再 `vec4 pack(vec4)` → `vec4 encode(vec4)`（多分支 return，各帶 `* (1.0 / 255.0)`）。

## p057/p058 續查（未解）
- 原廠常數池順序：c12.x=-0.5、y=256、z=1/255、w=1/256（1/256 最後才出現），且 floor(position)、floor(upper) 各算一次共用；每個分支各自乘 1/255 後才 sel。
- 試過：encode 函數（真分支，55 條）、每分支先乘 1/255 再 `.xxyy`、共用 `upperFloor`、手寫 `x - floor(x)`、強制常數順序（const float k256…）、switch：41 條原廠 vs 39–44 條，沒有全相同。最接近：inline 四分支寫法（常數池順序一致，44 條，差 29 行）。
- 與 raisin 其他 ES3 程式（p033/p035）不同，這組的 if-conversion 結果對運算式排列非常敏感，需另想辦法（例如以 ir3 指令序反推 SSA 順序）。

## p057/p058 反推 SSA 結果（仍未全同）
- 由 ir3 反推出的運算（與原廠語意一致）：p=clamp(tc*size-0.5,0,size) 兩個 lane；各分支值 mode1=floor(fract(p)*256)/255、mode2=floor(fract(p/256)*256)/255、mode3=floor(p/256)/255，三者各自乘 1/255 後才 sel；floor(p)、floor(p/256) 各算一次；cmps(mode==2)、cmps(mode==1) 在最前面先算。
- 把 1/255 乘進各分支並維持（不被編譯器沉到 sel 之後）的唯一寫法：每個分支各自 `FragColor = vec4(c0, c0, c1, c1)`，c 用純量 float p0、p1（cand_p057_s1.frag）。結果：指令數 41（與原廠相同）、常數池順序相同，但指令排序不同（原廠先 floor(p0) 再乘 1/256，我們是先乘再 floor），共 26 行差。
- 排序變化（lane 順序、向量/純量混用、per-component、巢狀分支、共用 upper、函數邊界）都沒有改變這 26 行。可能需要找出能讓 floor(p0) 先於 p0*(1/256) 的寫法。

## p057/p058 續（仍差 26 行）
- 試了 6 種分支順序全排列、明確的語句順序（先 floor(p0)、再 upper）、純量/向量混用、手寫 floor/fract 展開、三元運算式：最佳仍是 cand_p057_s1（41 條、26 行差）。語句順序在前端被重排，源碼順序無法控制後端排程；手寫 `u - floor(u)` 會被融合成 mad，原廠是顯式 `fract()`。
- 結論：此組的差異只剩排程順序，與語意、常數、指令數皆無關；暫不採用 s1，p057/p058 維持現狀。

## 以 libsomc_raisin.so 反查 p057/p058（無助益）
- 該 so（vendor/lib/libsomc_raisin.so）只有 CPU 端的定點數參數運算（`stblz_dec`、`distortion`、`transform`、`fract(float)`、`rsn_modulation`）與著色器載入／uniform 設定；沒有 GLSL 原始碼。`setTexCoordDumpMode` 只是把列舉值存進物件（偏移 0x3f8），uniform 型別（ES3 為 int、ES 1.00 為 mediump float）早已與重建一致。
- 著色器本體只在 `libsomc_raisinrsc.so` 的預編譯二進位內，因此排程順序的差異無法由 so 推得，只能靠編譯器黑箱實驗。

## 編譯器規則調查（libllvm-glnext.so，與原廠 A9 同一份 md5=d9cf4288…）
- 編譯器是 LLVM 為底的 QGPU 後端，自訂 pass 有 `QGPU List Scheduler`、`QGPU Global/Local Register Allocator`、`QGPU Peephole Optimizer`、`QGPU Instruction selection` 等；排程順序由 `QGPU List Scheduler`（含 sched-heur-* 參數）決定，閉源。
- 內建 LLVM debug 選項（`print-after-all`、`print-before-all`、`debug-pass`、`misched` 等）皆存在，但選項字串未被驅動傳入；GL 驅動另有 `/data/vendor/gpu/esx_config*.txt` 設定檔路徑（鍵名疑似雜湊，尚未找到）與 `EsxShaderCompiler::DumpBinaries`。
- 已實作：compile.c 於 constructor 內 dlopen libllvm-glnext，以 `ALUDominationRatio` 符號反推載入位址，掃描可寫區段找到 `print-after-all`／`print-before-all` 的 cl::opt 物件（ArgStr 在 +0x18，疑似 bool 值在 +0x14）並寫 1；編譯後沒有任何 IR/MI 輸出（可能旗標位置不對，或 QGPU 管線未使用標準 printer pass）。備份：`.tmp/adreno-glsl-compare/compile.c.bak`。
- 續：把 `print-after-all`／`print-before-all`／`time-passes` 的 cl::opt 在 +4…+32 位元組各偏移都試寫 1，皆無輸出（時間報告也沒有）；以 Thumb-2／ARM 的 movw/movt 掃描 .text 也找不到選項名稱的參照。結論：靠記憶體補丁開 LLVM 傾印不可行（可能管線未使用標準 printer pass，或旗標由別處讀取）。若要繼續，需用 Ghidra 分析 `QGPU List Scheduler`（rea 對 11MB 的 libllvm-glnext.so 會逾時，需先用較小範圍的匯入）。

## alfort 名稱池檢查
- 72 個 alfort 原廠二進位的名稱池與現有重建逐一比對：uniform、sampler、varying 名稱全部一致（`pixSize`、`texUnit(0)`、`wakuTexUnit`、`fa_l/fa_r/fh_l/fh_r`、`params1/params2`、`paramskkd/paramslim/paramssft`、`$YUVControlInt32/$YUVConversionMat4Array`）。唯一差異：66 個大型程式（p005–p070）我們用 ES3 `out fragColor`，原廠名稱池是 `gl_FragColor`，代表原廠是 ES 1.00（與 raisin 的 ES 1.00 程式同款），而不是 ES3。
- 這 66 個大型重建是機器逐指令翻譯（`fullRegister[]`、`halfRegister[]`、`floatBitsToUint`、`switch(block)`），不是演算法重建，所以指令數膨脹 1.5–2 倍；ES 1.00 沒有位元運算，無法直接改版本。要通過比對必須由演算法重寫。
- 家族分組（原廠指令數）：
  - p001/p003/p072 `pixSize + texUnit0`（20–27）；p002/p004 外部紋理版（44/94）
  - p005/p027/p049 `fa/fh + params + waku`（550–590）；p006/p028/p050 外部版（643–672）
  - 30 個 `params1/2 + paramskkd/lim/sft + waku`（p007…p069 奇數，383–450）
  - 30 個外部紋理版（p008…p070 偶數，463–540）
  - p071 `params1/2 + texUnit`（34，framebuffer fetch 案例）

## p027–p032、p051、p052、p067、p068 已解決（全階段相同）
- p027–p032、p051、p052（ES 1.00）：把單 lane 運算寫成 `float lane(float p)`（含 texDumpMode 分支與 `floor(255.0 * (code * (1.0/255.0)) + 0.5) * (1.0/255.0)`），main 以 `lane(position.x)`… 組出 vec4；向量寬度寫法會被編譯成 rpt 指令而不同。
- p067/p068（ES3）：每個分支各自 `FragColor = X * (1.0 / 255.0);`，不經 `code` 變數。
- p057/p058（ES3）仍差指令排序：每個分支乘 1/255 再選取的結構要保留，`lane()` 版本會把乘法沉到 sel 之後。

## 自動工具：ir3 → ES 1.00（tools/ir3_to_es100.py）
- 輸入：原廠二進位（取指令區反組譯、`lift_alfort.shader_interface` 取 uniform／常數表）。輸出：ES 1.00 片段著色器（`float` 變數：r＝highp、hr＝mediump；`(rptN)` 展開成逐 lane；`sam` 轉 `texture2D`；外部紋理版以 `brac` 區塊辨識並直接取樣本分量；`trunc`→`float(int(x))`；`cmps`→`?:`）。
- 控制流：以標籤還原 `if`／`if-else`／`for`（含向後 `jump`、向後 `br` 的 do-while、迴圈內向前跳出→`break`），不使用 switch 狀態機。
- 用法：`python3 tools/ir3_to_es100.py alfort-p007 > p007.frag`；批次：`python3 tools/run_gen.py 5 70`（編譯於原廠 A9，輸出 `.tmp/ir3/gen_es100/summary.json`）；比對：`python3 tools/gdiff.py alfort-p007 1 檔案.frag`。
- 結果：alfort p005–p070 共 66 個全部可生成且在原廠 A9 編譯成功（`alfort_auto_es100/`）；指令數為原廠的 1.15–1.48 倍（中位數 1.30），先前的暫存器陣列重建為 1.5–2 倍；**全階段相同 0 個**。
- 限制：尚未做像素等價驗證（像素比對 harness 仍有 GL 0x502）；變數以暫存器為單位而非 SSA，故編譯器多生成 cov 轉換（約 3–4 倍）與 absneg；ir3 的 half/full 暫存器別名未處理；alfort p071（framebuffer fetch）未支援。
- 下一步方向：(1) SSA 重命名＋以原廠運算型別決定每個定義的精度，降低 cov；(2) 常數暫存器（hc12.* 等）改用 uniform 風格運算元以讓編譯器產生 `(abs)(neg)` 來源修飾；(3) 以原廠 vs 生成碼的像素比對確認語意。

## 語意驗證（以原廠二進位為基準的實機像素比對）
- 方法：`tools/pixel2.c` 在原廠 A9 上用 `glProgramBinary` 載入原廠二進位與「生成 GLSL 編譯後」的二進位，餵入同一組亂數輸入（8192 組：每組隨機 uniform 值、隨機輸入紋理與 waku 紋理，部分 waku 位元組強制 255 以走主路徑），逐組比對 RGB 輸出；外部紋理版以 EGLImage 掛 `GL_TEXTURE_EXTERNAL_OES`。入口：`tools/pixcmp.py`、`tools/verify_all.py`。
- 結果：alfort p005–p070 共 66 個自動生成程式（`alfort_auto_es100/`）8192 組輸入輸出**逐位元組相同（差異 0）**；p003、p004 手寫原始碼同樣差異 0。全階段指令相同的 67 個程式以機器碼相同保證等價。
- 靈敏度（負向對照，p007 8192 組）：把 `params1.x→y`、`pixSize.x→y`、`paramssft.y→x`、`paramskkd.x→y`、`paramslim.z→w`、`params2.x→z` 分別改一處，皆被偵測到（差異 1–140 位元組）；`paramslim.x→y` 未被偵測，代表此類統計比對不是形式證明，罕見路徑可能未覆蓋。
- 驗證過程找到並修正的 lifter 錯誤：
  1. `sam` 遮罩 `(yzw)` 應寫入 `dst + 分量索引`（hr0.y、hr0.z、hr0.w），而非自 dst 起連續（先前連舊的暫存器陣列版也錯）。
  2. `sel.f16` 以條件的符號位元（0x8000）判斷：`add.s x, -1` 取反後，條件為負才選 src2。
  3. 比對 harness 的亂數序列必須在兩個程式間一致（不可因 uniform 存在與否而少取亂數）。
- 偵錯工具：`tools/patchbin.py`（把原廠二進位的第 k 條指令改成 `end` 並重算完整性雜湊 H＝逐位元組 `h=rotl(h^b,7)`，已驗證與原廠雜湊一致）＋ `tools/bisect_pix.py`（原廠截斷 vs 生成碼截斷逐點比對，找第一個分歧指令）、`tools/ir3_interp.py`（ir3 直譯器，含 fp16 四捨五入）。
- 限制：外部紋理版只驗證了 RGB 路徑（EGLImage 為 RGBA8，YUV 控制為關）；alfort p071 未支援；raisin 的 ES3 版（p045/p046/p057/p058）未驗證。

## 剩餘 74 個的指令區對齊嘗試（未達成）
- 現況：全階段指令區與原廠相同的仍是 67 個；其餘 74 個（raisin p045/p046/p057/p058、alfort p003/p004/p005–p071）沒有新增。
- lifter 改進（alfort p005–p070，皆通過 8192 組像素比對，差異 0）：
  1. `a + (neg b)` 改寫成 `a - b`：編譯器才會把 `(abs)`／`(neg)` 折進 `add.f` 的來源修飾，`absneg.f` 從 17 條降到 0。
  2. 以 `hc`／`c` 的使用型態推論 uniform 精度：只被半精度常數暫存器讀取的 uniform（paramslim、paramssft、paramskkd）宣告成 `mediump`，大幅減少 `cov`。
  3. 迴圈改 `while (true)`（驅動接受），不再多出計數器與展開。
  4. `sam (f16)` 的樣本變數宣告為 `mediump vec4`（對應原廠半精度取樣），外部紋理取樣包成 `fetchExt()` 輔助函數。
- 指令數相對原廠：先前中位數 1.29（1.15–1.43）→ 現在 1.13（0.95–1.28）；p006 0.95、p018 0.97、p016 0.99、p020 1.02 已接近，但 0 個全階段相同。
- 剩餘差異的性質：外部紋理的 YUV 轉換通道數（原廠 3 條，我們只剩被用到的通道）、迴圈首輪與 phi 的 `mov` 搬移、指令排程順序。這些取決於原廠原始碼的運算分組（例如是否以 vec4 整體使用取樣結果），無法只由 ir3 反推唯一寫法；與 raisin p057 同類，需逐程式實驗，且每個程式 380–670 條指令，目前沒有自動化手段收斂到逐位元組相同。

## p006 逐段實驗（外部紋理版）
- 學到的編譯器規則：**取樣器槽位（s#0／s#1）依「取樣呼叫所在函數的定義順序」編號**，不是依宣告順序或呼叫順序。把外部紋理取樣包成輔助函數放在 main 之前時，外部取樣器會搶到 s#0、waku 變成 s#1，預取描述（sampler/texture 索引）就與原廠不同。解法：waku 與外部取樣各包一個輔助函數，**waku 的先定義**（`fetchWaku`、`fetchExt`），槽位即與原廠一致（waku＝0、外部＝1，`sam ... s#1`）。已寫入 lifter，33 個外部紋理版重新通過 8192 組像素比對（差異 0）。
- 與原廠 p006 的剩餘差異：(1) 第一個取樣的 YUV 轉換原廠算 3 條通道，我們只剩 2 條（第一個取樣的 x 通道在後續程式碼被覆寫前沒被讀取，編譯器將其視為死通道；原廠仍保留，推測原廠原始碼把取樣結果當整個 vec4 使用）；(2) `hc28.*` 常數池順序（原廠 hc28.y 先於 hc28.x）；(3) 初始 `mov hr2.w, hc28.y` 的位置。
- 指令數相對原廠：中位數 1.13（0.96–1.28），0 個全階段相同。

## 自動搜尋（tools/search_lib.py、search_p057.py、search2.py、search3.py）
- 做法：把已知規則寫成「基因」組合（位置運算式、clamp 形式、lane 純量／vec2、分支順序與串接、每分支縮放、共用 upper、fract 展開、除法／乘倒數、輸出寫法、無條件預先計算的排列），每批 24 個在原廠 A9 編譯，以與原廠指令區的差異行數為分數。
- 結果（raisin p057）：240 個窮舉組合 + 1200 個隨機組合 + 72 個預計算排列，最佳差異 25 行（原本 26 行），0 個相同。差異形態穩定不變：原廠先 `floor(p0)` 再乘 1/256、部分以 `(rpt1)` 成對運算，我們的編譯結果為純量對稱排列；這些由暫存器配置與排程決定，不隨來源的語法寫法改變，來源層級的基因空間看來已窮盡。
- 結論：再往下需要編譯器內部資訊（QGPU List Scheduler 與暫存器配置規則）或原廠原始碼；單靠改寫來源無法收斂。

## 在實機行程內呼叫編譯器的 LLVM 選項（QGLCParseLLVMCompileOption）— 沒有取得排程資訊
- 發現：libllvm-glnext.so 匯出 `_Z26QGLCParseLLVMCompileOptionPviPPc`（驅動用來傳 LLVM 命令列選項）與 `QGLCCreateContext`（0x7e06a5；需要最小 client interface：[+0x14]、[+0x18]（配置函數 `alloc(user, 0x2a0)`）、[+0x28]、[+0x34] 不為 0）。測試程式（`tools/compile_llvm_probe.c`）用假介面成功建立 context，並以 `-print-after-all`、`-print-before-all`、`-debug-pass=Executions/Structure`、`-time-passes`、`-stats`、`-print-machineinstrs`、`-help` 呼叫該函數，回傳 0。
- 結果：編譯輸出（stdout/stderr/logcat）沒有任何 IR/機器碼傾印，`-help`、未知選項也沒有任何反應（不退出、不報錯）。解讀：此匯出函數只把選項存進該 context 或以不回報錯誤的方式解析，並未影響驅動自己建立的編譯 context；驅動內部的 context 指標無法從外部取得（嘗試在驅動可寫記憶體中尋找 QGLCCompileToIRShader 函數指標，找到 0 處）。
- 若要繼續：需直接用我們建立的 context 呼叫 `QGLCCompileToIRShader`／`QGLCLinkProgram`（需逆向 QGLC_SRCSHADER、QGLC_LINKPROGRAM_DATA 等結構），讓選項對該 context 生效；工作量大，尚未做。
