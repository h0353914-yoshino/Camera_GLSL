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
extern void exit(int);

#define RTLD_NOW 2
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


extern char *strstr(const char *, const char *);
extern int dladdr(const void *, void *);
typedef struct { const char *fn; void *fb; const char *sn; void *sa; } DlInfo;

static char g_pool[1 << 20];
static unsigned g_pool_used;
static void *dummy_alloc(void *ud, unsigned size) { void *p = g_pool + g_pool_used; g_pool_used += (size + 15) & ~15u; return g_pool_used < sizeof(g_pool) ? p : 0; }
static int dummy_fn(void) { return 0; }
static void *g_parse_ptr;
typedef int (*parse_fn_t)(void *, int, char **);
static parse_fn_t g_parse;
static void *g_orig_compile;
static char *g_argv[10];
static int g_argc;
static unsigned g_target_old;
static int g_parsed;
typedef int (*compile_fn_t)(void *, void *, void *);
static int hook_compile(void *ctx, void *src, void *res)
{
    if (!g_parsed && g_parse) {
        g_parsed = 1;
        int r = g_parse(ctx, g_argc, g_argv);
        printf("parse(ctx=%p, %d args) -> %d\n", ctx, g_argc, r);
        fflush(0);
    }
    return ((compile_fn_t)g_orig_compile)(ctx, src, res);
}
static void patch_driver_table(void)
{
    File *maps = fopen("/proc/self/maps", "r");
    char line[256];
    int patched = 0;
    while (maps && fgets(line, sizeof(line), maps)) {
        if (strstr(line, "glcmp") || strstr(line, "compile.so") || strstr(line, "libllvm-glnext") || strstr(line, "[stack")) continue;
        if (line[18] != 'r' || line[19] != 'w') {}
        unsigned lo = 0, hi = 0; int i = 0;
        while (line[i] != '-') { lo = lo * 16 + (line[i] <= '9' ? line[i] - '0' : (line[i] | 32) - 'a' + 10); ++i; }
        ++i;
        while (line[i] != ' ') { hi = hi * 16 + (line[i] <= '9' ? line[i] - '0' : (line[i] | 32) - 'a' + 10); ++i; }
        if (line[i + 2] != 'w') continue;
        for (unsigned p = lo; p + 4 <= hi; p += 4) {
            if (*(volatile unsigned *)p == (g_target_old | 1u)) { *(volatile unsigned *)p = (unsigned)hook_compile; ++patched; }
        }
    }
    if (maps) fclose(maps);
    printf("patched %d slots\n", patched);
}

static void llvm_dump_setup(void)
{
    const char *want = getenv("LLDUMP");
    char flag[8];
    File *f = fopen(BATCH_DIR "/lldump", "r");
    if (!f) return;
    int n = (int)fread(flag, 1, 7, f); flag[n > 0 ? n : 0] = 0; fclose(f);
    void *h = dlopen("/vendor/lib/libllvm-glnext.so", RTLD_NOW);
    if (!h) { printf("llvm dlopen fail %s\n", dlerror()); return; }
    void *sym = dlsym(h, "ALUDominationRatio");
    unsigned base = (unsigned)sym - 0xa8dc80u;
    printf("llvm base %x\n", base);
    typedef int (*parse_fn)(void *, int, char **);
    parse_fn parse = (parse_fn)(base + 0x7e0725u);
    g_parse = parse;
    g_orig_compile = (void *)(base + 0x7e0771u);
    static char argbuf[8][64];
    int argc = 0;
    g_argv[argc++] = (char *)"qglc";
    File *f2 = fopen(BATCH_DIR "/lldump", "r");
    char line[64];
    while (f2 && fgets(line, sizeof(line), f2) && argc < 9) {
        int i = 0;
        while (line[i] && line[i] != '\n') { argbuf[argc][i] = line[i]; ++i; }
        argbuf[argc][i] = 0;
        g_argv[argc] = argbuf[argc];
        ++argc;
    }
    if (f2) fclose(f2);
    g_argv[argc] = 0; g_argc = argc;
    {
        typedef void *(*create_fn)(void *);
        static unsigned iface[256];
        iface[4] = 0x1234; iface[5] = (unsigned)dummy_fn; iface[6] = (unsigned)dummy_alloc;
        iface[7] = (unsigned)dummy_fn; iface[8] = (unsigned)dummy_fn; iface[9] = (unsigned)dummy_fn;
        iface[10] = (unsigned)dummy_fn; iface[11] = (unsigned)dummy_fn; iface[12] = (unsigned)dummy_fn;
        iface[13] = (unsigned)dummy_fn; iface[14] = (unsigned)dummy_fn;
        create_fn create = (create_fn)(base + 0x7e06a5u);
        void *ctx = create(iface);
        printf("created ctx=%p\n", ctx); fflush(0);
        if (ctx && parse && argc > 1) { int r = parse(ctx, argc, g_argv); printf("parse -> %d\n", r); fflush(0); }
    }
    g_target_old = base + 0x7e0771u;
    printf("lldump args=%d\n", argc);
    fflush(0);
}

__attribute__((constructor)) static void run(void)
{
    const char *stage = BATCH_DIR;
    char path[512];
    snprintf(path, sizeof(path), "%s/params", stage);
    File *parameters = fopen(path, "r");
    char arguments[128];
    if (!parameters || !fgets(arguments, sizeof(arguments), parameters)) {
        halt("缺少測試參數", *__errno());
    }
    fclose(parameters);
    int version = arguments[0] == '3' ? 3 : 2;
    const char *job = arguments + 2;
    for (char *p = arguments + 2; *p; ++p) {
        if (*p == '\n') { *p = 0; break; }
    }
    load_symbols();
    llvm_dump_setup();
    U32 display = eglGetDisplay(0);
    if (!eglInitialize(display, 0, 0) || !eglBindAPI(0x30a0)) {
        halt("初始化 EGL", eglGetError());
    }
    int config_attrs[] = {0x3040, version == 3 ? 0x40 : 4, 0x3033, 1, EGL_NONE};
    int context_attrs[] = {0x3098, version, EGL_NONE};
    int surface_attrs[] = {0x3057, 16, 0x3056, 16, EGL_NONE};
    U32 config = 0;
    int count = 0;
    if (!eglChooseConfig(display, config_attrs, &config, 1, &count) || count != 1) {
        halt("選擇 EGL 組態", eglGetError());
    }
    U32 context = eglCreateContext(display, config, 0, context_attrs);
    U32 surface = eglCreatePbufferSurface(display, config, surface_attrs);
    if (!eglMakeCurrent(display, surface, surface, context)) {
        halt("啟動 EGL context", eglGetError());
    }
    if (version == 2 || !glGetProgramBinary) {
        void *legacy = eglGetProcAddress("glGetProgramBinaryOES");
        if (legacy) glGetProgramBinary = legacy;
    }
    if (!glGetProgramBinary) {
        halt("查找 glGetProgramBinary", 0);
    }
    printf("環境\t%s\t%s\t%s\n", glGetString(0x1f01), glGetString(0x1f02), glGetString(0x8b8c)); printf("擴充\t%s\n", glGetString(0x1f03));
    fflush(0);

    char manifest_path[512];
    char out_dir[512];
    snprintf(manifest_path, sizeof(manifest_path), "%s/%s.tsv", stage, job);
    snprintf(out_dir, sizeof(out_dir), "%s/%s-out", stage, job);
    File *manifest = fopen(manifest_path, "r");
    if (!manifest) {
        halt("讀取測試清單", *__errno());
    }
    char line[1024];
    int total = 0;
    int passed = 0;
    while (fgets(line, sizeof(line), manifest)) {
        char *fields[3] = {line, 0, 0};
        int field = 1;
        for (char *p = line; *p; ++p) {
            if (*p == '\t' && field < 3) {
                *p = 0;
                fields[field++] = p + 1;
            } else if (*p == '\n') {
                *p = 0;
                break;
            }
        }
        if (field != 3) halt("測試清單欄位", field);
        char vertex[512], fragment[512];
        snprintf(vertex, sizeof(vertex), "%s/%s", stage, fields[1]);
        snprintf(fragment, sizeof(fragment), "%s/%s", stage, fields[2]);
        ++total;
        passed += compile_pair(fields[0], vertex, fragment, out_dir, version);
        fflush(0);
    }
    fclose(manifest);
    eglMakeCurrent(display, 0, 0, 0);
    eglDestroyContext(display, context);
    eglDestroySurface(display, surface);
    printf("總計\t%d\t%d\n", passed, total);
    fflush(0);
    _exit(0);
}
