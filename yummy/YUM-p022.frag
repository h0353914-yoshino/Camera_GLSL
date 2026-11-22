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
    highp float r63_x;
    samplePF0 = texture2D(texUnit0, texCoord.xy);
    hr0_x = samplePF0.x;
    hr0_y = samplePF0.y;
    hr0_z = samplePF0.z;
    hr0_w = samplePF0.w;
    r63_x = texCoord.x;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
