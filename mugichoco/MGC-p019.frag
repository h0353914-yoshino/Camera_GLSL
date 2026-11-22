#version 100
precision highp float;

uniform highp sampler2D texUnit0;
uniform highp float pixSize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample13;
    mediump vec4 sample15;
    mediump vec4 sample17;
    mediump vec4 sample19;
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
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = pixSize;
    r0_y = r0_w + 0.0;
    r1_x = r0_w;
    r1_y = (-1.5) * r0_x + r0_z;
    r1_z = (-0.5) * r0_x + r0_z;
    r1_w = 0.5 * r0_x + r0_z;
    r2_y = r0_w;
    r0_w = r1_y;
    r2_x = r1_z;
    r1_y = r1_w;
    r1_z = r0_y;
    r0_x = 1.5 * r0_x + r0_z;
    sample13 = texture2D(texUnit0, vec2(r0_w, r1_x));
    hr0_x = sample13.x;
    sample15 = texture2D(texUnit0, vec2(r2_x, r2_y));
    hr0_y = sample15.x;
    sample17 = texture2D(texUnit0, vec2(r1_y, r1_z));
    hr0_z = sample17.x;
    sample19 = texture2D(texUnit0, vec2(r0_x, r0_y));
    hr0_w = sample19.x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
