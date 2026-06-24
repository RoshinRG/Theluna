import * as THREE from 'three';

export class Starfield {
  constructor(scene) {
    this.scene = scene;
    
    // Dramatically reduce particle count on mobile for performance
    this.particleCount = window.innerWidth <= 768 ? 400 : 1500; 
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const phases = new Float32Array(this.particleCount); 

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4000;
      
      sizes[i] = Math.random() * 2.5 + 0.5; 
      phases[i] = Math.random() * Math.PI * 2; 
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#FEF7FF') } 
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        varying float vPhase;
        void main() {
          vPhase = phase;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          gl_PointSize = size * (2000.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying float vPhase;
        void main() {
          
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;

          float alpha = (0.5 - ll) * 2.0;

          float twinkle = sin(time * 1.5 + vPhase) * 0.5 + 0.5;
          
          alpha *= (0.2 + 0.8 * twinkle);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);
  }

  update(time) {
    this.material.uniforms.time.value = time;
    
    this.points.rotation.y = time * 0.02;
    this.points.rotation.x = time * 0.01;
  }
}
