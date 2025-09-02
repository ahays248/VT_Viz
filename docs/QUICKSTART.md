# VizOne Quick Start Guide

## 🚀 Project Successfully Initialized!

Your Three.js cybersecurity visualization is now running at [http://localhost:3000](http://localhost:3000)

## What's Been Created

### Core Features
✅ **Vite + Three.js Setup** - Fast development environment with hot module replacement
✅ **3D Particle System** - 5,000 particles representing cybersecurity events
✅ **Gravity Physics** - Particles attract to category-based gravity wells
✅ **Interactive Controls** - dat.GUI panel for real-time parameter adjustment
✅ **Data Processing** - Support for CSV/JSON datasets with automatic validation
✅ **Visual Encoding** - Threat levels mapped to size, color, and motion

### Project Structure
```
VizOne/
├── src/                    # Application source code
│   ├── main.js            # Entry point & initialization
│   ├── scene.js           # Three.js scene setup
│   ├── particles.js       # Particle system with custom shaders
│   ├── physics.js         # Gravity simulation engine
│   ├── data-loader.js     # Dataset processing
│   └── controls.js        # Interactive GUI controls
├── docs/                   # Comprehensive documentation
│   ├── CLAUDE-*.md        # AI context files for each module
│   └── SETUP.md          # Detailed setup instructions
├── public/data/           # Sample datasets
└── index.html            # Application shell
```

## Keyboard Shortcuts

- **H** - Toggle UI panels visibility
- **Space** - Pause/resume animation
- **R** - Reset camera position
- **G** - Toggle GUI controls
- **P** - Enable/disable physics
- **A** - Toggle auto-rotation

## Next Steps

### 1. Customize the Visualization
- Adjust parameters in the GUI panel (right side)
- Modify gravity strength for different clustering patterns
- Change particle size and opacity for visual emphasis

### 2. Load Your Own Data
Place a CSV or JSON file in `public/data/` with this format:
```csv
timestamp,severity,category,source_ip,destination_ip,attack_type,confidence,data_volume
2024-01-15T10:23:45Z,8,malware,192.168.1.105,10.0.0.1,trojan,0.95,1024
```

Then update `src/data-loader.js`:
```javascript
const DATA_SOURCE = '/data/your-file.csv';
```

### 3. Enhance Visual Effects
- Custom shaders are ready for modification in `src/particles.js`
- Post-processing pipeline can be added in `src/scene.js`
- Particle trails and connections can be enabled

### 4. Deploy to Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages (after setting up repository)
npm run deploy
```

## Current Visualization Features

### Visual Mappings
- **Particle Size**: Event severity (2-20 units)
- **Particle Color**: Attack type
  - 🔴 Red: DDoS attacks
  - 🟣 Purple: Malware
  - 🟠 Orange: Intrusions
  - 🟡 Yellow: Phishing
  - 🔵 Blue: Benign traffic
- **Opacity**: Confidence level (30-100%)
- **Motion**: Gravity-based clustering by category
- **Pulsing**: High-threat events (severity > 7)

### Performance
- Renders 5,000+ particles at 60 FPS
- Optimized with instanced rendering
- Custom GLSL shaders for GPU acceleration
- Spatial partitioning for physics calculations

## Troubleshooting

### Low FPS?
1. Reduce particle count in GUI
2. Disable physics simulation
3. Lower particle size multiplier

### Data Not Loading?
1. Check browser console for errors
2. Verify file path in data-loader.js
3. Ensure CSV/JSON format matches schema

### Black Screen?
1. Check WebGL support: [get.webgl.org](https://get.webgl.org/)
2. Update graphics drivers
3. Try different browser

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Project README](../README.md)
- [Setup Guide](SETUP.md)
- [Architecture Docs](CLAUDE.md)

---

**Enjoy exploring your data in 3D!** 🎨✨

For questions or issues, check the documentation in `/docs` or open an issue on GitHub.