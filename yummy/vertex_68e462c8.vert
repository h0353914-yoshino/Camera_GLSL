#version 100
attribute highp vec4 vPosition;
attribute highp vec2 inTexCoord;
varying highp vec2 texCoord;

void main()
{
    gl_Position = vPosition;
    texCoord = inTexCoord;
}
