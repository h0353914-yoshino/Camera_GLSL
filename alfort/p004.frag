#version 100
#extension GL_OES_EGL_image_external : require
precision mediump float;

uniform mediump samplerExternalOES texUnit0;
uniform highp vec2 pixSize;
varying highp vec2 texCoord;

void main()
{
    highp vec2 topLeft = texCoord - pixSize;
    highp vec2 bottomRight = texCoord + pixSize;

    vec4 left = texture2D(texUnit0, topLeft)
        + texture2D(texUnit0, vec2(topLeft.x, bottomRight.y));
    vec4 right = texture2D(texUnit0, vec2(bottomRight.x, topLeft.y))
        + texture2D(texUnit0, bottomRight);

    gl_FragColor = vec4(
        left.g + left.r,
        left.b + left.a,
        right.r + right.g,
        right.b + right.a
    ) * 0.25;
}
