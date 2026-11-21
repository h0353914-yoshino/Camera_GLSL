#version 300 es
precision highp float;

in vec2 vPosition;
in vec2 inTexCoord;
out vec2 texCoord;

void main()
{
    gl_Position = vec4(vPosition, 0.0, 1.0);
    texCoord = inTexCoord;
}
