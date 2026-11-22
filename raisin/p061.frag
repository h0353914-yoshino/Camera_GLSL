#version 300 es
precision highp float;

uniform highp sampler2D texUnit0;
in vec2 texCoord;
layout(location = 0) out vec4 FragColor;

void main()
{
    highp float red = texture(texUnit0, texCoord).r;
    FragColor = vec4(red, 0.0, 0.0, 0.0);
}
