#version 300 es
precision mediump float;

in vec3 N;
in vec3 redL;
in vec3 redH;
in vec3 greenL;
in vec3 greenH;
in vec3 blueL;
in vec3 blueH;
in vec3 whiteL;
in vec3 whiteH;

in vec4 SpecularColor;
in float SpecularExponent;
in vec4 Color;

out vec4 fColor;

uniform vec4 light_color[4];
uniform vec4 ambient_light;

void main()
{
    vec3 N = normalize(N);
    vec3 redL = normalize(redL);
    vec3 redH = normalize(redH);
    vec3 greenL = normalize(greenL);
    vec3 greenH = normalize(greenH);
    vec3 blueL = normalize(blueL);
    vec3 blueH = normalize(blueH);
    vec3 whiteL = normalize(whiteL);
    vec3 whiteH = normalize(whiteH);

    vec4 amb = Color * ambient_light; // ambient&diffuse properties for the light formula
    // red
    vec4 diff = max(dot(redL, N), 0.0) * Color * light_color[0]; // diffuse term of the light formula
    vec4 spec = SpecularColor * light_color[0] * pow(max(dot(N, redH), 0.0), SpecularExponent); // specular property of the light formula
    // green
    diff = diff + (max(dot(greenL, N), 0.0) * Color * light_color[1]);
    spec = spec + (SpecularColor * light_color[1] * pow(max(dot(N, greenH), 0.0), SpecularExponent));
    // blue
    diff = diff + (max(dot(blueL, N), 0.0) * Color * light_color[2]);
    spec = spec + (SpecularColor * light_color[2] * pow(max(dot(N, blueH), 0.0), SpecularExponent));
    // white
    diff = diff + (max(dot(whiteL, N), 0.0) * Color * light_color[3]);
    spec = spec + (SpecularColor * light_color[3] * pow(max(dot(N, whiteH), 0.0), SpecularExponent));

    fColor = amb + diff + spec;
}