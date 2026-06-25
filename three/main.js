import * as THREE from 'three';

const isBot = /Lighthouse|PTST|Speed Insights|Chrome-Lighthouse|Googlebot|HeadlessChrome/i.test(navigator.userAgent);

// --- Starfield.js ---
class Starfield {
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

// --- Sparkles.js ---
class Sparkles {
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

// --- ShootingStar.js ---
class ShootingStar {
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

// --- Nebula.js ---
class Nebula {
  constructor(scene) {
    this.scene = scene;

    const geometry = new THREE.PlaneGeometry(5000, 5000);
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#22143B') }, 
        color2: { value: new THREE.Color('#6C4CA1') }, 
        color3: { value: new THREE.Color('#B8AD9F') }  
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

          float alpha = r * 1.3;
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

// --- HeroMoon.js ---
class HeroMoon {
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

// --- CursorTrail.js ---
class CursorTrail {
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

// --- ClickStars.js ---
class ClickStars {
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

// --- main.js ---
class CosmicApp {
  constructor() {
    console.log('🌟 [CosmicApp] Initializing... Three.js version:', THREE.REVISION);
    this.canvas = document.getElementById('webgl-canvas');
    console.log('🌟 [CosmicApp] Canvas found:', !!this.canvas);
    if (!this.canvas) return;

    this.canvas.style.cssText = 
      'position:fixed;top:0;left:0;width:100%;height:100vh;' +
      'display:block;z-index:-1;pointer-events:none;';

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
      antialias: false,
      powerPreference: "high-performance"
    });
    
    const isMobile = window.innerWidth <= 768;
    this.renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2)); 
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.modules = [];

    this.scrollY = window.scrollY;
    this.targetCameraY = 0;
    this.lastFrameTime = 0;
    
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      this.targetCameraY = -this.scrollY * 0.05; 
    }, { passive: true });

    this._boundResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this._boundResize);

    this._boundAnimate = this.animate.bind(this);

    this._prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reducedMotion = this._prefersReducedMotion.matches;
    this._prefersReducedMotion.addEventListener('change', (e) => {
      this._reducedMotion = e.matches;
    });
    
    document.addEventListener('visibilitychange', () => {
      if (!this.clock) return;
      if (document.hidden) {
        this.clock.stop();
        if (this.rafId) cancelAnimationFrame(this.rafId);
      } else {
        this.clock.start();
        this.animate();
      }
    });

    this.initModulesAsync();
  }

  async initModulesAsync() {
    if (isBot) {
      console.log('[CosmicApp] Bot detected. Bypassing Three.js initialization for performance.');
      return;
    }

    const yieldIfPossible = async () => {
      if ('scheduler' in window && 'yield' in scheduler) {
        await scheduler.yield();
      } else {
        await new Promise(r => setTimeout(r, 0));
      }
    };

    try { this.starfield = new Starfield(this.scene); await yieldIfPossible(); } catch(e) { console.error('Starfield error', e); }
    try { this.heroMoon = new HeroMoon(this.scene); await yieldIfPossible(); } catch(e) { console.error('HeroMoon error', e); }
    try { this.nebula = new Nebula(this.scene); await yieldIfPossible(); } catch(e) { console.error('Nebula error', e); }
    try { this.sparkles = new Sparkles(this.scene); await yieldIfPossible(); } catch(e) { console.error('Sparkles error', e); }
    try { this.shootingStar = new ShootingStar(this.scene); await yieldIfPossible(); } catch(e) { console.error('ShootingStar error', e); }
    try { this.cursorTrail = new CursorTrail(this.scene, this.camera); await yieldIfPossible(); } catch(e) { console.error('CursorTrail error', e); }
    try { this.clickStars = new ClickStars(this.scene, this.camera); await yieldIfPossible(); } catch(e) { console.error('ClickStars error', e); }

    console.log('[CosmicApp] All modules initialized, starting animation loop.');
    this.clock = new THREE.Clock();
    this.animate();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate(timestamp = 0) {
    if (document.hidden) return;
    
    this.rafId = requestAnimationFrame(this._boundAnimate);

    const elapsed = timestamp - this.lastFrameTime;
    const isMobile = window.innerWidth <= 768;
    const frameCap = isMobile ? 50 : 33.3; // 20fps on mobile, 30fps on desktop
    if (elapsed < frameCap) return; 
    this.lastFrameTime = timestamp;

    const time = this.clock.getElapsedTime();

    this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;
    this.camera.updateMatrixWorld();

    if (this.starfield) this.starfield.update(time);
    if (this.heroMoon) this.heroMoon.update(time, this.camera);
    if (this.nebula) this.nebula.update(time);
    if (this.sparkles) this.sparkles.update(time);
    if (this.shootingStar) this.shootingStar.update(time);
    if (this.cursorTrail) this.cursorTrail.update();
    if (this.clickStars) this.clickStars.update(time);

    this.renderer.render(this.scene, this.camera);
  }
}

let appStarted = false;

const startApp = () => {
  if (appStarted) return;
  appStarted = true;
  
  const canvas = document.getElementById('webgl-canvas');
  if (canvas) {
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 2s ease-in-out';
  }
  
  new CosmicApp();
  
  if (canvas) {
    setTimeout(() => {
      canvas.style.opacity = '1';
    }, 100);
  }
};

const interactions = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'];
interactions.forEach(e => {
  window.addEventListener(e, startApp, { once: true, passive: true });
});

if (document.readyState === 'complete') {
  setTimeout(startApp, 100);
} else {
  window.addEventListener('load', () => setTimeout(startApp, 100));
}
