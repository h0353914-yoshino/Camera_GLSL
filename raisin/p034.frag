#version 100
#extension GL_OES_EGL_image_external : require

precision highp float;

uniform highp samplerExternalOES texUnit0;
varying highp vec2 texCoord0;
varying highp vec2 texCoord1;

void main()
{
    vec4 texels = vec4(texture2D(texUnit0, texCoord0).rg,
                      texture2D(texUnit0, texCoord1).rg);
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
