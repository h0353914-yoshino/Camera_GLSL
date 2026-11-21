#version 100

precision highp float;

attribute vec2 vPosition;
attribute vec2 inTexCoord;

uniform vec2 scale;
uniform vec2 offset;
uniform vec2 invRamin;

varying highp vec4 texCoord;

void main()
{
    vec2 previousCoord = ((inTexCoord - vec2(2.0, 1.0)) * scale + offset);
    vec2 currentCoord = ((inTexCoord + vec2(0.0, -1.0)) * scale + offset);

    previousCoord = (previousCoord * (1.0 / 4096.0) + 0.5) * invRamin;
    currentCoord = (currentCoord * (1.0 / 4096.0) + 0.5) * invRamin;

    gl_Position = vec4(vPosition, 0.0, 1.0);
    texCoord = vec4(previousCoord, currentCoord);
}
