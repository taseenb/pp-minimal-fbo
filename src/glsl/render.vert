uniform float time;
uniform float delta;
uniform float pointSize;

// texture containing the positions of each particle + alpha
uniform sampler2D datatexture;

varying float alpha;

void main() {

    // the mesh is a normalized square so the uvs = the xy positions of the vertices
    vec4 pos = texture2D(datatexture, position.xy).xyzw;
    alpha = pos.a;

    // pos now contains the position of a point in space that can be transformed
    // the 4th value must be 1.0, not the alpha value
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

    gl_PointSize = pointSize;
}