#version 300 es
in highp vec4 vPosition;
in highp vec2 inTexCoord;
out highp vec2 texCoord;
uniform highp mat4 orthoMatrix;

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
    r1_x = orthoMatrix[3][0] * r0_w;
    r1_y = orthoMatrix[3][1] * r0_w;
    r1_z = orthoMatrix[3][2] * r0_w;
    r0_w = orthoMatrix[3][3] * r0_w;
    r1_x = orthoMatrix[2][0] * r0_z + r1_x;
    r1_y = orthoMatrix[2][1] * r0_z + r1_y;
    r1_z = orthoMatrix[2][2] * r0_z + r1_z;
    r0_z = orthoMatrix[2][3] * r0_z + r0_w;
    r0_w = orthoMatrix[1][0] * r0_y + r1_x;
    r1_x = orthoMatrix[1][1] * r0_y + r1_y;
    r1_y = orthoMatrix[1][2] * r0_y + r1_z;
    r1_z = orthoMatrix[1][3] * r0_y + r0_z;
    r0_z = orthoMatrix[0][0] * r0_x + r0_w;
    r0_w = orthoMatrix[0][1] * r0_x + r1_x;
    r1_x = orthoMatrix[0][2] * r0_x + r1_y;
    r1_y = orthoMatrix[0][3] * r0_x + r1_z;
    gl_Position = vec4(r0_x, r0_y, r0_z, r0_w);
    texCoord = vec2(r1_x, r1_y);
}
