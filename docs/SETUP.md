# Complete Setup Guide

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Version 2.0 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended for large datasets)
- **GPU**: WebGL 2.0 support required
- **Network**: Internet connection for initial setup and dependencies

## Installation Steps

### 1. Clone the Repository

```bash
# Via HTTPS
git clone https://github.com/yourusername/VizOne.git

# Via SSH (if you have SSH keys set up)
git clone git@github.com:yourusername/VizOne.git

# Navigate to project directory
cd VizOne
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# If you encounter permission errors on Unix systems
sudo npm install

# For Windows users with long path issues
npm config set max-old-space-size=8192
npm install
```

### 3. Verify Installation

```bash
# Check Node version
node --version  # Should be 18.0 or higher

# Check npm version
npm --version   # Should be 8.0 or higher

# List installed dependencies
npm list --depth=0
```

## Development Environment

### Start Development Server

```bash
# Start Vite dev server with hot module replacement
npm run dev

# The application will open automatically at http://localhost:3000
# If port 3000 is busy, Vite will use the next available port
```

### Development Features
- **Hot Module Replacement**: Changes reflect instantly
- **Source Maps**: Debug original source code
- **Error Overlay**: See errors directly in browser
- **Network Access**: Access from other devices on same network

### Accessing from Other Devices

```bash
# Find your local IP address
# On Windows
ipconfig

# On Mac/Linux
ifconfig

# Access the app from mobile/tablet
# http://YOUR_LOCAL_IP:3000
```

## Using Sample Data

### Built-in Sample Dataset

```bash
# The application includes sample data that loads automatically
# No additional setup required for demo purposes
```

### Using Your Own Data

1. **Prepare your CSV file** with the following columns:
   ```csv
   timestamp,severity,category,source_ip,destination_ip,attack_type,confidence,data_volume
   ```

2. **Place the file** in `public/data/` directory:
   ```bash
   cp your-data.csv public/data/
   ```

3. **Update the data source** in `src/data-loader.js`:
   ```javascript
   const DATA_SOURCE = '/data/your-data.csv';
   ```

### Downloading Public Datasets

#### CICIDS2017 Dataset
```bash
# Download network intrusion dataset
wget https://www.unb.ca/cic/datasets/ids-2017.html

# Extract and convert to supported format
# Use the provided conversion script
node scripts/convert-cicids.js input.csv public/data/cicids.csv
```

#### Custom API Integration
```javascript
// In src/data-loader.js
const API_ENDPOINT = 'https://your-api.com/events';

async function loadLiveData() {
  const response = await fetch(API_ENDPOINT);
  return response.json();
}
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Keys (if using external services)
VITE_GEO_API_KEY=your_api_key_here
VITE_WEBSOCKET_URL=wss://your-websocket-server.com

# Performance Settings
VITE_MAX_PARTICLES=10000
VITE_PHYSICS_WORKERS=4

# Debug Options
VITE_DEBUG_MODE=false
VITE_SHOW_STATS=true
```

### Performance Tuning

Edit `src/config.js` to adjust performance settings:

```javascript
export const CONFIG = {
  // Particle System
  MAX_PARTICLES: 10000,
  PARTICLE_SIZE: 5,
  
  // Physics
  GRAVITY_STRENGTH: 0.001,
  DAMPING: 0.99,
  
  // Rendering
  PIXEL_RATIO: window.devicePixelRatio,
  ENABLE_SHADOWS: false,
  ENABLE_POSTPROCESSING: true,
  
  // Data
  BATCH_SIZE: 100,
  UPDATE_INTERVAL: 16 // 60 FPS
};
```

## Building for Production

### Create Production Build

```bash
# Build optimized version
npm run build

# Output will be in the 'dist' directory
# Check build size
du -sh dist/
```

### Preview Production Build

```bash
# Serve production build locally
npm run preview

# Opens at http://localhost:4173
```

### Deploy to GitHub Pages

```bash
# Install gh-pages utility
npm install --save-dev gh-pages

# Add deploy script to package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# Deploy to GitHub Pages
npm run deploy

# Access at https://yourusername.github.io/VizOne
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --dir=dist --prod

# Or drag and drop the 'dist' folder to netlify.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow the prompts
```

## Troubleshooting

### Common Issues and Solutions

#### 1. WebGL Not Supported
**Error**: "WebGL is not supported in your browser"

**Solution**:
- Update your browser to the latest version
- Enable hardware acceleration in browser settings
- Check if WebGL is blocked: Visit https://get.webgl.org/
- Try a different browser

#### 2. Performance Issues
**Problem**: Low FPS or stuttering

**Solutions**:
```javascript
// Reduce particle count in src/config.js
MAX_PARTICLES: 5000  // Lower from 10000

// Disable post-processing
ENABLE_POSTPROCESSING: false

// Lower pixel ratio
PIXEL_RATIO: 1  // Instead of window.devicePixelRatio
```

#### 3. Data Loading Errors
**Error**: "Failed to load dataset"

**Solutions**:
- Check file path in `src/data-loader.js`
- Verify CSV format matches expected schema
- Check browser console for CORS errors
- Use local data file instead of remote URL

#### 4. Memory Issues
**Problem**: Browser tab crashes with large datasets

**Solutions**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=8192 npm run dev

# Or use data pagination/streaming
```

#### 5. Build Failures
**Error**: Build process fails

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check for conflicting dependencies
npm ls

# Update all dependencies
npm update
```

### Browser-Specific Issues

#### Chrome
- Enable GPU acceleration: `chrome://flags/#ignore-gpu-blocklist`
- Check WebGL status: `chrome://gpu`

#### Firefox
- Enable WebGL: `about:config` → `webgl.force-enabled`
- Increase memory: `about:config` → `dom.max_script_run_time`

#### Safari
- Enable WebGL: Develop menu → Experimental Features → WebGL 2.0
- Enable developer tools: Preferences → Advanced → Show Develop menu

## Performance Optimization

### For Large Datasets (50,000+ points)

1. **Enable LOD (Level of Detail)**:
```javascript
// In src/particles.js
const LOD_ENABLED = true;
const LOD_LEVELS = [
  { distance: 100, particles: 50000 },
  { distance: 500, particles: 25000 },
  { distance: 1000, particles: 10000 },
  { distance: 2000, particles: 5000 }
];
```

2. **Use Web Workers**:
```javascript
// In src/physics.js
const PHYSICS_WORKERS = navigator.hardwareConcurrency || 4;
```

3. **Enable Culling**:
```javascript
// In src/scene.js
renderer.setScissorTest(true);
frustumCulling = true;
```

### Mobile Optimization

```javascript
// Detect mobile and adjust settings
if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
  CONFIG.MAX_PARTICLES = 5000;
  CONFIG.PIXEL_RATIO = 1;
  CONFIG.ENABLE_POSTPROCESSING = false;
}
```

## Development Tools

### Recommended VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Three.js Snippets**
- **GLSL Syntax Highlighting**
- **Prettier - Code formatter**
- **ESLint**

### Chrome Extensions
- **Three.js Developer Tools**
- **Spector.js** - WebGL debugging
- **React Developer Tools** (if using React)

### Performance Monitoring
```javascript
// Add to src/main.js for development
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  // ... render code
  stats.end();
}
```

## Getting Help

### Resources
- **Documentation**: Check `/docs` folder
- **GitHub Issues**: https://github.com/yourusername/VizOne/issues
- **Three.js Forum**: https://discourse.threejs.org/
- **Stack Overflow**: Tag with `three.js` and `webgl`

### Debug Mode
```javascript
// Enable debug mode in console
window.DEBUG = true;

// This will show:
// - Particle count
// - Force vectors
// - Octree boundaries
// - Performance metrics
```

### Reporting Issues
When reporting issues, please include:
1. Browser and version
2. Operating system
3. GPU model (check `chrome://gpu`)
4. Console errors (F12 → Console)
5. Steps to reproduce

---

Last Updated: Project initialization
Version: 1.0.0