#version 100
#extension GL_OES_EGL_image_external : require
precision highp float;

uniform highp samplerExternalOES texUnit;
uniform highp vec4 translateParam;
uniform highp mat2 rotationParam;
uniform highp vec4 pixSize;
varying highp vec2 texCoord;

void main()
{
    bool p0;
    bool p1;
    highp vec4 sample35;
    highp vec4 sample40;
    mediump float hr0_w;
    mediump float hr0_x;
    mediump float hr0_y;
    mediump float hr0_z;
    highp float r0_w;
    highp float r0_x;
    highp float r0_y;
    highp float r0_z;
    highp float r1_w;
    highp float r1_x;
    highp float r1_y;
    highp float r1_z;
    highp float r2_x;
    highp float r2_y;
    highp float r2_z;
    translateParam;
    rotationParam;
    pixSize;
    r0_z = texCoord.x;
    r0_w = texCoord.y;
    r0_x = 0.0;
    r0_y = 2.0 * r0_z + 0.5;
    r0_z = 2.0 * r0_w + 0.5;
    r0_x = 0.0;
    r0_y = floor(r0_y);
    r0_z = floor(r0_z);
    hr0_x = r0_x;
    r0_x = 0.5 * r0_y + -0.5;
    r0_w = 0.5 * r0_z + (-translateParam.w);
    r0_z = 0.5 * r0_z + 0.0;
    r0_y = 0.5 * r0_y + 0.5;
    r0_x = r0_x - translateParam.z;
    r1_x = rotationParam[1][0] * r0_w;
    r0_w = rotationParam[1][1] * r0_w;
    r0_z = r0_z - translateParam.w;
    r1_x = rotationParam[0][0] * r0_x + r1_x;
    r0_x = rotationParam[0][1] * r0_x + r0_w;
    r0_y = r0_y - translateParam.z;
    r0_w = rotationParam[1][0] * r0_z;
    r1_x = r1_x + translateParam.x;
    r0_x = r0_x + translateParam.y;
    r0_z = rotationParam[1][1] * r0_z;
    r0_w = rotationParam[0][0] * r0_y + r0_w;
    r1_x = r1_x + translateParam.z;
    r1_y = r0_x + translateParam.w;
    r0_z = rotationParam[0][1] * r0_y + r0_z;
    r0_w = r0_w + translateParam.x;
    r0_x = r1_x * pixSize.x;
    r0_y = r1_y * pixSize.y;
    r0_z = r0_z + translateParam.y;
    r0_w = r0_w + translateParam.z;
    r2_x = hr0_x;
    hr0_x = hr0_x;
    r2_y = r0_z + translateParam.w;
    r0_z = r0_w * pixSize.x;
    sample35 = texture2D(texUnit, vec2(r0_x, r0_y));
    r1_x = sample35.x;
    r1_y = sample35.y;
    r1_z = sample35.z;
    r1_w = sample35.w;
    p0 = hr0_x == 1.0;
    r0_w = r2_y * pixSize.y;
    sample40 = texture2D(texUnit, vec2(r0_z, r0_w));
    r0_x = sample40.x;
    r0_y = sample40.y;
    r0_z = sample40.z;
    r0_w = sample40.w;
    r2_y = 0.0 * r1_w;
    r2_z = 0.0 * r1_w;
    r1_w = 0.0 * r1_w;
    r2_y = 0.0 * r1_z + r2_y;
    r2_z = 0.0 * r1_z + r2_z;
    r1_z = 0.0 * r1_z + r1_w;
    r1_w = 0.0 * r1_y + r2_y;
    r2_y = 0.0 * r1_y + r2_z;
    r1_z = 0.0 * r1_y + r1_z;
    r1_w = 0.0 * r1_x + r1_w;
    r2_y = 0.0 * r1_x + r2_y;
    r1_z = 0.0 * r1_x + r1_z;
    r1_x = (r2_x != 0.0) ? r1_w : r1_x;
    r1_y = (r2_x != 0.0) ? r2_y : r1_y;
    if (!p0)
    {
        r0_w = r0_x;
    }
    else
    {
        r1_z = 0.0 * r0_w;
        r1_w = 0.0 * r0_w;
        r0_w = 0.0 * r0_w;
        r1_z = 0.0 * r0_z + r1_z;
        r1_w = 0.0 * r0_z + r1_w;
        r0_z = 0.0 * r0_z + r0_w;
        r0_w = 0.0 * r0_y + r1_z;
        r1_z = 0.0 * r0_y + r1_w;
        r0_z = 0.0 * r0_y + r0_z;
        r0_w = 0.0 * r0_x + r0_w;
        r0_y = 0.0 * r0_x + r1_z;
        r0_x = 0.0 * r0_x + r0_z;
    }
    r0_x = 255.0 * r1_y + 0.5;
    r0_z = 255.0 * r1_x + 0.5;
    r0_y = 255.0 * r0_y + 0.5;
    r0_w = 255.0 * r0_w + 0.5;
    r0_x = floor(r0_x);
    r0_z = floor(r0_z);
    r0_y = floor(r0_y);
    r0_w = floor(r0_w);
    hr0_x = r0_x * 0.003921568859368563;
    hr0_y = r0_z * 0.003921568859368563;
    hr0_z = r0_y * 0.003921568859368563;
    hr0_w = r0_w * 0.003921568859368563;
    gl_FragColor = vec4(hr0_x, hr0_y, hr0_z, hr0_w);
}
