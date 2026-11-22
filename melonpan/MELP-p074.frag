#version 300 es
precision highp int;
precision highp float;

uniform highp usampler2D sadImage;
uniform highp sampler2D btmMaskImage;
uniform highp vec2 dstPixSize;
uniform highp vec4 params;
uniform highp vec2 sadPixSize;
uniform highp vec2 btmMaskPixSize;
in highp vec2 texCoord;
out highp vec4 fragColor;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample177;
    highp vec4 sample179;
    highp vec4 sample181;
    highp vec4 sample301;
    highp vec4 sample303;
    highp vec4 sample305;
    highp vec4 sample425;
    highp vec4 sample426;
    highp vec4 sample428;
    highp vec4 sample53;
    highp vec4 sample55;
    highp vec4 sample57;
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
    highp float r5_w;
    highp float r5_x;
    highp float r5_y;
    highp float r5_z;
    dstPixSize;
    params;
    sadPixSize;
    btmMaskPixSize;
    int blk = 0;
    while (true)
    {
        switch (blk)
        {
        case 0:
        {
            r0_z = dstPixSize.y;
            r0_w = dstPixSize.x;
            r1_x = texCoord.x;
            r1_y = texCoord.y;
            r3_y = float(int(params.x));
            r3_z = float(int(params.y));
            r3_w = params.z;
            r0_x = 1.0 / r0_z;
            r0_y = 1.0 / r0_w;
            p0 = r3_y < r3_z;
            r0_x = r0_x * r1_y;
            r0_y = r0_y * r1_x;
            r0_x = floor(r0_x);
            r0_y = r0_y - 0.5;
            r0_x = r0_x * params.w;
            r0_x = 4.0 * r0_y + r0_x;
            r4_x = r0_x + 0.5;
            if (p0) { blk = 30; break; }
            blk = 18;
        }
        break;
        case 18:
        {
            r4_z = 65535.0;
            blk = 19; break;
        }
        break;
        case 19:
        {
            r4_x = r4_x + 1.0;
            if (p0) { blk = 154; break; }
            blk = 22;
        }
        break;
        case 22:
        {
            r4_w = 65535.0;
            blk = 23; break;
        }
        break;
        case 23:
        {
            r4_x = r4_x + 1.0;
            if (p0) { blk = 278; break; }
            blk = 26;
        }
        break;
        case 26:
        {
            r5_x = 65535.0;
            blk = 27; break;
        }
        break;
        case 27:
        {
            if (p0) { blk = 402; break; }
            blk = 28;
        }
        break;
        case 28:
        {
            r4_y = 65535.0;
            blk = 522; break;
        }
        break;
        case 30:
        {
            r0_x = r4_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r4_y = 65535.0;
            r0_x = r3_y;
            r4_z = 65535.0;
            blk = 38; break;
        }
        break;
        case 38:
        {
            r4_w = r0_x;
            r0_z = 1.0 / r3_w;
            r5_x = r0_x + 1.0;
            r0_x = r4_w + 0.5;
            r1_x = r4_w - 1.0;
            p1 = r5_x < r3_z;
            r1_z = r0_x * sadPixSize.x;
            r0_x = r0_x * btmMaskPixSize.x;
            r1_w = r1_x + 0.5;
            r2_x = r0_z * r4_w;
            r0_z = r1_z;
            r1_x = r0_x;
            r0_x = r1_w * sadPixSize.x;
            r5_y = floor(r2_x);
            sample53 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample53.x;
            r1_w = sample53.y;
            r2_x = sample53.z;
            sample55 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample55.x;
            r2_z = sample55.y;
            r2_w = sample55.z;
            r3_x = sample55.w;
            r0_z = (-params.z) * r5_y + r4_w;
            sample57 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample57.w;
            r0_x = (r0_z < 0.5) ? 1.0 : 0.0;
            r0_x = (r0_x != 0.0) ? 0.0 : 1.0;
            r0_z = r2_x;
            r2_x = r2_w * 255.0;
            r2_w = r3_x * 255.0;
            r1_z = r1_z;
            r3_x = (r0_z < r4_y) ? 1.0 : 0.0;
            r2_y = r2_y * 255.0;
            r1_x = r1_x;
            r2_w = r0_x * r2_w;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r2_y;
            r1_w = r1_w;
            r2_y = r2_z * 255.0;
            r2_z = 1.0 - r3_x;
            r3_x = r2_x * r2_z;
            r2_z = (-r2_x) * r2_z + 1.0;
            r4_w = r3_x * r4_y;
            r3_x = r0_z * r3_x;
            r4_z = r2_z * r4_z + r4_w;
            r3_x = r2_z * r4_y + r3_x;
            r2_x = r2_x * r2_z;
            r2_z = (r0_z < r4_z) ? 1.0 : 0.0;
            r4_y = (r0_z < r3_x) ? 1.0 : 0.0;
            r4_w = (r1_x < r3_x) ? 1.0 : 0.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r4_w = (r4_w != 0.0) ? 0.0 : 1.0;
            r2_z = 1.0 - r2_z;
            r2_x = r2_x * r4_y;
            r4_y = 1.0 - r4_w;
            r4_w = r2_x * r2_z;
            r2_x = (-r2_x) * r2_z + 1.0;
            r2_z = r2_w * r4_y;
            r4_y = (-r2_w) * r4_y + 1.0;
            r0_z = r0_z * r4_w;
            r0_z = r2_x * r4_z + r0_z;
            r2_x = r2_z * r3_x;
            r2_z = r1_x * r2_z;
            r2_w = r2_w * r4_y;
            r2_z = r3_x * r4_y + r2_z;
            r0_z = r0_z * r4_y + r2_x;
            r2_x = (r1_x < r2_z) ? 1.0 : 0.0;
            r3_x = (r1_x < r0_z) ? 1.0 : 0.0;
            r4_y = (r1_z < r2_z) ? 1.0 : 0.0;
            r2_x = (r2_x != 0.0) ? 0.0 : 1.0;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r2_x = r2_x * r2_w;
            r2_w = 1.0 - r3_x;
            r3_x = 1.0 - r4_y;
            r4_y = r2_x * r2_w;
            r2_x = (-r2_x) * r2_w + 1.0;
            r2_w = r0_x * r3_x;
            r3_x = (-r0_x) * r3_x + 1.0;
            r1_x = r1_x * r4_y;
            r0_z = r0_z * r2_x + r1_x;
            r1_x = r2_z * r2_w;
            r2_x = r1_z * r2_w;
            r0_x = r0_x * r3_x;
            r2_x = r2_z * r3_x + r2_x;
            r0_z = r0_z * r3_x + r1_x;
            r1_x = (r1_z < r2_x) ? 1.0 : 0.0;
            r2_z = (r1_z < r0_z) ? 1.0 : 0.0;
            r2_w = (r1_w < r2_x) ? 1.0 : 0.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r2_w = (r2_w != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r1_x;
            r1_x = 1.0 - r2_z;
            r2_z = 1.0 - r2_w;
            r2_w = r0_x * r1_x;
            r0_x = (-r0_x) * r1_x + 1.0;
            r1_x = r2_y * r2_z;
            r2_z = (-r2_y) * r2_z + 1.0;
            r1_z = r1_z * r2_w;
            r0_x = r0_x * r0_z + r1_z;
            r0_z = r1_x * r2_x;
            r1_x = r1_x * r1_w;
            r1_z = r2_y * r2_z;
            r0_x = r0_x * r2_z + r0_z;
            r4_y = r2_x * r2_z + r1_x;
            r0_z = (r1_w < r0_x) ? 1.0 : 0.0;
            r1_x = (r1_w < r4_y) ? 1.0 : 0.0;
            r0_z = (r0_z != 0.0) ? 0.0 : 1.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r0_z = 1.0 - r0_z;
            r1_x = r1_x * r1_z;
            r1_z = r0_z * r1_x;
            r0_z = r0_z * (-r1_x) + 1.0;
            r1_x = r1_z * r1_w;
            r4_z = r0_x * r0_z + r1_x;
            if (!p1) { blk = 19; break; }
            blk = 152;
        }
        break;
        case 152:
        {
            r0_x = r5_x;
            blk = 38; break;
        }
        break;
        case 154:
        {
            r0_x = r4_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r0_x = r3_y;
            r4_w = 65535.0;
            r4_y = 65535.0;
            blk = 162; break;
        }
        break;
        case 162:
        {
            r5_x = r0_x;
            r0_z = 1.0 / r3_w;
            r5_y = r0_x + 1.0;
            r0_x = r5_x + 0.5;
            r1_x = r5_x - 1.0;
            p1 = r5_y < r3_z;
            r1_z = r0_x * sadPixSize.x;
            r0_x = r0_x * btmMaskPixSize.x;
            r1_w = r1_x + 0.5;
            r2_x = r0_z * r5_x;
            r0_z = r1_z;
            r1_x = r0_x;
            r0_x = r1_w * sadPixSize.x;
            r5_z = floor(r2_x);
            sample177 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample177.x;
            r1_w = sample177.y;
            r2_x = sample177.z;
            sample179 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample179.x;
            r2_z = sample179.y;
            r2_w = sample179.z;
            r3_x = sample179.w;
            r0_z = (-params.z) * r5_z + r5_x;
            sample181 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample181.w;
            r0_x = (r0_z < 0.5) ? 1.0 : 0.0;
            r0_x = (r0_x != 0.0) ? 0.0 : 1.0;
            r0_z = r2_x;
            r2_x = r2_w * 255.0;
            r2_w = r3_x * 255.0;
            r1_z = r1_z;
            r3_x = (r0_z < r4_y) ? 1.0 : 0.0;
            r2_y = r2_y * 255.0;
            r1_x = r1_x;
            r2_w = r0_x * r2_w;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r2_y;
            r1_w = r1_w;
            r2_y = r2_z * 255.0;
            r2_z = 1.0 - r3_x;
            r3_x = r2_x * r2_z;
            r2_z = (-r2_x) * r2_z + 1.0;
            r5_x = r3_x * r4_y;
            r3_x = r0_z * r3_x;
            r4_w = r2_z * r4_w + r5_x;
            r3_x = r2_z * r4_y + r3_x;
            r2_x = r2_x * r2_z;
            r2_z = (r0_z < r4_w) ? 1.0 : 0.0;
            r4_y = (r0_z < r3_x) ? 1.0 : 0.0;
            r5_x = (r1_x < r3_x) ? 1.0 : 0.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r5_x = (r5_x != 0.0) ? 0.0 : 1.0;
            r2_z = 1.0 - r2_z;
            r2_x = r2_x * r4_y;
            r4_y = 1.0 - r5_x;
            r5_x = r2_x * r2_z;
            r2_x = (-r2_x) * r2_z + 1.0;
            r2_z = r2_w * r4_y;
            r4_y = (-r2_w) * r4_y + 1.0;
            r0_z = r0_z * r5_x;
            r0_z = r2_x * r4_w + r0_z;
            r2_x = r2_z * r3_x;
            r2_z = r1_x * r2_z;
            r2_w = r2_w * r4_y;
            r2_z = r3_x * r4_y + r2_z;
            r0_z = r0_z * r4_y + r2_x;
            r2_x = (r1_x < r2_z) ? 1.0 : 0.0;
            r3_x = (r1_x < r0_z) ? 1.0 : 0.0;
            r4_y = (r1_z < r2_z) ? 1.0 : 0.0;
            r2_x = (r2_x != 0.0) ? 0.0 : 1.0;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r2_x = r2_x * r2_w;
            r2_w = 1.0 - r3_x;
            r3_x = 1.0 - r4_y;
            r4_y = r2_x * r2_w;
            r2_x = (-r2_x) * r2_w + 1.0;
            r2_w = r0_x * r3_x;
            r3_x = (-r0_x) * r3_x + 1.0;
            r1_x = r1_x * r4_y;
            r0_z = r0_z * r2_x + r1_x;
            r1_x = r2_z * r2_w;
            r2_x = r1_z * r2_w;
            r0_x = r0_x * r3_x;
            r2_x = r2_z * r3_x + r2_x;
            r0_z = r0_z * r3_x + r1_x;
            r1_x = (r1_z < r2_x) ? 1.0 : 0.0;
            r2_z = (r1_z < r0_z) ? 1.0 : 0.0;
            r2_w = (r1_w < r2_x) ? 1.0 : 0.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r2_w = (r2_w != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r1_x;
            r1_x = 1.0 - r2_z;
            r2_z = 1.0 - r2_w;
            r2_w = r0_x * r1_x;
            r0_x = (-r0_x) * r1_x + 1.0;
            r1_x = r2_y * r2_z;
            r2_z = (-r2_y) * r2_z + 1.0;
            r1_z = r1_z * r2_w;
            r0_x = r0_x * r0_z + r1_z;
            r0_z = r1_x * r2_x;
            r1_x = r1_x * r1_w;
            r1_z = r2_y * r2_z;
            r0_x = r0_x * r2_z + r0_z;
            r4_y = r2_x * r2_z + r1_x;
            r0_z = (r1_w < r0_x) ? 1.0 : 0.0;
            r1_x = (r1_w < r4_y) ? 1.0 : 0.0;
            r0_z = (r0_z != 0.0) ? 0.0 : 1.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r0_z = 1.0 - r0_z;
            r1_x = r1_x * r1_z;
            r1_z = r0_z * r1_x;
            r0_z = r0_z * (-r1_x) + 1.0;
            r1_x = r1_z * r1_w;
            r4_w = r0_x * r0_z + r1_x;
            if (!p1) { blk = 23; break; }
            blk = 276;
        }
        break;
        case 276:
        {
            r0_x = r5_y;
            blk = 162; break;
        }
        break;
        case 278:
        {
            r0_x = r4_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r0_x = r3_y;
            r5_x = 65535.0;
            r4_y = 65535.0;
            blk = 286; break;
        }
        break;
        case 286:
        {
            r5_y = r0_x;
            r0_z = 1.0 / r3_w;
            r5_z = r0_x + 1.0;
            r0_x = r5_y + 0.5;
            r1_x = r5_y - 1.0;
            p1 = r5_z < r3_z;
            r1_z = r0_x * sadPixSize.x;
            r0_x = r0_x * btmMaskPixSize.x;
            r1_w = r1_x + 0.5;
            r2_x = r0_z * r5_y;
            r0_z = r1_z;
            r1_x = r0_x;
            r0_x = r1_w * sadPixSize.x;
            r5_w = floor(r2_x);
            sample301 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample301.x;
            r1_w = sample301.y;
            r2_x = sample301.z;
            sample303 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample303.x;
            r2_z = sample303.y;
            r2_w = sample303.z;
            r3_x = sample303.w;
            r0_z = (-params.z) * r5_w + r5_y;
            sample305 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample305.w;
            r0_x = (r0_z < 0.5) ? 1.0 : 0.0;
            r0_x = (r0_x != 0.0) ? 0.0 : 1.0;
            r0_z = r2_x;
            r2_x = r2_w * 255.0;
            r2_w = r3_x * 255.0;
            r1_z = r1_z;
            r3_x = (r0_z < r4_y) ? 1.0 : 0.0;
            r2_y = r2_y * 255.0;
            r1_x = r1_x;
            r2_w = r0_x * r2_w;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r2_y;
            r1_w = r1_w;
            r2_y = r2_z * 255.0;
            r2_z = 1.0 - r3_x;
            r3_x = r2_x * r2_z;
            r2_z = (-r2_x) * r2_z + 1.0;
            r5_y = r3_x * r4_y;
            r3_x = r0_z * r3_x;
            r5_x = r2_z * r5_x + r5_y;
            r3_x = r2_z * r4_y + r3_x;
            r2_x = r2_x * r2_z;
            r2_z = (r0_z < r5_x) ? 1.0 : 0.0;
            r4_y = (r0_z < r3_x) ? 1.0 : 0.0;
            r5_y = (r1_x < r3_x) ? 1.0 : 0.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r5_y = (r5_y != 0.0) ? 0.0 : 1.0;
            r2_z = 1.0 - r2_z;
            r2_x = r2_x * r4_y;
            r4_y = 1.0 - r5_y;
            r5_y = r2_x * r2_z;
            r2_x = (-r2_x) * r2_z + 1.0;
            r2_z = r2_w * r4_y;
            r4_y = (-r2_w) * r4_y + 1.0;
            r0_z = r0_z * r5_y;
            r0_z = r2_x * r5_x + r0_z;
            r2_x = r2_z * r3_x;
            r2_z = r1_x * r2_z;
            r2_w = r2_w * r4_y;
            r2_z = r3_x * r4_y + r2_z;
            r0_z = r0_z * r4_y + r2_x;
            r2_x = (r1_x < r2_z) ? 1.0 : 0.0;
            r3_x = (r1_x < r0_z) ? 1.0 : 0.0;
            r4_y = (r1_z < r2_z) ? 1.0 : 0.0;
            r2_x = (r2_x != 0.0) ? 0.0 : 1.0;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r4_y = (r4_y != 0.0) ? 0.0 : 1.0;
            r2_x = r2_x * r2_w;
            r2_w = 1.0 - r3_x;
            r3_x = 1.0 - r4_y;
            r4_y = r2_x * r2_w;
            r2_x = (-r2_x) * r2_w + 1.0;
            r2_w = r0_x * r3_x;
            r3_x = (-r0_x) * r3_x + 1.0;
            r1_x = r1_x * r4_y;
            r0_z = r0_z * r2_x + r1_x;
            r1_x = r2_z * r2_w;
            r2_x = r1_z * r2_w;
            r0_x = r0_x * r3_x;
            r2_x = r2_z * r3_x + r2_x;
            r0_z = r0_z * r3_x + r1_x;
            r1_x = (r1_z < r2_x) ? 1.0 : 0.0;
            r2_z = (r1_z < r0_z) ? 1.0 : 0.0;
            r2_w = (r1_w < r2_x) ? 1.0 : 0.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r2_w = (r2_w != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r1_x;
            r1_x = 1.0 - r2_z;
            r2_z = 1.0 - r2_w;
            r2_w = r0_x * r1_x;
            r0_x = (-r0_x) * r1_x + 1.0;
            r1_x = r2_y * r2_z;
            r2_z = (-r2_y) * r2_z + 1.0;
            r1_z = r1_z * r2_w;
            r0_x = r0_x * r0_z + r1_z;
            r0_z = r1_x * r2_x;
            r1_x = r1_x * r1_w;
            r1_z = r2_y * r2_z;
            r0_x = r0_x * r2_z + r0_z;
            r4_y = r2_x * r2_z + r1_x;
            r0_z = (r1_w < r0_x) ? 1.0 : 0.0;
            r1_x = (r1_w < r4_y) ? 1.0 : 0.0;
            r0_z = (r0_z != 0.0) ? 0.0 : 1.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r0_z = 1.0 - r0_z;
            r1_x = r1_x * r1_z;
            r1_z = r0_z * r1_x;
            r0_z = r0_z * (-r1_x) + 1.0;
            r1_x = r1_z * r1_w;
            r5_x = r0_x * r0_z + r1_x;
            if (!p1) { blk = 27; break; }
            blk = 400;
        }
        break;
        case 400:
        {
            r0_x = r5_z;
            blk = 286; break;
        }
        break;
        case 402:
        {
            r0_x = r4_x + 1.0;
            r0_x = r0_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r4_y = 65535.0;
            r4_x = 65535.0;
            blk = 409; break;
        }
        break;
        case 409:
        {
            r5_y = r3_y;
            r0_x = 1.0 / r3_w;
            r3_y = r3_y + 1.0;
            r0_z = r5_y + 0.5;
            r1_x = r5_y - 1.0;
            p0 = r3_y < r3_z;
            r1_z = r0_z * sadPixSize.x;
            r1_w = r0_z * btmMaskPixSize.x;
            r2_x = r1_x + 0.5;
            r0_x = r0_x * r5_y;
            r0_z = r1_z;
            r1_x = r1_w;
            r1_z = r2_x * sadPixSize.x;
            r5_z = floor(r0_x);
            r0_x = r1_z;
            sample425 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample425.x;
            r1_w = sample425.y;
            r2_x = sample425.z;
            sample426 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample426.x;
            r2_z = sample426.y;
            r2_w = sample426.z;
            r3_x = sample426.w;
            r0_z = (-params.z) * r5_z + r5_y;
            sample428 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample428.w;
            r0_x = (r0_z < 0.5) ? 1.0 : 0.0;
            r0_x = (r0_x != 0.0) ? 0.0 : 1.0;
            r0_z = r2_x;
            r2_x = r2_w * 255.0;
            r2_w = r3_x * 255.0;
            r1_z = r1_z;
            r3_x = (r0_z < r4_x) ? 1.0 : 0.0;
            r2_y = r2_y * 255.0;
            r1_x = r1_x;
            r2_w = r0_x * r2_w;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r2_y;
            r1_w = r1_w;
            r2_y = r2_z * 255.0;
            r2_z = 1.0 - r3_x;
            r3_x = r2_x * r2_z;
            r2_z = (-r2_x) * r2_z + 1.0;
            r5_y = r3_x * r4_x;
            r3_x = r0_z * r3_x;
            r4_y = r2_z * r4_y + r5_y;
            r3_x = r2_z * r4_x + r3_x;
            r2_x = r2_x * r2_z;
            r2_z = (r0_z < r4_y) ? 1.0 : 0.0;
            r4_x = (r0_z < r3_x) ? 1.0 : 0.0;
            r5_y = (r1_x < r3_x) ? 1.0 : 0.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r4_x = (r4_x != 0.0) ? 0.0 : 1.0;
            r5_y = (r5_y != 0.0) ? 0.0 : 1.0;
            r2_z = 1.0 - r2_z;
            r2_x = r2_x * r4_x;
            r4_x = 1.0 - r5_y;
            r5_y = r2_x * r2_z;
            r2_x = (-r2_x) * r2_z + 1.0;
            r2_z = r2_w * r4_x;
            r4_x = (-r2_w) * r4_x + 1.0;
            r0_z = r0_z * r5_y;
            r0_z = r2_x * r4_y + r0_z;
            r2_x = r2_z * r3_x;
            r2_z = r1_x * r2_z;
            r2_w = r2_w * r4_x;
            r2_z = r3_x * r4_x + r2_z;
            r0_z = r0_z * r4_x + r2_x;
            r2_x = (r1_x < r2_z) ? 1.0 : 0.0;
            r3_x = (r1_x < r0_z) ? 1.0 : 0.0;
            r4_x = (r1_z < r2_z) ? 1.0 : 0.0;
            r2_x = (r2_x != 0.0) ? 0.0 : 1.0;
            r3_x = (r3_x != 0.0) ? 0.0 : 1.0;
            r4_x = (r4_x != 0.0) ? 0.0 : 1.0;
            r2_x = r2_x * r2_w;
            r2_w = 1.0 - r3_x;
            r3_x = 1.0 - r4_x;
            r4_x = r2_x * r2_w;
            r2_x = (-r2_x) * r2_w + 1.0;
            r2_w = r0_x * r3_x;
            r3_x = (-r0_x) * r3_x + 1.0;
            r1_x = r1_x * r4_x;
            r0_z = r0_z * r2_x + r1_x;
            r1_x = r2_z * r2_w;
            r2_x = r1_z * r2_w;
            r0_x = r0_x * r3_x;
            r2_x = r2_z * r3_x + r2_x;
            r0_z = r0_z * r3_x + r1_x;
            r1_x = (r1_z < r2_x) ? 1.0 : 0.0;
            r2_z = (r1_z < r0_z) ? 1.0 : 0.0;
            r2_w = (r1_w < r2_x) ? 1.0 : 0.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r2_w = (r2_w != 0.0) ? 0.0 : 1.0;
            r0_x = r0_x * r1_x;
            r1_x = 1.0 - r2_z;
            r2_z = 1.0 - r2_w;
            r2_w = r0_x * r1_x;
            r0_x = (-r0_x) * r1_x + 1.0;
            r1_x = r2_y * r2_z;
            r2_z = (-r2_y) * r2_z + 1.0;
            r1_z = r1_z * r2_w;
            r0_x = r0_x * r0_z + r1_z;
            r0_z = r1_x * r2_x;
            r1_x = r1_x * r1_w;
            r1_z = r2_y * r2_z;
            r0_x = r0_x * r2_z + r0_z;
            r4_x = r2_x * r2_z + r1_x;
            r0_z = (r1_w < r0_x) ? 1.0 : 0.0;
            r1_x = (r1_w < r4_x) ? 1.0 : 0.0;
            r0_z = (r0_z != 0.0) ? 0.0 : 1.0;
            r1_x = (r1_x != 0.0) ? 0.0 : 1.0;
            r0_z = 1.0 - r0_z;
            r1_x = r1_x * r1_z;
            r1_z = r0_z * r1_x;
            r0_z = r0_z * (-r1_x) + 1.0;
            r1_x = r1_z * r1_w;
            r4_y = r0_x * r0_z + r1_x;
            if (p0) { blk = 409; break; }
            blk = 522;
        }
        break;
        case 522:
        {
            r0_x = float(int(r4_z));
            r0_y = float(int(r4_w));
            r0_z = float(int(r5_x));
            r0_w = float(int(r4_y));
            blk = -1; break;
        }
        break;
        default: blk = -1; break;
        }
        if (blk < 0) break;
    }
    fragColor = vec4(r0_x, r0_y, r0_z, r0_w);
}
