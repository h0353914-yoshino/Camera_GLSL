#version 100
precision mediump float;

uniform mediump sampler2D texUnit0;
uniform highp float pixSize;
varying highp vec2 texCoord;

void main()
{
    gl_FragColor = vec4(
        texture2D(texUnit0, texCoord - vec2(1.5 * pixSize, 0.0)).r,
        texture2D(texUnit0, texCoord - vec2(0.5 * pixSize, 0.0)).r,
        texture2D(texUnit0, texCoord + vec2(0.5 * pixSize, 0.0)).r,
        texture2D(texUnit0, texCoord + vec2(1.5 * pixSize, 0.0)).r
    );
}
