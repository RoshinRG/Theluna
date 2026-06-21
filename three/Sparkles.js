import * as THREE from 'three';

export class Sparkles {
  constructor(scene) {
    this.scene = scene;
    this.count = 150; 
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const speeds = new Float32Array(this.count);
    
    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800; 
      positions[i * 3 + 1] = (Math.random() - 0.5) * 800; 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; 
      
      speeds[i] = Math.random() * 0.2 + 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#D5CABD') } 
      },
      vertexShader: `
        attribute float speed;
        varying float vSpeed;
        uniform float time;
        void main() {
          vSpeed = speed;
          vec3 pos = position;

          float yOffset = mod(pos.y + time * speed * 50.0, 800.0) - 400.0;
          pos.y = yOffset;

          pos.x += sin(time * 2.0 + pos.y * 0.05) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (100.0 / -mvPosition.z) * (speed * 6.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        void main() {
          
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float ll = length(xy);
          if (ll > 0.5) discard;

          float alpha = pow((0.5 - ll) * 2.0, 2.0); 
          gl_FragColor = vec4(color, alpha * 0.8);
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
  }
}
