#version 100
precision highp float;

uniform highp sampler2D texYY;
uniform highp vec4 mapOffset;
uniform highp vec4 params;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample11;
    highp vec4 sample12;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    mapOffset;
    params;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = params.x;
    r0_y = params.y + r0_z;
    r0_z = r0_w * mapOffset.z;
    r0_w = (-1.5) * r0_x + r0_y;
    r0_x = 1.5 * r0_x + r0_y;
    r1_x = r0_z;
    r0_w = r0_w * params.z;
    r0_y = r0_x * params.z;
    sample11 = texture2D(texYY, vec2(r0_y, r0_z));
    r0_z = sample11.z;
    sample12 = texture2D(texYY, vec2(r0_w, r1_x));
    r0_w = sample12.z;
    r0_x = r0_z * 0.3333333432674408;
    r0_y = 255.0 * r0_z + 0.5;
    r1_x = r0_w * 0.3333333432674408;
    r0_x = 0.6666666269302368 * r0_w + r0_x;
    r0_z = 0.6666666269302368 * r0_z + r1_x;
    r0_w = 255.0 * r0_w + 0.5;
    r0_y = floor(r0_y);
    r0_x = 255.0 * r0_x + 0.5;
    r0_z = 255.0 * r0_z + 0.5;
    r0_w = floor(r0_w);
    r0_x = floor(r0_x);
    r0_z = floor(r0_z);
    hr0_x = r0_w * 0.003921568859368563;
    hr0_y = r0_x * 0.003921568859368563;
    hr0_z = r0_z * 0.003921568859368563;
    hr0_w = r0_y * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
