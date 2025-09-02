# CLAUDE-PARTICLES.md - Particle System Implementation

## Purpose
Manages the creation, updating, and rendering of thousands of particles representing cybersecurity events with optimal performance.

## Core Architecture

### Particle System Design
- **Geometry**: THREE.BufferGeometry with instanced attributes
- **Material**: Custom ShaderMaterial with GLSL
- **Rendering**: Instanced mesh for optimal performance
- **Count**: Scalable from 100 to 100,000+ particles

## Buffer Attributes

### Position Buffer
```javascript
const positions = new Float32Array(particleCount * 3);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
```

### Custom Attributes
```javascript
// Per-particle attributes
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
geometry.setAttribute('aThreatLevel', new THREE.BufferAttribute(threatLevels, 1));
```

## Shader Implementation

### Vertex Shader Structure
```glsl
attribute float aSize;
attribute vec3 aColor;
attribute float aOpacity;
attribute float aThreatLevel;

varying vec3 vColor;
varying float vOpacity;

void main() {
  vColor = aColor;
  vOpacity = aOpacity;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
```

### Fragment Shader Structure
```glsl
varying vec3 vColor;
varying float vOpacity;

void main() {
  vec2 uv = gl_PointCoord.xy;
  float dist = length(uv - vec2(0.5));
  
  if (dist > 0.5) discard;
  
  float strength = 1.0 - dist * 2.0;
  strength = pow(strength, 3.0);
  
  vec3 color = vColor * strength;
  gl_FragColor = vec4(color, vOpacity * strength);
}
```

## Particle Properties

### Visual Attributes
- **Position**: XYZ coordinates in 3D space
- **Size**: 2-20 units based on severity
- **Color**: RGB based on threat type
- **Opacity**: 0.3-1.0 based on age/relevance
- **Glow**: Bloom intensity multiplier

### Physics Attributes
- **Velocity**: Current movement vector
- **Mass**: Affects gravity interactions
- **Charge**: For electromagnetic effects
- **Age**: Time since creation
- **Lifetime**: Maximum age before removal

## Update System

### Frame Update Loop
```javascript
function updateParticles(deltaTime) {
  const positions = geometry.attributes.position.array;
  const colors = geometry.attributes.aColor.array;
  const opacities = geometry.attributes.aOpacity.array;
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Update position from physics
    positions[i3] = particles[i].x;
    positions[i3 + 1] = particles[i].y;
    positions[i3 + 2] = particles[i].z;
    
    // Update visual properties
    updateParticleVisuals(i, deltaTime);
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.aColor.needsUpdate = true;
  geometry.attributes.aOpacity.needsUpdate = true;
}
```

### Visual State Transitions
```javascript
function updateParticleVisuals(index, deltaTime) {
  const particle = particles[index];
  
  // Fade in/out
  if (particle.state === 'spawning') {
    particle.opacity = Math.min(1, particle.opacity + deltaTime);
  } else if (particle.state === 'dying') {
    particle.opacity = Math.max(0, particle.opacity - deltaTime);
  }
  
  // Threat level pulsing
  if (particle.threatLevel > 0.8) {
    particle.size = baseSize * (1 + Math.sin(time * 5) * 0.3);
  }
  
  // Color transitions
  lerpColor(particle.color, particle.targetColor, deltaTime * 2);
}
```

## Performance Optimizations

### Instanced Rendering
```javascript
const instancedMesh = new THREE.InstancedMesh(
  geometry,
  material,
  particleCount
);

// Update instance matrices
for (let i = 0; i < particleCount; i++) {
  dummy.position.set(x, y, z);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
}
instancedMesh.instanceMatrix.needsUpdate = true;
```

### LOD System
```javascript
const lodDistances = [100, 500, 1000, 2000];
const lodParticleCounts = [10000, 5000, 2500, 1000];

function updateLOD(cameraDistance) {
  for (let i = 0; i < lodDistances.length; i++) {
    if (cameraDistance < lodDistances[i]) {
      activeParticleCount = lodParticleCounts[i];
      break;
    }
  }
}
```

### Culling Strategy
```javascript
function cullParticles(camera) {
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);
  
  for (let i = 0; i < particleCount; i++) {
    const visible = frustum.containsPoint(particles[i].position);
    particles[i].active = visible;
  }
}
```

## Particle Effects

### Trail System
```javascript
class ParticleTrail {
  constructor(maxLength = 20) {
    this.positions = [];
    this.maxLength = maxLength;
  }
  
  update(position) {
    this.positions.unshift(position.clone());
    if (this.positions.length > this.maxLength) {
      this.positions.pop();
    }
  }
  
  render() {
    // Create line geometry from positions
    const geometry = new THREE.BufferGeometry().setFromPoints(this.positions);
    return new THREE.Line(geometry, trailMaterial);
  }
}
```

### Particle Connections
```javascript
function createConnections() {
  const connections = [];
  
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dist = particles[i].position.distanceTo(particles[j].position);
      
      if (dist < connectionDistance && particles[i].group === particles[j].group) {
        connections.push({
          start: particles[i].position,
          end: particles[j].position,
          strength: 1 - dist / connectionDistance
        });
      }
    }
  }
  
  return connections;
}
```

## Memory Management

### Object Pooling
```javascript
class ParticlePool {
  constructor(size) {
    this.pool = [];
    this.active = [];
    
    for (let i = 0; i < size; i++) {
      this.pool.push(new Particle());
    }
  }
  
  get() {
    if (this.pool.length > 0) {
      const particle = this.pool.pop();
      this.active.push(particle);
      return particle;
    }
    return null;
  }
  
  release(particle) {
    particle.reset();
    const index = this.active.indexOf(particle);
    if (index > -1) {
      this.active.splice(index, 1);
      this.pool.push(particle);
    }
  }
}
```

### Disposal
```javascript
function dispose() {
  geometry.dispose();
  material.dispose();
  
  // Dispose textures
  if (particleTexture) particleTexture.dispose();
  
  // Clear arrays
  particles.length = 0;
  
  // Remove from scene
  scene.remove(particleMesh);
}
```

## Data Mapping

### Event to Particle
```javascript
function mapEventToParticle(event) {
  return {
    position: mapCoordinates(event.source_ip, event.destination_ip),
    size: mapSeverityToSize(event.severity),
    color: mapThreatToColor(event.attack_type),
    opacity: mapConfidenceToOpacity(event.confidence),
    velocity: new THREE.Vector3(0, 0, 0),
    mass: event.data_volume || 1,
    group: event.category,
    metadata: event
  };
}
```

### Visual Encoding
```javascript
const threatColorMap = {
  'ddos': new THREE.Color(0xff0000),
  'malware': new THREE.Color(0xff00ff),
  'intrusion': new THREE.Color(0xff8800),
  'phishing': new THREE.Color(0xffff00),
  'benign': new THREE.Color(0x0080ff)
};

const severitySizeMap = {
  'critical': 20,
  'high': 15,
  'medium': 10,
  'low': 5,
  'info': 2
};
```

## Integration Points

### With physics.js
- Receives position updates
- Provides particle mass/charge
- Handles collision callbacks

### With scene.js
- Adds particle mesh to scene
- Updates in render loop
- Responds to camera changes

### With data-loader.js
- Receives new particle data
- Maps attributes to visuals
- Handles real-time updates

## Debugging

### Particle Inspector
```javascript
function inspectParticle(index) {
  const particle = particles[index];
  console.log({
    index,
    position: particle.position,
    velocity: particle.velocity,
    color: particle.color,
    size: particle.size,
    age: particle.age,
    metadata: particle.metadata
  });
}
```

### Visual Debug Mode
```javascript
function enableDebugMode() {
  // Show particle indices
  // Display velocity vectors
  // Highlight selected particles
  // Show bounding boxes
}
```

## Common Issues

### Particles Not Visible
- Check camera near/far planes
- Verify particle positions
- Ensure size > 0
- Check material transparency

### Performance Issues
- Reduce particle count
- Simplify shaders
- Enable LOD system
- Use object pooling

### Visual Artifacts
- Check depth testing
- Adjust blend modes
- Verify color space
- Update buffer attributes

---

Last Updated: Particle system initialization
Module Version: 1.0.0