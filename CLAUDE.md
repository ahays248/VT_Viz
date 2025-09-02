# CLAUDE.md - VizOne Project Context

## Project Overview
VizOne is an artistic cybersecurity data visualization using Three.js with gravity-based particle physics. The goal is to create a visually stunning, performant 3D visualization that represents security events as particles in space with physical interactions.

## Core Concept
- **Threat Constellation**: Security events as particles with gravity-based attraction
- **Visual Anomaly Detection**: Outliers break away from normal patterns
- **Artistic Focus**: Prioritize beauty and visual impact over traditional charts
- **Real-time Physics**: Continuous motion and interaction between data points

## Technical Architecture

### Rendering Pipeline
1. **Scene Setup**: Three.js WebGLRenderer with post-processing
2. **Particle System**: Instanced BufferGeometry for 10,000+ particles
3. **Physics Engine**: Custom gravity simulation (not using physics libraries for performance)
4. **Shaders**: Custom GLSL for particle rendering and effects
5. **Post-processing**: Bloom, depth of field, motion blur

### Data Flow
1. Load cybersecurity dataset (CSV/JSON)
2. Process with D3.js (scaling, filtering)
3. Map data attributes to visual properties
4. Update particle positions via physics simulation
5. Render with Three.js

### Performance Targets
- 60 FPS with 10,000 particles
- Sub-16ms frame time
- Efficient memory usage (<500MB)
- Mobile-responsive (30 FPS minimum)

## Key Files and Responsibilities

### src/main.js
- Application initialization
- Asset loading coordination
- Performance monitoring
- Event handling setup

### src/scene.js
- Three.js scene, camera, renderer setup
- Lighting configuration
- Post-processing pipeline
- Render loop management

### src/particles.js
- Particle system creation and management
- BufferGeometry optimization
- Particle attribute updates (color, size, position)
- LOD system for large datasets

### src/physics.js
- Gravity simulation calculations
- Spatial indexing (quadtree/octree)
- Force calculations
- Anomaly detection logic

### src/data-loader.js
- Dataset loading and parsing
- Data preprocessing with D3
- Attribute mapping configuration
- Real-time data streaming support

### src/controls.js
- dat.GUI setup
- Parameter management
- User interaction handling
- Settings persistence

### src/shaders/
- particle.vert: Vertex shader for particle positioning
- particle.frag: Fragment shader for particle rendering
- Custom effects shaders

## Visual Design System

### Color Palette
- **Safe/Benign**: Blues (#0080ff to #00ffff)
- **Warning**: Yellows (#ffff00 to #ff8800)
- **Critical/Threat**: Reds (#ff0000 to #ff00ff)
- **Background**: Dark gradient (#000000 to #1a1a2e)
- **Accent**: Cyan glow (#00ffff)

### Particle Properties
- **Size**: Mapped to event severity (2-20 units)
- **Color**: Threat level gradient
- **Opacity**: Age/relevance (0.3-1.0)
- **Trails**: Motion history visualization
- **Glow**: Bloom intensity for emphasis

### Animation Patterns
- **Orbital**: Normal events orbit gravity wells
- **Escape**: Anomalies accelerate away
- **Pulse**: Critical events pulsate
- **Swarm**: Related events cluster
- **Explosion**: Major incidents disperse particles

## Data Schema

### Expected Input Format
```javascript
{
  timestamp: Date,
  severity: 0-10,
  category: string,
  source_ip: string,
  destination_ip: string,
  attack_type: string,
  confidence: 0-1,
  related_events: array
}
```

### Visual Mapping
- timestamp → animation timeline
- severity → particle size
- category → gravity well assignment
- attack_type → color
- confidence → opacity
- related_events → particle connections

## Performance Optimizations

### Rendering
- Use instanced rendering for particles
- Frustum culling for off-screen particles
- LOD system based on camera distance
- Texture atlasing for particle sprites

### Physics
- Spatial partitioning (octree)
- Barnes-Hut approximation for distant forces
- Fixed timestep with interpolation
- SIMD optimizations where available

### Memory
- Object pooling for particles
- Typed arrays for positions/attributes
- Dispose unused geometries/materials
- Lazy loading for large datasets

## Development Guidelines

### Code Style
- ES6+ modules
- Async/await for asynchronous operations
- Descriptive variable names
- Comments for complex algorithms

### Testing Approach
- Performance profiling with Chrome DevTools
- Visual regression testing
- Dataset edge cases (empty, massive, malformed)
- Cross-browser compatibility checks

### Common Issues & Solutions

1. **Performance Drops**
   - Check particle count
   - Verify shader complexity
   - Profile with SpectorJS
   - Reduce post-processing effects

2. **Memory Leaks**
   - Dispose Three.js objects properly
   - Clear event listeners
   - Monitor heap snapshots

3. **Data Loading Failures**
   - Validate dataset format
   - Check CORS policies
   - Implement fallback sample data

4. **Visual Artifacts**
   - Check depth buffer precision
   - Verify blend modes
   - Adjust near/far planes

## Future Enhancements

### Planned Features
- Real-time data streaming via WebSocket
- Machine learning anomaly detection
- VR/AR support
- Multi-dataset comparison view
- Recording/playback system
- Collaborative viewing sessions

### Optimization Opportunities
- WebGPU migration when stable
- Worker threads for physics
- Progressive loading for massive datasets
- Adaptive quality based on performance

## External Resources

### Documentation
- [Three.js Docs](https://threejs.org/docs/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/Core_Language_(GLSL))
- [D3.js API](https://d3js.org/api)

### Inspiration
- [Particle Systems Examples](https://threejs.org/examples/?q=particle)
- [Data Visualization Gallery](https://observablehq.com/@d3/gallery)
- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)

## Debugging Commands

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npx vite-bundle-visualizer
```

## Important Notes

- Always test with both small (100) and large (10,000+) particle counts
- Maintain 60 FPS as primary performance metric
- Document any WebGL extensions required
- Keep mobile performance in mind
- Preserve artistic vision while optimizing

---

Last Updated: Project initialization
Version: 1.0.0