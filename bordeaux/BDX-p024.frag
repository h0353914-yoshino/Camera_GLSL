#version 100
precision highp float;

uniform highp sampler2D samplerTexture;
uniform highp vec2 pixsize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample11;
    mediump vec4 sample13;
    mediump vec4 sample9;
    highp vec4 samplePF0;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    mediump float hr1_x;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    highp float r1_y;
    pixsize;
    samplePF0 = texture2D(samplerTexture, texCoord.xy);
    hr0_x = samplePF0.x;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = r0_z - pixsize.x;
    r0_y = r0_w - pixsize.y;
    r1_y = r0_w;
    r0_w = r0_y;
    r1_x = r0_x;
    sample9 = texture2D(samplerTexture, vec2(r0_x, r0_y));
    hr0_y = sample9.x;
    sample11 = texture2D(samplerTexture, vec2(r0_z, r0_w));
    hr0_z = sample11.x;
    sample13 = texture2D(samplerTexture, vec2(r1_x, r1_y));
    hr0_w = sample13.x;
    hr1_x = max(hr0_y, hr0_z);
    hr0_y = min(hr0_y, hr0_z);
    hr0_z = max(hr0_w, hr1_x);
    hr0_y = min(hr0_y, hr0_w);
    hr0_z = max(hr0_x, hr0_z);
    hr0_x = min(hr0_x, hr0_y);
    hr0_x = hr0_z - hr0_x;
    hr0_y = 0.0;
    hr0_z = 0.0;
    hr0_w = 0.0;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
