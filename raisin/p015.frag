#version 100

precision highp float;

uniform highp sampler2D texUnit0;
varying highp vec4 texCoord0;
varying highp vec4 texCoord1;

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
    float pixelX = floor(params4.z * (rotatedX * inverseDepth) + params0.x + 0.5);
    float pixelY = floor(params4.z * (rotatedY * inverseDepth) + params0.y + 0.5);
    return vec2(((1.0 / 8192.0) * pixelX + params3.x) * params3.z,
                ((1.0 / 8192.0) * pixelY + params3.y) * params3.w);
}

void main()
{
    vec4 texels;
    texels.x = texture2D(texUnit0, correct(texCoord0.xy)).r;
    texels.y = texture2D(texUnit0, correct(texCoord0.zw)).r;
    texels.z = texture2D(texUnit0, correct(texCoord1.xy)).r;
    texels.w = texture2D(texUnit0, correct(texCoord1.zw)).r;

    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
