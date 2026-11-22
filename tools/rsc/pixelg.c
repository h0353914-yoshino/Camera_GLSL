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
typedef void (*fn_gau)(U32,U32,int,int*,int*,U32*,char*);
static fn_useprog p_useprog; static fn_viewport p_viewport; static fn_vattrptr p_vattrptr; static fn_vattr2f p_vattr2f; static fn_enablev p_enablev;
typedef void (*fn_gai)(U32,U32,int,int*,int*,U32*,char*);
typedef void (*fn_ufv)(int,int,const float*);
typedef void (*fn_uiv)(int,int,const int*);
typedef void (*fn_uuv)(int,int,const unsigned*);
typedef void (*fn_vap4)(U32,float,float,float,float);
typedef void (*fn_bindattr)(U32,U32,const char*);
typedef void (*fn_gensamp)(void);
typedef void (*fn_um)(int,int,int,const float*); static fn_um p_um2,p_um3,p_um4;
static fn_gau p_gau; static fn_ufv p_u1fv,p_u2fv,p_u3fv,p_u4fv; static fn_uiv p_u1iv,p_u2iv,p_u3iv,p_u4iv; static fn_uuv p_u1uv,p_u2uv,p_u3uv,p_u4uv;
typedef void (*fn_getprogiv)(U32,U32,int*);

static unsigned hstr(const char *s) { unsigned h = 2166136261u; while (*s) { h ^= (unsigned char)*s++; h *= 16777619u; } return h; }
static unsigned nrand(unsigned *s) { *s = *s * 1664525u + 1013904223u; return *s >> 8; }

static int load_prog(const char *path, U32 *out)
{
    File *bf = fopen(path, "rb");
    if (!bf) return 0;
    unsigned fl[2];
    if (fread(fl, 4, 2, bf) != 2) { fclose(bf); return 0; }
    static unsigned char pb[1 << 20];
    if (fl[1] > sizeof(pb) || fread(pb, 1, fl[1], bf) != fl[1]) { fclose(bf); return 0; }
    fclose(bf);
    U32 prog = glCreateProgram();
    p_progbin(prog, fl[0], pb, fl[1]);
    int linked = 0; glGetProgramiv(prog, GL_LINK_STATUS, &linked);
    if (!linked) return 0;
    *out = prog; return 1;
}

#define NPIX (16*16*4)
static unsigned char tex_data[8][NPIX];

/* 對一個 program 設定 uniform/取樣器並繪製 TR 次，結果寫入 res */
static int render(U32 prog, unsigned char *res, int trials, char *info)
{
    p_useprog(prog);
    int nu = 0; glGetProgramiv(prog, 0x8b86, &nu);
    int apos = p_getattr(prog, "vPosition"), acoord = p_getattr(prog, "inTexCoord");
    static const float verts[] = {-1,-1,0,1, 3,-1,0,1, -1,3,0,1};
    static const float tcs[] = {0,0, 2,0, 0,2};
    U32 vb[2]; p_genbuf(2, vb);
    p_bindbuf(0x8892, vb[0]); p_bufdata(0x8892, sizeof(verts), verts, 0x88e4);
    if (apos >= 0) { p_enablev(apos); p_vattrptr(apos, 4, 0x1406, 0, 0, 0); }
    p_bindbuf(0x8892, vb[1]); p_bufdata(0x8892, sizeof(tcs), tcs, 0x88e4);
    if (acoord >= 0) { p_enablev(acoord); p_vattrptr(acoord, 2, 0x1406, 0, 0, 0); }
    int pos = 0;
    static char snames[16][96]; int ns = 0;
    for (int u = 0; u < nu; ++u) {
        char name[96]; int len = 0, size = 0; U32 type = 0;
        p_gau(prog, u, sizeof(name), &len, &size, &type, name);
        if ((type == 0x8b5e || type == 0x8d66 || type == 0x8dd2 || type == 0x8dca) && ns < 16) { int k = 0; while (name[k]) { snames[ns][k] = name[k]; k++; } snames[ns][k] = 0; ns++; }
    }
    for (int i = 0; i < ns; ++i) for (int j = i + 1; j < ns; ++j) if (strcmp(snames[j], snames[i]) < 0) { char tmp[96]; for (int k = 0; k < 96; ++k) { tmp[k] = snames[i][k]; snames[i][k] = snames[j][k]; snames[j][k] = tmp[k]; } }
    for (int t = 0; t < trials; ++t) {
        int unit = 0;
        for (int u = 0; u < nu; ++u) {
            char name[96]; int len = 0, size = 0; U32 type = 0;
            p_gau(prog, u, sizeof(name), &len, &size, &type, name);
            int loc = p_getloc(prog, name);
            if (loc < 0) continue;
            unsigned s = hstr(name) ^ (t * 2654435761u);
            if (type == 0x8b5e || type == 0x8d66) {
                { int ui = 0; for (int i = 0; i < ns; ++i) if (!strcmp(snames[i], name)) ui = i; unit = ui; }
                p_uni1i(loc, unit);
                if (type == 0x8dd2 || type == 0x8dca) { p_activeTex(0x84c0 + unit); p_texImg(0x0de1, 0, type == 0x8dd2 ? 0x8d7c : 0x8d8e, 16, 16, 0, 0x8d99, 0x1401, tex_data[unit]); p_texPar(0x0de1, 0x2801, 0x2600); p_texPar(0x0de1, 0x2800, 0x2600); }
                unit++; continue;
            }
            int comps = 1; int kind = 0; /* 0 float 1 int 2 uint */
            switch (type) {
            case 0x1406: comps = 1; kind = 0; break; case 0x8b50: comps = 2; kind = 0; break; case 0x8b51: comps = 3; kind = 0; break; case 0x8b52: comps = 4; kind = 0; break;
            case 0x1404: comps = 1; kind = 1; break; case 0x8b53: comps = 2; kind = 1; break; case 0x8b54: comps = 3; kind = 1; break; case 0x8b55: comps = 4; kind = 1; break;
            case 0x1405: comps = 1; kind = 2; break; case 0x8dc6: comps = 2; kind = 2; break; case 0x8dc7: comps = 3; kind = 2; break; case 0x8dc8: comps = 4; kind = 2; break;
            case 0x8b5a: case 0x8b5b: case 0x8b5c: { int cc = type == 0x8b5a ? 4 : type == 0x8b5b ? 9 : 16; float mv[64]; int nn = cc * size; if (nn > 64) nn = 64; for (int k = 0; k < nn; ++k) { unsigned r = nrand(&s); mv[k] = ((r >> 2) & 0xffff) / 65535.0f * 2.0f - 0.5f; } if (type == 0x8b5a) p_um2(loc, size, 0, mv); else if (type == 0x8b5b) p_um3(loc, size, 0, mv); else p_um4(loc, size, 0, mv); continue; }
            default: snprintf(info, 64, "type0x%x", type); continue; }
            float fv[64]; int iv[64]; unsigned uv[64]; int n = comps * size; if (n > 64) n = 64;
            for (int k = 0; k < n; ++k) {
                unsigned r = nrand(&s);
                static const float pk[] = {0.0f,0.25f,0.5f,1.0f,2.0f,3.0f,-1.0f,8.0f,0.0625f,0.125f,0.75f,16.0f};
                if (UMODE == 3) { int z = 1; { const char *o = ONLY; int q = 0; while (o[q] && name[q] == o[q]) q++; z = !(o[q] == 0 && name[q] == 0); } fv[k] = z ? 0.0f : 1.0f; iv[k] = z ? 0 : 1; uv[k] = iv[k]; continue; }
                if (UMODE == 1) { fv[k] = 0.0f; iv[k] = 0; uv[k] = 0; continue; } if (UMODE == 2) { fv[k] = 1.0f; iv[k] = 1; uv[k] = 1; continue; }
                if (SANE) { if (kind == 0) fv[k] = 0.25f + ((r >> 2) & 0xffff) / 65535.0f * (((r >> 20) & 3) == 0 ? 32.0f : 3.0f); else if (kind == 1) iv[k] = 1 + (int)((r >> 2) % 16); else uv[k] = 1 + (r >> 2) % 16; continue; }
                if (kind == 0) fv[k] = ((r & 3) == 0) ? pk[(r >> 2) % 12] : ((r >> 2) & 0xffff) / 65535.0f * (((r >> 20) & 3) == 0 ? 64.0f : 4.0f);
                else if (kind == 1) iv[k] = (int)((r >> 2) % 17) - (((r >> 12) & 7) == 0 ? 4 : 0);
                else uv[k] = (r >> 2) % 17;
            }
            if (kind == 0) { switch (comps) { case 1: p_u1fv(loc, size, fv); break; case 2: p_u2fv(loc, size, fv); break; case 3: p_u3fv(loc, size, fv); break; default: p_u4fv(loc, size, fv); } }
            else if (kind == 1) { switch (comps) { case 1: p_u1iv(loc, size, iv); break; case 2: p_u2iv(loc, size, iv); break; case 3: p_u3iv(loc, size, iv); break; default: p_u4iv(loc, size, iv); } }
            else { switch (comps) { case 1: p_u1uv(loc, size, uv); break; case 2: p_u2uv(loc, size, uv); break; case 3: p_u3uv(loc, size, uv); break; default: p_u4uv(loc, size, uv); } }
        }
        p_clearcolor(0,0,0,0); p_clear(0x4000);
        p_draw(4, 0, 3);
        p_readpix(0, 0, 16, 16, 0x1908, 0x1401, res + pos);
        pos += NPIX;
        (void)unit;
    }
    int e = p_err();
    if (e) snprintf(info, 64, "gl0x%x", e);
    return e;
}

static U32 texids[8];
static void upload_textures(unsigned seed)
{
    for (int i = 0; i < 8; ++i) {
        unsigned s = seed + i * 7919;
        for (int k = 0; k < NPIX; ++k) { s = s * 1103515245u + 12345u; tex_data[i][k] = (unsigned char)(s >> 16); }
        p_activeTex(0x84c0 + i); p_bindTex(0x0de1, texids[i]);
        p_texImg(0x0de1, 0, 0x8058, 16, 16, 0, 0x1908, 0x1401, tex_data[i]);
        p_texPar(0x0de1, 0x2801, 0x2600); p_texPar(0x0de1, 0x2800, 0x2600);
        p_texPar(0x0de1, 0x2802, 0x812f); p_texPar(0x0de1, 0x2803, 0x812f);
    }
}

static unsigned char res_a[NPIX * 24], res_b[NPIX * 24];

__attribute__((constructor)) static void pixel_run(void)
{
    const char *stage = BATCH_DIR;
    char path[512];
    snprintf(path, sizeof(path), "%s/params", stage);
    File *parameters = fopen(path, "r");
    if (!parameters) halt("缺少測試參數", 0);
    load_symbols();
    void *gles = dlopen("libGLESv2.so", RTLD_NOW);
    U32 display = eglGetDisplay(0);
    if (!eglInitialize(display, 0, 0) || !eglBindAPI(0x30a0)) halt("初始化 EGL", eglGetError());
    int config_attrs[] = {0x3040, CFG_BIT, 0x3033, 1, EGL_NONE};
    int context_attrs[] = {0x3098, CTX_VER, EGL_NONE};
    int surface_attrs[] = {0x3057, 16, 0x3056, 16, EGL_NONE};
    U32 config = 0; int count = 0;
    if (!eglChooseConfig(display, config_attrs, &config, 1, &count) || count != 1) halt("選擇 EGL 組態", eglGetError());
    U32 context = eglCreateContext(display, config, 0, context_attrs);
    U32 surface = eglCreatePbufferSurface(display, config, surface_attrs);
    if (!eglMakeCurrent(display, surface, surface, context)) halt("啟動 EGL context", eglGetError());
#define L(var, sym) var = (void *)dlsym(gles, sym); if (!var) halt(sym, 0)
    L(p_useprog,"glUseProgram"); L(p_viewport,"glViewport"); L(p_genbuf,"glGenBuffers"); L(p_bindbuf,"glBindBuffer"); L(p_bufdata,"glBufferData");
    L(p_genTex,"glGenTextures"); L(p_bindTex,"glBindTexture"); L(p_activeTex,"glActiveTexture"); L(p_texImg,"glTexImage2D"); L(p_texPar,"glTexParameteri");
    L(p_getloc,"glGetUniformLocation"); L(p_uni1i,"glUniform1i"); L(p_enablev,"glEnableVertexAttribArray"); L(p_vattrptr,"glVertexAttribPointer");
    L(p_draw,"glDrawArrays"); L(p_readpix,"glReadPixels"); L(p_err,"glGetError"); L(p_clear,"glClear"); L(p_clearcolor,"glClearColor"); L(p_disable,"glDisable");
    L(p_getattr,"glGetAttribLocation"); L(p_progbin,"glProgramBinary"); L(p_finish,"glFinish");
    L(p_gau,"glGetActiveUniform"); L(p_um2,"glUniformMatrix2fv"); L(p_um3,"glUniformMatrix3fv"); L(p_um4,"glUniformMatrix4fv");
    L(p_u1fv,"glUniform1fv"); L(p_u2fv,"glUniform2fv"); L(p_u3fv,"glUniform3fv"); L(p_u4fv,"glUniform4fv");
    L(p_u1iv,"glUniform1iv"); L(p_u2iv,"glUniform2iv"); L(p_u3iv,"glUniform3iv"); L(p_u4iv,"glUniform4iv");
#if CTX_VER >= 3
    L(p_u1uv,"glUniform1uiv"); L(p_u2uv,"glUniform2uiv"); L(p_u3uv,"glUniform3uiv"); L(p_u4uv,"glUniform4uiv");
#endif
    p_disable(0x0bd0); p_viewport(0, 0, 16, 16);
    p_genTex(8, texids);
    upload_textures(4242);
    char line[1024];
    while (fgets(line, sizeof(line), parameters)) {
        char *name = line, *a = 0, *b = 0;
        for (char *p = line; *p; ++p) { if (*p == ' ' || *p == '\t') { *p = 0; if (!a) a = p + 1; else if (!b) b = p + 1; } if (*p == '\n') { *p = 0; break; } }
        if (!a || !b) continue;
        U32 pa = 0, pb = 0; char info[64] = "";
        int la = load_prog(a, &pa), lb = load_prog(b, &pb);
        if (!la || !lb) { printf("%s\tnolink\t%d\t%d\n", name, la, lb); fflush(0); continue; }
        int trials = 24;
        for (int pass = 0; pass < 1; ++pass) {
            /* 把取樣器單元綁到各自紋理 */
            upload_textures(4242);
            /* 為讓取樣器uniform設到正確單元: 再次綁定 unit i -> texids[i] */
            for (int i = 0; i < 8; ++i) { p_activeTex(0x84c0 + i); p_bindTex(0x0de1, texids[i]); }
        }
        for (int w = 0; w < 2; ++w) { U32 pp = w ? pb : pa; int nn = 0; glGetProgramiv(pp, 0x8b86, &nn); printf("U%c %s", w ? 'b' : 'a', name);
            for (int u = 0; u < nn; ++u) { char nm[96]; int ln = 0, sz = 0; U32 ty = 0; p_gau(pp, u, sizeof(nm), &ln, &sz, &ty, nm); printf(" %s:%x:%d@%d", nm, ty, sz, p_getloc(pp, nm)); } printf("\n"); }
        int ea = render(pa, res_a, trials, info);
        int eb = render(pb, res_b, trials, info);
        int nd = 0, mx = 0, nz = 0;
        for (int i = 0; i < NPIX * trials; ++i) { int d = res_a[i] - res_b[i]; if (d < 0) d = -d; if (d) nd++; if (d > mx) mx = d; if (res_a[i]) nz++; }
        { int shown = 0; for (int i = 0; i < NPIX * trials && shown < 6; ++i) if (res_a[i] != res_b[i]) { printf("D %s t%d px%d c%d a=%d b=%d\n", name, i / NPIX, (i % NPIX) / 4, i % 4, res_a[i], res_b[i]); shown++; } }
        int bt = 0; for (int t = 0; t < trials; ++t) { int dd = 0; for (int k = 0; k < NPIX; ++k) if (res_a[t * NPIX + k] != res_b[t * NPIX + k]) { dd = 1; break; } bt += dd; }
        printf("%s\tok\t%d\t%d\t%d\t%d\t%d\t%s\t%d\n", name, nd, mx, nz, ea, eb, info, bt);
        fflush(0);
    }
    fclose(parameters);
    _exit(0);
}
