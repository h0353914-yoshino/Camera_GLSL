#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit0;
varying vec2 texCoord;
uniform highp float pixSize;

void main()
{
    gl_FragColor = vec4(
        texture2D(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0)).r,
        texture2D(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0)).g,
        texture2D(texUnit0, texCoord + vec2(0.5 * pixSize, 0.0)).r,
        texture2D(texUnit0, texCoord + vec2(0.5 * pixSize, 0.0)).g
    );
}
