#version 300 es

precision highp float;

uniform highp sampler2D texUnit0;
in highp vec4 texCoord0;
in highp vec4 texCoord1;

layout(location = 0) out highp vec4 FragColor;

void main()
{
    vec4 texels = vec4(texture(texUnit0, texCoord0.xy).a,
                      texture(texUnit0, texCoord0.zw).a,
                      texture(texUnit0, texCoord1.xy).a,
                      texture(texUnit0, texCoord1.zw).a);
    FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
