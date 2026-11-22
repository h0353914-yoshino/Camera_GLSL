#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit0;
uniform highp float pixSize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample17;
    highp vec4 sample19;
    highp vec4 sample23;
    highp vec4 sample24;
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
    pixSize;
    r2_x = texCoord.x;
    r0_z = texCoord.y;
    r0_x = pixSize;
    r2_y = 0.0;
    r0_y = r0_z + 0.0;
    r0_w = r0_z;
    r1_x = (-1.5) * r0_x + r2_x;
    r1_z = (-0.5) * r0_x + r2_x;
    r1_w = 0.5 * r0_x + r2_x;
    r1_y = r0_z;
    r0_z = r1_x;
    r1_x = r1_z;
    r1_z = r1_w;
    r1_w = r0_y;
    r0_x = 1.5 * r0_x + r2_x;
    r3_x = 0.0;
    sample17 = texture2D(texUnit0, vec2(r0_z, r0_w));
    r2_x = sample17.x;
    r2_y = sample17.y;
    r2_z = sample17.z;
    r2_w = sample17.w;
    sample19 = texture2D(texUnit0, vec2(r1_x, r1_y));
    r0_z = sample19.x;
    r0_w = sample19.y;
    r1_x = sample19.z;
    r1_y = sample19.w;
    hr0_x = r3_x;
    sample23 = texture2D(texUnit0, vec2(r1_z, r1_w));
    r3_x = sample23.x;
    r3_y = sample23.y;
    r3_z = sample23.z;
    r3_w = sample23.w;
    sample24 = texture2D(texUnit0, vec2(r0_x, r0_y));
    r4_x = sample24.x;
    r4_y = sample24.y;
    r4_z = sample24.z;
    r4_w = sample24.w;
    r0_x = hr0_x;
    hr0_x = hr0_x;
    p0 = hr0_x == 1.0;
    r0_y = 0.0 * r2_w;
    r1_y = 0.0 * r1_y;
    r0_y = 0.0 * r2_z + r0_y;
    r1_z = 0.0 * r3_w;
    r1_x = 0.0 * r1_x + r1_y;
    r1_y = 0.0 * r3_z + r1_z;
    r0_y = 0.0 * r2_y + r0_y;
    r0_w = 0.0 * r0_w + r1_x;
    r1_x = 0.0 * r3_y + r1_y;
    r0_y = 0.0 * r2_x + r0_y;
    r0_w = 0.0 * r0_z + r0_w;
    r1_x = 0.0 * r3_x + r1_x;
    r0_y = (r0_x != 0.0) ? r0_y : r2_x;
    r0_z = (r0_x != 0.0) ? r0_w : r0_z;
    r0_x = (r0_x != 0.0) ? r1_x : r3_x;
    hr0_x = r0_y;
    hr0_y = r0_z;
    hr0_z = r0_x;
    if (p0)
    {
        r0_x = 0.0 * r4_w;
        r0_x = 0.0 * r4_z + r0_x;
        r0_x = 0.0 * r4_y + r0_x;
        r4_x = 0.0 * r4_x + r0_x;
    }
    hr0_w = r4_x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
