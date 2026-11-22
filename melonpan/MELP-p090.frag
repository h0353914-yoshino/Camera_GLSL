#version 100
precision highp float;

uniform highp sampler2D texUnit0;
uniform highp vec2 pixSize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample6;
    highp vec4 samplePF0;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    highp float r1_y;
    pixSize;
    samplePF0 = texture2D(texUnit0, texCoord.xy);
    r0_w = samplePF0.w;
    r1_x = texCoord.x;
    r1_y = texCoord.y;
    r0_x = r1_x + pixSize.x;
    r0_y = r1_y;
    sample6 = texture2D(texUnit0, vec2(r0_x, r0_y));
    r0_x = sample6.x;
    r0_y = sample6.y;
    r0_z = sample6.z;
    r0_w = 255.0 * r0_w + 0.5;
    r0_w = floor(r0_w);
    r0_x = 255.0 * r0_x + 0.5;
    r0_y = 255.0 * r0_y + 0.5;
    r0_z = 255.0 * r0_z + 0.5;
    r0_x = floor(r0_x);
    r0_y = floor(r0_y);
    r0_z = floor(r0_z);
    hr0_x = r0_w * 0.003921568859368563;
    hr0_y = r0_x * 0.003921568859368563;
    hr0_z = r0_y * 0.003921568859368563;
    hr0_w = r0_z * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
