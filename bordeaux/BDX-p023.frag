#version 100
precision highp float;

uniform highp sampler2D texImage;
uniform highp vec2 texCoordOffset;
uniform highp vec2 texCoordScaleFactor;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    mediump vec4 sample6;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    texCoordOffset;
    texCoordScaleFactor;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = r0_z + texCoordOffset.x;
    r0_y = r0_w + texCoordOffset.y;
    r0_x = r0_x * texCoordScaleFactor.x;
    r0_y = r0_y * texCoordScaleFactor.y;
    sample6 = texture2D(texImage, vec2(r0_x, r0_y));
    hr0_x = sample6.x;
    hr0_y = sample6.y;
    hr0_z = sample6.z;
    hr0_w = sample6.w;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
