# CLAUDE-PHYSICS.md - Gravity Physics Simulation

## Purpose
Implements a custom gravity-based physics engine optimized for thousands of particles, creating organic motion patterns that reveal data relationships and anomalies.

## Physics Model

### Core Concepts
- **N-body Gravity**: Particles attract each other based on mass
- **Gravity Wells**: Major attraction points for data categories
- **Repulsion Forces**: Prevent particle overlap
- **Damping**: Energy dissipation for stability
- **Anomaly Forces**: Special behaviors for outliers

## Force Calculations

### Gravitational Force
```javascript
function calculateGravity(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  
  const distSq = dx * dx + dy * dy + dz * dz;
  const dist = Math.sqrt(distSq);
  
  // Prevent singularity
  if (dist < MIN_DISTANCE) return { x: 0, y: 0, z: 0 };
  
  // F = G * m1 * m2 / r^2
  const force = GRAVITY_CONSTANT * p1.mass * p2.mass / distSq;
  
  // Normalize and apply
  return {
    x: force * dx / dist,
    y: force * dy / dist,
    z: force * dz / dist
  };
}
```

### Repulsion Force
```javascript
function calculateRepulsion(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (dist > REPULSION_RADIUS) return { x: 0, y: 0, z: 0 };
  
  const force = REPULSION_STRENGTH * (1 - dist / REPULSION_RADIUS);
  
  return {
    x: -force * dx / dist,
    y: -force * dy / dist,
    z: -force * dz / dist
  };
}
```

## Optimization Strategies

### Barnes-Hut Algorithm
```javascript
class OctreeNode {
  constructor(bounds) {
    this.bounds = bounds;
    this.children = null;
    this.particles = [];
    this.centerOfMass = new THREE.Vector3();
    this.totalMass = 0;
  }
  
  insert(particle) {
    if (this.children === null && this.particles.length < MAX_PARTICLES) {
      this.particles.push(particle);
      this.updateCenterOfMass();
    } else {
      if (this.children === null) this.subdivide();
      this.getQuadrant(particle).insert(particle);
    }
  }
  
  calculateForce(particle, theta = 0.5) {
    if (this.children === null) {
      // Leaf node - calculate direct forces
      return this.calculateDirectForces(particle);
    }
    
    const d = particle.position.distanceTo(this.centerOfMass);
    const s = this.bounds.size;
    
    if (s / d < theta) {
      // Treat as single body
      return this.calculateGravity(particle, this.centerOfMass, this.totalMass);
    } else {
      // Recurse
      let force = { x: 0, y: 0, z: 0 };
      for (let child of this.children) {
        const f = child.calculateForce(particle, theta);
        force.x += f.x;
        force.y += f.y;
        force.z += f.z;
      }
      return force;
    }
  }
}
```

### Spatial Hashing
```javascript
class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.buckets = new Map();
  }
  
  hash(x, y, z) {
    const ix = Math.floor(x / this.cellSize);
    const iy = Math.floor(y / this.cellSize);
    const iz = Math.floor(z / this.cellSize);
    return `${ix},${iy},${iz}`;
  }
  
  insert(particle) {
    const key = this.hash(particle.x, particle.y, particle.z);
    if (!this.buckets.has(key)) {
      this.buckets.set(key, []);
    }
    this.buckets.get(key).push(particle);
  }
  
  getNearby(particle, radius) {
    const nearby = [];
    const cells = this.getCellsInRadius(particle, radius);
    
    for (let cell of cells) {
      const particles = this.buckets.get(cell) || [];
      nearby.push(...particles);
    }
    
    return nearby;
  }
}
```

## Integration Methods

### Verlet Integration
```javascript
function integrateVerlet(particle, dt) {
  const acceleration = {
    x: particle.force.x / particle.mass,
    y: particle.force.y / particle.mass,
    z: particle.force.z / particle.mass
  };
  
  // x(t+dt) = 2*x(t) - x(t-dt) + a(t)*dt^2
  const newX = 2 * particle.x - particle.oldX + acceleration.x * dt * dt;
  const newY = 2 * particle.y - particle.oldY + acceleration.y * dt * dt;
  const newZ = 2 * particle.z - particle.oldZ + acceleration.z * dt * dt;
  
  particle.oldX = particle.x;
  particle.oldY = particle.y;
  particle.oldZ = particle.z;
  
  particle.x = newX;
  particle.y = newY;
  particle.z = newZ;
  
  // Apply damping
  const damping = Math.pow(DAMPING_FACTOR, dt);
  particle.x = particle.oldX + (particle.x - particle.oldX) * damping;
  particle.y = particle.oldY + (particle.y - particle.oldY) * damping;
  particle.z = particle.oldZ + (particle.z - particle.oldZ) * damping;
}
```

### RK4 Integration (Higher Accuracy)
```javascript
function integrateRK4(particle, dt) {
  const k1 = evaluate(particle, 0, { dx: 0, dv: 0 });
  const k2 = evaluate(particle, dt * 0.5, k1);
  const k3 = evaluate(particle, dt * 0.5, k2);
  const k4 = evaluate(particle, dt, k3);
  
  const dxdt = (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx) / 6;
  const dvdt = (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv) / 6;
  
  particle.x += dxdt * dt;
  particle.velocity += dvdt * dt;
}
```

## Gravity Wells

### Well Configuration
```javascript
const gravityWells = [
  {
    position: new THREE.Vector3(0, 0, 0),
    mass: 10000,
    radius: 200,
    category: 'malware',
    color: 0xff00ff
  },
  {
    position: new THREE.Vector3(500, 0, 0),
    mass: 8000,
    radius: 150,
    category: 'intrusion',
    color: 0xff8800
  },
  {
    position: new THREE.Vector3(-500, 0, 0),
    mass: 5000,
    radius: 100,
    category: 'benign',
    color: 0x0080ff
  }
];
```

### Dynamic Well Creation
```javascript
function createGravityWell(category, dataCount) {
  const angle = (gravityWells.length * Math.PI * 2) / 8;
  const radius = 400;
  
  return {
    position: new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.5,
      Math.sin(angle) * radius
    ),
    mass: Math.log10(dataCount + 1) * 1000,
    radius: Math.sqrt(dataCount) * 10,
    category: category,
    color: getCategoryColor(category)
  };
}
```

## Anomaly Detection

### Velocity-Based Detection
```javascript
function detectVelocityAnomaly(particle) {
  const speed = Math.sqrt(
    particle.velocity.x ** 2 +
    particle.velocity.y ** 2 +
    particle.velocity.z ** 2
  );
  
  if (speed > ANOMALY_SPEED_THRESHOLD) {
    particle.isAnomaly = true;
    particle.anomalyType = 'high_velocity';
    triggerAnomalyEffect(particle);
  }
}
```

### Isolation Detection
```javascript
function detectIsolationAnomaly(particle, neighbors) {
  const minNeighbors = 3;
  const searchRadius = 100;
  
  const nearbyCount = neighbors.filter(n => 
    n.position.distanceTo(particle.position) < searchRadius
  ).length;
  
  if (nearbyCount < minNeighbors) {
    particle.isAnomaly = true;
    particle.anomalyType = 'isolated';
  }
}
```

### Trajectory Analysis
```javascript
function analyzeTrajectory(particle) {
  if (particle.history.length < 10) return;
  
  // Calculate trajectory curvature
  const points = particle.history.slice(-10);
  const curvature = calculateCurvature(points);
  
  if (curvature > ANOMALY_CURVATURE_THRESHOLD) {
    particle.isAnomaly = true;
    particle.anomalyType = 'erratic_motion';
  }
}
```

## Performance Monitoring

### Metrics
```javascript
const physicsMetrics = {
  updateTime: 0,
  forceCalculations: 0,
  activeParticles: 0,
  spatialHashBuckets: 0,
  octreeDepth: 0
};

function updatePhysicsMetrics() {
  const start = performance.now();
  
  updatePhysics();
  
  physicsMetrics.updateTime = performance.now() - start;
  physicsMetrics.activeParticles = particles.filter(p => p.active).length;
  physicsMetrics.spatialHashBuckets = spatialHash.buckets.size;
}
```

## Configuration Parameters

### Tunable Constants
```javascript
const PHYSICS_CONFIG = {
  GRAVITY_CONSTANT: 0.001,
  REPULSION_STRENGTH: 100,
  REPULSION_RADIUS: 20,
  DAMPING_FACTOR: 0.99,
  MIN_DISTANCE: 1,
  MAX_VELOCITY: 500,
  THETA: 0.5, // Barnes-Hut accuracy
  TIME_STEP: 0.016, // 60 FPS
  SUB_STEPS: 2, // Integration subdivisions
  ANOMALY_SPEED_THRESHOLD: 300,
  ANOMALY_CURVATURE_THRESHOLD: 0.8
};
```

## Integration with Visualization

### Update Loop
```javascript
function updatePhysics(deltaTime) {
  // Clear forces
  particles.forEach(p => {
    p.force = { x: 0, y: 0, z: 0 };
  });
  
  // Build spatial structure
  rebuildOctree();
  
  // Calculate forces
  particles.forEach(p => {
    if (!p.active) return;
    
    // Gravity from wells
    gravityWells.forEach(well => {
      const force = calculateGravityToWell(p, well);
      p.force.x += force.x;
      p.force.y += force.y;
      p.force.z += force.z;
    });
    
    // Inter-particle forces (optimized)
    const nearbyForce = octree.calculateForce(p);
    p.force.x += nearbyForce.x;
    p.force.y += nearbyForce.y;
    p.force.z += nearbyForce.z;
  });
  
  // Integrate positions
  particles.forEach(p => {
    if (!p.active) return;
    integrateVerlet(p, deltaTime);
  });
  
  // Detect anomalies
  detectAnomalies();
  
  // Update metrics
  updatePhysicsMetrics();
}
```

## Debugging Tools

### Force Visualization
```javascript
function visualizeForces() {
  const forceLines = new THREE.Group();
  
  particles.forEach(p => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p.x, p.y, p.z),
      new THREE.Vector3(
        p.x + p.force.x * 10,
        p.y + p.force.y * 10,
        p.z + p.force.z * 10
      )
    ]);
    
    const line = new THREE.Line(geometry, forceLineMaterial);
    forceLines.add(line);
  });
  
  scene.add(forceLines);
}
```

### Octree Visualization
```javascript
function visualizeOctree(node, depth = 0) {
  const box = new THREE.Box3Helper(node.bounds, 0x00ff00);
  box.material.opacity = 0.3 - depth * 0.05;
  scene.add(box);
  
  if (node.children) {
    node.children.forEach(child => visualizeOctree(child, depth + 1));
  }
}
```

---

Last Updated: Physics module initialization
Module Version: 1.0.0