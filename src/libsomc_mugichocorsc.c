// 自動產生（rsc/gen_rsc.py），請勿手動修改。
extern const unsigned char res_MGC_0[];
extern const unsigned char res_MGC_1[];
extern const unsigned char res_MGC_2[];
extern const unsigned char res_MGC_3[];
extern const unsigned char res_MGC_4[];
extern const unsigned char res_MGC_5[];
extern const unsigned char res_MGC_6[];
extern const unsigned char res_MGC_7[];
extern const unsigned char res_MGC_8[];
extern const unsigned char res_MGC_9[];
extern const unsigned char res_MGC_10[];
extern const unsigned char res_MGC_11[];
extern const unsigned char res_MGC_12[];
extern const unsigned char res_MGC_13[];
extern const unsigned char res_MGC_14[];
extern const unsigned char res_MGC_15[];
extern const unsigned char res_MGC_16[];
extern const unsigned char res_MGC_17[];
extern const unsigned char res_MGC_18[];
extern const unsigned char res_MGC_19[];
extern const unsigned char res_MGC_20[];
extern const unsigned char res_MGC_21[];
extern const unsigned char res_MGC_22[];
extern const unsigned char res_MGC_23[];
extern const unsigned char res_MGC_24[];
static const void *const kTable_MGC[25] = { res_MGC_0,res_MGC_1,res_MGC_2,res_MGC_3,res_MGC_4,res_MGC_5,res_MGC_6,res_MGC_7,res_MGC_8,res_MGC_9,res_MGC_10,res_MGC_11,res_MGC_12,res_MGC_13,res_MGC_14,res_MGC_15,res_MGC_16,res_MGC_17,res_MGC_18,res_MGC_19,res_MGC_20,res_MGC_21,res_MGC_22,res_MGC_23,res_MGC_24 };
__attribute__((visibility("default"))) const void *holder_MGC(int index) asm("_ZN20ShaderCodeHolder_MGC13getShaderDataEi");
const void *holder_MGC(int index) { return (index >= 0 && index < 25) ? kTable_MGC[index] : (const void *)0; }
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN9mugichoco13getShaderDataEii");
const void *shaderdata(int tag, int index) {
    if (tag == 0x4d4743) return holder_MGC(index);
    return (const void *)0;
}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN9mugichoco13getKernelDataEii");
const void *kerneldata(int tag, int index) { return (const void *)0; }
