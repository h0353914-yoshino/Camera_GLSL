#version 100

precision highp float;

attribute vec4 vPosition;
attribute vec4 inTexCoordX;
attribute vec4 inTexCoordY;

varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

void main()
{
    gl_Position = vPosition;
    texCoord0 = vec4(inTexCoordX.x, inTexCoordY.x, inTexCoordX.y, inTexCoordY.y);
    texCoord1 = vec4(inTexCoordX.z, inTexCoordY.z, inTexCoordX.w, inTexCoordY.w);
}
