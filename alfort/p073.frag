#version 100
precision mediump float;

uniform mediump sampler2D texUnit0;
uniform highp vec2 pixSize;
varying highp vec2 texCoord;

void main()
{
    highp vec4 left = texCoord.x + vec4(-7.0, -3.0, 1.0, 5.0) * pixSize.x;
    highp vec4 right = texCoord.x + vec4(-5.0, -1.0, 3.0, 7.0) * pixSize.x;
    highp float lowY = texCoord.y - pixSize.y;
    highp float highY = texCoord.y + pixSize.y;

    vec4 lowLeft = vec4(
        texture2D(texUnit0, vec2(left.x, lowY)).r,
        texture2D(texUnit0, vec2(left.y, lowY)).r,
        texture2D(texUnit0, vec2(left.z, lowY)).r,
        texture2D(texUnit0, vec2(left.w, lowY)).r
    );
    vec4 lowRight = vec4(
        texture2D(texUnit0, vec2(right.x, lowY)).r,
        texture2D(texUnit0, vec2(right.y, lowY)).r,
        texture2D(texUnit0, vec2(right.z, lowY)).r,
        texture2D(texUnit0, vec2(right.w, lowY)).r
    );
    vec4 highLeft = vec4(
        texture2D(texUnit0, vec2(left.x, highY)).r,
        texture2D(texUnit0, vec2(left.y, highY)).r,
        texture2D(texUnit0, vec2(left.z, highY)).r,
        texture2D(texUnit0, vec2(left.w, highY)).r
    );
    vec4 highRight = vec4(
        texture2D(texUnit0, vec2(right.x, highY)).r,
        texture2D(texUnit0, vec2(right.y, highY)).r,
        texture2D(texUnit0, vec2(right.z, highY)).r,
        texture2D(texUnit0, vec2(right.w, highY)).r
    );

    gl_FragColor = (((lowLeft + lowRight) + highLeft) + highRight) * 0.25;
}
