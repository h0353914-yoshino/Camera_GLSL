#version 100
#extension GL_OES_EGL_image_external : require

precision highp float;

uniform samplerExternalOES texUnit;
varying highp vec4 texCoord;

vec2 fetch(vec2 uv)
{
    return texture2D(texUnit, uv).rg;
}

void main()
{
    vec4 texels = vec4(fetch(texCoord.xy), fetch(texCoord.zw));
    gl_FragColor = floor(texels * 255.0 + 0.5) * (1.0 / 255.0);
}
