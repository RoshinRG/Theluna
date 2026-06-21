import * as THREE from 'three';

export class ShootingStar {
  constructor(scene) {
    this.scene = scene;
    this.starCount = 20; 
    this.stars = [];

    const geometry = new THREE.PlaneGeometry(60, 0.4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    for (let i = 0; i < this.starCount; i++) {
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.position.z = -100;
      this.scene.add(mesh);
      
      this.stars.push({
        mesh: mesh,
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
  }

  update(time) {
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
        star.mesh.material.opacity = 0;
        
        star.nextSpawnTime = time + Math.random() * 2.5 + 0.5; 
        return;
      }

      const x = THREE.MathUtils.lerp(star.startX, star.endX, star.progress);
      const y = THREE.MathUtils.lerp(star.startY, star.endY, star.progress);
      star.mesh.position.set(x, y, -100);

      const fade = Math.sin(star.progress * Math.PI);
      star.mesh.material.opacity = fade * 0.8;
    });
  }
  
  spawn(star) {
    star.isActive = true;
    star.progress = 0;
    star.speed = Math.random() * 0.01 + 0.005; 

    star.startX = Math.random() * 600 - 100; 
    star.startY = Math.random() * 300 + 100; 
    
    star.endX = star.startX - (Math.random() * 300 + 200); 
    star.endY = star.startY - (Math.random() * 300 + 200);

    const angle = Math.atan2(star.endY - star.startY, star.endX - star.startX);
    star.mesh.rotation.z = angle;
  }
}
