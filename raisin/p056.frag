#version 100

precision highp float;

varying highp vec2 texCoord0;
varying highp vec2 texCoord1;

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
    return floor(params4.z * (rotatedY * inverseDepth) + params0.y + 0.5);
}

vec4 encode(vec2 packedPosition)
{
    if (texDumpMode == 1.0) {
        return floor(fract(packedPosition * (1.0 / 256.0)) * 256.0).xxyy * (1.0 / 255.0);
    } else if (texDumpMode == 2.0) {
        vec2 middle = floor(packedPosition * (1.0 / 256.0));
        return floor(fract(middle * (1.0 / 256.0)) * 256.0).xxyy * (1.0 / 255.0);
    } else {
        return floor(packedPosition * (1.0 / 65536.0)).xxyy * (1.0 / 255.0);
    }
}

void main()
{
    vec2 pixels = vec2(correct(texCoord0), correct(texCoord1));
    vec2 packedPosition = floor(clamp(pixels, -33554432.0, 33554432.0) * (1.0 / 32.0));
    packedPosition = clamp(packedPosition + (params3.y - 0.5) * 256.0,
                           0.0, inTexSize.y * 256.0);
    gl_FragColor = encode(packedPosition);
}
