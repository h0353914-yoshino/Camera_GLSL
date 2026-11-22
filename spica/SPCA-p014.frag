#version 300 es
precision highp int;
precision highp float;

uniform highp sampler2D texImage;
uniform highp usampler2D estImage;
in highp vec2 texCoord;
out highp uvec4 fragColor;

float rndne(float x)
{
    float f = floor(x + 0.5);
    return (f - x == 0.5 && mod(f, 2.0) != 0.0) ? f - 1.0 : f;
}

void main()
{
    bool p0;
    bool p1;
    highp vec4 samplePF0;
    highp vec4 samplePF1;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    mediump float hr1_w;
    mediump float hr1_x;
    mediump float hr1_y;
    mediump float hr1_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    highp float r1_y;
    highp float r63_x;
    samplePF0 = texture(texImage, texCoord.xy);
    hr0_x = samplePF0.x;
    hr0_y = samplePF0.y;
    hr0_z = samplePF0.z;
    hr0_w = samplePF0.w;
    samplePF1 = vec4(texture(estImage, texCoord.xy));
    r0_z = samplePF1.x;
    r0_w = samplePF1.y;
    r1_x = samplePF1.z;
    r1_y = samplePF1.w;
    r63_x = texCoord.x;
    r0_x = r0_z - 32768.0;
    r0_y = r0_w - 32768.0;
    r0_z = r1_x - 32768.0;
    r0_w = r1_y - 32768.0;
    r0_x = r0_x;
    r0_y = r0_y;
    r0_z = r0_z;
    r0_w = r0_w;
    hr1_x = r0_x * 0.0078125;
    hr1_y = r0_y * 0.0078125;
    hr1_z = r0_z * 0.0078125;
    hr1_w = r0_w * 0.0078125;
    hr0_x = (-255.0) * hr0_x + hr1_x;
    hr0_y = (-255.0) * hr0_y + hr1_y;
    hr0_z = (-255.0) * hr0_z + hr1_z;
    hr0_w = (-255.0) * hr0_w + hr1_w;
    hr0_x = rndne(hr0_x);
    hr0_y = rndne(hr0_y);
    hr0_z = rndne(hr0_z);
    hr0_w = rndne(hr0_w);
    hr0_x = max(hr0_x, -255.0);
    hr0_y = max(hr0_y, -255.0);
    hr0_z = max(hr0_z, -255.0);
    hr0_w = max(hr0_w, -255.0);
    hr0_x = min(hr0_x, 255.0);
    hr0_y = min(hr0_y, 255.0);
    hr0_z = min(hr0_z, 255.0);
    hr0_w = min(hr0_w, 255.0);
    hr0_x = hr0_x + 256.0;
    hr0_y = hr0_y + 256.0;
    hr0_z = hr0_z + 256.0;
    hr0_w = hr0_w + 256.0;
    hr0_x = float(int(hr0_x));
    hr0_y = float(int(hr0_y));
    hr0_z = float(int(hr0_z));
    hr0_w = float(int(hr0_w));
    r0_x = hr0_x;
    r0_y = hr0_y;
    r0_z = hr0_z;
    r0_w = hr0_w;
    fragColor = uvec4(uint(r0_x), uint(r0_y), uint(r0_z), uint(r0_w));
}
