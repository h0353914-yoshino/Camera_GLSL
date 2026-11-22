#version 100
precision highp float;

uniform highp sampler2D texUnitCr;
uniform highp sampler2D texUnitCb;
uniform highp float pixWidth;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample10;
    highp vec4 sample7;
    highp vec4 sample8;
    highp vec4 sample9;
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
    highp float r1_z;
    pixWidth;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = r0_z - pixWidth;
    r0_y = r0_w;
    r0_z = r0_z + pixWidth;
    r0_w = r0_w + 0.0;
    sample7 = texture2D(texUnitCr, vec2(r0_z, r0_w));
    r1_x = sample7.z;
    sample8 = texture2D(texUnitCr, vec2(r0_x, r0_y));
    r1_y = sample8.z;
    sample9 = texture2D(texUnitCb, vec2(r0_x, r0_y));
    r1_z = sample9.z;
    sample10 = texture2D(texUnitCb, vec2(r0_z, r0_w));
    r0_z = sample10.z;
    r0_x = 255.0 * r1_x + 0.5;
    r0_y = 255.0 * r1_y + 0.5;
    r0_w = 255.0 * r1_z + 0.5;
    r0_z = 255.0 * r0_z + 0.5;
    r0_x = floor(r0_x);
    r0_y = floor(r0_y);
    r0_w = floor(r0_w);
    r0_z = floor(r0_z);
    hr0_x = r0_y * 0.003921568859368563;
    hr0_y = r0_w * 0.003921568859368563;
    hr0_z = r0_x * 0.003921568859368563;
    hr0_w = r0_z * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
