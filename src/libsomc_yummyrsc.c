// 自動產生（rsc/gen_rsc.py），請勿手動修改。
extern const unsigned char res_YUM_0[];
extern const unsigned char res_YUM_1[];
extern const unsigned char res_YUM_2[];
extern const unsigned char res_YUM_3[];
extern const unsigned char res_YUM_4[];
extern const unsigned char res_YUM_5[];
extern const unsigned char res_YUM_6[];
extern const unsigned char res_YUM_7[];
extern const unsigned char res_YUM_8[];
extern const unsigned char res_YUM_9[];
extern const unsigned char res_YUM_10[];
extern const unsigned char res_YUM_11[];
extern const unsigned char res_YUM_12[];
extern const unsigned char res_YUM_13[];
extern const unsigned char res_YUM_14[];
extern const unsigned char res_YUM_15[];
extern const unsigned char res_YUM_16[];
extern const unsigned char res_YUM_17[];
extern const unsigned char res_YUM_18[];
extern const unsigned char res_YUM_19[];
extern const unsigned char res_YUM_20[];
extern const unsigned char res_YUM_21[];
extern const unsigned char res_YUM_22[];
extern const unsigned char res_YUM_23[];
static const void *const kTable_YUM[24] = { res_YUM_0,res_YUM_1,res_YUM_2,res_YUM_3,res_YUM_4,res_YUM_5,res_YUM_6,res_YUM_7,res_YUM_8,res_YUM_9,res_YUM_10,res_YUM_11,res_YUM_12,res_YUM_13,res_YUM_14,res_YUM_15,res_YUM_16,res_YUM_17,res_YUM_18,res_YUM_19,res_YUM_20,res_YUM_21,res_YUM_22,res_YUM_23 };
__attribute__((visibility("default"))) const void *holder_YUM(int index) asm("_ZN20ShaderCodeHolder_YUM13getShaderDataEi");
const void *holder_YUM(int index) { return (index >= 0 && index < 24) ? kTable_YUM[index] : (const void *)0; }
__attribute__((visibility("default"))) const void *shaderdata(int tag, int index) asm("_ZN5yummy13getShaderDataEii");
const void *shaderdata(int tag, int index) {
    if (tag == 0x59554d) return holder_YUM(index);
    return (const void *)0;
}
__attribute__((visibility("default"))) const void *kerneldata(int tag, int index) asm("_ZN5yummy13getKernelDataEii");
const void *kerneldata(int tag, int index) { return (const void *)0; }
