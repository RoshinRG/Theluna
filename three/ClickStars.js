import * as THREE from 'three';

export class ClickStars {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.maxStars = 20; // max active clicks at once
    
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxStars * 3);
    this.birthTimes = new Float32Array(this.maxStars);
    
    // Initialize offscreen / inactive
    for (let i = 0; i < this.maxStars; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = 0;
      this.positions[i * 3 + 2] = -9999;
      this.birthTimes[i] = -9999;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('birthTime', new THREE.BufferAttribute(this.birthTimes, 1));
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#FFD37E') } // Gold color for click star
      },
      vertexShader: `
        attribute float birthTime;
        varying float vAge;
        uniform float time;
        void main() {
          vAge = time - birthTime;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Star grows quickly then stays and shrinks
          float scale = 0.0;
          if (vAge >= 0.0 && vAge < 2.0) {
            scale = sin(vAge * 3.14159 / 2.0) * 800.0; 
          }
          
          gl_PointSize = scale * (50.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAge;
        void main() {
          if (vAge < 0.0 || vAge > 2.0) discard;
          
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float d = length(xy);
          
          // Fades to exactly 0 at the edge of the particle quad
          float edgeFade = 1.0 - (d * 2.0); 
          if (edgeFade < 0.0) discard;
          
          // Cross rays
          float crossShape = min(abs(xy.x), abs(xy.y));
          float rays = 0.005 / (crossShape + 0.001);
          
          // Central glowing core
          float core = 0.015 / (d + 0.01);
          
          // Combine and apply the edge fade with a power curve for a sharp, elegant taper
          float star = (core + rays) * pow(edgeFade, 3.0);
          
          // Fade out over its 2 second lifespan
          float fade = 1.0 - (vAge / 2.0);
          float alpha = star * fade;
          
          gl_FragColor = vec4(color, alpha * 1.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.renderOrder = 999; // Render on top
    this.points.frustumCulled = false; // Prevent culling when points update
    this.scene.add(this.points);
    
    this._vec = new THREE.Vector3();
    this.currentIndex = 0;
    
    window.addEventListener('click', (e) => {
      // Desktop only check (removed pointer:coarse because it blocks touch laptops)
      if (window.innerWidth <= 768) return;
      this.spawnStar(e.clientX, e.clientY);
    });
  }
  
  spawnStar(clientX, clientY) {
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;
    
    this._vec.set(ndcX, ndcY, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();

    // Place it a bit in front of the camera, slightly further back than cursor trail (-10)
    const distance = (-25 - this.camera.position.z) / this._vec.z;
    const pos = this.camera.position.clone().add(this._vec.multiplyScalar(distance));
    
    const i = this.currentIndex;
    this.positions[i * 3] = pos.x;
    this.positions[i * 3 + 1] = pos.y;
    this.positions[i * 3 + 2] = pos.z;
    this.birthTimes[i] = this.material.uniforms.time.value; // set birth time to current time
    
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.birthTime.needsUpdate = true;
    
    this.currentIndex = (this.currentIndex + 1) % this.maxStars;
  }

  update(time) {
    this.material.uniforms.time.value = time;
  }
}
