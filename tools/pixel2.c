typedef struct File File;
typedef unsigned int U32;
typedef unsigned int Size;
extern char *getenv(const char *);
extern void *dlopen(const char *, int);
extern void *dlsym(void *, const char *);
extern char *dlerror(void);
extern int printf(const char *, ...);
extern int fflush(File *);
extern File *fopen(const char *, const char *);
extern int fclose(File *);
extern Size fread(void *, Size, Size, File *);
extern Size fwrite(const void *, Size, Size, File *);
extern char *fgets(char *, int, File *);
extern int snprintf(char *, Size, const char *, ...);
extern int strcmp(const char *, const char *);
extern int strlen(const char *);
extern int unshare(int);
extern int mount(const char *, const char *, const char *, unsigned long, const void *);
extern int *__errno(void);
extern void _exit(int);

#define RTLD_NOW 2
#ifndef TRIALS
#define TRIALS 32
#endif
#define EGL_NONE 0x3038
#define GL_LINK_STATUS 0x8b82
#define GL_COMPILE_STATUS 0x8b81
#define GL_PROGRAM_BINARY_LENGTH 0x8741
#define GL_PROGRAM_BINARY_RETRIEVABLE_HINT 0x8257
#define GL_VERTEX_SHADER 0x8b31
#define GL_FRAGMENT_SHADER 0x8b30

static char source_buffer[1024 * 1024];
static char binary_buffer[4 * 1024 * 1024];
static char error_log[1024];

static U32 (*eglGetDisplay)(U32);
static int (*eglInitialize)(U32, int *, int *);
static int (*eglBindAPI)(U32);
static int (*eglChooseConfig)(U32, const int *, U32 *, int, int *);
static U32 (*eglCreateContext)(U32, U32, U32, const int *);
static U32 (*eglCreatePbufferSurface)(U32, U32, const int *);
static int (*eglMakeCurrent)(U32, U32, U32, U32);
static U32 (*eglGetError)(void);
static void *(*eglGetProcAddress)(const char *);
static int (*eglDestroyContext)(U32, U32);
static int (*eglDestroySurface)(U32, U32);
static U32 (*glCreateShader)(U32);
static void (*glShaderSource)(U32, int, const char **, const int *);
static void (*glCompileShader)(U32);
static void (*glGetShaderiv)(U32, U32, int *);
static void (*glGetShaderInfoLog)(U32, int, int *, char *);
static U32 (*glCreateProgram)(void);
static void (*glAttachShader)(U32, U32);
static void (*glLinkProgram)(U32);
static void (*glGetProgramiv)(U32, U32, int *);
static void (*glGetProgramInfoLog)(U32, int, int *, char *);
static void (*glProgramParameteri)(U32, U32, int);
static void (*glGetProgramBinary)(U32, int, int *, U32 *, void *);
static void (*glDeleteProgram)(U32);
static void (*glDeleteShader)(U32);
static U32 (*glGetError)(void);
static const char *(*glGetString)(U32);

static void halt(const char *phase, int detail)
{
    printf("錯誤\t%s\t%d\n", phase, detail);
    fflush(0);
    _exit(1);
}

static int compile_shader(const char *name, const char *path, U32 shader)
{
    File *file = fopen(path, "rb");
    if (!file) {
        printf("%s\t讀取失敗\t%s\n", name, path);
        return 0;
    }
    int length = fread(source_buffer, 1, sizeof(source_buffer), file);
    fclose(file);
    if (length <= 0 || length == sizeof(source_buffer)) {
        printf("%s\t原始碼大小異常\t%d\n", name, length);
        return 0;
    }
    const char *text = source_buffer;
    glShaderSource(shader, 1, &text, &length);
    glCompileShader(shader);
    int status = 0;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &status);
    if (!status) {
        glGetShaderInfoLog(shader, sizeof(error_log), 0, error_log);
        printf("%s\t編譯失敗\t0x%x\t%s\n", name, shader, error_log);
    }
    return status;
}

static int compile_pair(const char *name, const char *vertex_path, const char *fragment_path,
                        const char *out_dir, int version)
{
    U32 vertex = glCreateShader(GL_VERTEX_SHADER);
    U32 fragment = glCreateShader(GL_FRAGMENT_SHADER);
    int vertex_ok = compile_shader(name, vertex_path, vertex);
    int fragment_ok = compile_shader(name, fragment_path, fragment);
    if (!vertex_ok || !fragment_ok) {
        glDeleteShader(vertex);
        glDeleteShader(fragment);
        return 0;
    }
    U32 program = glCreateProgram();
    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    if (version >= 3 && glProgramParameteri) {
        glProgramParameteri(program, GL_PROGRAM_BINARY_RETRIEVABLE_HINT, 1);
    }
    glLinkProgram(program);
    int linked = 0;
    glGetProgramiv(program, GL_LINK_STATUS, &linked);
    glDeleteShader(vertex);
    glDeleteShader(fragment);
    if (!linked) {
        glGetProgramInfoLog(program, sizeof(error_log), 0, error_log);
        printf("%s\t連結失敗\t%s\n", name, error_log);
        glDeleteProgram(program);
        return 0;
    }
    int length = 0;
    glGetProgramiv(program, GL_PROGRAM_BINARY_LENGTH, &length);
    if (length <= 0 || length > sizeof(binary_buffer)) {
        printf("%s\t二進位長度異常\t%d\t%x\n", name, length, glGetError());
        glDeleteProgram(program);
        return 0;
    }
    int actual = 0;
    U32 format = 0;
    glGetProgramBinary(program, length, &actual, &format, binary_buffer);
    if (actual <= 0 || actual > length) {
        printf("%s\t匯出失敗\t%d\t%x\n", name, actual, glGetError());
        glDeleteProgram(program);
        return 0;
    }
    char path[512];
    snprintf(path, sizeof(path), "%s/%s.bin", out_dir, name);
    File *out = fopen(path, "wb");
    if (!out) {
        halt("輸出檔案", *__errno());
    }
    if (fwrite(&format, 4, 1, out) != 1 || fwrite(&actual, 4, 1, out) != 1 ||
        fwrite(binary_buffer, 1, actual, out) != (Size)actual || fclose(out)) {
        halt("寫入二進位", *__errno());
    }
    glDeleteProgram(program);
    printf("%s\t完成\t0x%x\t%d\n", name, format, actual);
    return 1;
}

static void load_symbols(void)
{
    void *egl = dlopen("libEGL.so", RTLD_NOW);
    if (!egl) {
        printf("%s\n", dlerror());
        halt("載入 libEGL", 0);
    }
    void *gles = dlopen("libGLESv2.so", RTLD_NOW);
    if (!gles) {
        printf("%s\n", dlerror());
        halt("載入 libGLESv2", 0);
    }
#define EGL_SYMBOL(symbol) symbol = dlsym(egl, #symbol); if (!symbol) halt(#symbol, 0)
#define GLES_SYMBOL(symbol) symbol = dlsym(gles, #symbol); if (!symbol) halt(#symbol, 0)
    EGL_SYMBOL(eglGetDisplay);
    EGL_SYMBOL(eglInitialize);
    EGL_SYMBOL(eglBindAPI);
    EGL_SYMBOL(eglChooseConfig);
    EGL_SYMBOL(eglCreateContext);
    EGL_SYMBOL(eglCreatePbufferSurface);
    EGL_SYMBOL(eglMakeCurrent);
    EGL_SYMBOL(eglGetError);
    EGL_SYMBOL(eglGetProcAddress);
    EGL_SYMBOL(eglDestroyContext);
    EGL_SYMBOL(eglDestroySurface);
    GLES_SYMBOL(glCreateShader);
    GLES_SYMBOL(glShaderSource);
    GLES_SYMBOL(glCompileShader);
    GLES_SYMBOL(glGetShaderiv);
    GLES_SYMBOL(glGetShaderInfoLog);
    GLES_SYMBOL(glCreateProgram);
    GLES_SYMBOL(glAttachShader);
    GLES_SYMBOL(glLinkProgram);
    GLES_SYMBOL(glGetProgramiv);
    GLES_SYMBOL(glGetProgramInfoLog);
    GLES_SYMBOL(glDeleteProgram);
    GLES_SYMBOL(glDeleteShader);
    GLES_SYMBOL(glGetError);
    GLES_SYMBOL(glGetString);
#undef EGL_SYMBOL
#undef GLES_SYMBOL
    glProgramParameteri = dlsym(gles, "glProgramParameteri");
    glGetProgramBinary = dlsym(gles, "glGetProgramBinary");
}


/* ---- pixel comparison: load a program binary, draw fixed inputs, dump pixels ---- */
typedef void (*fn_useprog)(U32);
typedef void (*fn_viewport)(int,int,int,int);
typedef void (*fn_genbuf)(int,U32*);
typedef void (*fn_bindbuf)(U32,U32);
typedef void (*fn_bufdata)(U32,long,const void*,U32);
typedef void (*fn_genTex)(int,U32*);
typedef void (*fn_bindTex)(U32,U32);
typedef void (*fn_activeTex)(U32);
typedef void (*fn_texImg)(U32,int,int,int,int,int,U32,U32,const void*);
typedef void (*fn_texPar)(U32,U32,int);
typedef int (*fn_getloc)(U32,const char*);
typedef void (*fn_uni1i)(int,int);
typedef void (*fn_uni4f)(int,float,float,float,float);
typedef void (*fn_u2f)(int,float,float);
typedef void (*fn_vattr2f)(U32,float,float);
typedef void (*fn_enablev)(U32);
typedef void (*fn_vattrptr)(U32,int,U32,U32,int,const void*);
typedef void (*fn_draw)(U32,int,int);
typedef void (*fn_readpix)(int,int,int,int,U32,U32,void*);
typedef U32 (*fn_err)(void);
typedef void (*fn_clear)(U32);
typedef void (*fn_clearcolor)(float,float,float,float);
typedef void (*fn_disable)(U32);
typedef int (*fn_getattr)(U32,const char*);
typedef void (*fn_progbin)(U32,U32,const void*,int);
typedef void (*fn_finish)(void);

static unsigned char pixel_buf[1 << 20];
static fn_activeTex p_activeTex;
static fn_bindTex p_bindTex;
static fn_bindbuf p_bindbuf;
static fn_bufdata p_bufdata;
static fn_clear p_clear;
static fn_clearcolor p_clearcolor;
static fn_disable p_disable;
static fn_draw p_draw;
static fn_enablev p_enablev;
static fn_err p_err;
static fn_finish p_finish;
static fn_genTex p_genTex;
static fn_genbuf p_genbuf;
static fn_getattr p_getattr;
static fn_getloc p_getloc;
static fn_progbin p_progbin;
static fn_readpix p_readpix;
static fn_texImg p_texImg;
static fn_texPar p_texPar;
static fn_u2f p_u2f;
static fn_uni1i p_uni1i;
static fn_uni4f p_uni4f;
static fn_useprog p_useprog;
static fn_vattr2f p_vattr2f;
static fn_vattrptr p_vattrptr;
static fn_viewport p_viewport;


__attribute__((constructor)) static void pixel_run(void)
{
    const char *stage = BATCH_DIR;
    char path[512];
    snprintf(path, sizeof(path), "%s/params", stage);
    File *parameters = fopen(path, "r");
    char arguments[1024];
    if (!parameters || !fgets(arguments, sizeof(arguments), parameters)) halt("缺少測試參數", 0);
    fclose(parameters);
    char *binpath = arguments;
    char *outpath = 0;
    int use_ext = 0;
    for (char *p = arguments; *p; ++p) {
        if (*p == ' ') { *p = 0; if (!outpath) outpath = p + 1; else use_ext = 1; }
        if (*p == '\n') { *p = 0; break; }
    }
    if (!outpath) halt("參數格式", 0);
    load_symbols();
    void *gles = dlopen("libGLESv2.so", RTLD_NOW);
    U32 display = eglGetDisplay(0);
    if (!eglInitialize(display, 0, 0) || !eglBindAPI(0x30a0)) halt("初始化 EGL", eglGetError());
    int config_attrs[] = {0x3040, 4, 0x3033, 1, EGL_NONE};
    int context_attrs[] = {0x3098, 2, EGL_NONE};
    int surface_attrs[] = {0x3057, 16, 0x3056, 16, EGL_NONE};
    U32 config = 0; int count = 0;
    if (!eglChooseConfig(display, config_attrs, &config, 1, &count) || count != 1) halt("選擇 EGL 組態", eglGetError());
    U32 context = eglCreateContext(display, config, 0, context_attrs);
    U32 surface = eglCreatePbufferSurface(display, config, surface_attrs);
    if (!eglMakeCurrent(display, surface, surface, context)) halt("啟動 EGL context", eglGetError());

    p_useprog = (fn_useprog)dlsym(gles, "glUseProgram"); if (!p_useprog) halt("glUseProgram", 0); p_viewport = (fn_viewport)dlsym(gles, "glViewport"); if (!p_viewport) halt("glViewport", 0); p_genbuf = (fn_genbuf)dlsym(gles, "glGenBuffers"); if (!p_genbuf) halt("glGenBuffers", 0); p_bindbuf = (fn_bindbuf)dlsym(gles, "glBindBuffer"); if (!p_bindbuf) halt("glBindBuffer", 0);
    p_bufdata = (fn_bufdata)dlsym(gles, "glBufferData"); if (!p_bufdata) halt("glBufferData", 0); p_genTex = (fn_genTex)dlsym(gles, "glGenTextures"); if (!p_genTex) halt("glGenTextures", 0); p_bindTex = (fn_bindTex)dlsym(gles, "glBindTexture"); if (!p_bindTex) halt("glBindTexture", 0); p_activeTex = (fn_activeTex)dlsym(gles, "glActiveTexture"); if (!p_activeTex) halt("glActiveTexture", 0);
    p_texImg = (fn_texImg)dlsym(gles, "glTexImage2D"); if (!p_texImg) halt("glTexImage2D", 0); p_texPar = (fn_texPar)dlsym(gles, "glTexParameteri"); if (!p_texPar) halt("glTexParameteri", 0); p_getloc = (fn_getloc)dlsym(gles, "glGetUniformLocation"); if (!p_getloc) halt("glGetUniformLocation", 0); p_uni1i = (fn_uni1i)dlsym(gles, "glUniform1i"); if (!p_uni1i) halt("glUniform1i", 0);
    p_uni4f = (fn_uni4f)dlsym(gles, "glUniform4f"); if (!p_uni4f) halt("glUniform4f", 0); p_u2f = (fn_u2f)dlsym(gles, "glUniform2f"); if (!p_u2f) halt("glUniform2f", 0); p_vattr2f = (fn_vattr2f)dlsym(gles, "glVertexAttrib2f"); if (!p_vattr2f) halt("glVertexAttrib2f", 0); p_enablev = (fn_enablev)dlsym(gles, "glEnableVertexAttribArray"); if (!p_enablev) halt("glEnableVertexAttribArray", 0);
    p_vattrptr = (fn_vattrptr)dlsym(gles, "glVertexAttribPointer"); if (!p_vattrptr) halt("glVertexAttribPointer", 0); p_draw = (fn_draw)dlsym(gles, "glDrawArrays"); if (!p_draw) halt("glDrawArrays", 0); p_readpix = (fn_readpix)dlsym(gles, "glReadPixels"); if (!p_readpix) halt("glReadPixels", 0); p_err = (fn_err)dlsym(gles, "glGetError"); if (!p_err) halt("glGetError", 0);
    p_clear = (fn_clear)dlsym(gles, "glClear"); if (!p_clear) halt("glClear", 0); p_clearcolor = (fn_clearcolor)dlsym(gles, "glClearColor"); if (!p_clearcolor) halt("glClearColor", 0); p_disable = (fn_disable)dlsym(gles, "glDisable"); if (!p_disable) halt("glDisable", 0); p_getattr = (fn_getattr)dlsym(gles, "glGetAttribLocation"); if (!p_getattr) halt("glGetAttribLocation", 0);
    p_progbin = (fn_progbin)dlsym(gles, "glProgramBinary"); if (!p_progbin) halt("glProgramBinary", 0); p_finish = (fn_finish)dlsym(gles, "glFinish"); if (!p_finish) halt("glFinish", 0);
    fn_u2f dummy = 0; (void)dummy;
    typedef U32 (*fn_createimg)(U32,U32,U32,const void*,const int*);
    typedef void (*fn_target)(U32,U32);
    typedef void (*fn_subimg)(U32,int,int,int,int,int,U32,U32,const void*);
    fn_createimg p_createimg = (fn_createimg)eglGetProcAddress("eglCreateImageKHR");
    fn_target p_target = (fn_target)eglGetProcAddress("glEGLImageTargetTexture2DOES");
    fn_subimg p_subimg = (fn_subimg)dlsym(gles, "glTexSubImage2D");

    /* load Sony/our binary: file = [fmt u32][len u32][bytes] */
    File *bf = fopen(binpath, "rb");
    if (!bf) halt("開啟二進位", *__errno());
    unsigned fmt_len[2];
    if (fread(fmt_len, 4, 2, bf) != 2) halt("讀取二進位標頭", 0);
    unsigned blen = fmt_len[1];
    unsigned char *bin = pixel_buf + 0; /* reuse */
    static unsigned char program_bytes[1 << 20];
    if (blen > sizeof(program_bytes)) halt("二進位過大", blen);
    if (fread(program_bytes, 1, blen, bf) != blen) halt("讀取二進位內容", 0);
    fclose(bf);
    (void)bin;

    U32 prog = glCreateProgram();
    p_progbin(prog, fmt_len[0], program_bytes, blen);
    int linked = 0;
    glGetProgramiv(prog, GL_LINK_STATUS, &linked);
    printf("link=%d err=0x%x\n", linked, p_err());
    if (!linked) { fflush(0); return; }
    p_useprog(prog);
    printf("dbg0 GL=0x%x\n", p_err());
    p_disable(0x0bd0); /* GL_DITHER */
    p_viewport(0, 0, 16, 16);

    float verts[] = {-1,-1,0,1, 3,-1,0,1, -1,3,0,1};
    U32 vb; p_genbuf(1, &vb); p_bindbuf(0x8892, vb); p_bufdata(0x8892, sizeof(verts), verts, 0x88e4);
    int apos = p_getattr(prog, "vPosition"); int acoord = p_getattr(prog, "inTexCoord");
    if (apos >= 0) { p_enablev(apos); p_vattrptr(apos, 4, 0x1406, 0, 0, 0); }
    printf("dbg1 GL=0x%x apos=%d acoord=%d\n", p_err(), apos, acoord);
    if (acoord >= 0) p_vattr2f(acoord, 0.5f, 0.5f);

    /* deterministic 16x16 RGBA8 input texture */
    unsigned char tex[16*16*4]; unsigned seed = 12345;
    for (int i = 0; i < 16*16*4; ++i) { seed = seed * 1103515245u + 12345u; tex[i] = (unsigned char)(seed >> 16); }
    U32 tx; p_genTex(1, &tx); p_activeTex(0x84c0); p_bindTex(0x0de1, tx);
    p_texPar(0x0de1, 0x2801, 0x2600); p_texPar(0x0de1, 0x2800, 0x2600);
    p_texPar(0x0de1, 0x2802, 0x812f); p_texPar(0x0de1, 0x2803, 0x812f);
    p_texImg(0x0de1, 0, 0x8058, 16, 16, 0, 0x1908, 0x1401, tex);
    U32 ext_tex = 0;
    if (use_ext) {
        int iattr[] = {0x30bc, 0, EGL_NONE};
        U32 image = p_createimg(display, context, 0x30b1, (const void *)(unsigned long)tx, iattr);
        printf("image=%x egl=0x%x\n", image, eglGetError());
        p_genTex(1, &ext_tex); p_activeTex(0x84c0); p_bindTex(0x8d65, ext_tex);
        p_target(0x8d65, image);
        p_texPar(0x8d65, 0x2801, 0x2600); p_texPar(0x8d65, 0x2800, 0x2600);
        p_texPar(0x8d65, 0x2802, 0x812f); p_texPar(0x8d65, 0x2803, 0x812f);
        printf("ext GL=0x%x\n", p_err());
    }
    U32 tw; p_genTex(1, &tw); p_activeTex(0x84c1); p_bindTex(0x0de1, tw);
    p_texPar(0x0de1, 0x2801, 0x2600); p_texPar(0x0de1, 0x2800, 0x2600);
    p_texPar(0x0de1, 0x2802, 0x812f); p_texPar(0x0de1, 0x2803, 0x812f);
    p_texImg(0x0de1, 0, 0x8058, 16, 16, 0, 0x1908, 0x1401, tex);
    int loc;
    printf("dbg2 GL=0x%x\n", p_err());
    if ((loc = p_getloc(prog, "texUnit")) >= 0) p_uni1i(loc, 0);
    if ((loc = p_getloc(prog, "texUnit0")) >= 0) p_uni1i(loc, 0);
    if ((loc = p_getloc(prog, "wakuTexUnit")) >= 0) p_uni1i(loc, 1);

    FILE_OUT: ;
    File *out = fopen(outpath, "wb");
    if (!out) halt("開啟輸出", *__errno());
    static unsigned char pixels[16*16*4];
    static unsigned char first4[4];
    static const char *names[] = {"pixSize","paramslim","params1","params2","paramssft","paramskkd","fa_l","fa_r","fh_l","fh_r"};
    static const float picks[] = {0.0f,0.25f,0.5f,1.0f,2.0f,3.0f,-1.0f,255.0f,0.0625f,0.125f,8.0f,0.75f};
    unsigned rng = 987654321u;
    for (int v = 0; v < TRIALS; ++v) {
        for (int n = 0; n < 10; ++n) {
            loc = p_getloc(prog, names[n]);
            float c[4];
            for (int k = 0; k < 4; ++k) {
                rng = rng * 1664525u + 1013904223u;
                unsigned r = rng >> 8;
                if ((r & 3) == 0) c[k] = picks[(r >> 2) % 12];
                else c[k] = ((r >> 2) & 0xffff) / 65535.0f * (n == 0 ? 0.25f : ((n == 1 || n == 5 || n == 4) && ((r >> 20) & 1)) ? 260.0f : 4.0f);
            }
            if (loc >= 0) p_uni4f(loc, c[0], c[1], c[2], c[3]);
        }
        for (int i = 0; i < 16*16*4; ++i) { rng = rng * 1103515245u + 12345u; tex[i] = (unsigned char)(rng >> 16); }
        p_activeTex(0x84c0); p_bindTex(0x0de1, tx);
        if (use_ext) { p_subimg(0x0de1, 0, 0, 0, 16, 16, 0x1908, 0x1401, tex); p_bindTex(0x8d65, ext_tex); }
        else p_texImg(0x0de1, 0, 0x8058, 16, 16, 0, 0x1908, 0x1401, tex);
        for (int i = 0; i < 16*16*4; ++i) { rng = rng * 1103515245u + 12345u; tex[i] = (unsigned char)(rng >> 16); if (((rng >> 8) & 3) < 2) tex[i] = 255; }
        p_activeTex(0x84c1); p_bindTex(0x0de1, tw);
        p_texImg(0x0de1, 0, 0x8058, 16, 16, 0, 0x1908, 0x1401, tex);
        p_clearcolor(0,0,0,0); p_clear(0x4000);
        p_draw(4, 0, 3);
        p_readpix(0, 0, 16, 16, 0x1908, 0x1401, pixels);
        fwrite(pixels, 1, 4, out);
    }
    fclose(out);
    p_finish();
    fflush(0);
    _exit(0);
}
