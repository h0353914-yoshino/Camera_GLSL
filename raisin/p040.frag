#version 100
#extension GL_OES_EGL_image_external : require

precision highp float;

uniform highp samplerExternalOES texUnit0;
varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

void main()
{
    vec4 texels = vec4(texture2D(texUnit0, texCoord0.xy).g,
                      texture2D(texUnit0, texCoord0.zw).g,
                      texture2D(texUnit0, texCoord1.xy).g,
                      texture2D(texUnit0, texCoord1.zw).g);
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
