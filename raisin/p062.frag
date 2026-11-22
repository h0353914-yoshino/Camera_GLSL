#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit0;
varying vec2 texCoord;

void main()
{
    mediump vec4 c = vec4(0.0);
    c.r = texture2D(texUnit0, texCoord).r;
    gl_FragColor = c;
}
