varying float alpha;
uniform float opacity;

void main() {
    // float a = alpha * 0.075;
    float a = alpha * opacity;

    gl_FragColor = vec4(vec3(1.0), a);
}
