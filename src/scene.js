import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let composer, renderPass, bloomPass;
let clock = new THREE.Clock();

export async function initScene(container) {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0005);
  
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
  camera.position.set(-700, 800, 600);  // Start with side/top-down view of proxy chain
  camera.lookAt(-700, 0, -100);
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 100;
  controls.maxDistance = 2000;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotate = false; // Disabled - too distracting during attack sequences
  controls.autoRotateSpeed = 0.3;
  
  addLights();
  // addStarfield(); // Disabled for cleaner packet flow visualization
  
  window.addEventListener('resize-scene', (e) => {
    const { width, height } = e.detail;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  
  window.addEventListener('reset-camera', () => {
    controls.reset();
    camera.position.set(-700, 800, 600);  // Reset to side/top-down view
    camera.lookAt(-700, 0, -100);
  });
  
  return { scene, camera, renderer, controls };
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(500, 500, 500);
  directionalLight1.castShadow = true;
  scene.add(directionalLight1);
  
  const directionalLight2 = new THREE.DirectionalLight(0x00ffff, 0.4);
  directionalLight2.position.set(-500, 300, -500);
  scene.add(directionalLight2);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.3, 2000);
  pointLight.position.set(0, 200, 0);
  scene.add(pointLight);
}

function addStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.7,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: false
  });
  
  const starsVertices = [];
  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 4000;
    const y = (Math.random() - 0.5) * 4000;
    const z = (Math.random() - 0.5) * 4000;
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);
}

let animationPaused = false;

window.addEventListener('toggle-animation', () => {
  animationPaused = !animationPaused;
  controls.autoRotate = !animationPaused;
});

export function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  
  if (!animationPaused) {
    controls.update();
    
    const timelineEvent = new CustomEvent('update-timeline', { detail: { deltaTime } });
    window.dispatchEvent(timelineEvent);
  }
  
  renderer.render(scene, camera);
}

export function getSceneComponents() {
  return { scene, camera, renderer, controls };
}