#version 100

precision highp float;

uniform highp sampler2D texUnit;
varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

void main()
{
    vec4 texels = vec4(texture2D(texUnit, texCoord0.xy).a,
                      texture2D(texUnit, texCoord0.zw).a,
                      texture2D(texUnit, texCoord1.xy).a,
                      texture2D(texUnit, texCoord1.zw).a);
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
