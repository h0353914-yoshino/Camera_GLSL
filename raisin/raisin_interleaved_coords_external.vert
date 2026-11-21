#version 100

precision highp float;

attribute vec4 vPosition;
attribute vec4 inTexCoordX;
attribute vec4 inTexCoordY;

varying highp vec2 texCoord0;
varying highp vec2 texCoord1;

void main()
{
    gl_Position = vPosition;
    texCoord0 = vec2(inTexCoordX.y, inTexCoordY.y);
    texCoord1 = vec2(inTexCoordX.z, inTexCoordY.z);
}
