#version 300 es

in vec4 vPosition;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;
in vec4 vColor;

out vec3 L;
out vec3 H;
out vec3 N;

out vec4 SpecularColor;
out float SpecularExponent;
out vec4 Color;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position;

void main() {
    vec4 veyepos = model_view*vPosition; // world to eye space

    // using .xyz is known as swizzling. Grabs the first three values in the vector
    L = normalize(light_position.xyz - veyepos.xyz); // light vector
    vec3 E = normalize(-veyepos.xyz); // vector pointing to camera
    H = normalize(L+E); // halfway vector
    N = normalize(model_view*vNormal).xyz; // normal vector

    SpecularColor = vSpecularColor;
    SpecularExponent = vSpecularExponent;
    Color = vColor;

    gl_Position = projection * veyepos;
}