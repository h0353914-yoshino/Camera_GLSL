#version 100
precision highp float;

uniform highp sampler2D texUnitKK;
uniform highp sampler2D texUnitYK;
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
    samplePF0 = texture2D(texUnitYK, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    samplePF1 = texture2D(texUnitKK, texCoord.xy);
    r1_z = samplePF1.x;
    r1_w = samplePF1.y;
    r2_x = samplePF1.z;
    r2_y = samplePF1.w;
    r63_x = texCoord.x;
    r0_x = max(r0_z, r1_z);
    r0_y = max(r0_w, r1_w);
    r0_z = max(r1_x, r2_x);
    r0_w = max(r1_y, r2_y);
    hr0_x = r0_x;
    hr0_y = r0_y;
    hr0_z = r0_z;
    hr0_w = r0_w;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
