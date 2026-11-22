#version 100

precision highp float;

varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

uniform highp sampler2D texUnitLensParam;

uniform vec4 params0;
uniform vec4 params1;
uniform vec4 params2;
uniform vec4 params3;
uniform vec3 params4;
uniform vec2 inTexSize;
uniform mediump float texDumpMode;

float correct(vec2 p)
{
    float x = p.x - params0.x;
    float y = p.y - params0.y;
    float firstAxis = params0.w * x + params0.z * y;
    float secondAxis = params0.z * x - params0.w * y;
    float depthOffset = params4.z * params1.y;
    float yOffset = params4.z * params1.z;
    float rotatedDepth = params1.z * firstAxis + depthOffset;
    float rotatedY = params1.y * firstAxis - yOffset;
    float depth = params2.z * secondAxis + rotatedDepth * params2.y;
    float rotatedX = params2.y * secondAxis - rotatedDepth * params2.z;
    float inverseDepth = 1.0 / depth;
    float projectedX = (rotatedX * inverseDepth) * params4.z;
    float projectedY = (rotatedY * inverseDepth) * params4.z;
    float radius = length(vec2(projectedX, projectedY)) * params2.w;
    float tablePosition = radius * params1.w;
    float tableFraction = fract(tablePosition);
    float tableColumn = (tablePosition - tableFraction + 0.5) * params4.x;
    vec2 lens = texture2D(texUnitLensParam, vec2(tableColumn, 0.5)).ra;
    float interpolatedRadius = tableFraction * lens.y + lens.x;
    const float smallestNormalFloat = 1.1754943508222875e-38;
    float correction = (interpolatedRadius * (1.0 / (radius + smallestNormalFloat)))
        * (1.0 / params4.y);
    return floor(correction * projectedX + params0.x + 0.5);
}

vec4 pack(vec4 pixels)
{
    vec4 packedPosition = floor(clamp(pixels, -33554432.0, 33554432.0) * (1.0 / 32.0));
    return clamp(packedPosition + (params3.x - 0.5) * 256.0, 0.0, inTexSize.x * 256.0);
}

vec4 encode(vec4 packedPosition)
{
    if (texDumpMode == 1.0) {
        return floor(fract(packedPosition * (1.0 / 256.0)) * 256.0) * (1.0 / 255.0);
    } else if (texDumpMode == 2.0) {
        vec4 middle = floor(packedPosition * (1.0 / 256.0));
        return floor(fract(middle * (1.0 / 256.0)) * 256.0) * (1.0 / 255.0);
    } else {
        return floor(packedPosition * (1.0 / 65536.0)) * (1.0 / 255.0);
    }
}

void main()
{
    vec4 pixels;
    pixels.x = correct(texCoord0.xy);
    pixels.y = correct(texCoord0.zw);
    pixels.z = correct(texCoord1.xy);
    pixels.w = correct(texCoord1.zw);
    gl_FragColor = encode(pack(pixels));
}
