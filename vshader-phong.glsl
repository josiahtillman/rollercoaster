#version 300 es

in vec4 vPosition;
in vec4 vNormal;
in vec4 vSpecularColor;
in float vSpecularExponent;
in vec4 vColor;

out vec3 N;
out vec3 redL;
out vec3 redH;
out vec3 greenL;
out vec3 greenH;
out vec3 blueL;
out vec3 blueH;
out vec3 whiteL;
out vec3 whiteH;

out vec4 SpecularColor;
out float SpecularExponent;
out vec4 Color;

uniform mat4 model_view;
uniform mat4 projection;
uniform vec4 light_position[4];

void main() {
    vec4 veyepos = model_view*vPosition; // world to eye space

    // using .xyz is known as swizzling. Grabs the first three values in the vector
    vec3 E = normalize(-veyepos.xyz); // vector pointing to camera
    N = normalize(model_view*vNormal).xyz; // normal vector
    redL = normalize(light_position[0].xyz - veyepos.xyz); // light vector
    redH = normalize(redL+E); // halfway vector
    greenL = normalize(light_position[1].xyz - veyepos.xyz); // light vector
    greenH = normalize(greenL+E); // halfway vector
    blueL = normalize(light_position[2].xyz - veyepos.xyz); // light vector
    blueH = normalize(blueL+E); // halfway vector
    whiteL = normalize(light_position[3].xyz - veyepos.xyz); // light vector
    whiteH = normalize(whiteL+E); // halfway vector

    SpecularColor = vSpecularColor;
    SpecularExponent = vSpecularExponent;
    Color = vColor;

    gl_Position = projection * veyepos;
}