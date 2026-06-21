import * as THREE from 'three';
import { Starfield } from './Starfield.js';
import { HeroMoon } from './HeroMoon.js';
import { Nebula } from './Nebula.js';
import { Sparkles } from './Sparkles.js';
import { ShootingStar } from './ShootingStar.js';
import { CursorTrail } from './CursorTrail.js';
import { BookCards } from './BookCards.js';

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

    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.initModulesAsync();
  }

  async initModulesAsync() {
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

    this.bookCards = new BookCards(this.scene);
    this.renderer.render(this.scene, this.camera);
    await delay();

    this.clock = new THREE.Clock();
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;

    if (this.starfield) this.starfield.update(time);
    if (this.heroMoon) this.heroMoon.update(time, this.camera);
    if (this.nebula) this.nebula.update(time);
    if (this.sparkles) this.sparkles.update(time);
    if (this.shootingStar) this.shootingStar.update(time);
    if (this.cursorTrail) this.cursorTrail.update();
    if (this.bookCards) this.bookCards.update(time, this.camera);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => new CosmicApp(), { timeout: 2000 });
    } else {
      new CosmicApp();
    }
  }, 100);
});
