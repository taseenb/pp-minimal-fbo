uniform float time;
uniform float delta;
uniform sampler2D datatexture;

varying vec2 vUv;

const float PI = 3.14159265358979323846264;

//float rand(vec2 co){
//    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
//}
//#pragma glslify: snoise2 = require("glsl-noise/simplex/2d")
//#pragma glslify: snoise3 = require("glsl-noise/simplex/3d")
//#pragma glslify: snoise4 = require("glsl-noise/simplex/4d")
#pragma glslify: curlNoise = require("./curl-noise")
//#pragma glslify: snoise = require("./curl-noise")


void main() {

    // Get data from texture at the uv coord (passed from the vertex shader)
    vec4 pos = texture2D( datatexture, vUv );
    float alpha = pos.a;

    vec3 p = curlNoise(0.0018 * pos.xyz + time * 0.00015);
    p += p;
    p *= .5;

    gl_FragColor = vec4(p, alpha);

//    gl_FragColor = vec4(vec3(pos.xyz), pos.a);

}