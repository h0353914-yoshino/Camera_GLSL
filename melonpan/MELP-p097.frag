#version 300 es
#extension GL_OES_EGL_image_external_essl3 : require
precision highp int;
precision highp float;

uniform highp samplerExternalOES texUnit0;
uniform highp vec2 pixSize;
in highp vec2 texCoord;
out mediump vec4 fragColor;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample9;
    highp vec4 samplePF0;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_w;
    highp float r1_x;
    highp float r1_y;
    highp float r1_z;
    highp float r2_x;
    highp float r2_y;
    pixSize;
    samplePF0 = texture(texUnit0, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    r1_z = texCoord.x;
    r1_w = texCoord.y;
    r0_x = 0.0;
    r1_z = r1_z + pixSize.x;
    r0_x = 0.0;
    hr0_x = r0_x;
    r0_x = hr0_x;
    sample9 = texture(texUnit0, vec2(r1_z, r1_w));
    r1_z = sample9.x;
    r1_w = sample9.y;
    r2_x = sample9.z;
    r2_y = sample9.w;
    hr0_x = float(int(hr0_x) & int(1.0));
    p0 = hr0_x == 1.0;
    r0_y = 0.0 * r1_y;
    r1_y = (r0_x != 0.0) ? 1.0 : r1_y;
    r0_y = 0.0 * r1_x + r0_y;
    r0_y = 0.0 * r0_w + r0_y;
    r0_y = 0.0 * r0_z + r0_y;
    r0_x = (r0_x != 0.0) ? r0_y : r1_x;
    if (!p0)
    {
        r0_y = r1_z;
    }
    else
    {
        r0_y = 0.0 * r2_y;
        r0_z = 0.0 * r2_y;
        r0_w = 0.0 * r2_y;
        r0_y = 0.0 * r2_x + r0_y;
        r0_z = 0.0 * r2_x + r0_z;
        r0_w = 0.0 * r2_x + r0_w;
        r0_y = 0.0 * r1_w + r0_y;
        r0_z = 0.0 * r1_w + r0_z;
        r0_w = 0.0 * r1_w + r0_w;
        r0_y = 0.0 * r1_z + r0_y;
        r1_w = 0.0 * r1_z + r0_z;
        r0_z = 0.0 * r1_z + r0_w;
    }
    r0_x = 255.0 * r0_x + 0.5;
    r0_z = 255.0 * r1_y + 0.5;
    r0_y = 255.0 * r0_y + 0.5;
    r0_w = 255.0 * r1_w + 0.5;
    r0_x = floor(r0_x);
    r0_z = floor(r0_z);
    r0_y = floor(r0_y);
    r0_w = floor(r0_w);
    hr0_x = r0_x * 0.003921568859368563;
    hr0_y = r0_z * 0.003921568859368563;
    hr0_z = r0_y * 0.003921568859368563;
    hr0_w = r0_w * 0.003921568859368563;
    fragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
