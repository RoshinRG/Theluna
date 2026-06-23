import * as THREE from 'three';

export class ShootingStar {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 20; 
    this.stars = [];

    const geometry = new THREE.PlaneGeometry(60, 0.4);
    
    this.opacityArray = new Float32Array(this.starCount);
    geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(this.opacityArray, 1));

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = `
        attribute float instanceOpacity;
        varying float vInstanceOpacity;
      ` + shader.vertexShader.replace(
        `void main() {`,
        `void main() {\n  vInstanceOpacity = instanceOpacity;`
      );
      
      shader.fragmentShader = `
        varying float vInstanceOpacity;
      ` + shader.fragmentShader.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `vec4 diffuseColor = vec4( diffuse, opacity * vInstanceOpacity );`
      );
    };
    
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, this.starCount);
    
    // Initialize all instances off-screen
    const dummy = new THREE.Object3D();
    dummy.position.set(0, 0, -100);
    dummy.scale.set(0.001, 0.001, 0.001); // Tiny instead of 0 to avoid degenerate matrix
    dummy.updateMatrix();
    
    for (let i = 0; i < this.starCount; i++) {
      this.instancedMesh.setMatrixAt(i, dummy.matrix);
      this.opacityArray[i] = 0; 
      
      this.stars.push({
        index: i,
        isActive: false,
        progress: 0,
        speed: 0,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        nextSpawnTime: Math.random() * 5 
      });
    }
    
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedMesh);
    
    this.dummy = new THREE.Object3D();
  }

  update(time) {
    let needsUpdate = false;
    
    this.stars.forEach(star => {
      if (!star.isActive) {
        if (time > star.nextSpawnTime) {
          this.spawn(star);
        }
        return;
      }
      
      star.progress += star.speed;
      
      if (star.progress > 1) {
        star.isActive = false;
        this.opacityArray[star.index] = 0;
        needsUpdate = true;
        
        star.nextSpawnTime = time + Math.random() * 2.5 + 0.5; 
        return;
      }

      const x = THREE.MathUtils.lerp(star.startX, star.endX, star.progress);
      const y = THREE.MathUtils.lerp(star.startY, star.endY, star.progress);
      
      this.dummy.position.set(x, y, -100);
      this.dummy.rotation.z = star.angle;
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(star.index, this.dummy.matrix);

      const fade = Math.sin(star.progress * Math.PI) * 0.8;
      this.opacityArray[star.index] = fade;
      
      needsUpdate = true;
    });
    
    if (needsUpdate) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      this.instancedMesh.geometry.attributes.instanceOpacity.needsUpdate = true;
    }
  }
  
  spawn(star) {
    star.isActive = true;
    star.progress = 0;
    star.speed = Math.random() * 0.01 + 0.005; 

    star.startX = Math.random() * 600 - 100; 
    star.startY = Math.random() * 300 + 100; 
    
    star.endX = star.startX - (Math.random() * 300 + 200); 
    star.endY = star.startY - (Math.random() * 300 + 200);

    star.angle = Math.atan2(star.endY - star.startY, star.endX - star.startX);
  }
}
