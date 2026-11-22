#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit0;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 samplePF0;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_x;
    highp float r1_y;
    highp float r63_x;
    samplePF0 = texture2D(texUnit0, texCoord.xy);
    r0_z = samplePF0.x;
    r0_w = samplePF0.y;
    r1_x = samplePF0.z;
    r1_y = samplePF0.w;
    r63_x = texCoord.x;
    r0_x = r0_z;
    r0_x = 255.0 * r0_x + 0.5;
    r0_y = 255.0 * r0_w + 0.5;
    r0_z = 255.0 * r1_x + 0.5;
    r0_w = 255.0 * r1_y + 0.5;
    r0_x = floor(r0_x);
    r0_y = floor(r0_y);
    r0_z = floor(r0_z);
    r0_w = floor(r0_w);
    hr0_x = r0_x * 0.003921568859368563;
    hr0_y = r0_y * 0.003921568859368563;
    hr0_z = r0_z * 0.003921568859368563;
    hr0_w = r0_w * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
