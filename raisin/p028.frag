#version 100

precision highp float;

uniform vec2 texSize;
uniform mediump float texDumpMode;

varying highp vec4 texCoord;

float lane(float p)
{
    float code;
    if (texDumpMode == 1.0) {
        code = floor(fract(p) * 256.0);
    } else if (texDumpMode == 2.0) {
        code = floor(fract(p * (1.0 / 256.0)) * 256.0);
    } else {
        code = floor(p * (1.0 / 256.0));
    }
    return floor(255.0 * (code * (1.0 / 255.0)) + 0.5) * (1.0 / 255.0);
}

void main()
{
    float size = texSize.y;
    vec2 position = clamp(texCoord.yw * size - 0.5, 0.0, size);
    float a = lane(position.x);
    float b = lane(position.y);
    gl_FragColor = vec4(a, a, b, b);
}
