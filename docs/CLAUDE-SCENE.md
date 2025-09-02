# CLAUDE-SCENE.md - Three.js Scene Management

## Purpose
Manages the Three.js scene setup, camera controls, lighting, rendering pipeline, and post-processing effects.

## Core Components

### Scene Setup
```javascript
scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0008);
scene.background = new THREE.Color(0x000000);
```

### Camera Configuration
- **Type**: PerspectiveCamera
- **FOV**: 75 degrees
- **Near Plane**: 0.1
- **Far Plane**: 10000
- **Initial Position**: (0, 0, 500)
- **Controls**: OrbitControls with damping

### Renderer Settings
```javascript
renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = false; // Particles don't need shadows
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

### Lighting Setup
1. **Ambient Light**: Soft base illumination (0x404040, 0.5)
2. **Directional Lights**: 3 lights for dimensional depth
3. **Point Lights**: Dynamic lights following major clusters

## Post-Processing Pipeline

### Effect Composer Chain
1. **RenderPass**: Base scene rendering
2. **UnrealBloomPass**: Glow effect for particles
   - Strength: 1.5
   - Radius: 0.4
   - Threshold: 0.85
3. **SMAAPass**: Anti-aliasing
4. **FilmPass**: Optional cinematic grain
5. **FXAAPass**: Fallback anti-aliasing for mobile

### Bloom Configuration
```javascript
bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
bloomPass.threshold = 0.21;
bloomPass.strength = 1.5;
bloomPass.radius = 0.4;
```

## Performance Monitoring

### Stats Panel
- FPS counter
- Frame time
- Memory usage
- Draw calls

### Adaptive Quality
```javascript
if (fps < 30) {
  // Reduce quality
  renderer.setPixelRatio(1);
  bloomPass.enabled = false;
} else if (fps > 55) {
  // Increase quality
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  bloomPass.enabled = true;
}
```

## Render Loop

### Animation Frame Structure
```javascript
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.update();
  
  // Update physics (from physics.js)
  updatePhysics(deltaTime);
  
  // Update particles (from particles.js)
  updateParticles(deltaTime);
  
  // Render scene
  composer.render();
  
  // Update stats
  stats.update();
}
```

### Delta Time Management
- Use THREE.Clock for consistent timing
- Cap deltaTime to prevent large jumps
- Interpolate positions for smooth motion

## Camera Controls

### OrbitControls Configuration
```javascript
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 2000;
controls.maxPolarAngle = Math.PI;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
```

### Camera Animations
- Smooth transitions between viewpoints
- Focus on specific particle clusters
- Cinematic camera paths using GSAP

## Responsive Design

### Window Resize Handler
```javascript
window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
```

## Scene Optimization

### Culling Strategy
- Frustum culling enabled by default
- LOD system for distant particles
- Occlusion culling for dense clusters

### Draw Call Reduction
- Merge geometries where possible
- Use instanced rendering
- Batch similar materials

## Visual Effects

### Background Options
1. **Solid Color**: Pure black for focus
2. **Gradient**: Subtle color shifts
3. **Starfield**: Particle background
4. **Skybox**: HDR environment maps

### Fog Effects
- Exponential fog for depth
- Color matches background
- Density adjustable via controls

## Integration Points

### With particles.js
- Provides rendering context
- Manages particle mesh in scene
- Handles particle material updates

### With physics.js
- Triggers physics updates
- Provides time delta
- Manages simulation speed

### With controls.js
- Receives parameter updates
- Adjusts visual settings
- Toggles effects on/off

## Debugging Tools

### Helper Objects
```javascript
// Grid helper
const gridHelper = new THREE.GridHelper(1000, 50);
scene.add(gridHelper);

// Axes helper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// Camera helper
const cameraHelper = new THREE.CameraHelper(camera);
scene.add(cameraHelper);
```

### Performance Profiling
- Use SpectorJS for WebGL debugging
- Chrome DevTools Performance tab
- Three.js Inspector extension

## Common Issues

### Black Screen
- Check renderer.domElement attachment
- Verify camera position/lookAt
- Ensure scene has objects

### Poor Performance
- Reduce pixel ratio
- Disable post-processing
- Check particle count
- Profile with DevTools

### Visual Artifacts
- Adjust near/far planes
- Check depth buffer bits
- Verify blend modes
- Update GPU drivers

## Future Enhancements

### Planned Features
- WebGPU renderer support
- Ray tracing effects
- Temporal anti-aliasing
- Screen space reflections
- Volumetric lighting

### Experimental
- Virtual reality mode
- Stereoscopic rendering
- Multi-viewport support
- Picture-in-picture views

---

Last Updated: Scene module initialization
Module Version: 1.0.0