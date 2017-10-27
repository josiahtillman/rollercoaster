#version 300 es
precision mediump float;

in vec3 L;
in vec3 H;
in vec3 N;

in vec4 SpecularColor;
in float SpecularExponent;
in vec4 Color;

out vec4 fColor;

uniform vec4 light_color;
uniform vec4 ambient_light;

void main()
{
    vec3 l = normalize(L);
    vec3 h = normalize(H);
    vec3 n = normalize(N);

    vec4 amb = Color * ambient_light; // ambient&diffuse properties for the light formula
    vec4 diff = max(dot(l,n), 0.0) * Color * light_color; // diffuse term of the light formula
    vec4 spec = SpecularColor * light_color * pow(max(dot(n,h), 0.0), SpecularExponent); // specular property of the light formula

    if(dot(l,n) < 0.0) {
        spec = vec4(0,0,0,1);
    }

//    fColor = amb;
    fColor = amb + diff + spec;
}