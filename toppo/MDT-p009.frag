#version 100
precision highp float;

uniform highp sampler2D texUnit0;
uniform highp vec2 texParam;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample14;
    mediump vec4 sample16;
    mediump vec4 sample18;
    mediump vec4 sample20;
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
    highp float r2_z;
    texParam;
    r0_z = texParam.x;
    r0_w = texCoord.x;
    r1_x = texCoord.y;
    r0_x = r0_z * 1.5;
    r0_y = r0_z * 0.5;
    r0_z = r1_x + 0.0;
    r1_y = texParam.y * r0_w + (-r0_x);
    r1_z = texParam.y * r0_w + (-r0_y);
    r0_y = texParam.y * r0_w + r0_y;
    r2_x = r1_x;
    r1_w = r1_y;
    r1_y = r1_z;
    r1_z = r1_x;
    r2_y = r0_y;
    r2_z = r0_z;
    r0_y = texParam.y * r0_w + r0_x;
    sample14 = texture2D(texUnit0, vec2(r1_w, r2_x));
    hr0_x = sample14.x;
    sample16 = texture2D(texUnit0, vec2(r1_y, r1_z));
    hr0_y = sample16.x;
    sample18 = texture2D(texUnit0, vec2(r2_y, r2_z));
    hr0_z = sample18.x;
    sample20 = texture2D(texUnit0, vec2(r0_y, r0_z));
    hr0_w = sample20.x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
