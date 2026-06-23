import * as THREE from 'three';

export class Nebula {
  constructor(scene) {
    this.scene = scene;

    const geometry = new THREE.PlaneGeometry(5000, 5000);
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#1A0F30') }, 
        color2: { value: new THREE.Color('#503780') }, 
        color3: { value: new THREE.Color('#968D84') }  
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
        
        float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100.0);
          mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
          for (int i = 0; i < 4; ++i) {
            v += a * noise(p);
            p = rot * p * 2.0 + shift;
            a *= 0.5;
          }
          return v;
        }
        
        void main() {
          vec2 p = vUv * 3.0; 

          float q = fbm(p - time * 0.02);
          float r = fbm(p + q + time * 0.05);

          vec3 col = mix(color1, color2, r);
          col = mix(col, color3, q * 0.5);

          float alpha = r * 1.0;
          gl_FragColor = vec4(col, alpha); 
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    
    this.mesh.position.z = -500;
    this.scene.add(this.mesh);
  }

  update(time) {
    this.material.uniforms.time.value = time;
  }
}
