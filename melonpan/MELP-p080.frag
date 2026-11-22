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
out highp uvec4 fragColor;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample169;
    highp vec4 sample170;
    highp vec4 sample172;
    highp vec4 sample45;
    highp vec4 sample47;
    highp vec4 sample49;
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
            if (p0) { blk = 22; break; }
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
            if (p0) { blk = 146; break; }
            blk = 20;
        }
        break;
        case 20:
        {
            r4_y = 65535.0;
            blk = 266; break;
        }
        break;
        case 22:
        {
            r0_x = r4_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r0_x = r3_y;
            r4_z = 65535.0;
            r4_y = 65535.0;
            blk = 30; break;
        }
        break;
        case 30:
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
            sample45 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample45.x;
            r1_w = sample45.y;
            r2_x = sample45.z;
            sample47 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample47.x;
            r2_z = sample47.y;
            r2_w = sample47.z;
            r3_x = sample47.w;
            r0_z = (-params.z) * r5_y + r4_w;
            sample49 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample49.w;
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
            blk = 144;
        }
        break;
        case 144:
        {
            r0_x = r5_x;
            blk = 30; break;
        }
        break;
        case 146:
        {
            r0_x = r4_x + 1.0;
            r0_x = r0_x + 0.0;
            r0_w = r0_x * sadPixSize.y;
            r1_y = r0_x * btmMaskPixSize.y;
            r0_y = r0_w;
            r4_y = 65535.0;
            r4_x = 65535.0;
            blk = 153; break;
        }
        break;
        case 153:
        {
            r4_w = r3_y;
            r0_x = 1.0 / r3_w;
            r3_y = r3_y + 1.0;
            r0_z = r4_w + 0.5;
            r1_x = r4_w - 1.0;
            p0 = r3_y < r3_z;
            r1_z = r0_z * sadPixSize.x;
            r1_w = r0_z * btmMaskPixSize.x;
            r2_x = r1_x + 0.5;
            r0_x = r0_x * r4_w;
            r0_z = r1_z;
            r1_x = r1_w;
            r1_z = r2_x * sadPixSize.x;
            r5_x = floor(r0_x);
            r0_x = r1_z;
            sample169 = vec4(texture(sadImage, vec2(r0_z, r0_w)));
            r1_z = sample169.x;
            r1_w = sample169.y;
            r2_x = sample169.z;
            sample170 = texture(btmMaskImage, vec2(r1_x, r1_y));
            r2_y = sample170.x;
            r2_z = sample170.y;
            r2_w = sample170.z;
            r3_x = sample170.w;
            r0_z = (-params.z) * r5_x + r4_w;
            sample172 = vec4(texture(sadImage, vec2(r0_x, r0_y)));
            r1_x = sample172.w;
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
            r4_w = r3_x * r4_x;
            r3_x = r0_z * r3_x;
            r4_y = r2_z * r4_y + r4_w;
            r3_x = r2_z * r4_x + r3_x;
            r2_x = r2_x * r2_z;
            r2_z = (r0_z < r4_y) ? 1.0 : 0.0;
            r4_x = (r0_z < r3_x) ? 1.0 : 0.0;
            r4_w = (r1_x < r3_x) ? 1.0 : 0.0;
            r2_z = (r2_z != 0.0) ? 0.0 : 1.0;
            r4_x = (r4_x != 0.0) ? 0.0 : 1.0;
            r4_w = (r4_w != 0.0) ? 0.0 : 1.0;
            r2_z = 1.0 - r2_z;
            r2_x = r2_x * r4_x;
            r4_x = 1.0 - r4_w;
            r4_w = r2_x * r2_z;
            r2_x = (-r2_x) * r2_z + 1.0;
            r2_z = r2_w * r4_x;
            r4_x = (-r2_w) * r4_x + 1.0;
            r0_z = r0_z * r4_w;
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
            if (p0) { blk = 153; break; }
            blk = 266;
        }
        break;
        case 266:
        {
            r0_x = float(int(r4_z));
            r0_y = float(int(r4_y));
            r0_z = 0.0;
            r0_w = 0.0;
            blk = -1; break;
        }
        break;
        default: blk = -1; break;
        }
        if (blk < 0) break;
    }
    fragColor = uvec4(uint(r0_x), uint(r0_y), uint(r0_z), uint(r0_w));
}
