#version 100
precision highp float;

attribute vec4 vPosition;
attribute vec2 inTexCoord;
varying vec2 texCoord;

void main()
{
    gl_Position = vPosition;
    texCoord = inTexCoord;
}
