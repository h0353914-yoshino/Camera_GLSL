#version 100

precision highp float;

uniform highp sampler2D texUnit;
varying highp vec4 texCoord;

void main()
{
    vec4 texels = vec4(texture2D(texUnit, texCoord.xy).ra,
                      texture2D(texUnit, texCoord.zw).ra);
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
