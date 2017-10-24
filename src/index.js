const CCapture = require('ccapture.js')
const glslify = require('glslify')
const isMobile = require('ismobilejs')
const OrbitControls = require('three-orbit-controls')(THREE)
const Background = require('./bg/Bg')
const FBO = require('./fbo')

// FBO shaders
const fboPositionVertex = glslify('./glsl/fboPosition.vert')
const fboPositionFragment = glslify('./glsl/fboPosition.frag')

class App {
  constructor (fboSize) {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.fboSize = fboSize || 128 // size of texture 256 x 256 = 65K particles

    this.state = {
      paused: false,
      isMobile: isMobile.any
    }

    window.addEventListener('resize', this.onResize.bind(this), false)
  }

  init3dScene () {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })

    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.gammaInput = true
    this.renderer.gammaOutput = true
    this.renderer.physicallyCorrectLights = true
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 1000)
    this.camera.position.z = 6
    document.body.appendChild(this.renderer.domElement)
    this.controls = new OrbitControls(this.camera, document.body)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 1

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        datatexture: { type: 't', value: null },
        pointSize: { type: 'f', value: window.devicePixelRatio * 2 },
        opacity: { type: 'f', value: 0.0 }
      },
      transparent: true,
      // blending: THREE.AdditiveBlending,
      vertexShader: glslify('./glsl/render.vert'),
      fragmentShader: glslify('./glsl/render.frag')
    })

    const geo = new THREE.PlaneBufferGeometry(1, 1, this.fboSize, this.fboSize)
    this.particles = new THREE.Points(geo, this.material)
    this.particles.material.uniforms['opacity'].value = 0.075
    this.scene.add(this.particles)
  }

  initFBO () {
    this.positionFBO = new FBO(this.renderer, this.fboSize, fboPositionVertex, fboPositionFragment)
  }

  onResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  update () {
    window.requestAnimationFrame(this.update.bind(this))

    this.stats.begin()
    const now = window.performance.now()
    let delta = (now - this.lastTime) / 1000
    if (delta > 1) delta = 1 // safety cap on large deltas
    // this.lastTime = now
    this.render(now, delta)
    this.stats.end()
  }

  render (now, delta) {
    if (!this.state.paused) {
      // Send FBO texture to shaders
      this.positionFBO.update(now, delta)
      this.particles.material.uniforms.datatexture.value = this.positionFBO.texture
    }

    // Render the scene on the screen
    this.renderer.render(this.scene, this.camera)

    // Update autorotate
    this.controls.update()

    // Capture images
    if (this.capture) {
      this.capturer.capture(this.renderer.domElement)
    }
  }

  initStats () {
    this.stats = new window.Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.id = 'stats'
    document.getElementById('ui').appendChild(this.stats.dom)
  }

  initCapture () {
    this.capture = false
    this.capturer = new CCapture({
      // format: 'webm'
      format: 'png'
    })

    const btn = document.getElementById('captureBtn')

    btn.addEventListener('click', () => {
      this.capture = !this.capture
      if (this.capture) {
        btn.classList.remove('off')
        btn.classList.add('on')
        this.capturer.start()
      } else {
        btn.classList.remove('on')
        btn.classList.add('off')
        this.capturer.stop()
        this.capturer.save()
      }
    })
  }

  initUI () {
    document.body.classList.remove('show-loader')
    document.body.classList.add('show-ui-btn')

    document.getElementById('ui-btn').addEventListener('click', e => {
      document.body.classList.toggle('show-ui')
    })

    this.initStats()
    this.initCapture()
  }

  initBg () {
    this.background = new Background({
      colors: ['#39abb2', '#5b4169'],
      isMobile: isMobile.any
    })

    this.scene.add(this.background)

    return this
  }

  initKeyEvents () {
    document.body.addEventListener('keyup', e => {
      if (e.key === 'p' || e.key === 'P') {
        // Toggle pause
        this.state.paused = !this.state.paused
      }
    })
  }

  start () {
    this.init3dScene()
    this.initFBO()
    this.initUI()
    this.initBg()
    this.initKeyEvents()
    this.update()
  }
}

window.onload = () => {
  const fboSize = isMobile.any ? 128 : 256
  const app = new App(fboSize)
  app.start()
}
