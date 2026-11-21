#version 100
precision mediump float;

uniform mediump sampler2D texUnit;
uniform highp vec4 params1;
uniform highp vec4 params2;
uniform mediump vec4 pixSize;
varying highp vec2 texCoord;

void main()
{
    vec4 texel = texture2D(texUnit, texCoord);
    vec4 quantized = floor(texel * 255.0 + 0.5);
    highp vec4 x = quantized;
    highp vec4 squared = x * x;
    highp vec4 cubed = x * squared;
    highp vec4 fourth = x * cubed;
    highp vec4 adjustment = params1.x * fourth + params1.y * cubed;
    adjustment = params1.z * squared + adjustment;
    adjustment = params1.w * x + adjustment;
    highp vec4 corrected = clamp(adjustment + params2.x, 0.0, 255.75);
    vec4 packedValue = floor(corrected * 4.0 + 0.5);
    vec4 scaled = floor(packedValue * pixSize.w);
    gl_FragColor = min(scaled, 255.0) * 0.0039215087890625;
}
