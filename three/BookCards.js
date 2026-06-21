import * as THREE from 'three';

export class BookCards {
  constructor(scene) {
    this.scene = scene;
    this.cards = document.querySelectorAll('#books .glass-card');
    this.meshes = [];

    const geometry = new THREE.PlaneGeometry(1, 1, 16, 16);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#B0A8B9') },
        resolution: { value: new THREE.Vector2(1, 1) },
        radius: { value: 28.0 }
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
        uniform vec3 color;
        uniform vec2 resolution;
        uniform float radius;
        varying vec2 vUv;
        
        void main() {
          
          vec2 pixelPos = vUv * resolution;
          vec2 halfRes = resolution * 0.5;
          vec2 d = abs(pixelPos - halfRes) - (halfRes - radius);
          float dist = length(max(d, 0.0));
          float alphaMask = 1.0 - smoothstep(radius - 1.0, radius + 1.0, dist);
          
          if (alphaMask <= 0.01) discard;

          float edgeX = pow(abs(vUv.x - 0.5) * 2.0, 8.0);
          float edgeY = pow(abs(vUv.y - 0.5) * 2.0, 8.0);
          float edge = max(edgeX, edgeY);

          float alpha = edge * 0.6; 
          gl_FragColor = vec4(color, alpha * alphaMask);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.cards.forEach((card, index) => {
      const mesh = new THREE.Mesh(geometry, material.clone());
      this.scene.add(mesh);
      
      this.meshes.push({
        domElement: card,
        mesh: mesh,
        baseYOffset: Math.random() * Math.PI * 2, 
        isHovered: false,
        targetRotationX: 0,
        targetRotationY: 0
      });

      card.addEventListener('mouseenter', () => {
        this.meshes[index].isHovered = true;
      });
      
      card.addEventListener('mouseleave', () => {
        this.meshes[index].isHovered = false;
        this.meshes[index].targetRotationX = 0;
        this.meshes[index].targetRotationY = 0;
      });
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        this.meshes[index].targetRotationY = x * 0.15;
        this.meshes[index].targetRotationX = y * 0.15;
      });
    });
  }

  update(time, camera) {
    this.meshes.forEach(item => {
      const rect = item.domElement.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        item.mesh.visible = false;
        return;
      }
      item.mesh.visible = true;
      
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const ndcX = (x / window.innerWidth) * 2 - 1;
      const ndcY = -(y / window.innerHeight) * 2 + 1;
      
      const distance = -30; 
      
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      vec.sub(camera.position).normalize();
      
      const distanceToPlane = (distance - camera.position.z) / vec.z;
      const pos = camera.position.clone().add(vec.multiplyScalar(distanceToPlane));
      
      item.mesh.position.copy(pos);

      if (!item.isHovered) {
        item.mesh.position.y += Math.sin(time * 1.5 + item.baseYOffset) * 0.3;
      }

      const depth = camera.position.z - distance;
      const vFov = camera.fov * Math.PI / 180;
      const visibleHeight = 2 * Math.tan(vFov / 2) * depth;
      const visibleWidth = visibleHeight * camera.aspect;
      
      const widthIn3D = (rect.width / window.innerWidth) * visibleWidth;
      const heightIn3D = (rect.height / window.innerHeight) * visibleHeight;
      
      item.mesh.scale.set(widthIn3D, heightIn3D, 1);

      item.mesh.rotation.x += (item.targetRotationX - item.mesh.rotation.x) * 0.1;
      item.mesh.rotation.y += (item.targetRotationY - item.mesh.rotation.y) * 0.1;
      
      item.mesh.material.uniforms.time.value = time;
      item.mesh.material.uniforms.resolution.value.set(rect.width, rect.height);
    });
  }
}
