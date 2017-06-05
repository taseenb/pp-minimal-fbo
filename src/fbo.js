class FBO {

  constructor (renderer, size, vertexShader, fragmentShader) {
    if (!renderer || !size || !vertexShader || !fragmentShader) {
      throw 'Error: missing arguments.'
    }

    this.size = size
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.renderer = renderer

    this.init()
  }

  init () {
    // Create the render target
    this.renderTarget = new THREE.WebGLRenderTarget(this.size, this.size, {
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: ( /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ) ? THREE.HalfFloatType : THREE.FloatType,
      stencilBuffer: false
    })
    this.scene = new THREE.Scene()
    this.camera = new THREE.Camera()
    this.texture = this.renderTarget.texture

    // Texture
    const data = new Float32Array(this.size * this.size * 4)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.size * (Math.random() - .5) // x
      data[i + 1] = this.size * (Math.random() - .5) // y
      data[i + 2] = this.size * (Math.random() - .5) // z
      data[i + 3] = Math.random() // ALPHA
    }
    const datatexture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType)
    datatexture.needsUpdate = true

    // Material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        datatexture: {type: 't', value: datatexture},
        time: {type: 'f', value: 0},
        delta: {type: 'f', value: 0}
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    })

    // Create 2 triangles mesh
    const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2, 1, 1), this.material)
    this.scene.add(mesh)
  }

  update (now, delta) {
    this.material.uniforms.time.value = now
    this.material.uniforms.delta.value = delta

    this.renderer.render(this.scene, this.camera, this.renderTarget, true)
  }
}

module.exports = FBO
