import * as THREE from 'three';
import { Starfield } from './Starfield.js';
import { HeroMoon } from './HeroMoon.js';
import { Nebula } from './Nebula.js';
import { Sparkles } from './Sparkles.js';
import { ShootingStar } from './ShootingStar.js';
import { CursorTrail } from './CursorTrail.js';
class CosmicApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      5000
    );
    this.camera.position.z = 100; 

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,      
      antialias: true   
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.modules = [];

    this.scrollY = window.scrollY;
    this.targetCameraY = 0;
    
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      this.targetCameraY = -this.scrollY * 0.05; 
    });

    this._boundResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._boundResize);

    this._boundAnimate = this.animate.bind(this);

    this._prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedMotion = this._prefersReducedMotion.matches;
    this._prefersReducedMotion.addEventListener('change', (e) => {
      this._reducedMotion = e.matches;
    });
    
    document.addEventListener('visibilitychange', () => {
      if (!this.clock) return;
      if (document.hidden) {
        this.clock.stop();
      } else {
        this.clock.start();
        this.animate();
      }
    });

    this.initModulesAsync();
  }

  async initModulesAsync() {
    try {
      const delay = () => new Promise(res => setTimeout(res, 30));

      this.starfield = new Starfield(this.scene);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.heroMoon = new HeroMoon(this.scene);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.nebula = new Nebula(this.scene);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.sparkles = new Sparkles(this.scene);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.shootingStar = new ShootingStar(this.scene);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.cursorTrail = new CursorTrail(this.scene, this.camera);
      this.renderer.render(this.scene, this.camera);
      await delay();

      this.clock = new THREE.Clock();
      this.animate();
    } catch (err) {
      console.error('[CosmicApp] Module init failed:', err);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (document.hidden) return;
    
    if (this._reducedMotion) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    requestAnimationFrame(this._boundAnimate);

    const time = this.clock.getElapsedTime();

    this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;
    this.camera.updateMatrixWorld();

    if (this.starfield) this.starfield.update(time);
    if (this.heroMoon) this.heroMoon.update(time, this.camera);
    if (this.nebula) this.nebula.update(time);
    if (this.sparkles) this.sparkles.update(time);
    if (this.shootingStar) this.shootingStar.update(time);
    if (this.cursorTrail) this.cursorTrail.update();

    this.renderer.render(this.scene, this.camera);
  }
}

let appStarted = false;

const startApp = () => {
  if (appStarted) return;
  appStarted = true;
  
  const canvas = document.getElementById('webgl-canvas');
  if (canvas) {
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 2s ease-in-out';
  }
  
  new CosmicApp();
  
  if (canvas) {
    setTimeout(() => {
      canvas.style.opacity = '1';
    }, 100);
  }
};

const interactions = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'];
interactions.forEach(e => {
  window.addEventListener(e, startApp, { once: true, passive: true });
});

// If document is already loaded, we don't need a massive 4.5s delay, just 500ms
if (document.readyState === 'complete') {
  setTimeout(startApp, 500);
} else {
  setTimeout(startApp, 4500);
  window.addEventListener('load', startApp);
}
