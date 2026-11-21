#version 300 es
precision highp float;

in vec4 texCoord0;
in vec4 texCoord1;
uniform vec2 inTexSize;
uniform mediump int texDumpMode;
layout(location = 0) out vec4 FragColor;

void main()
{
    float size = inTexSize.y;
    vec4 position = vec4(texCoord0.yw, texCoord1.yw) * size - 0.5;
    position = max(position, 0.0);
    if (texDumpMode == 1) {
        FragColor = floor(fract(position) * 256.0) * (1.0 / 255.0);
    } else if (texDumpMode == 2) {
        FragColor = floor(fract(position * (1.0 / 256.0)) * 256.0) * (1.0 / 255.0);
    } else {
        FragColor = floor(position * (1.0 / 256.0)) * (1.0 / 255.0);
    }
}
