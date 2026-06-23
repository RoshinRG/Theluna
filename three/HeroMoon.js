import * as THREE from 'three';

export class HeroMoon {
  constructor(scene) {
    this.scene = scene;
    this.domElement = document.querySelector('.moon');

    const geometry = new THREE.SphereGeometry(1, 32, 32);

    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load('assets/moon_1024.jpg');

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('#FEF7FF') }, 
        color2: { value: new THREE.Color('#9B89B3') }, 
        fresnelBias: { value: 0.1 },
        fresnelScale: { value: 1.0 },
        fresnelPower: { value: 2.5 },
        tDiffuse: { value: moonTexture }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float fresnelBias;
        uniform float fresnelScale;
        uniform float fresnelPower;
        uniform sampler2D tDiffuse;
        
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        varying vec2 vUv;
        
        void main() {
          
          vec4 texColor = texture2D(tDiffuse, vUv);

          float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

          vec3 baseColor = mix(color2 * 0.4, color1, luminance * 0.85);

          float f = fresnelBias + fresnelScale * pow(1.0 - dot(vNormal, -vPositionNormal), fresnelPower);

          vec3 finalColor = mix(baseColor, color1, f * 0.6);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this._vec = new THREE.Vector3();
    this._pos = new THREE.Vector3();
  }

  update(time, camera) {
    if (!this.domElement) return;
    const rect = this.domElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    this.mesh.rotation.y += 0.002;

    if (camera) {
      this.matchDOMPosition(camera, rect);
    }
  }

  matchDOMPosition(camera, rect) {
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const width = rect.width;

    const ndcX = (x / window.innerWidth) * 2 - 1;
    const ndcY = -(y / window.innerHeight) * 2 + 1;

    const distance = -20; 

    this._vec.set(ndcX, ndcY, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    
    const distanceToPlane = (distance - camera.position.z) / this._vec.z;
    this._pos.copy(camera.position).add(this._vec.multiplyScalar(distanceToPlane));
    
    this.mesh.position.copy(this._pos);

    const depth = camera.position.z - distance;
    const vFov = camera.fov * Math.PI / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * depth;
    const visibleWidth = visibleHeight * camera.aspect;
    
    const widthIn3D = (width / window.innerWidth) * visibleWidth;

    this.mesh.scale.setScalar(widthIn3D / 2);
  }
}
