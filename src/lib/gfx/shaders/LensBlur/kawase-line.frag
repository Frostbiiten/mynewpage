in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uOffset;
uniform vec2 uGamma; // x = gamma, y = invGamma

vec4 toLinearPremul(vec4 c)
{
    float a = c.a;
    vec3 rgb = c.rgb;
    if (a > 0.0) rgb /= a;
    rgb = pow(rgb, vec3(uGamma.x));
    if (a > 0.0) rgb *= a;
    return vec4(rgb, a);
}

vec4 toGammaPremul(vec4 c)
{
    float a = c.a;
    vec3 rgb = c.rgb;
    if (a > 0.0) rgb /= a;
    rgb = pow(max(rgb, vec3(0.0)), vec3(uGamma.y));
    if (a > 0.0) rgb *= a;
    return vec4(rgb, a);
}

void main(void)
{
    vec2 o = uOffset;

    vec4 c0 = toLinearPremul(texture(uTexture, vTextureCoord - o));
    vec4 c1 = toLinearPremul(texture(uTexture, vTextureCoord + o));

    vec4 color = 0.5 * (c0 + c1);

    finalColor = toGammaPremul(color);
}
