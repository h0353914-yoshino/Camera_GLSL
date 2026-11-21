#version 100

precision highp float;

uniform highp sampler2D texUnit0;
varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

uniform highp sampler2D texUnitLensParam;

uniform vec4 params0;
uniform vec4 params1;
uniform vec4 params2;
uniform vec4 params3;
uniform vec3 params4;

vec2 correct(vec2 p)
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
    float pixelX = floor(correction * projectedX + params0.x + 0.5);
    float pixelY = floor(correction * projectedY + params0.y + 0.5);
    return vec2(((1.0 / 8192.0) * pixelX + params3.x) * params3.z,
                ((1.0 / 8192.0) * pixelY + params3.y) * params3.w);
}

void main()
{
    vec4 texels;
    texels.x = texture2D(texUnit0, correct(texCoord0.xy)).a;
    texels.y = texture2D(texUnit0, correct(texCoord0.zw)).a;
    texels.z = texture2D(texUnit0, correct(texCoord1.xy)).a;
    texels.w = texture2D(texUnit0, correct(texCoord1.zw)).a;

    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
