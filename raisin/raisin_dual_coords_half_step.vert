#version 100
precision highp float;

attribute vec2 vPosition;
attribute vec2 inTexCoord;
uniform vec2 scale;
uniform vec2 offset;
uniform vec2 invRamin;
varying vec4 texCoord0;
varying vec4 texCoord1;

void main()
{
    const float inverseFixedPointScale = 1.0 / 4096.0;
    vec4 a = inTexCoord.xyxx + vec4(-2.0, -0.5, -1.0, 0.0);
    float b = inTexCoord.x + 1.0;
    a = a * scale.xyxx + offset.xyxx;
    b = b * scale.x + offset.x;
    a = (a * inverseFixedPointScale + 0.5) * invRamin.xyxx;
    b = (b * inverseFixedPointScale + 0.5) * invRamin.x;
    gl_Position = vec4(vPosition, 0.0, 1.0);
    texCoord0 = vec4(a.x, a.y, a.z, a.y);
    texCoord1 = vec4(a.w, a.y, b, a.y);
}
