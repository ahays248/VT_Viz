import * as THREE from 'three';

let particles = [];
let gravityWells = [];
let physicsEnabled = true;

const PHYSICS_CONFIG = {
  GRAVITY_CONSTANT: 0.01,
  REPULSION_STRENGTH: 50,
  REPULSION_RADIUS: 30,
  DAMPING_FACTOR: 0.98,
  MIN_DISTANCE: 5,
  MAX_VELOCITY: 100,
  ANOMALY_SPEED_THRESHOLD: 80
};

export function initPhysics(particleArray) {
  particles = particleArray;
  
  initGravityWells();
  
  window.addEventListener('update-physics', (e) => {
    if (physicsEnabled) {
      updatePhysics(e.detail.deltaTime);
    }
  });
  
  window.addEventListener('toggle-physics', () => {
    physicsEnabled = !physicsEnabled;
  });
}

function initGravityWells() {
  gravityWells = [
    {
      position: new THREE.Vector3(0, 0, 0),
      mass: 5000,
      radius: 200,
      category: 'malware',
      color: 0xff00ff
    },
    {
      position: new THREE.Vector3(300, 0, 0),
      mass: 3000,
      radius: 150,
      category: 'intrusion',
      color: 0xff8800
    },
    {
      position: new THREE.Vector3(-300, 0, 0),
      mass: 3000,
      radius: 150,
      category: 'ddos',
      color: 0xff0000
    },
    {
      position: new THREE.Vector3(0, 0, 300),
      mass: 2000,
      radius: 100,
      category: 'phishing',
      color: 0xffff00
    },
    {
      position: new THREE.Vector3(0, 0, -300),
      mass: 4000,
      radius: 200,
      category: 'benign',
      color: 0x0080ff
    }
  ];
}

function updatePhysics(deltaTime) {
  particles.forEach(particle => {
    particle.force = new THREE.Vector3(0, 0, 0);
  });
  
  particles.forEach(particle => {
    gravityWells.forEach(well => {
      if (well.category === particle.category || particle.category === 'unknown') {
        const force = calculateGravityToWell(particle, well);
        particle.force.add(force);
      }
    });
    
    const nearbyParticles = getNearebyParticles(particle, PHYSICS_CONFIG.REPULSION_RADIUS * 2);
    nearbyParticles.forEach(other => {
      const repulsion = calculateRepulsion(particle, other);
      particle.force.add(repulsion);
    });
  });
  
  particles.forEach(particle => {
    integrateParticle(particle, deltaTime);
    detectAnomaly(particle);
  });
}

function calculateGravityToWell(particle, well) {
  const direction = new THREE.Vector3().subVectors(well.position, particle.position);
  const distance = direction.length();
  
  if (distance < PHYSICS_CONFIG.MIN_DISTANCE) {
    return new THREE.Vector3(0, 0, 0);
  }
  
  const forceMagnitude = (PHYSICS_CONFIG.GRAVITY_CONSTANT * particle.mass * well.mass) / (distance * distance);
  
  direction.normalize();
  direction.multiplyScalar(forceMagnitude);
  
  return direction;
}

function calculateRepulsion(p1, p2) {
  const direction = new THREE.Vector3().subVectors(p1.position, p2.position);
  const distance = direction.length();
  
  if (distance > PHYSICS_CONFIG.REPULSION_RADIUS || distance < 0.1) {
    return new THREE.Vector3(0, 0, 0);
  }
  
  const forceMagnitude = PHYSICS_CONFIG.REPULSION_STRENGTH * (1 - distance / PHYSICS_CONFIG.REPULSION_RADIUS);
  
  direction.normalize();
  direction.multiplyScalar(forceMagnitude);
  
  return direction;
}

function getNearebyParticles(particle, radius) {
  return particles.filter(other => {
    if (other === particle) return false;
    const distance = particle.position.distanceTo(other.position);
    return distance < radius;
  });
}

function integrateParticle(particle, deltaTime) {
  const acceleration = particle.force.divideScalar(particle.mass);
  
  particle.velocity.add(acceleration.multiplyScalar(deltaTime));
  
  const speed = particle.velocity.length();
  if (speed > PHYSICS_CONFIG.MAX_VELOCITY) {
    particle.velocity.normalize();
    particle.velocity.multiplyScalar(PHYSICS_CONFIG.MAX_VELOCITY);
  }
  
  particle.velocity.multiplyScalar(PHYSICS_CONFIG.DAMPING_FACTOR);
  
  const displacement = particle.velocity.clone().multiplyScalar(deltaTime);
  particle.position.add(displacement);
  
  const maxBound = 1000;
  ['x', 'y', 'z'].forEach(axis => {
    if (Math.abs(particle.position[axis]) > maxBound) {
      particle.position[axis] = Math.sign(particle.position[axis]) * maxBound;
      particle.velocity[axis] *= -0.5;
    }
  });
}

function detectAnomaly(particle) {
  const speed = particle.velocity.length();
  
  if (speed > PHYSICS_CONFIG.ANOMALY_SPEED_THRESHOLD) {
    particle.isAnomaly = true;
    particle.anomalyType = 'high_velocity';
    
    particle.color = new THREE.Color(0xffffff);
    particle.size *= 1.5;
  } else if (particle.isAnomaly && speed < PHYSICS_CONFIG.ANOMALY_SPEED_THRESHOLD * 0.5) {
    particle.isAnomaly = false;
    particle.anomalyType = null;
  }
}

export function getGravityWells() {
  return gravityWells;
}

export function updatePhysicsConfig(config) {
  Object.assign(PHYSICS_CONFIG, config);
}