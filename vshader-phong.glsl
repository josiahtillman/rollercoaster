#version 300 es

in vec4 vPosition;
in vec4 vAmbientDiffuseColor;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;

out vec3 L;
out vec3 H;
out vec3 N;

out vec4 AmbientDiffuseColor;
out vec4 SpecularColor;
out float SpecularExponent;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position;

void main() {
    vec4 veyepos = model_view*vPosition; // world to eye space

    // using .xyz is known as swizzling. Grabs the first three values in the vector
    vec3 L = normalize(light_position.xyz - veyepos.xyz); // light vector
    vec3 E = normalize(-veyepos.xyz); // vector pointing to camera
    vec3 H = normalize(L+E); // halfway vector
    vec3 N = normalize(model_view*vNormal).xyz; // normal vector

    AmbientDiffuseColor = vAmbientDiffuseColor;
    SpecularColor = vSpecularColor;
    SpecularExponent = vSpecularExponent;

    gl_Position = projection * veyepos;
}