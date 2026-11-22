#version 300 es
precision highp int;
precision highp float;

uniform highp usampler2D coef;
uniform highp vec2 outputPixSize;
uniform highp vec2 inputPixSize;
in highp vec2 texCoord;
out highp vec4 fragColor;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample122;
    highp vec4 sample19;
    highp vec4 sample34;
    highp vec4 sample36;
    highp vec4 sample38;
    highp vec4 sample40;
    highp vec4 sample45;
    highp vec4 sample47;
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
    highp float r6_w;
    highp float r6_x;
    highp float r6_y;
    highp float r6_z;
    outputPixSize;
    inputPixSize;
    int blk = 0;
    while (true)
    {
        switch (blk)
        {
        case 0:
        {
            r0_z = outputPixSize.x;
            r0_w = texCoord.x;
            r4_z = texCoord.y;
            r0_x = 1.0 / r0_z;
            r0_x = r0_x * r0_w;
            r0_x = float(int(r0_x));
            p0 = r0_x == 3.0;
            if (p0) { blk = 23; break; }
            blk = 11;
        }
        break;
        case 11:
        {
            p0 = r0_x == 6.0;
            if (!p0) { blk = 116; break; }
            blk = 14;
        }
        break;
        case 14:
        {
            r0_y = r4_z;
            r0_x = inputPixSize.x;
            r0_x = r0_x * 3.5;
            sample19 = vec4(texture(coef, vec2(r0_x, r0_y)));
            r0_x = sample19.x;
            r0_x = r0_x;
            r0_y = 0.0;
            r0_z = 0.0;
            r0_w = 0.0;
            blk = 127; break;
        }
        break;
        case 23:
        {
            r4_w = inputPixSize.x;
            r0_y = r4_z;
            r0_w = r4_z;
            r1_y = r4_z;
            r0_x = r4_w * 0.5;
            r0_z = r4_w * 1.5;
            r1_x = r4_w * 2.5;
            r1_z = r4_w * 3.5;
            r1_w = r4_z;
            r2_x = r4_w * 4.5;
            r2_y = r4_z;
            sample34 = vec4(texture(coef, vec2(r0_x, r0_y)));
            r2_z = sample34.x;
            r2_w = sample34.y;
            r3_x = sample34.z;
            r3_y = sample34.w;
            sample36 = vec4(texture(coef, vec2(r0_z, r0_w)));
            r0_x = sample36.x;
            r0_y = sample36.y;
            r0_z = sample36.z;
            r0_w = sample36.w;
            sample38 = vec4(texture(coef, vec2(r1_x, r1_y)));
            r3_z = sample38.x;
            r3_w = sample38.y;
            r4_x = sample38.z;
            r4_y = sample38.w;
            r5_x = r4_w * 5.5;
            sample40 = vec4(texture(coef, vec2(r1_z, r1_w)));
            r1_x = sample40.x;
            r1_y = sample40.y;
            r1_z = sample40.z;
            r1_w = sample40.w;
            r4_w = r4_z;
            r4_z = r5_x;
            sample45 = vec4(texture(coef, vec2(r2_x, r2_y)));
            r5_x = sample45.x;
            r5_y = sample45.y;
            r5_z = sample45.z;
            r5_w = sample45.w;
            sample47 = vec4(texture(coef, vec2(r4_z, r4_w)));
            r6_x = sample47.x;
            r6_y = sample47.y;
            r6_z = sample47.z;
            r6_w = sample47.w;
            r2_x = r2_z;
            r2_y = r2_w;
            r2_z = r3_x;
            r0_x = r0_x;
            r2_x = 0.0009765625 * r2_x + -32.0;
            r2_y = 0.0009765625 * r2_y + -32.0;
            r0_y = r0_y;
            r2_w = r3_y;
            r2_z = 0.0009765625 * r2_z + -32.0;
            r2_x = r2_x + 0.0;
            r2_y = r2_y + 0.0;
            r0_z = r0_z;
            r0_x = 0.0009765625 * r0_x + -32.0;
            r0_y = 0.0009765625 * r0_y + -32.0;
            r3_x = r3_z;
            r3_y = r3_w;
            r2_w = 0.0009765625 * r2_w + -32.0;
            r2_z = r2_z + 0.0;
            r0_w = r0_w;
            r0_z = 0.0009765625 * r0_z + -32.0;
            r0_x = r0_x + r2_x;
            r0_y = r0_y + r2_y;
            r2_x = r4_x;
            r2_y = 0.0009765625 * r3_x + -32.0;
            r3_x = 0.0009765625 * r3_y + -32.0;
            r1_x = r1_x;
            r1_y = r1_y;
            r2_w = r2_w + 0.0;
            r0_w = 0.0009765625 * r0_w + -32.0;
            r0_z = r0_z + r2_z;
            r2_z = r4_y;
            r2_x = 0.0009765625 * r2_x + -32.0;
            r0_x = r0_x + r2_y;
            r0_y = r0_y + r3_x;
            r1_z = r1_z;
            r1_x = 0.0009765625 * r1_x + -32.0;
            r2_y = 0.0009765625 * r1_y + -32.0;
            r3_x = r5_x;
            r3_y = r5_y;
            r0_w = r0_w + r2_w;
            r2_z = 0.0009765625 * r2_z + -32.0;
            r0_z = r0_z + r2_x;
            r1_w = r1_w;
            r2_x = 0.0009765625 * r1_z + -32.0;
            r0_x = r0_x + r1_x;
            r0_y = r0_y + r2_y;
            r1_x = r5_z;
            r2_y = 0.0009765625 * r3_x + -32.0;
            r2_w = 0.0009765625 * r3_y + -32.0;
            r3_x = r6_x;
            r3_y = r6_y;
            r0_w = r0_w + r2_z;
            r2_z = 0.0009765625 * r1_w + -32.0;
            r0_z = r0_z + r2_x;
            r2_x = r5_w;
            r1_x = 0.0009765625 * r1_x + -32.0;
            r0_x = r0_x + r2_y;
            r0_y = r0_y + r2_w;
            r2_y = r6_z;
            r2_w = 0.0009765625 * r3_x + -32.0;
            r3_x = 0.0009765625 * r3_y + -32.0;
            r0_w = r0_w + r2_z;
            r2_x = 0.0009765625 * r2_x + -32.0;
            r0_z = r0_z + r1_x;
            r1_x = r6_w;
            r2_y = 0.0009765625 * r2_y + -32.0;
            r0_x = r0_x + r2_w;
            r0_y = r0_y + r3_x;
            r0_w = r0_w + r2_x;
            r1_x = 0.0009765625 * r1_x + -32.0;
            r0_z = r0_z + r2_y;
            r0_x = r0_x + r0_y;
            r0_y = r0_w + r1_x;
            r0_x = r0_x + r0_z;
            r0_x = r0_x + r0_y;
            r0_x = 1.0 - r0_x;
            r0_x = r0_x + 32.0;
            r0_x = r0_x * 1024.0;
            r0_y = r1_y;
            r0_z = r1_z;
            r0_w = r1_w;
            blk = 127; break;
        }
        break;
        case 116:
        {
            r0_x = r0_x;
            r0_y = r4_z;
            r0_x = r0_x + 0.5;
            r0_x = inputPixSize.x * r0_x;
            sample122 = vec4(texture(coef, vec2(r0_x, r0_y)));
            r0_x = sample122.x;
            r0_y = sample122.y;
            r0_z = sample122.z;
            r0_w = sample122.w;
            r0_x = r0_x;
            r1_y = r0_y;
            r1_z = r0_z;
            r1_w = r0_w;
            r0_y = r1_y;
            r0_z = r1_z;
            r0_w = r1_w;
            blk = 127; break;
        }
        break;
        case 127:
        {
            blk = -1; break;
        }
        break;
        default: blk = -1; break;
        }
        if (blk < 0) break;
    }
    fragColor = vec4(r0_x, r0_y, r0_z, r0_w);
}
