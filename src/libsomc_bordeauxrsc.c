// 自動產生（rsc/gen_rsc.py），請勿手動修改。
extern const unsigned char res_BDX_0[];
extern const unsigned char res_BDX_1[];
extern const unsigned char res_BDX_2[];
extern const unsigned char res_BDX_3[];
extern const unsigned char res_BDX_4[];
extern const unsigned char res_BDX_5[];
extern const unsigned char res_BDX_6[];
extern const unsigned char res_BDX_7[];
extern const unsigned char res_BDX_8[];
extern const unsigned char res_BDX_9[];
extern const unsigned char res_BDX_10[];
extern const unsigned char res_BDX_11[];
extern const unsigned char res_BDX_12[];
extern const unsigned char res_BDX_13[];
extern const unsigned char res_BDX_14[];
extern const unsigned char res_BDX_15[];
extern const unsigned char res_BDX_16[];
extern const unsigned char res_BDX_17[];
extern const unsigned char res_BDX_18[];
extern const unsigned char res_BDX_19[];
extern const unsigned char res_BDX_20[];
extern const unsigned char res_BDX_21[];
extern const unsigned char res_BDX_22[];
extern const unsigned char res_BDX_23[];
extern const unsigned char res_BDX_24[];
extern const unsigned char res_BDX_25[];
extern const unsigned char res_BDX_26[];
extern const unsigned char res_BDX_27[];
extern const unsigned char res_BDX_28[];
extern const unsigned char res_BDX_29[];
extern const unsigned char res_BDX_30[];
extern const unsigned char res_BDX_31[];
extern const unsigned char res_BDX_32[];
static const void *const kTable_BDX[33] = { res_BDX_0,res_BDX_1,res_BDX_2,res_BDX_3,res_BDX_4,res_BDX_5,res_BDX_6,res_BDX_7,res_BDX_8,res_BDX_9,res_BDX_10,res_BDX_11,res_BDX_12,res_BDX_13,res_BDX_14,res_BDX_15,res_BDX_16,res_BDX_17,res_BDX_18,res_BDX_19,res_BDX_20,res_BDX_21,res_BDX_22,res_BDX_23,res_BDX_24,res_BDX_25,res_BDX_26,res_BDX_27,res_BDX_28,res_BDX_29,res_BDX_30,res_BDX_31,res_BDX_32 };
__attribute__((visibility("default"))) const void *holder_BDX(int index) asm("_ZN20ShaderCodeHolder_BDX13getShaderDataEi");
const void *holder_BDX(int index) { return (index >= 0 && index < 33) ? kTable_BDX[index] : (const void *)0; }
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN8bordeaux13getShaderDataEii");
const void *shaderdata(int tag, int index) {
    if (tag == 0x424458) return holder_BDX(index);
    return (const void *)0;
}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN8bordeaux13getKernelDataEii");
const void *kerneldata(int tag, int index) { return (const void *)0; }
