import * as dat from 'dat.gui';
import { updatePhysicsConfig } from './physics.js';

let gui;
let settings;

export function initControls(sceneComponents, particles) {
  gui = new dat.GUI({ width: 300 });
  
  settings = {
    autoRotate: true,
    rotationSpeed: 0.3,
    particleSize: 1.0,
    particleOpacity: 1.0,
    gravityStrength: 0.01,
    repulsionStrength: 50,
    damping: 0.98,
    showStats: true,
    showInfo: true,
    particleCount: particles ? particles.length : 0,
    physicsEnabled: true,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.85
  };
  
  const sceneFolder = gui.addFolder('Scene');
  sceneFolder.add(settings, 'autoRotate').onChange(value => {
    sceneComponents.controls.autoRotate = value;
  });
  sceneFolder.add(settings, 'rotationSpeed', 0, 2).onChange(value => {
    sceneComponents.controls.autoRotateSpeed = value;
  });
  sceneFolder.open();
  
  const particleFolder = gui.addFolder('Particles');
  particleFolder.add(settings, 'particleSize', 0.1, 3).onChange(value => {
    updateParticleSize(value);
  });
  particleFolder.add(settings, 'particleOpacity', 0.1, 1).onChange(value => {
    updateParticleOpacity(value);
  });
  particleFolder.add(settings, 'particleCount').listen();
  particleFolder.open();
  
  const physicsFolder = gui.addFolder('Physics');
  physicsFolder.add(settings, 'physicsEnabled').onChange(value => {
    const event = new CustomEvent('toggle-physics');
    window.dispatchEvent(event);
  });
  physicsFolder.add(settings, 'gravityStrength', 0, 0.1).onChange(value => {
    updatePhysicsConfig({ GRAVITY_CONSTANT: value });
  });
  physicsFolder.add(settings, 'repulsionStrength', 0, 200).onChange(value => {
    updatePhysicsConfig({ REPULSION_STRENGTH: value });
  });
  physicsFolder.add(settings, 'damping', 0.9, 1).onChange(value => {
    updatePhysicsConfig({ DAMPING_FACTOR: value });
  });
  physicsFolder.open();
  
  const displayFolder = gui.addFolder('Display');
  displayFolder.add(settings, 'showStats').onChange(value => {
    const statsElements = document.querySelectorAll('.stats');
    statsElements.forEach(el => {
      el.style.display = value ? 'grid' : 'none';
    });
  });
  displayFolder.add(settings, 'showInfo').onChange(value => {
    const infoPanel = document.querySelector('.info-panel');
    const controlsHint = document.querySelector('.controls-hint');
    if (infoPanel) infoPanel.style.display = value ? 'block' : 'none';
    if (controlsHint) controlsHint.style.display = value ? 'block' : 'none';
  });
  
  const actions = {
    resetCamera: () => {
      const event = new CustomEvent('reset-camera');
      window.dispatchEvent(event);
    },
    pauseAnimation: () => {
      const event = new CustomEvent('toggle-animation');
      window.dispatchEvent(event);
    },
    exportStats: () => {
      exportStatistics(particles);
    },
    regenerateData: () => {
      location.reload();
    }
  };
  
  const actionsFolder = gui.addFolder('Actions');
  actionsFolder.add(actions, 'resetCamera').name('Reset Camera');
  actionsFolder.add(actions, 'pauseAnimation').name('Pause/Resume');
  actionsFolder.add(actions, 'exportStats').name('Export Statistics');
  actionsFolder.add(actions, 'regenerateData').name('Regenerate Data');
  
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '20px';
  gui.domElement.style.right = '20px';
  
  addKeyboardShortcuts();
  
  return gui;
}

function updateParticleSize(multiplier) {
  const event = new CustomEvent('update-particle-size', { 
    detail: { multiplier } 
  });
  window.dispatchEvent(event);
}

function updateParticleOpacity(multiplier) {
  const event = new CustomEvent('update-particle-opacity', { 
    detail: { multiplier } 
  });
  window.dispatchEvent(event);
}

function exportStatistics(particles) {
  if (!particles) {
    console.log('No particle data to export (using timeline mode)');
    return;
  }
  
  const stats = {
    timestamp: new Date().toISOString(),
    particleCount: particles.length,
    categories: {},
    threatLevels: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    anomalies: []
  };
  
  particles.forEach(particle => {
    if (!stats.categories[particle.category]) {
      stats.categories[particle.category] = 0;
    }
    stats.categories[particle.category]++;
    
    if (particle.threatLevel >= 0.8) stats.threatLevels.critical++;
    else if (particle.threatLevel >= 0.6) stats.threatLevels.high++;
    else if (particle.threatLevel >= 0.4) stats.threatLevels.medium++;
    else stats.threatLevels.low++;
    
    if (particle.isAnomaly) {
      stats.anomalies.push({
        id: particle.id,
        type: particle.anomalyType,
        position: particle.position.toArray(),
        velocity: particle.velocity.length()
      });
    }
  });
  
  const dataStr = JSON.stringify(stats, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `vizone-stats-${Date.now()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

function addKeyboardShortcuts() {
  const shortcuts = {
    'g': () => gui.closed ? gui.open() : gui.close(),
    'p': () => {
      settings.physicsEnabled = !settings.physicsEnabled;
      const event = new CustomEvent('toggle-physics');
      window.dispatchEvent(event);
      gui.updateDisplay();
    },
    'a': () => {
      settings.autoRotate = !settings.autoRotate;
      const event = new CustomEvent('toggle-animation');
      window.dispatchEvent(event);
      gui.updateDisplay();
    }
  };
  
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    const action = shortcuts[e.key.toLowerCase()];
    if (action) {
      e.preventDefault();
      action();
    }
  });
}

export function getSettings() {
  return settings;
}