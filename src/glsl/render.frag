varying float alpha;

void main() {
    gl_FragColor = vec4(vec3(1.0), alpha * 0.075);
}
