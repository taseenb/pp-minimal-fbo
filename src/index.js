const glslify = require('glslify');
const createBackground = require('./bg');
const FBO = require('./fbo');

// FBO shaders
const fboPositionVertex = glslify(__dirname + '/glsl/fboPosition.vert');
const fboPositionFragment = glslify(__dirname + '/glsl/fboPosition.frag');

// Particle shaders
const renderFragment = glslify(__dirname + '/glsl/render.frag');
const renderVertex = glslify(__dirname + '/glsl/render.vert');


class App {

  constructor(fboSize) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.fboSize = fboSize || 256;

    this.lastTime = 0; // time of the last animation frame

    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  init3dScene() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      // antialias: true,
      alpha: true
    });

    this.renderer.setSize(this.width, this.height);
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 1000);
    this.camera.position.z = 5;
    document.body.appendChild(this.renderer.domElement);
    this.controls = new THREE.OrbitControls(this.camera, document.body);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        datatexture: {type: 't', value: null},
        pointSize: {type: 'f', value: 1.4}
      },
      transparent: true,
      // blending: THREE.AdditiveBlending,
      vertexShader: renderVertex,
      fragmentShader: renderFragment
    });

    const geo = new THREE.PlaneBufferGeometry(1, 1, this.fboSize, this.fboSize);
    this.particles = new THREE.Points(geo, this.material);
    this.scene.add(this.particles);
  }

  initFBO() {
    this.positionFBO = new FBO(this.renderer, this.fboSize, fboPositionVertex, fboPositionFragment);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    this.stats.begin();
    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    if (delta > 1) delta = 1; // safety cap on large deltas
    this.lastTime = now;
    this.render(now, delta);
    this.stats.end();
  }

  render(now, delta) {
    this.positionFBO.update(now, delta);

    // Send FBO texture to shaders
    this.material.uniforms.datatexture.value = this.positionFBO.texture;

    this.particles.rotation.x += Math.PI / 180 * .1;
    this.particles.rotation.y -= Math.PI / 180 * .1;

    // Render the scene on the screen
    this.renderer.render(this.scene, this.camera);
  }

  initStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.dom.id = 'stats';
    document.getElementById('ui').appendChild(this.stats.dom);
  }

  initUI() {
    document.body.classList.remove('show-loader');
    document.body.classList.add('show-ui-btn');

    document.getElementById('ui-btn').addEventListener('click', (e) => {
      document.body.classList.toggle('show-ui');
    });

    this.initStats();
  }

  initBg() {
    this.background = createBackground();
    this.scene.add(this.background);
  }

  start() {
    this.init3dScene();
    this.initFBO();
    this.initUI();
    this.initBg();
    this.update();
  }

}

window.onload = () => {
  const app = new App(256);
  app.start();
};