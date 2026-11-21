#version 300 es

precision highp float;

layout(location = 0) in vec4 vPosition;
layout(location = 1) in vec4 inTexCoordX;
layout(location = 2) in vec4 inTexCoordY;

out highp vec2 texCoord0;
out highp vec2 texCoord1;

void main()
{
    gl_Position = vPosition;
    texCoord0 = vec2(inTexCoordX.y, inTexCoordY.y);
    texCoord1 = vec2(inTexCoordX.z, inTexCoordY.z);
}
