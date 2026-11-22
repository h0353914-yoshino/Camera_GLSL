#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit1;
uniform highp samplerExternalOES texUnit2;
uniform highp vec4 param;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 samplePF0;
    highp vec4 samplePF1;
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
    highp float r63_x;
    param;
    samplePF0 = texture2D(texUnit2, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    samplePF1 = texture2D(texUnit1, texCoord.xy);
    r1_z = samplePF1.x;
    r1_w = samplePF1.y;
    r2_x = samplePF1.z;
    r2_y = samplePF1.w;
    r63_x = texCoord.x;
    r0_x = 0.0;
    r0_x = 0.0;
    r0_y = 0.0 * r2_y;
    r2_z = 0.0 * r2_y;
    r2_w = 0.0 * r2_y;
    r2_y = (r0_x != 0.0) ? 1.0 : r2_y;
    r0_y = 0.0 * r2_x + r0_y;
    r2_z = 0.0 * r2_x + r2_z;
    r2_w = 0.0 * r2_x + r2_w;
    r0_y = 0.0 * r1_w + r0_y;
    r2_z = 0.0 * r1_w + r2_z;
    r2_w = 0.0 * r1_w + r2_w;
    r0_y = 0.0 * r1_z + r0_y;
    r2_z = 0.0 * r1_z + r2_z;
    r2_w = 0.0 * r1_z + r2_w;
    r0_y = (r0_x != 0.0) ? r0_y : r1_z;
    r1_z = (r0_x != 0.0) ? r2_z : r1_w;
    r0_x = (r0_x != 0.0) ? r2_w : r2_x;
    r2_x = r0_z;
    r0_z = param.x;
    r1_w = r2_x * param.x;
    r0_w = r0_w * param.x;
    r1_x = r1_x * param.x;
    r0_z = 1.0 - r0_z;
    r1_y = r1_y * param.x;
    hr0_x = r0_y * r0_z + r1_w;
    hr0_y = r0_z * r1_z + r0_w;
    hr0_z = r0_x * r0_z + r1_x;
    hr0_w = r0_z * r2_y + r1_y;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
