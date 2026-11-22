#version 300 es
precision highp float;

in vec2 texCoord0;
in vec2 texCoord1;
uniform vec2 inTexSize;
uniform mediump int texDumpMode;
layout(location = 0) out vec4 FragColor;

void main()
{
    float size = inTexSize.y;
    vec2 position = vec2(texCoord0.y, texCoord1.y) * size - 0.5;
    position = clamp(position, 0.0, size);
    vec2 upperPosition = position * (1.0 / 256.0);
    vec2 code;

    if (texDumpMode == 1) {
        code = floor(fract(position) * 256.0);
    } else if (texDumpMode == 2) {
        code = floor(fract(upperPosition) * 256.0);
    } else {
        code = floor(upperPosition);
    }

    FragColor = code.xxyy * (1.0 / 255.0);
}
