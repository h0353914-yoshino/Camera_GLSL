// 自動產生（rsc/gen_rsc.py），請勿手動修改。
extern const unsigned char res_SPCA_0[];
extern const unsigned char res_SPCA_1[];
extern const unsigned char res_SPCA_2[];
extern const unsigned char res_SPCA_3[];
extern const unsigned char res_SPCA_4[];
extern const unsigned char res_SPCA_5[];
extern const unsigned char res_SPCA_6[];
extern const unsigned char res_SPCA_7[];
extern const unsigned char res_SPCA_8[];
extern const unsigned char res_SPCA_9[];
extern const unsigned char res_SPCA_10[];
extern const unsigned char res_SPCA_11[];
extern const unsigned char res_SPCA_12[];
extern const unsigned char res_SPCA_13[];
extern const unsigned char res_SPCA_14[];
extern const unsigned char res_SPCA_15[];
extern const unsigned char res_SPCA_16[];
extern const unsigned char res_SPCA_17[];
extern const unsigned char res_SPCA_18[];
extern const unsigned char res_SPCA_19[];
extern const unsigned char res_SPCA_20[];
extern const unsigned char res_SPCA_21[];
extern const unsigned char res_SPCA_22[];
extern const unsigned char res_SPCA_23[];
extern const unsigned char res_SPCA_24[];
extern const unsigned char res_SPCA_25[];
extern const unsigned char res_SPCA_26[];
extern const unsigned char res_SPCA_27[];
extern const unsigned char res_SPCA_28[];
extern const unsigned char res_SPCA_29[];
extern const unsigned char res_SPCA_30[];
static const void *const kTable_SPCA[31] = { res_SPCA_0,res_SPCA_1,res_SPCA_2,res_SPCA_3,res_SPCA_4,res_SPCA_5,res_SPCA_6,res_SPCA_7,res_SPCA_8,res_SPCA_9,res_SPCA_10,res_SPCA_11,res_SPCA_12,res_SPCA_13,res_SPCA_14,res_SPCA_15,res_SPCA_16,res_SPCA_17,res_SPCA_18,res_SPCA_19,res_SPCA_20,res_SPCA_21,res_SPCA_22,res_SPCA_23,res_SPCA_24,res_SPCA_25,res_SPCA_26,res_SPCA_27,res_SPCA_28,res_SPCA_29,res_SPCA_30 };
__attribute__((visibility("default"))) const void *holder_SPCA(int index) asm("_ZN21ShaderCodeHolder_SPCA13getShaderDataEi");
const void *holder_SPCA(int index) { return (index >= 0 && index < 31) ? kTable_SPCA[index] : (const void *)0; }
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN5spica13getShaderDataEii");
const void *shaderdata(int tag, int index) {
    if (tag == 0x53504341) return holder_SPCA(index);
    return (const void *)0;
}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN5spica13getKernelDataEii");
const void *kerneldata(int tag, int index) { return (const void *)0; }
