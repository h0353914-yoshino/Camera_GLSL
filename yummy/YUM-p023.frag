#version 100
precision highp float;

uniform highp sampler2D texUnit0;
uniform highp sampler2D table;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample11;
    mediump vec4 sample13;
    mediump vec4 sample15;
    mediump vec4 sample17;
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
    highp float r2_w;
    highp float r2_x;
    highp float r2_y;
    highp float r2_z;
    highp float r63_x;
    samplePF0 = texture2D(texUnit0, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    r63_x = texCoord.x;
    r0_y = 0.5;
    r1_w = 0.5;
    r2_y = 0.5;
    r2_w = 0.5;
    r0_x = r0_z;
    r1_z = r0_w;
    r2_x = r1_x;
    r2_z = r1_y;
    sample11 = texture2D(table, vec2(r0_x, r0_y));
    hr0_x = sample11.x;
    sample13 = texture2D(table, vec2(r1_z, r1_w));
    hr0_y = sample13.x;
    sample15 = texture2D(table, vec2(r2_x, r2_y));
    hr0_z = sample15.x;
    sample17 = texture2D(table, vec2(r2_z, r2_w));
    hr0_w = sample17.x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
