import * as THREE from 'three';

export class CursorTrail {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.trailLength = 25;
    this.mouseHistory = [];
    this._vec = new THREE.Vector3();

    // Pre-allocate a pool of Vector3 objects to avoid clone() every frame
    this._pool = [];
    for (let i = 0; i < this.trailLength + 5; i++) {
      this._pool.push(new THREE.Vector3());
    }
    this._poolIndex = 0;
    
    const geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.trailLength * 3);
    this.sizes = new Float32Array(this.trailLength);

    for (let i = 0; i < this.trailLength; i++) {
      this.sizes[i] = (1 - (i / this.trailLength)) * 3; 
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#FEF7FF') } 
      },
      vertexShader: `
        attribute float size;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          gl_PointSize = size * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;
          gl_FragColor = vec4(color, (0.5 - ll) * 2.0);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, this.material);
    
    this.points.renderOrder = 999;
    this.scene.add(this.points);
    
    this.target = new THREE.Vector3(0, 0, -10);
    this.isMoving = false;
    
    window.addEventListener('mousemove', (e) => {
      this.isMoving = true;
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      
      this._vec.set(ndcX, ndcY, 0.5)
        .unproject(this.camera)
        .sub(this.camera.position)
        .normalize();

      const distance = (-10 - this.camera.position.z) / this._vec.z;
      this.target.copy(this.camera.position).add(this._vec.multiplyScalar(distance));
    });
  }

  update() {
    
    const isMobile = window.innerWidth <= 768 || window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) {
      this.points.visible = false;
      return;
    } else {
      this.points.visible = true;
    }

    if (!this.isMoving && this.mouseHistory.length > 0) {
       this.target.y -= 0.05;
    }
    this.isMoving = false; 

    // Reuse a pooled vector instead of cloning
    const pooled = this._pool[this._poolIndex];
    pooled.copy(this.target);
    this._poolIndex = (this._poolIndex + 1) % this._pool.length;
    this.mouseHistory.unshift(pooled);

    if (this.mouseHistory.length > this.trailLength) {
      this.mouseHistory.pop();
    }

    for (let i = 0; i < this.mouseHistory.length; i++) {
      this.positions[i * 3] = this.mouseHistory[i].x;
      this.positions[i * 3 + 1] = this.mouseHistory[i].y;
      this.positions[i * 3 + 2] = this.mouseHistory[i].z;
    }

    if (this.mouseHistory.length > 0) {
      const last = this.mouseHistory[this.mouseHistory.length - 1];
      for (let i = this.mouseHistory.length; i < this.trailLength; i++) {
        this.positions[i * 3] = last.x;
        this.positions[i * 3 + 1] = last.y;
        this.positions[i * 3 + 2] = last.z;
      }
    }
    
    this.points.geometry.attributes.position.needsUpdate = true;
  }
}
