#version 300 es
in highp vec4 vPosition;
in highp vec2 inTexCoord;
out highp vec2 texCoord;

void main()
{
    gl_Position = vPosition;
    texCoord = inTexCoord;
}
