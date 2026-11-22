// 自動產生（rsc/gen_rsc.py），請勿手動修改。
extern const unsigned char res_PEX_0[];
extern const unsigned char res_PEX_1[];
extern const unsigned char res_PEX_2[];
extern const unsigned char res_PEX_3[];
extern const unsigned char res_PEX_4[];
extern const unsigned char res_PEX_5[];
extern const unsigned char res_PEX_6[];
extern const unsigned char res_PEX_7[];
extern const unsigned char res_PEX_8[];
extern const unsigned char res_PEX_9[];
extern const unsigned char res_PEX_10[];
extern const unsigned char res_PEX_11[];
extern const unsigned char res_PEX_12[];
extern const unsigned char res_PEX_13[];
extern const unsigned char res_PEX_14[];
extern const unsigned char res_PEX_15[];
extern const unsigned char res_PEX_16[];
extern const unsigned char res_PEX_17[];
extern const unsigned char res_PEX_18[];
extern const unsigned char res_PEX_19[];
extern const unsigned char res_PEX_20[];
extern const unsigned char res_PEX_21[];
extern const unsigned char res_PEX_22[];
extern const unsigned char res_PEX_23[];
extern const unsigned char res_PEX_24[];
extern const unsigned char res_PEX_25[];
extern const unsigned char res_PEX_26[];
extern const unsigned char res_PEX_27[];
extern const unsigned char res_PEX_28[];
extern const unsigned char res_PEX_29[];
static const void *const kTable_PEX[30] = { res_PEX_0,res_PEX_1,res_PEX_2,res_PEX_3,res_PEX_4,res_PEX_5,res_PEX_6,res_PEX_7,res_PEX_8,res_PEX_9,res_PEX_10,res_PEX_11,res_PEX_12,res_PEX_13,res_PEX_14,res_PEX_15,res_PEX_16,res_PEX_17,res_PEX_18,res_PEX_19,res_PEX_20,res_PEX_21,res_PEX_22,res_PEX_23,res_PEX_24,res_PEX_25,res_PEX_26,res_PEX_27,res_PEX_28,res_PEX_29 };
__attribute__((visibility("default"))) const void *holder_PEX(int index) asm("_ZN20ShaderCodeHolder_PEX13getShaderDataEi");
const void *holder_PEX(int index) { return (index >= 0 && index < 30) ? kTable_PEX[index] : (const void *)0; }
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN15proper_exposure13getShaderDataEii");
const void *shaderdata(int tag, int index) {
    if (tag == 0x504558) return holder_PEX(index);
    return (const void *)0;
}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN15proper_exposure13getKernelDataEii");
const void *kerneldata(int tag, int index) { return (const void *)0; }
