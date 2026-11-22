#version 100
attribute highp vec4 vPosition;
attribute highp vec2 inTexCoord;
varying highp vec2 texCoord;
uniform highp vec4 params;

void main()
{
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_w;
    highp float r1_x;
    highp float r1_y;
    highp float r1_z;
    r0_x = vPosition.x;
    r0_y = vPosition.y;
    r0_z = vPosition.z;
    r0_w = vPosition.w;
    r1_x = inTexCoord.x;
    r1_y = inTexCoord.y;
    r1_x = r1_x - params.x;
    r1_y = r1_y * params.z;
    r1_x = r1_x * params.y;
    gl_Position = vec4(r0_x, r0_y, r0_z, r0_w);
    texCoord = vec2(r1_x, r1_y);
}
