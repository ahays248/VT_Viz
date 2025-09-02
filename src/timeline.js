import * as THREE from 'three';
import gsap from 'gsap';

export class AttackTimeline {
  constructor(scene, data, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.data = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    this.currentTime = 0;
    this.playbackSpeed = 3600; // 1 hour = 1 second
    this.isPlaying = true;
    this.activeFlows = [];
    this.flowGroup = new THREE.Group();
    this.nodeMap = new Map();
    this.currentStage = 0;
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    
    // Timeline range (72 hours)
    this.startTime = new Date(this.data[0].timestamp).getTime();
    this.endTime = this.startTime + (72 * 3600 * 1000);
    this.duration = this.endTime - this.startTime;
    
    // Create network nodes
    this.createNetworkNodes();
    
    // Add flow group to scene
    this.scene.add(this.flowGroup);
    
    // Stage boundaries with camera positions
    this.stages = [
      { 
        name: 'Reconnaissance', 
        start: 0, 
        end: 12, 
        color: 0xffff00,
        cameraPos: new THREE.Vector3(0, 600, 1000),
        cameraTarget: new THREE.Vector3(0, 0, 0),
        description: 'Attackers scanning network perimeter'
      },
      { 
        name: 'Initial Access', 
        start: 12, 
        end: 24, 
        color: 0xff8800,
        cameraPos: new THREE.Vector3(-300, 400, 600),
        cameraTarget: new THREE.Vector3(0, 0, 0),
        description: 'Brute force attacks on edge services'
      },
      { 
        name: 'Lateral Movement', 
        start: 24, 
        end: 48, 
        color: 0xff00ff,
        cameraPos: new THREE.Vector3(100, 200, 300),
        cameraTarget: new THREE.Vector3(0, 20, 0),
        description: 'Malware spreading between internal servers'
      },
      { 
        name: 'Data Exfiltration', 
        start: 48, 
        end: 60, 
        color: 0xffaa00,
        cameraPos: new THREE.Vector3(300, 300, 500),
        cameraTarget: new THREE.Vector3(200, 0, 200),
        description: 'Stealing data to external servers'
      },
      { 
        name: 'Ransomware', 
        start: 60, 
        end: 72, 
        color: 0xff0000,
        cameraPos: new THREE.Vector3(0, 150, 250),
        cameraTarget: new THREE.Vector3(0, 20, 0),
        description: 'Encryption spreading across network'
      }
    ];
    
    this.initUI();
  }
  
  createNetworkNodes() {
    // Create central network infrastructure
    const networkGroup = new THREE.Group();
    
    // Main server rack (central target)
    const serverGeometry = new THREE.BoxGeometry(150, 200, 150);
    const serverMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0080ff,
      emissive: 0x0040ff,
      emissiveIntensity: 0.2,
      transparent: true, 
      opacity: 0.7
    });
    this.targetNetwork = new THREE.Mesh(serverGeometry, serverMaterial);
    this.targetNetwork.position.set(0, 0, 0);
    networkGroup.add(this.targetNetwork);
    
    // Add glowing edges
    const edgesGeometry = new THREE.EdgesGeometry(serverGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 2
    });
    const serverEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    this.targetNetwork.add(serverEdges);
    
    // Add base platform
    const platformGeometry = new THREE.CylinderGeometry(250, 300, 10, 32);
    const platformMaterial = new THREE.MeshPhongMaterial({
      color: 0x202020,
      emissive: 0x101010
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -105;
    networkGroup.add(platform);
    
    // Add network label
    this.createNetworkLabel();
    
    // Add the network group to scene
    this.scene.add(networkGroup);
    
    // Create attacker nodes positioned around the network
    const attackerPositions = [
      { ip: '218.92.0', pos: new THREE.Vector3(-500, 0, -500), country: 'China' },
      { ip: '185.220.', pos: new THREE.Vector3(500, 0, -500), country: 'Russia' },
      { ip: '191.96.', pos: new THREE.Vector3(-500, 0, 500), country: 'Brazil' },
      { ip: '14.177.', pos: new THREE.Vector3(500, 0, 500), country: 'Vietnam' },
      { ip: '103.251.', pos: new THREE.Vector3(0, 0, -700), country: 'India' }
    ];
    
    attackerPositions.forEach(attacker => {
      const nodeGeometry = new THREE.SphereGeometry(30, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(attacker.pos);
      this.scene.add(node);
      
      // Add pulsing animation to attacker nodes
      const pulse = () => {
        node.scale.x = node.scale.y = node.scale.z = 1 + Math.sin(Date.now() * 0.001) * 0.1;
        requestAnimationFrame(pulse);
      };
      pulse();
      
      // Store node reference
      this.nodeMap.set(attacker.ip, node);
      
      // Add label
      this.createLabel(attacker.country, attacker.pos);
    });
    
    // Create internal network nodes (servers inside the network)
    const internalNodes = [
      { ip: '192.168.1.10', pos: new THREE.Vector3(-40, 20, -40), name: 'Web Server' },
      { ip: '192.168.1.15', pos: new THREE.Vector3(40, 20, -40), name: 'Database' },
      { ip: '192.168.1.22', pos: new THREE.Vector3(-40, 20, 40), name: 'File Server' },
      { ip: '192.168.1.45', pos: new THREE.Vector3(40, 20, 40), name: 'Mail Server' }
    ];
    
    internalNodes.forEach(node => {
      const nodeGeometry = new THREE.BoxGeometry(25, 30, 25);
      const nodeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.8
      });
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      mesh.position.copy(node.pos);
      
      // Add edges for visibility
      const edges = new THREE.EdgesGeometry(nodeGeometry);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const edgeMesh = new THREE.LineSegments(edges, edgeMat);
      mesh.add(edgeMesh);
      
      this.scene.add(mesh);
      this.nodeMap.set(node.ip, mesh);
    });
  }
  
  createNetworkLabel() {
    // Add a glowing ring around the base to indicate this is the target network
    const ringGeometry = new THREE.TorusGeometry(280, 5, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = -100;
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);
  }
  
  createLabel(text, position) {
    // Labels would require text geometry or sprites
    // For now, we'll skip labels but they could be added with THREE.TextGeometry
  }
  
  initUI() {
    // Create timeline UI
    const timelineDiv = document.createElement('div');
    timelineDiv.id = 'timeline-container';
    timelineDiv.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                  background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; 
                  border: 1px solid rgba(255,255,255,0.2); min-width: 600px; z-index: 1000;">
        <div style="color: white; font-family: monospace; margin-bottom: 10px;">
          <span id="stage-name" style="font-size: 18px; color: #00ffff;">Stage: Initializing</span>
          <span id="time-display" style="float: right;">Hour: 0 / 72</span>
        </div>
        <div style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; margin-bottom: 10px;">
          <div id="progress-bar" style="background: linear-gradient(90deg, #ffff00, #ff8800, #ff00ff, #ff0000); 
                                         height: 100%; width: 0%; border-radius: 5px; transition: width 0.1s;"></div>
        </div>
        <div style="text-align: center;">
          <button id="play-pause" style="background: #00ffff; border: none; padding: 5px 15px; 
                                          border-radius: 5px; color: black; cursor: pointer; margin: 0 5px;">⏸ Pause</button>
          <button id="speed-1x" style="background: #444; border: none; padding: 5px 15px; 
                                        border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">1x</button>
          <button id="speed-10x" style="background: #444; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">10x</button>
          <button id="speed-60x" style="background: #00ffff; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: black; cursor: pointer; margin: 0 5px;">60x</button>
          <button id="restart" style="background: #444; border: none; padding: 5px 15px; 
                                       border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">↺ Restart</button>
        </div>
        <div id="event-stats" style="color: #888; font-size: 12px; margin-top: 10px; text-align: center;">
          Events: <span id="event-count">0</span> | 
          Flows: <span id="flow-count">0</span> | 
          Attacks: <span id="attack-count">0</span>
        </div>
      </div>
    `;
    document.body.appendChild(timelineDiv);
    
    // Add event listeners
    document.getElementById('play-pause').addEventListener('click', () => this.togglePlayback());
    document.getElementById('speed-1x').addEventListener('click', () => this.setSpeed(3600));
    document.getElementById('speed-10x').addEventListener('click', () => this.setSpeed(360));
    document.getElementById('speed-60x').addEventListener('click', () => this.setSpeed(60));
    document.getElementById('restart').addEventListener('click', () => this.restart());
  }
  
  update(deltaTime) {
    if (!this.isPlaying) return;
    
    // Update current time
    this.currentTime += deltaTime * this.playbackSpeed * 1000;
    
    if (this.currentTime > this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;
    }
    
    // Calculate current hour
    const currentHour = (this.currentTime / (3600 * 1000));
    
    // Update stage
    const newStage = this.stages.findIndex(s => currentHour >= s.start && currentHour < s.end);
    if (newStage !== this.currentStage && newStage >= 0) {
      this.currentStage = newStage;
      this.onStageChange(this.stages[this.currentStage]);
    }
    
    // Process events up to current time
    const currentTimestamp = this.startTime + this.currentTime;
    this.processEvents(currentTimestamp);
    
    // Update active flows
    this.updateFlows(deltaTime);
    
    // Update UI
    this.updateUI(currentHour);
  }
  
  processEvents(currentTimestamp) {
    // Find events that should be triggered
    const eventsToProcess = this.data.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime <= currentTimestamp && !event.processed;
    });
    
    eventsToProcess.forEach(event => {
      event.processed = true;
      this.createPacketFlow(event);
    });
  }
  
  createPacketFlow(event) {
    // Determine source and destination positions
    const sourcePos = this.getNodePosition(event.source_ip);
    const destPos = this.getNodePosition(event.destination_ip);
    
    if (!sourcePos || !destPos) return;
    
    // Create packet particle
    const packetGeometry = new THREE.SphereGeometry(2, 8, 8);
    const packetMaterial = new THREE.MeshBasicMaterial({
      color: this.getEventColor(event),
      emissive: this.getEventColor(event),
      emissiveIntensity: 2
    });
    const packet = new THREE.Mesh(packetGeometry, packetMaterial);
    packet.position.copy(sourcePos);
    
    // Create trail line
    const points = [sourcePos, destPos];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.getEventColor(event),
      transparent: true,
      opacity: 0.3
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    
    // Add to scene
    this.flowGroup.add(packet);
    this.flowGroup.add(line);
    
    // Animate packet movement
    const flow = {
      packet,
      line,
      event,
      lifetime: 2.0,
      age: 0
    };
    
    // Animate with GSAP
    gsap.to(packet.position, {
      x: destPos.x,
      y: destPos.y,
      z: destPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Flash on impact
        if (event.success) {
          this.createImpactEffect(destPos, event);
        }
      }
    });
    
    this.activeFlows.push(flow);
  }
  
  getNodePosition(ip) {
    // Check if it's an internal IP
    if (ip.startsWith('192.168.') || ip.startsWith('10.')) {
      // Internal node - return position within network
      const node = this.nodeMap.get(ip);
      if (node) return node.position.clone();
      
      // Random position within network for unknown internal IPs
      return new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
    }
    
    // External attacker - find by prefix
    for (let [prefix, node] of this.nodeMap) {
      if (ip.startsWith(prefix)) {
        return node.position.clone();
      }
    }
    
    // Unknown external - return random external position
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * 600,
      0,
      Math.sin(angle) * 600
    );
  }
  
  getEventColor(event) {
    const colorMap = {
      'reconnaissance': 0xffff00,
      'brute_force': 0xff8800,
      'intrusion': 0xff4400,
      'malware': 0xff00ff,
      'ransomware': 0xff0000,
      'data_exfil': 0xffaa00,
      'benign': 0x0080ff
    };
    return colorMap[event.category] || 0x808080;
  }
  
  createImpactEffect(position, event) {
    // Create expanding ring effect
    const ringGeometry = new THREE.RingGeometry(1, 5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.getEventColor(event),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    this.flowGroup.add(ring);
    
    // Animate expansion and fade
    gsap.to(ring.scale, {
      x: 10,
      y: 10,
      z: 10,
      duration: 1,
      ease: "power2.out"
    });
    
    gsap.to(ringMaterial, {
      opacity: 0,
      duration: 1,
      onComplete: () => {
        this.flowGroup.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
      }
    });
    
    // Flash the target node if it exists
    const targetNode = this.nodeMap.get(event.destination_ip);
    if (targetNode && event.category !== 'benign') {
      const originalColor = targetNode.material.color.getHex();
      targetNode.material.color.setHex(this.getEventColor(event));
      
      gsap.to(targetNode.material, {
        opacity: 1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          targetNode.material.color.setHex(originalColor);
        }
      });
    }
  }
  
  updateFlows(deltaTime) {
    // Update and clean up flows
    this.activeFlows = this.activeFlows.filter(flow => {
      flow.age += deltaTime;
      
      // Fade out old flows
      if (flow.age > flow.lifetime) {
        this.flowGroup.remove(flow.packet);
        this.flowGroup.remove(flow.line);
        flow.packet.geometry.dispose();
        flow.packet.material.dispose();
        flow.line.geometry.dispose();
        flow.line.material.dispose();
        return false;
      }
      
      // Update opacity
      const fadeStart = flow.lifetime * 0.7;
      if (flow.age > fadeStart) {
        const fadeProgress = (flow.age - fadeStart) / (flow.lifetime - fadeStart);
        flow.line.material.opacity = 0.3 * (1 - fadeProgress);
      }
      
      return true;
    });
  }
  
  animateCamera(stage) {
    // Temporarily disable auto-rotate during camera animation
    const wasAutoRotating = this.controls.autoRotate;
    this.controls.autoRotate = false;
    
    // Animate camera position
    gsap.to(this.camera.position, {
      x: stage.cameraPos.x,
      y: stage.cameraPos.y,
      z: stage.cameraPos.z,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.lookAt(stage.cameraTarget);
      },
      onComplete: () => {
        // Update controls target
        this.controls.target.copy(stage.cameraTarget);
        this.controls.autoRotate = wasAutoRotating;
      }
    });
    
    // Update controls target
    gsap.to(this.controls.target, {
      x: stage.cameraTarget.x,
      y: stage.cameraTarget.y,
      z: stage.cameraTarget.z,
      duration: 3,
      ease: "power2.inOut"
    });
  }
  
  onStageChange(stage) {
    console.log(`=== STAGE CHANGE: ${stage.name} ===`);
    
    // Animate camera to new position
    this.animateCamera(stage);
    
    // Update target network color based on stage
    gsap.to(this.targetNetwork.material.color, {
      r: ((stage.color >> 16) & 255) / 255,
      g: ((stage.color >> 8) & 255) / 255,
      b: (stage.color & 255) / 255,
      duration: 2
    });
    
    // Create stage announcement
    const stageDiv = document.createElement('div');
    stageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #${stage.color.toString(16).padStart(6, '0')};
      font-size: 48px;
      font-weight: bold;
      text-shadow: 0 0 20px currentColor;
      pointer-events: none;
      z-index: 2000;
    `;
    stageDiv.textContent = stage.name;
    document.body.appendChild(stageDiv);
    
    gsap.from(stageDiv, {
      scale: 0,
      duration: 0.5,
      ease: "back.out"
    });
    
    gsap.to(stageDiv, {
      opacity: 0,
      delay: 2,
      duration: 1,
      onComplete: () => stageDiv.remove()
    });
  }
  
  updateUI(currentHour) {
    const stage = this.stages[this.currentStage];
    const stageName = document.getElementById('stage-name');
    if (stage) {
      stageName.innerHTML = `Stage: ${stage.name}<br><span style="font-size: 12px; color: #888;">${stage.description}</span>`;
    } else {
      stageName.textContent = 'Stage: Complete';
    }
    document.getElementById('time-display').textContent = `Hour: ${Math.floor(currentHour)} / 72`;
    document.getElementById('progress-bar').style.width = `${(currentHour / 72) * 100}%`;
    
    // Update stats
    const processedEvents = this.data.filter(e => e.processed).length;
    const attacks = this.data.filter(e => e.processed && e.category !== 'benign').length;
    document.getElementById('event-count').textContent = processedEvents;
    document.getElementById('flow-count').textContent = this.activeFlows.length;
    document.getElementById('attack-count').textContent = attacks;
  }
  
  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('play-pause');
    btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
  }
  
  setSpeed(speed) {
    this.playbackSpeed = speed;
    
    // Update button styles
    ['speed-1x', 'speed-10x', 'speed-60x'].forEach(id => {
      document.getElementById(id).style.background = '#444';
      document.getElementById(id).style.color = 'white';
    });
    
    if (speed === 3600) document.getElementById('speed-1x').style.background = '#00ffff';
    else if (speed === 360) document.getElementById('speed-10x').style.background = '#00ffff';
    else if (speed === 60) document.getElementById('speed-60x').style.background = '#00ffff';
    
    const activeBtn = document.querySelector(`#speed-${speed === 3600 ? '1x' : speed === 360 ? '10x' : '60x'}`);
    if (activeBtn) activeBtn.style.color = 'black';
  }
  
  restart() {
    this.currentTime = 0;
    this.currentStage = 0;
    this.isPlaying = true;
    
    // Clear all flows
    this.activeFlows.forEach(flow => {
      this.flowGroup.remove(flow.packet);
      this.flowGroup.remove(flow.line);
      flow.packet.geometry.dispose();
      flow.packet.material.dispose();
      flow.line.geometry.dispose();
      flow.line.material.dispose();
    });
    this.activeFlows = [];
    
    // Reset event processing
    this.data.forEach(event => {
      event.processed = false;
    });
    
    // Reset node colors
    this.nodeMap.forEach(node => {
      if (node.material) {
        node.material.opacity = 0.5;
      }
    });
    
    document.getElementById('play-pause').textContent = '⏸ Pause';
  }
  
  dispose() {
    // Clean up
    this.flowGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.scene.remove(this.flowGroup);
    
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) timelineContainer.remove();
  }
}