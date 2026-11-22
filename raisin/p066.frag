#version 100

precision highp float;

varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

uniform vec4 params0;
uniform vec4 params1;
uniform vec4 params2;
uniform vec4 params3;
uniform vec3 params4;
uniform vec2 inTexSize;
uniform mediump float texDumpMode;

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

vec4 correct()
{
    vec4 x = vec4(texCoord0.xz, texCoord1.xz) - params0.x;
    vec4 y = vec4(texCoord0.yw, texCoord1.yw) - params0.y;
    vec4 firstAxis = params0.w * x + params0.z * y;
    vec4 secondAxis = params0.z * x - params0.w * y;

    float depthOffset = params4.z * params1.y;
    float yOffset = params4.z * params1.z;
    vec4 rotatedDepth = params1.z * firstAxis + depthOffset;
    vec4 rotatedY = params1.y * firstAxis - yOffset;
    vec4 depth = params2.z * secondAxis + rotatedDepth * params2.y;
    vec4 rotatedX = params2.y * secondAxis - rotatedDepth * params2.z;
    vec4 inverseDepth = 1.0 / depth;
    vec4 pixels = floor(params4.z * (rotatedY * inverseDepth) + params0.y + 0.5);
    vec4 packedPosition = floor(clamp(pixels, -33554432.0, 33554432.0) * (1.0 / 16.0));
    return clamp(packedPosition + (params3.y - 0.5) * 256.0, 0.0, inTexSize.y * 256.0);
}

void main()
{
    gl_FragColor = encode(correct());
}
