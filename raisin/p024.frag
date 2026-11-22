#version 100
#extension GL_OES_EGL_image_external : require

precision highp float;

uniform highp samplerExternalOES texUnit;
varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

void main()
{
    vec4 texels = vec4(texture2D(texUnit, texCoord0.xy).r,
                      texture2D(texUnit, texCoord0.zw).r,
                      texture2D(texUnit, texCoord1.xy).r,
                      texture2D(texUnit, texCoord1.zw).r);
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
