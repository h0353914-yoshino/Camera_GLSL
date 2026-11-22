#version 300 es
precision highp float;

uniform highp sampler2D texUnit0;
in vec2 texCoord;
layout(location = 0) out vec4 FragColor;
uniform highp float pixSize;

void main()
{
    vec4 l = texture(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0));
    vec4 r = texture(texUnit0, texCoord + vec2(0.5 * pixSize, 0.0));
    FragColor = vec4(l.ra, r.ra);
}
