const glslify = require('glslify')

const vert = glslify('./glsl/bg.vert')
const frag = glslify('./glsl/bg.frag')

/**
 * Creates a background
 * See: https://github.com/mattdesl/three-vignette-background (thanks @mattdesl)
 * @param opt
 * @returns {Mesh}
 */
function createBackground (opt) {
  opt = opt || {}

  const geometry = opt.geometry || new THREE.PlaneBufferGeometry(2, 2, 1)
  const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  const material = new THREE.RawShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.DoubleSide,
    uniforms: {
      aspectCorrection: {type: 'i', value: false},
      aspect: {type: 'f', value: 1},
      grainScale: {type: 'f', value: 0.00001},
      grainTime: {type: 'f', value: 0},
      noiseAlpha: {type: 'f', value: 0.3},
      offset: {type: 'v2', value: new THREE.Vector2(0, 0)},
      scale: {type: 'v2', value: new THREE.Vector2(1, 1)},
      smoother: {type: 'v2', value: new THREE.Vector2(0.0, orientation === 'landscape' ? 0.5 : 0.9)},
      // color1: { type: 'c', value: new THREE.Color('#e66314') },
      // color1: { type: 'c', value: new THREE.Color('#ce6f13') },
      color2: {type: 'c', value: new THREE.Color('#39abb2')},
      color1: {type: 'c', value: new THREE.Color('#5b4169')}
    },
    depthTest: false
  })

  function style (opt) {
    opt = opt || {}
    if (Array.isArray(opt.colors)) {
      const colors = opt.colors.map(function (c) {
        if (typeof c === 'string' || typeof c === 'number') {
          return new THREE.Color(c)
        }
        return c
      })
      material.uniforms.color1.value.copy(colors[0])
      material.uniforms.color2.value.copy(colors[1])
    }
    if (typeof opt.aspect === 'number') {
      material.uniforms.aspect.value = opt.aspect
    }
    if (typeof opt.grainScale === 'number') {
      material.uniforms.grainScale.value = opt.grainScale
    }
    if (typeof opt.grainTime === 'number') {
      material.uniforms.grainTime.value = opt.grainTime
    }
    if (opt.smooth) {
      const smooth = fromArray(opt.smooth, THREE.Vector2)
      material.uniforms.smooth.value.copy(smooth)
    }
    if (opt.offset) {
      const offset = fromArray(opt.offset, THREE.Vector2)
      material.uniforms.offset.value.copy(offset)
    }
    if (typeof opt.noiseAlpha === 'number') {
      material.uniforms.noiseAlpha.value = opt.noiseAlpha
    }
    if (typeof opt.scale !== 'undefined') {
      let scale = opt.scale
      if (typeof scale === 'number') {
        scale = [scale, scale]
      }
      scale = fromArray(scale, THREE.Vector2)
      material.uniforms.scale.value.copy(scale)
    }
    if (typeof opt.aspectCorrection !== 'undefined') {
      material.uniforms.aspectCorrection.value = Boolean(opt.aspectCorrection)
    }
  }

  function fromArray (array, VectorType) {
    if (Array.isArray(array)) {
      return new VectorType().fromArray(array)
    }
    return array
  }

  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.style = style
  if (opt) mesh.style(opt)

  return mesh
}

module.exports = createBackground
