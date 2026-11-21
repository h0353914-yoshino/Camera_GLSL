#version 100
precision mediump float;

uniform mediump sampler2D texUnit0;
uniform highp vec2 pixSize;
varying highp vec2 texCoord;

void main()
{
    highp vec2 topLeft = texCoord - pixSize;
    highp vec2 bottomRight = texCoord + pixSize;

    mediump vec4 right = texture2D(texUnit0, bottomRight)
        + texture2D(texUnit0, vec2(bottomRight.x, topLeft.y));
    mediump vec4 left = texture2D(texUnit0, topLeft)
        + texture2D(texUnit0, vec2(topLeft.x, bottomRight.y));

    gl_FragColor = vec4(
        left.r + left.g,
        left.b + left.a,
        right.r + right.g,
        right.b + right.a
    ) * 0.25;
}
