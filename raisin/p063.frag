#version 300 es
precision highp float;

uniform highp sampler2D texUnit0;
in vec2 texCoord;
layout(location = 0) out vec4 FragColor;
uniform highp float pixSize;

void main()
{
    float s0 = texture(texUnit0, texCoord - vec2(1.5 * pixSize, 0.0)).r;
    float s1 = texture(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0)).r;
    float s2 = texture(texUnit0, texCoord + vec2(0.5 * pixSize, 0.0)).r;
    float s3 = texture(texUnit0, texCoord + vec2(1.5 * pixSize, 0.0)).r;
    FragColor = vec4(s0, s1, s2, s3);
}
