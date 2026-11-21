#version 100
precision mediump float;

uniform mediump sampler2D texUnit0;
uniform highp vec2 pixSize;
varying highp vec2 texCoord;

void main()
{
    gl_FragColor = vec4(
        texture2D(texUnit0, vec2(texCoord.x - pixSize.y, texCoord.y)).r,
        texture2D(texUnit0, vec2(texCoord.x - pixSize.x, texCoord.y)).r,
        texture2D(texUnit0, vec2(texCoord.x + pixSize.x, texCoord.y)).r,
        texture2D(texUnit0, vec2(texCoord.x + pixSize.y, texCoord.y)).r
    );
}
