import * as THREE from 'three';

let particleSystem;
let particles = [];
let particleGeometry;
let particleMaterial;
let particleCount = 0;

const threatColorMap = {
  // Attack types
  'port_scan': new THREE.Color(0xffff00),
  'ssh_brute': new THREE.Color(0xff8800),
  'rdp_brute': new THREE.Color(0xff6600),
  'telnet_brute': new THREE.Color(0xff4400),
  'mimikatz': new THREE.Color(0xff00ff),
  'cobalt_strike': new THREE.Color(0xcc00cc),
  'lockbit': new THREE.Color(0xff0000),
  'alphv': new THREE.Color(0xcc0000),
  'blackcat': new THREE.Color(0x990000),
  'https_exfil': new THREE.Color(0xffaa00),
  'dns_tunnel': new THREE.Color(0xff8800),
  
  // Categories
  'reconnaissance': new THREE.Color(0xffff00),
  'brute_force': new THREE.Color(0xff8800),
  'intrusion': new THREE.Color(0xff4400),
  'malware': new THREE.Color(0xff00ff),
  'ransomware': new THREE.Color(0xff0000),
  'data_exfil': new THREE.Color(0xffaa00),
  'benign': new THREE.Color(0x0080ff),
  'unknown': new THREE.Color(0x808080)
};

export async function initParticles(scene, data) {
  // Show all events but limit display for performance
  particleCount = Math.min(data.length, 5000);
  particles = [];
  
  console.log(`Loading ${data.length} attack events, displaying ${particleCount} particles`);
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const event = data[i % data.length];
    const particle = createParticle(event, i);
    particles.push(particle);
    
    const i3 = i * 3;
    positions[i3] = particle.position.x;
    positions[i3 + 1] = particle.position.y;
    positions[i3 + 2] = particle.position.z;
    
    colors[i3] = particle.color.r;
    colors[i3 + 1] = particle.color.g;
    colors[i3 + 2] = particle.color.b;
    
    sizes[i] = particle.size;
    opacities[i] = particle.opacity;
  }
  
  particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
  
  const vertexShader = `
    attribute float size;
    attribute float opacity;
    varying vec3 vColor;
    varying float vOpacity;
    
    void main() {
      vColor = color;
      vOpacity = opacity;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  const fragmentShader = `
    varying vec3 vColor;
    varying float vOpacity;
    
    void main() {
      vec2 uv = gl_PointCoord.xy - vec2(0.5);
      float dist = length(uv);
      
      if (dist > 0.5) discard;
      
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0);
      
      vec3 finalColor = vColor * (1.0 + strength * 0.5);
      
      gl_FragColor = vec4(finalColor, vOpacity * strength);
    }
  `;
  
  particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);
  
  window.addEventListener('update-particles', (e) => {
    updateParticles(e.detail.deltaTime);
  });
  
  return particles;
}

function createParticle(event, index) {
  const position = mapEventToPosition(event, index);
  // Use category for color, fall back to attack_type, then unknown
  const color = threatColorMap[event.category] || threatColorMap[event.attack_type] || threatColorMap['unknown'];
  const size = mapSeverityToSize(event.severity);
  const opacity = mapConfidenceToOpacity(event.confidence);
  
  return {
    id: index,
    position: position,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ),
    color: color,
    size: size,
    opacity: opacity,
    mass: event.data_volume || 100,
    category: event.category,
    threatLevel: event.severity / 10,
    age: 0,
    maxAge: 100 + Math.random() * 100,
    data: event
  };
}

function mapEventToPosition(event, index) {
  const categories = {
    'reconnaissance': { x: -400, z: -400 },
    'brute_force': { x: -200, z: -200 },
    'intrusion': { x: 0, z: 0 },
    'malware': { x: 200, z: 0 },
    'data_exfil': { x: 400, z: 200 },
    'ransomware': { x: 0, z: 400 },
    'benign': { x: 0, z: -400 }
  };
  
  const categoryPos = categories[event.category] || { x: 0, z: 0 };
  
  const angle = (index / particleCount) * Math.PI * 2;
  const radius = 50 + Math.random() * 150;
  const height = (Math.random() - 0.5) * 200;
  
  return new THREE.Vector3(
    categoryPos.x + Math.cos(angle) * radius,
    height,
    categoryPos.z + Math.sin(angle) * radius
  );
}

function mapSeverityToSize(severity) {
  return 2 + (severity / 10) * 18;
}

function mapConfidenceToOpacity(confidence) {
  return 0.3 + confidence * 0.7;
}

function updateParticles(deltaTime) {
  if (!particleGeometry || !particles.length) return;
  
  const positions = particleGeometry.attributes.position.array;
  const colors = particleGeometry.attributes.color.array;
  const sizes = particleGeometry.attributes.size.array;
  const opacities = particleGeometry.attributes.opacity.array;
  
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const i3 = i * 3;
    
    particle.age += deltaTime;
    
    if (particle.age > particle.maxAge) {
      particle.age = 0;
      particle.position = mapEventToPosition(particle.data, i);
    }
    
    positions[i3] = particle.position.x;
    positions[i3 + 1] = particle.position.y;
    positions[i3 + 2] = particle.position.z;
    
    if (particle.threatLevel > 0.7) {
      const pulse = Math.sin(particle.age * 5) * 0.3 + 1;
      sizes[i] = particle.size * pulse;
      
      colors[i3] = particle.color.r * pulse;
      colors[i3 + 1] = particle.color.g * (2 - pulse);
      colors[i3 + 2] = particle.color.b * (2 - pulse);
    }
    
    const fadeIn = Math.min(particle.age / 2, 1);
    const fadeOut = particle.age > particle.maxAge - 5 
      ? Math.max(0, (particle.maxAge - particle.age) / 5)
      : 1;
    opacities[i] = particle.opacity * fadeIn * fadeOut;
  }
  
  particleGeometry.attributes.position.needsUpdate = true;
  particleGeometry.attributes.color.needsUpdate = true;
  particleGeometry.attributes.size.needsUpdate = true;
  particleGeometry.attributes.opacity.needsUpdate = true;
  
  if (particleMaterial) {
    particleMaterial.uniforms.time.value += deltaTime;
  }
}

export function getParticles() {
  return particles;
}

export function getParticleSystem() {
  return particleSystem;
}