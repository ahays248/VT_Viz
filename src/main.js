import './style.css';
import { initScene, animate } from './scene.js';
import { VoltTyphoonTimeline } from './volt-typhoon-timeline.js';
import { loadDataset } from './data-loader.js';
import { initControls } from './controls.js';

let isInitialized = false;
let timeline = null;

async function init() {
  try {
    showLoadingScreen('Initializing scene...');
    
    const container = document.getElementById('canvas-container');
    const sceneComponents = await initScene(container);
    
    showLoadingScreen('Loading dataset...');
    const data = await loadDataset('/data/volt-typhoon-attack.json');
    
    showLoadingScreen('Creating attack timeline...');
    timeline = new VoltTyphoonTimeline(sceneComponents.scene, data, sceneComponents.camera, sceneComponents.controls);
    
    showLoadingScreen('Setting up controls...');
    initControls(sceneComponents, null);
    
    // Add timeline update to animation loop
    window.addEventListener('update-timeline', (e) => {
      if (timeline) {
        timeline.update(e.detail.deltaTime);
      }
    });
    
    updateStats(data);
    
    hideLoadingScreen();
    
    animate();
    
    isInitialized = true;
    
  } catch (error) {
    console.error('Initialization failed:', error);
    showError(error.message);
  }
}

function showLoadingScreen(message) {
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading');
  if (loadingScreen) {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

function showError(message) {
  const container = document.getElementById('app');
  container.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                text-align: center; color: #ff0000; font-family: monospace;">
      <h2>Initialization Error</h2>
      <p>${message}</p>
      <p style="color: #888; margin-top: 20px;">Please check the console for details.</p>
    </div>
  `;
}

function updateStats(data) {
  const eventCount = document.getElementById('event-count');
  const threatCount = document.getElementById('threat-count');
  const anomalyCount = document.getElementById('anomaly-count');
  
  if (eventCount) eventCount.textContent = data.length;
  if (threatCount) {
    const threats = data.filter(d => d.severity >= 7).length;
    threatCount.textContent = threats;
  }
  if (anomalyCount) {
    const anomalies = data.filter(d => d.category === 'ransomware' || d.category === 'data_exfil').length;
    anomalyCount.textContent = anomalies;
  }
  
  // Show attack stage info
  console.log('=== ATTACK TIMELINE ===');
  console.log('Stage 1 (Recon):', data.filter(d => d.stage === 1).length, 'events');
  console.log('Stage 2 (Access):', data.filter(d => d.stage === 2).length, 'events');
  console.log('Stage 3 (Lateral):', data.filter(d => d.stage === 3).length, 'events');
  console.log('Stage 4 (Exfil):', data.filter(d => d.stage === 4).length, 'events');
  console.log('Stage 5 (Ransomware):', data.filter(d => d.stage === 5).length, 'events');
}

let lastTime = performance.now();
let frameCount = 0;

function updateFPS() {
  frameCount++;
  const currentTime = performance.now();
  
  if (currentTime >= lastTime + 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    const fpsElement = document.getElementById('fps-count');
    if (fpsElement) {
      fpsElement.textContent = fps;
      
      if (fps < 30) {
        fpsElement.style.color = '#ff0000';
      } else if (fps < 50) {
        fpsElement.style.color = '#ffff00';
      } else {
        fpsElement.style.color = '#00ff00';
      }
    }
    
    frameCount = 0;
    lastTime = currentTime;
  }
  
  if (isInitialized) {
    requestAnimationFrame(updateFPS);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  updateFPS();
});

window.addEventListener('resize', () => {
  if (isInitialized) {
    const container = document.getElementById('canvas-container');
    const event = new CustomEvent('resize-scene', { 
      detail: { 
        width: container.clientWidth, 
        height: container.clientHeight 
      } 
    });
    window.dispatchEvent(event);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') {
    const infoPanel = document.querySelector('.info-panel');
    const controlsHint = document.querySelector('.controls-hint');
    
    if (infoPanel) {
      infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
    }
    if (controlsHint) {
      controlsHint.style.display = controlsHint.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  if (e.key === ' ') {
    e.preventDefault();
    const event = new CustomEvent('toggle-animation');
    window.dispatchEvent(event);
  }
  
  if (e.key === 'r' || e.key === 'R') {
    const event = new CustomEvent('reset-camera');
    window.dispatchEvent(event);
  }
});

if (import.meta.hot) {
  import.meta.hot.accept();
}