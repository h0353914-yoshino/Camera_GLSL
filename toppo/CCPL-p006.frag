#version 100
precision highp float;

uniform highp sampler2D texUnit1;
uniform highp sampler2D texUnit2;
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
    highp float r2_x;
    highp float r2_y;
    highp float r63_x;
    param;
    samplePF0 = texture2D(texUnit1, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    samplePF1 = texture2D(texUnit2, texCoord.xy);
    r1_z = samplePF1.x;
    r1_w = samplePF1.y;
    r2_x = samplePF1.z;
    r2_y = samplePF1.w;
    r63_x = texCoord.x;
    r0_x = param.x;
    r0_x = 1.0 - r0_x;
    r0_y = r1_z + -0.501960813999176;
    r1_z = r1_w + -0.501960813999176;
    r1_w = r2_x + -0.501960813999176;
    r2_x = r2_y + -0.501960813999176;
    r0_z = r0_z + -0.501960813999176;
    r0_w = r0_w + -0.501960813999176;
    r1_x = r1_x + -0.501960813999176;
    r1_y = r1_y + -0.501960813999176;
    r0_y = r0_y * param.x;
    r1_z = r1_z * param.x;
    r1_w = r1_w * param.x;
    r2_x = r2_x * param.x;
    r0_y = r0_x * r0_z + r0_y;
    r0_z = r0_x * r0_w + r1_z;
    r0_w = r0_x * r1_x + r1_w;
    r0_x = r0_x * r1_y + r2_x;
    hr0_y = r0_y + 0.501960813999176;
    hr0_x = r0_z + 0.501960813999176;
    hr0_w = r0_w + 0.501960813999176;
    hr0_z = r0_x + 0.501960813999176;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
