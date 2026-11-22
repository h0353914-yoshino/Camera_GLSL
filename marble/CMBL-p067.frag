#version 100
precision highp float;

uniform highp sampler2D texUnitCr;
uniform highp sampler2D texUnitCb;
uniform highp vec4 params;
uniform highp float pixWidth;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample11;
    highp vec4 sample12;
    highp vec4 sample13;
    highp vec4 sample14;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    params;
    pixWidth;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = params.y + r0_z;
    r0_y = r0_w * params.x;
    r0_z = r0_x - pixWidth;
    r0_x = r0_x + pixWidth;
    r0_w = r0_y;
    r0_z = r0_z * params.z;
    r0_x = r0_x * params.z;
    sample11 = texture2D(texUnitCr, vec2(r0_x, r0_y));
    r1_x = sample11.x;
    sample12 = texture2D(texUnitCb, vec2(r0_x, r0_y));
    r0_x = sample12.x;
    sample13 = texture2D(texUnitCr, vec2(r0_z, r0_w));
    r0_y = sample13.x;
    sample14 = texture2D(texUnitCb, vec2(r0_z, r0_w));
    r0_z = sample14.x;
    r0_w = 255.0 * r1_x + 0.5;
    r0_x = 255.0 * r0_x + 0.5;
    r0_y = 255.0 * r0_y + 0.5;
    r0_z = 255.0 * r0_z + 0.5;
    r0_w = floor(r0_w);
    r0_x = floor(r0_x);
    r0_y = floor(r0_y);
    r0_z = floor(r0_z);
    hr0_x = r0_y * 0.003921568859368563;
    hr0_y = r0_z * 0.003921568859368563;
    hr0_z = r0_w * 0.003921568859368563;
    hr0_w = r0_x * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
