#version 100
precision highp float;

uniform highp sampler2D texUnit0;
uniform highp float pixSize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample8;
    mediump vec4 sample9;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    mediump float hr1_w;
    mediump float hr1_x;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    pixSize;
    r0_z = pixSize;
    r0_w = texCoord.x;
    r1_x = texCoord.y;
    r0_x = (-0.5) * r0_z + r0_w;
    r0_y = r1_x;
    r0_z = 0.5 * r0_z + r0_w;
    r0_w = r1_x + 0.0;
    sample8 = texture2D(texUnit0, vec2(r0_z, r0_w));
    hr0_x = sample8.x;
    hr0_w = sample8.w;
    sample9 = texture2D(texUnit0, vec2(r0_x, r0_y));
    hr1_x = sample9.x;
    hr1_w = sample9.w;
    hr0_y = hr1_w;
    hr0_z = hr0_x;
    hr0_x = hr1_x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
