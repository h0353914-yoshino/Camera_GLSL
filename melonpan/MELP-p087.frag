#version 300 es
precision highp int;
precision highp float;

uniform highp usampler2D sadImage;
uniform highp usampler2D vecImage;
uniform highp vec4 params;
uniform highp vec2 dstPixSize;
uniform highp vec2 sadPixSize;
in highp vec2 texCoord;
out highp vec4 fragColor;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample113;
    highp vec4 sample133;
    highp vec4 sample186;
    highp vec4 sample187;
    highp vec4 sample258;
    highp vec4 sample307;
    highp vec4 sample326;
    highp vec4 sample375;
    highp vec4 sample376;
    highp vec4 sample64;
    highp vec4 samplePF0;
    mediump float hr0_x;
    mediump float hr0_y;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_w;
    highp float r1_x;
    highp float r1_y;
    highp float r1_z;
    highp float r2_w;
    highp float r2_x;
    highp float r2_y;
    highp float r2_z;
    highp float r3_w;
    highp float r3_x;
    highp float r3_y;
    highp float r3_z;
    highp float r4_w;
    highp float r4_x;
    highp float r4_y;
    highp float r4_z;
    highp float r5_x;
    highp float r5_y;
    highp float r5_z;
    highp float a0_x;
    params;
    dstPixSize;
    sadPixSize;
    samplePF0 = vec4(texture(vecImage, texCoord.xy));
    r0_z = samplePF0.x;
    r1_x = samplePF0.z;
    r1_y = texCoord.x;
    r1_z = texCoord.y;
    r0_x = dstPixSize.y;
    r0_y = dstPixSize.x;
    r0_w = float(int(params.x));
    r2_y = 0.0;
    r0_w = r0_w * exp2(1.0);
    r0_x = 1.0 / r0_x;
    r0_y = 1.0 / r0_y;
    r2_z = (r0_w < 0.0) ? 1.0 : 0.0;
    r1_w = (-r0_w);
    r2_x = abs(r0_w);
    r2_w = r0_w + -1.0;
    r3_x = (r2_z != 0.0) ? r1_w : r0_w;
    r1_w = floor(r2_x / exp2(2.0));
    r0_x = r0_x * r1_z;
    r0_y = r0_y * r1_y;
    r1_y = r3_x;
    r1_z = 0.0 - r1_w;
    r0_x = floor(r0_x);
    r0_y = r0_y - 0.5;
    r3_y = (r0_w > 0.0) ? r1_w : r1_z;
    r0_x = r0_x * params.w;
    r3_z = 1.0 / r1_y;
    r0_x = 2.0 * r0_y + r0_x;
    r3_w = r0_x + 0.5;
    r0_x = r3_w + 0.0;
    r0_y = r0_x * sadPixSize.y;
    r0_x = floor(r0_z / exp2(31.0));
    r0_x = float(int(r0_x) & int(32767.0));
    r0_x = r0_x + r0_z;
    r0_x = float(int(r0_x) & int((-32768.0)));
    r0_x = r0_z - r0_x;
    r0_z = (r0_x < 0.0) ? 1.0 : 0.0;
    r0_w = (-r0_x);
    r1_y = abs(r0_x);
    r1_z = floor(r0_x / exp2(31.0));
    r4_x = float(int(r0_z) ^ int(r2_z));
    r0_w = (r0_z != 0.0) ? r0_w : r0_x;
    r1_y = floor(r1_y / exp2(2.0));
    r1_z = float(int(r1_z) & int(3.0));
    r1_w = r0_w;
    r2_x = 0.0 - r1_y;
    r1_z = r0_x + r1_z;
    r1_w = r1_w * r3_z;
    r4_y = (r0_x > 0.0) ? r1_y : r2_x;
    r1_y = float(int(r1_z) & (~int(3.0)));
    r4_z = float(int(r1_w));
    r1_z = r4_y;
    r4_w = r0_x - r1_y;
    r0_x = float((int(r4_z) & 65535) * (int(r3_x) & 65535));
    r1_y = r1_z + 0.5;
    r0_x = float(int(uint(r0_x) + (((uint(r4_z) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    hr0_x = r4_w;
    r1_z = float(int(uint(r0_x) + (((uint(r3_x) & 65535u) * (uint(r4_z) >> 16u)) << 16u)));
    r0_x = r1_y * sadPixSize.x;
    a0_x = hr0_x;
    r1_y = r0_w - r1_z;
    r5_x = r1_y;
    sample64 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
    r1_y = sample64.x;
    r1_z = sample64.y;
    r1_w = sample64.z;
    r2_x = sample64.w;
    r0_x = r3_z * r5_x;
    r0_x = float(int(r0_x));
    r0_x = r0_x + r4_z;
    r4_z = float((int(r0_x) & 65535) * (int(r3_x) & 65535));
    r4_z = float(int(uint(r4_z) + (((uint(r0_x) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    r4_z = float(int(uint(r4_z) + (((uint(r3_x) & 65535u) * (uint(r0_x) >> 16u)) << 16u)));
    r5_x = r0_w - r4_z;
    r4_z = (r4_z > r0_w) ? 1.0 : 0.0;
    r5_x = (r5_x >= r3_x) ? 1.0 : 0.0;
    r0_x = r0_x - r4_z;
    r4_z = floor(r5_x / exp2(r4_z));
    r0_x = r0_x + r4_z;
    r4_z = float((int(r0_x) & 65535) * (int(r3_x) & 65535));
    r5_x = (-r0_x);
    r4_z = float(int(uint(r4_z) + (((uint(r0_x) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    r4_z = float(int(uint(r4_z) + (((uint(r3_x) & 65535u) * (uint(r0_x) >> 16u)) << 16u)));
    r4_x = (r4_x != 0.0) ? r5_x : r0_x;
    r0_x = r0_w - r4_z;
    r4_z = (a0_x == 0.0 ? r1_y : (a0_x == 1.0 ? r1_z : (a0_x == 2.0 ? r1_w : (a0_x == 3.0 ? r2_x : (a0_x == 4.0 ? r2_y : (a0_x == 5.0 ? r2_z : (a0_x == 6.0 ? r2_w : (a0_x == 7.0 ? r3_x : (a0_x == 8.0 ? r3_y : (a0_x == 9.0 ? r3_z : (a0_x == 10.0 ? r3_w : (a0_x == 11.0 ? r4_x : (a0_x == 12.0 ? r4_y : (a0_x == 13.0 ? r4_z : (a0_x == 14.0 ? r4_w : (a0_x == 15.0 ? r5_x : 0.0))))))))))))))));
    r0_w = (-r0_x);
    r0_x = (r0_z != 0.0) ? r0_w : r0_x;
    p0 = r0_x > 0.0;
    p1 = r0_x < r2_w;
    if (!(p0 && p1))
    {
        r4_w = r2_y;
    }
    else
    {
        p0 = r4_w > 0.0;
        if (p0)
        {
            r0_x = r4_w + -1.0;
            hr0_y = r0_x;
            a0_x = hr0_y;
            r5_x = (a0_x == 0.0 ? r1_y : (a0_x == 1.0 ? r1_z : (a0_x == 2.0 ? r1_w : (a0_x == 3.0 ? r2_x : (a0_x == 4.0 ? r2_y : (a0_x == 5.0 ? r2_z : (a0_x == 6.0 ? r2_w : (a0_x == 7.0 ? r3_x : (a0_x == 8.0 ? r3_y : (a0_x == 9.0 ? r3_z : (a0_x == 10.0 ? r3_w : (a0_x == 11.0 ? r4_x : (a0_x == 12.0 ? r4_y : (a0_x == 13.0 ? r4_z : (a0_x == 14.0 ? r4_w : (a0_x == 15.0 ? r5_x : 0.0))))))))))))))));
        }
        else
        {
            r0_x = r4_y + -1.0;
            r0_w = r0_y;
            r0_x = r0_x;
            r0_x = r0_x + 0.5;
            r0_z = r0_x * sadPixSize.x;
            sample113 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r0_w = sample113.w;
            r5_x = r0_w;
        }
        p0 = r4_w < 3.0;
        if (p0)
        {
            r0_x = r4_w + 1.0;
            hr0_y = r0_x;
            a0_x = hr0_y;
            r0_x = (a0_x == 0.0 ? r1_y : (a0_x == 1.0 ? r1_z : (a0_x == 2.0 ? r1_w : (a0_x == 3.0 ? r2_x : (a0_x == 4.0 ? r2_y : (a0_x == 5.0 ? r2_z : (a0_x == 6.0 ? r2_w : (a0_x == 7.0 ? r3_x : (a0_x == 8.0 ? r3_y : (a0_x == 9.0 ? r3_z : (a0_x == 10.0 ? r3_w : (a0_x == 11.0 ? r4_x : (a0_x == 12.0 ? r4_y : (a0_x == 13.0 ? r4_z : (a0_x == 14.0 ? r4_w : (a0_x == 15.0 ? r5_x : 0.0))))))))))))))));
        }
        else
        {
            r0_x = r4_y + 1.0;
            r0_w = r0_y;
            r0_x = r0_x;
            r0_x = r0_x + 0.5;
            r0_z = r0_x * sadPixSize.x;
            sample133 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r0_x = sample133.x;
        }
        p0 = r4_z == r5_x;
        p1 = r0_x == r4_z;
        r2_y = 0.0;
        if (!(!p0 || !p1))
        {
            r0_x = r2_y;
        }
        else
        {
            r0_z = r4_z;
            r0_w = r5_x;
            r0_x = r0_x;
            r0_z = (-2.0) * r0_z + r0_w;
            r0_w = r0_w - r0_x;
            r0_x = r0_x + r0_z;
            r0_z = r0_w * 0.5;
            r0_x = 1.0 / r0_x;
            r0_x = r0_x * r0_z;
            r0_x = r0_x * 256.0;
            r0_x = float(int(r0_x));
            r0_z = float(int(r0_x) & int((-2147483617.0)));
            r0_w = r0_x + 32.0;
            r0_z = (r0_z == (-2147483648.0)) ? 1.0 : 0.0;
            r0_x = (r0_z != 0.0) ? r0_x : r0_w;
            r0_x = floor(r0_x / exp2(6.0));
            r0_x = max(r0_x, -2.0);
            r0_x = min(r0_x, 2.0);
        }
        r4_w = r0_x;
    }
    p0 = r4_x > 0.0;
    r0_x = float(int(params.y));
    r0_x = r0_x * exp2(1.0);
    r5_x = r0_x + -1.0;
    p1 = r4_x < r5_x;
    if (!(!p0 || !p1))
    {
        r0_x = r4_y - r3_y;
        r0_w = r3_y + r4_y;
        r0_z = r0_y;
        r1_z = r0_y;
        r0_x = r0_x;
        r0_y = r0_w;
        a0_x = hr0_x;
        r2_y = 0.0;
        r0_x = r0_x + 0.5;
        r0_y = r0_y + 0.5;
        r0_x = r0_x * sadPixSize.x;
        r1_y = r0_y * sadPixSize.x;
        r0_y = r0_x;
        sample186 = vec4(texture(sadImage, vec2(r0_y, r0_z)));
        r0_x = sample186.x;
        r0_y = sample186.y;
        r0_z = sample186.z;
        r0_w = sample186.w;
        sample187 = vec4(texture(sadImage, vec2(r1_y, r1_z)));
        r1_y = sample187.x;
        r1_z = sample187.y;
        r1_w = sample187.z;
        r2_x = sample187.w;
        r4_x = (a0_x == 0.0 ? r0_x : (a0_x == 1.0 ? r0_y : (a0_x == 2.0 ? r0_z : (a0_x == 3.0 ? r0_w : (a0_x == 4.0 ? r1_x : (a0_x == 5.0 ? r1_y : (a0_x == 6.0 ? r1_z : (a0_x == 7.0 ? r1_w : (a0_x == 8.0 ? r2_x : (a0_x == 9.0 ? r2_y : (a0_x == 10.0 ? r2_z : (a0_x == 11.0 ? r2_w : (a0_x == 12.0 ? r3_x : (a0_x == 13.0 ? r3_y : (a0_x == 14.0 ? r3_z : (a0_x == 15.0 ? r3_w : 0.0))))))))))))))));
        r0_x = (a0_x == 0.0 ? r1_y : (a0_x == 1.0 ? r1_z : (a0_x == 2.0 ? r1_w : (a0_x == 3.0 ? r2_x : (a0_x == 4.0 ? r2_y : (a0_x == 5.0 ? r2_z : (a0_x == 6.0 ? r2_w : (a0_x == 7.0 ? r3_x : (a0_x == 8.0 ? r3_y : (a0_x == 9.0 ? r3_z : (a0_x == 10.0 ? r3_w : (a0_x == 11.0 ? r4_x : (a0_x == 12.0 ? r4_y : (a0_x == 13.0 ? r4_z : (a0_x == 14.0 ? r4_w : (a0_x == 15.0 ? r5_x : 0.0))))))))))))))));
        p0 = r4_x == r4_z;
        p1 = r0_x == r4_z;
        if (!(p0 && p1))
        {
            r0_y = r4_z;
            r0_z = r4_x;
            r0_x = r0_x;
            r0_y = (-2.0) * r0_y + r0_z;
            r0_z = r0_z - r0_x;
            r0_x = r0_x + r0_y;
            r0_y = r0_z * 0.5;
            r0_x = 1.0 / r0_x;
            r0_x = r0_x * r0_y;
            r0_x = r0_x * 256.0;
            r0_x = float(int(r0_x));
            r0_y = float(int(r0_x) & int((-2147483617.0)));
            r0_z = r0_x + 32.0;
            r0_y = (r0_y == (-2147483648.0)) ? 1.0 : 0.0;
            r0_x = (r0_y != 0.0) ? r0_x : r0_z;
            r0_x = floor(r0_x / exp2(6.0));
            r0_x = max(r0_x, -2.0);
            r2_y = min(r0_x, 2.0);
        }
    }
    r0_x = floor(r1_x / exp2(31.0));
    r0_y = r3_w + 1.0;
    r0_z = r4_w + 2.0;
    r0_w = r2_y + 2.0;
    r0_x = float(int(r0_x) & int(32767.0));
    r0_y = r0_y + 0.0;
    r0_z = r0_z;
    r1_y = r0_w;
    r1_z = r0_x + r1_x;
    r0_w = r0_y * sadPixSize.y;
    r3_w = 0.0;
    r0_x = r0_z * 0.003921568859368563;
    r0_y = r1_y * 0.003921568859368563;
    r0_z = float(int(r1_z) & int((-32768.0)));
    r0_z = r1_x - r0_z;
    r2_x = (r0_z < 0.0) ? 1.0 : 0.0;
    r1_x = (-r0_z);
    r1_y = abs(r0_z);
    r1_z = floor(r0_z / exp2(31.0));
    r2_y = float(int(r2_x) ^ int(r2_z));
    r2_z = (r2_x != 0.0) ? r1_x : r0_z;
    r1_x = floor(r1_y / exp2(2.0));
    r1_y = float(int(r1_z) & int(3.0));
    r1_z = r2_z;
    r1_w = 0.0 - r1_x;
    r1_y = r0_z + r1_y;
    r1_z = r1_z * r3_z;
    r4_x = (r0_z > 0.0) ? r1_x : r1_w;
    r1_x = float(int(r1_y) & (~int(3.0)));
    r4_y = float(int(r1_z));
    r1_y = r4_x;
    r4_z = r0_z - r1_x;
    r0_z = float((int(r4_y) & 65535) * (int(r3_x) & 65535));
    r1_x = r1_y + 0.5;
    r0_z = float(int(uint(r0_z) + (((uint(r4_y) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    hr0_x = r4_z;
    r1_y = float(int(uint(r0_z) + (((uint(r3_x) & 65535u) * (uint(r4_y) >> 16u)) << 16u)));
    r0_z = r1_x * sadPixSize.x;
    a0_x = hr0_x;
    r1_x = r2_z - r1_y;
    r4_w = r1_x;
    sample258 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
    r1_x = sample258.x;
    r1_y = sample258.y;
    r1_z = sample258.z;
    r1_w = sample258.w;
    r0_z = r3_z * r4_w;
    r0_z = float(int(r0_z));
    r0_z = r0_z + r4_y;
    r3_z = float((int(r0_z) & 65535) * (int(r3_x) & 65535));
    r3_z = float(int(uint(r3_z) + (((uint(r0_z) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    r3_z = float(int(uint(r3_z) + (((uint(r3_x) & 65535u) * (uint(r0_z) >> 16u)) << 16u)));
    r4_y = r2_z - r3_z;
    r3_z = (r3_z > r2_z) ? 1.0 : 0.0;
    r4_y = (r4_y >= r3_x) ? 1.0 : 0.0;
    r0_z = r0_z - r3_z;
    r3_z = floor(r4_y / exp2(r3_z));
    r0_z = r0_z + r3_z;
    r3_z = float((int(r0_z) & 65535) * (int(r3_x) & 65535));
    r4_y = (-r0_z);
    r3_z = float(int(uint(r3_z) + (((uint(r0_z) & 65535u) * (uint(r3_x) >> 16u)) << 16u)));
    r3_x = float(int(uint(r3_z) + (((uint(r3_x) & 65535u) * (uint(r0_z) >> 16u)) << 16u)));
    r3_z = (r2_y != 0.0) ? r4_y : r0_z;
    r0_z = r2_z - r3_x;
    r3_x = (a0_x == 0.0 ? r1_x : (a0_x == 1.0 ? r1_y : (a0_x == 2.0 ? r1_z : (a0_x == 3.0 ? r1_w : (a0_x == 4.0 ? r2_x : (a0_x == 5.0 ? r2_y : (a0_x == 6.0 ? r2_z : (a0_x == 7.0 ? r2_w : (a0_x == 8.0 ? r3_x : (a0_x == 9.0 ? r3_y : (a0_x == 10.0 ? r3_z : (a0_x == 11.0 ? r3_w : (a0_x == 12.0 ? r4_x : (a0_x == 13.0 ? r4_y : (a0_x == 14.0 ? r4_z : (a0_x == 15.0 ? r4_w : 0.0))))))))))))))));
    r2_y = (-r0_z);
    r0_z = (r2_x != 0.0) ? r2_y : r0_z;
    p0 = r0_z > 0.0;
    p1 = r0_z < r2_w;
    if (!(p0 && p1))
    {
        r2_w = r3_w;
    }
    else
    {
        p0 = r4_z > 0.0;
        if (p0)
        {
            r0_z = r4_z + -1.0;
            hr0_y = r0_z;
            a0_x = hr0_y;
            r2_x = (a0_x == 0.0 ? r1_x : (a0_x == 1.0 ? r1_y : (a0_x == 2.0 ? r1_z : (a0_x == 3.0 ? r1_w : (a0_x == 4.0 ? r2_x : (a0_x == 5.0 ? r2_y : (a0_x == 6.0 ? r2_z : (a0_x == 7.0 ? r2_w : (a0_x == 8.0 ? r3_x : (a0_x == 9.0 ? r3_y : (a0_x == 10.0 ? r3_z : (a0_x == 11.0 ? r3_w : (a0_x == 12.0 ? r4_x : (a0_x == 13.0 ? r4_y : (a0_x == 14.0 ? r4_z : (a0_x == 15.0 ? r4_w : 0.0))))))))))))))));
        }
        else
        {
            r0_z = r4_x + -1.0;
            r2_y = r0_w;
            r0_z = r0_z;
            r0_z = r0_z + 0.5;
            r2_x = r0_z * sadPixSize.x;
            sample307 = vec4(texture(sadImage, vec2(r2_x, r2_y)));
            r2_x = sample307.w;
        }
        p0 = r4_z < 3.0;
        if (p0)
        {
            r0_z = r4_z + 1.0;
            hr0_y = r0_z;
            a0_x = hr0_y;
            r0_z = (a0_x == 0.0 ? r1_x : (a0_x == 1.0 ? r1_y : (a0_x == 2.0 ? r1_z : (a0_x == 3.0 ? r1_w : (a0_x == 4.0 ? r2_x : (a0_x == 5.0 ? r2_y : (a0_x == 6.0 ? r2_z : (a0_x == 7.0 ? r2_w : (a0_x == 8.0 ? r3_x : (a0_x == 9.0 ? r3_y : (a0_x == 10.0 ? r3_z : (a0_x == 11.0 ? r3_w : (a0_x == 12.0 ? r4_x : (a0_x == 13.0 ? r4_y : (a0_x == 14.0 ? r4_z : (a0_x == 15.0 ? r4_w : 0.0))))))))))))))));
        }
        else
        {
            r0_z = r4_x + 1.0;
            r1_y = r0_w;
            r0_z = r0_z;
            r0_z = r0_z + 0.5;
            r1_x = r0_z * sadPixSize.x;
            sample326 = vec4(texture(sadImage, vec2(r1_x, r1_y)));
            r0_z = sample326.x;
        }
        p0 = r2_x == r3_x;
        p1 = r0_z == r3_x;
        r3_w = 0.0;
        if (!(!p0 || !p1))
        {
            r0_z = r3_w;
        }
        else
        {
            r1_x = r3_x;
            r1_y = r2_x;
            r0_z = r0_z;
            r1_x = (-2.0) * r1_x + r1_y;
            r1_y = r1_y - r0_z;
            r0_z = r0_z + r1_x;
            r1_x = r1_y * 0.5;
            r0_z = 1.0 / r0_z;
            r0_z = r0_z * r1_x;
            r0_z = r0_z * 256.0;
            r0_z = float(int(r0_z));
            r1_x = float(int(r0_z) & int((-2147483617.0)));
            r1_y = r0_z + 32.0;
            r1_x = (r1_x == (-2147483648.0)) ? 1.0 : 0.0;
            r0_z = (r1_x != 0.0) ? r0_z : r1_y;
            r0_z = floor(r0_z / exp2(6.0));
            r0_z = max(r0_z, -2.0);
            r0_z = min(r0_z, 2.0);
        }
        r2_w = r0_z;
    }
    p0 = r3_z > 0.0;
    p1 = r3_z < r5_x;
    if (!(!p0 || !p1))
    {
        r0_z = r4_x - r3_y;
        r1_y = r3_y + r4_x;
        r1_x = r0_w;
        r1_z = r0_w;
        r0_z = r0_z;
        r0_w = r1_y;
        a0_x = hr0_x;
        r3_w = 0.0;
        r0_z = r0_z + 0.5;
        r0_w = r0_w + 0.5;
        r0_z = r0_z * sadPixSize.x;
        r1_y = r0_w * sadPixSize.x;
        r0_w = r0_z;
        sample375 = vec4(texture(sadImage, vec2(r0_w, r1_x)));
        r1_w = sample375.x;
        r2_x = sample375.y;
        r2_y = sample375.z;
        r2_z = sample375.w;
        sample376 = vec4(texture(sadImage, vec2(r1_y, r1_z)));
        r0_z = sample376.x;
        r0_w = sample376.y;
        r1_x = sample376.z;
        r1_y = sample376.w;
        r1_z = (a0_x == 0.0 ? r1_w : (a0_x == 1.0 ? r2_x : (a0_x == 2.0 ? r2_y : (a0_x == 3.0 ? r2_z : (a0_x == 4.0 ? r2_w : (a0_x == 5.0 ? r3_x : (a0_x == 6.0 ? r3_y : (a0_x == 7.0 ? r3_z : (a0_x == 8.0 ? r3_w : (a0_x == 9.0 ? r4_x : (a0_x == 10.0 ? r4_y : (a0_x == 11.0 ? r4_z : (a0_x == 12.0 ? r4_w : (a0_x == 13.0 ? r5_x : (a0_x == 14.0 ? r5_y : (a0_x == 15.0 ? r5_z : 0.0))))))))))))))));
        r1_w = (a0_x == 0.0 ? r0_z : (a0_x == 1.0 ? r0_w : (a0_x == 2.0 ? r1_x : (a0_x == 3.0 ? r1_y : (a0_x == 4.0 ? r1_z : (a0_x == 5.0 ? r1_w : (a0_x == 6.0 ? r2_x : (a0_x == 7.0 ? r2_y : (a0_x == 8.0 ? r2_z : (a0_x == 9.0 ? r2_w : (a0_x == 10.0 ? r3_x : (a0_x == 11.0 ? r3_y : (a0_x == 12.0 ? r3_z : (a0_x == 13.0 ? r3_w : (a0_x == 14.0 ? r4_x : (a0_x == 15.0 ? r4_y : 0.0))))))))))))))));
        p0 = r1_z == r3_x;
        p0 = r1_w == r3_x;
        if (!(p0 && p1))
        {
            r0_z = r3_x;
            r0_w = r1_z;
            r1_x = r1_w;
            r0_z = (-2.0) * r0_z + r0_w;
            r0_w = r0_w - r1_x;
            r0_z = r0_z + r1_x;
            r0_w = r0_w * 0.5;
            r0_z = 1.0 / r0_z;
            r0_z = r0_z * r0_w;
            r0_z = r0_z * 256.0;
            r0_z = float(int(r0_z));
            r0_w = float(int(r0_z) & int((-2147483617.0)));
            r1_x = r0_z + 32.0;
            r0_w = (r0_w == (-2147483648.0)) ? 1.0 : 0.0;
            r0_z = (r0_w != 0.0) ? r0_z : r1_x;
            r0_z = floor(r0_z / exp2(6.0));
            r0_z = max(r0_z, -2.0);
            r3_w = min(r0_z, 2.0);
        }
    }
    r0_z = r2_w + 2.0;
    r0_w = r3_w + 2.0;
    r0_z = r0_z;
    r0_w = r0_w;
    r0_z = r0_z * 0.003921568859368563;
    r0_w = r0_w * 0.003921568859368563;
    fragColor = vec4(r0_x, r0_y, r0_z, r0_w);
}
