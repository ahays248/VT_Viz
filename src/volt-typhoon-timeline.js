import * as THREE from 'three';
import gsap from 'gsap';

export class VoltTyphoonTimeline {
  constructor(scene, data, camera, controls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.data = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    this.currentTime = 0;
    this.playbackSpeed = 1; // Default to 1x speed for better visibility
    this.isPlaying = true;
    this.activeFlows = [];
    this.flowGroup = new THREE.Group();
    this.nodeMap = new Map();
    this.labelSprites = [];
    this.lastEventProcessedTime = 0; // Track when last event was processed for sequential display
    this.lastProcessedEventType = null; // Track the type of last processed event for continuity
    this.currentStage = 0;
    
    // Timeline range
    this.startTime = new Date(this.data[0].timestamp).getTime();
    this.endTime = this.startTime + (72 * 3600 * 1000);
    this.duration = this.endTime - this.startTime;
    
    // Create network infrastructure
    this.createNetworkInfrastructure();
    
    // Add flow group to scene
    this.scene.add(this.flowGroup);
    
    // Stage boundaries with Volt Typhoon specific tactics
    this.stages = [
      { 
        name: 'Initial Compromise', 
        start: 0, 
        end: 7, // Extended to fully show zero-day exploit
        color: 0x9900ff,
        cameraPos: new THREE.Vector3(-700, 800, 600),  // Side/top-down view of proxy chain
        cameraTarget: new THREE.Vector3(-700, 0, -100),
        description: 'CVE-2024-39717 - Versa Director Zero-Day',
        details: 'Exploiting authentication bypass in Versa SD-WAN controllers. Ports targeted: 4566, 4570, 443. Deploying VersaMem web shell for persistence.',
        technique: 'T1190',
        focus: 'proxy-to-versa'
      },
      { 
        name: 'Living Off the Land', 
        start: 7, // Delayed to give zero-day exploit time to be visible
        end: 24, 
        color: 0xffff00,
        cameraPos: new THREE.Vector3(-200, 750, 550),  // Center on Versa to IT transition
        cameraTarget: new THREE.Vector3(-200, 0, -100),
        description: 'PowerShell, WMI, WMIC Discovery',
        details: 'T1059.001: Using legitimate Windows tools - powershell.exe, wmic.exe, ntdsutil.exe, vssadmin.exe. No malware deployed.',
        technique: 'T1059.001',
        focus: 'it-network'
      },
      { 
        name: 'Multi-Hop Pivoting', 
        start: 24, 
        end: 48, 
        color: 0xff8800,
        cameraPos: new THREE.Vector3(50, 750, 550),  // Center on IT network
        cameraTarget: new THREE.Vector3(50, 0, -100),
        description: 'RDP Chain: Jump Box → DC → OT Network',
        details: 'T1021.001 & T1047: Moving laterally using stolen credentials via RDP (mstsc.exe) and WMI. Targeting Domain Controller.',
        technique: 'T1021.001',
        focus: 'jump-to-dc'
      },
      { 
        name: 'Domain & OT Compromise', 
        start: 48, 
        end: 60, 
        color: 0xff0000,
        cameraPos: new THREE.Vector3(500, 750, 550),  // Center on OT systems
        cameraTarget: new THREE.Vector3(500, 0, -100),
        description: 'NTDS.dit theft enables SCADA access',
        details: 'T1003.003: Using Volume Shadow Copy to extract AD database. Full domain compromise enables access to OT systems (Modbus, DNP3).',
        technique: 'T1003.003',
        focus: 'ot-systems'
      },
      { 
        name: 'Exfiltration & Persistence', 
        start: 60, 
        end: 72, 
        color: 0xff00ff,
        cameraPos: new THREE.Vector3(-100, 900, 700),  // Pull back showing full attack path
        cameraTarget: new THREE.Vector3(-100, 0, -100),
        description: 'Data theft via proxy chain, log deletion',
        details: 'T1090.003: Routing through New Caledonia → Pacific → Guam → China C2. T1070.001: Clearing Windows Event Logs.',
        technique: 'T1090.003',
        focus: 'overview'
      }
    ];
    
    this.initUI();
    this.createLegend();
    this.createTechniqueDisplay();
  }
  
  createNetworkInfrastructure() {
    // Create segmented network zones
    this.createNetworkZones();
    
    // LINEAR LAYOUT - Left to Right flow for clarity
    // External compromise points - Multi-hop proxy chain (FAR LEFT)
    const proxyChain = [
      { ip: '45.76.128.0', pos: new THREE.Vector3(-1000, 50, 0), name: 'China C2\nCommand Server', type: 'c2' },
      { ip: '103.56.54.0', pos: new THREE.Vector3(-800, 50, 0), name: 'New Caledonia\nVPN Device', type: 'proxy' },
      { ip: '203.119.88.0', pos: new THREE.Vector3(-600, 50, 0), name: 'Pacific\nCisco RV320', type: 'proxy' },
      { ip: '202.181.24.0', pos: new THREE.Vector3(-400, 50, 0), name: 'Guam\nNetgear Router', type: 'proxy' }
    ];
    
    // IT Network - Corporate zone (CENTER)
    const itNetwork = [
      { ip: '192.168.100.10', pos: new THREE.Vector3(-200, 50, 0), name: 'Versa Director\nPort 4566', type: 'sdwan' },
      { ip: '192.168.100.40', pos: new THREE.Vector3(0, 50, 0), name: 'Jump Box\nRDP 3389', type: 'jump' },
      { ip: '192.168.100.50', pos: new THREE.Vector3(200, 100, 0), name: 'Domain Controller\nPort 445/3389', type: 'dc' },
      { ip: '192.168.100.20', pos: new THREE.Vector3(0, 50, -150), name: 'Exchange Server\nPort 443', type: 'email' },
      { ip: '192.168.100.30', pos: new THREE.Vector3(0, 50, -300), name: 'Web Server\nPort 443/80', type: 'web' },
      { ip: '192.168.100.60', pos: new THREE.Vector3(0, 50, 150), name: 'File Server\nSMB 445', type: 'file' }
    ];
    
    // OT Network - Critical Infrastructure (FAR RIGHT)
    const otNetwork = [
      { ip: '10.1.1.10', pos: new THREE.Vector3(400, 50, 0), name: 'SCADA HMI\nPort 502', type: 'scada' },
      { ip: '10.1.1.20', pos: new THREE.Vector3(600, 50, -100), name: 'PLC Controller\nModbus 502', type: 'plc' },
      { ip: '10.1.1.30', pos: new THREE.Vector3(600, 50, 0), name: 'Water Treatment\nDNP3 20000', type: 'water' },
      { ip: '10.1.1.40', pos: new THREE.Vector3(600, 50, 100), name: 'Power Control\nIEC-104 2404', type: 'power' },
      { ip: '10.1.1.50', pos: new THREE.Vector3(800, 50, 0), name: 'Safety Systems\nOPC 4840', type: 'safety' }
    ];
    
    // Create nodes for each system
    [...proxyChain, ...itNetwork, ...otNetwork].forEach(node => {
      this.createNode(node);
    });
    
    // Create visual connections between network segments
    this.createNetworkConnections();
  }
  
  createNetworkZones() {
    // Internet/Proxy Zone (LEFT)
    const proxyZone = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 400),
      new THREE.MeshBasicMaterial({ 
        color: 0x660000, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide
      })
    );
    proxyZone.position.set(-600, 0, 0);
    proxyZone.rotation.x = -Math.PI / 2;
    this.scene.add(proxyZone);
    
    // IT Network Zone (CENTER)
    const itZone = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 600),
      new THREE.MeshBasicMaterial({ 
        color: 0x000066, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide
      })
    );
    itZone.position.set(0, 0, 0);
    itZone.rotation.x = -Math.PI / 2;
    this.scene.add(itZone);
    
    // OT/SCADA Zone (RIGHT)
    const otZone = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 400),
      new THREE.MeshBasicMaterial({ 
        color: 0x006600, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide
      })
    );
    otZone.position.set(600, 0, 0);
    otZone.rotation.x = -Math.PI / 2;
    this.scene.add(otZone);
    
    // Add zone labels
    this.addZoneLabel('COMPROMISED PROXIES', new THREE.Vector3(-600, 10, -250));
    this.addZoneLabel('IT NETWORK', new THREE.Vector3(0, 10, -350));
    this.addZoneLabel('OT / CRITICAL INFRASTRUCTURE', new THREE.Vector3(600, 10, -250));
  }
  
  createNode(nodeData) {
    let geometry, material, mesh;
    
    // Different shapes for different node types
    switch(nodeData.type) {
      case 'c2':
        geometry = new THREE.OctahedronGeometry(30);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xff00ff,
          emissive: 0x660066,
          emissiveIntensity: 0.4
        });
        break;
      case 'proxy':
        geometry = new THREE.ConeGeometry(20, 40, 8);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xff0000,
          emissive: 0x660000,
          emissiveIntensity: 0.3
        });
        break;
      case 'dc':
        geometry = new THREE.BoxGeometry(60, 80, 60);  // Larger proxy nodes
        material = new THREE.MeshPhongMaterial({ 
          color: 0xffff00,
          emissive: 0x666600,
          emissiveIntensity: 0.2
        });
        break;
      case 'scada':
      case 'plc':
      case 'water':
      case 'power':
      case 'safety':
        geometry = new THREE.CylinderGeometry(40, 40, 70, 8);  // Larger OT nodes
        material = new THREE.MeshPhongMaterial({ 
          color: 0x00ff00,
          emissive: 0x006600,
          emissiveIntensity: 0.3
        });
        break;
      case 'jump':
        geometry = new THREE.OctahedronGeometry(25);
        material = new THREE.MeshPhongMaterial({ 
          color: 0xff8800,
          emissive: 0x663300,
          emissiveIntensity: 0.2
        });
        break;
      default:
        geometry = new THREE.BoxGeometry(50, 60, 50);  // Larger IT nodes
        material = new THREE.MeshPhongMaterial({ 
          color: 0x0080ff,
          emissive: 0x004080,
          emissiveIntensity: 0.1
        });
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(nodeData.pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add wireframe for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: nodeData.type === 'proxy' ? 0xff0000 : 
             nodeData.type.includes('scada') || nodeData.type.includes('water') ? 0x00ff00 : 
             0x00ffff 
    });
    const edgeMesh = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(edgeMesh);
    
    this.scene.add(mesh);
    this.nodeMap.set(nodeData.ip, { mesh, data: nodeData });
    
    // Add text label
    this.createTextLabel(nodeData.name, nodeData.pos);
  }
  
  createTextLabel(text, position) {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 96;
    
    // Calculate text metrics for proper sizing
    context.font = 'bold 40px monospace';  // Larger text
    const lines = text.split('\n');
    const maxWidth = Math.max(...lines.map(line => context.measureText(line).width));
    
    // Resize canvas to fit text with padding
    const padding = 20;
    canvas.width = maxWidth + padding * 2;
    canvas.height = 40 + lines.length * 32;
    
    // Style the background with rounded corners effect
    context.fillStyle = 'rgba(0, 0, 0, 0.85)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    context.lineWidth = 1;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    context.fillStyle = '#ffffff';
    context.font = 'bold 40px monospace';  // Larger text
    context.textAlign = 'center';
    
    // Handle multi-line text
    lines.forEach((line, i) => {
      context.fillText(line, canvas.width / 2, 35 + i * 32);
    });
    
    // Create sprite with auto-sizing
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.95
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += 55;
    
    // Scale based on canvas size
    const scale = 0.5;  // Larger label scale
    sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
    
    this.scene.add(sprite);
    this.labelSprites.push(sprite);
  }
  
  addZoneLabel(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#00ffff';
    context.font = 'bold 36px monospace';  // Larger zone labels
    context.fillText(text, 20, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(280, 60, 1);  // Larger zone labels
    
    this.scene.add(sprite);
  }
  
  createNetworkConnections() {
    // Create visual network paths with better visibility
    const connections = [
      // Proxy chain - RED paths for malicious routing
      { from: '45.76.128.0', to: '103.56.54.0', color: 0x660000, label: 'C2 Channel' },
      { from: '103.56.54.0', to: '203.119.88.0', color: 0x660000, label: 'Proxy Chain' },
      { from: '203.119.88.0', to: '202.181.24.0', color: 0x660000 },
      { from: '202.181.24.0', to: '192.168.100.10', color: 0x990000, label: 'Initial Access' },
      
      // IT network connections - BLUE paths for internal network
      { from: '192.168.100.10', to: '192.168.100.40', color: 0x004466, label: 'Lateral Movement' },
      { from: '192.168.100.40', to: '192.168.100.50', color: 0x004466 },
      { from: '192.168.100.50', to: '192.168.100.60', color: 0x003355 },
      { from: '192.168.100.50', to: '192.168.100.20', color: 0x003355 },
      
      // IT to OT bridge - ORANGE paths for critical pivot
      { from: '192.168.100.50', to: '10.1.1.10', color: 0x664400, label: 'OT Pivot' },
      { from: '10.1.1.10', to: '10.1.1.20', color: 0x553300 },
      { from: '10.1.1.10', to: '10.1.1.30', color: 0x553300 },
      { from: '10.1.1.10', to: '10.1.1.40', color: 0x553300 },
    ];
    
    // Store connections for animation
    this.networkConnections = [];
    
    connections.forEach((conn) => {
      const sourceNode = this.nodeMap.get(conn.from);
      const destNode = this.nodeMap.get(conn.to);
      if (sourceNode && destNode) {
        // Create curved path for better visibility
        const curve = new THREE.QuadraticBezierCurve3(
          sourceNode.mesh.position,
          new THREE.Vector3(
            (sourceNode.mesh.position.x + destNode.mesh.position.x) / 2,
            Math.max(sourceNode.mesh.position.y, destNode.mesh.position.y) + 30,
            (sourceNode.mesh.position.z + destNode.mesh.position.z) / 2
          ),
          destNode.mesh.position
        );
        
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create main connection line
        const material = new THREE.LineBasicMaterial({ 
          color: conn.color,
          transparent: true,
          opacity: 0.5,
          linewidth: 2
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        // Create animated flow indicator
        const flowGeometry = new THREE.SphereGeometry(2, 8, 8);
        const flowMaterial = new THREE.MeshBasicMaterial({
          color: conn.color,
          transparent: true,
          opacity: 0.8,
          emissive: conn.color,
          emissiveIntensity: 0.5
        });
        const flowIndicator = new THREE.Mesh(flowGeometry, flowMaterial);
        flowIndicator.visible = false;
        this.scene.add(flowIndicator);
        
        this.networkConnections.push({
          line,
          curve,
          flowIndicator,
          from: conn.from,
          to: conn.to,
          active: false
        });
      }
    });
  }
  
  createLegend() {
    const legendDiv = document.createElement('div');
    legendDiv.id = 'legend';
    legendDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.8);
      padding: 15px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;
    legendDiv.innerHTML = `
      <div style="font-size: 14px; margin-bottom: 10px; color: #00ffff;">NETWORK ZONES</div>
      
      <div style="font-size: 12px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #444;">
        <div style="color: #888; margin-bottom: 5px;">NETWORK ZONES:</div>
        <div style="margin-bottom: 3px;"><span style="color: #ff0000;">■</span> Proxy Chain (Left)</div>
        <div style="margin-bottom: 3px;"><span style="color: #0080ff;">■</span> IT Network (Center)</div>
        <div style="margin-bottom: 3px;"><span style="color: #00ff00;">■</span> OT/SCADA (Right)</div>
      </div>
      
      <div style="font-size: 12px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #444;">
        <div style="color: #888; margin-bottom: 5px;">PACKET COLORS:</div>
        <div style="margin-bottom: 3px;"><span style="color: #9900ff;">●</span> Exploitation (Purple)</div>
        <div style="margin-bottom: 3px;"><span style="color: #ffff00;">●</span> Discovery (Yellow)</div>
        <div style="margin-bottom: 3px;"><span style="color: #ff8800;">●</span> Lateral Move (Orange)</div>
        <div style="margin-bottom: 3px;"><span style="color: #ff0000;">●</span> Critical Access (Red)</div>
        <div style="margin-bottom: 3px;"><span style="color: #ff00ff;">●</span> Exfiltration (Magenta)</div>
      </div>
      
    `;
    document.body.appendChild(legendDiv);
  }
  
  createTechniqueDisplay() {
    const techniqueDiv = document.createElement('div');
    techniqueDiv.id = 'technique-display';
    techniqueDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.95);
      padding: 20px 40px;
      border-radius: 10px;
      border: 2px solid #00ffff;
      color: white;
      font-family: monospace;
      z-index: 2000;
      text-align: center;
      min-width: 500px;
      box-shadow: 0 0 20px rgba(0,255,255,0.3);
    `;
    techniqueDiv.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 10px; color: #00ffff; font-weight: bold;">
        CURRENT ATTACK PHASE
      </div>
      <div id="current-technique" style="color: #ffff00; font-size: 16px; margin-bottom: 10px;">
        Initializing Attack...
      </div>
      <div style="color: #888; font-size: 12px; margin-top: 5px;">WHAT'S HAPPENING:</div>
      <div id="current-action" style="color: #ffffff; font-size: 14px; margin-top: 5px;">
        Preparing to compromise critical infrastructure...
      </div>
    `;
    document.body.appendChild(techniqueDiv);
  }
  
  processEvents(currentTimestamp) {
    // Process events more frequently for continuous flow
    const minEventInterval = 500; // 0.5 seconds between events for smoother flow
    
    if (this.lastEventProcessedTime && 
        currentTimestamp - this.lastEventProcessedTime < minEventInterval) {
      return; // Short wait between events
    }
    
    // Find all unprocessed events that should have occurred by now
    const availableEvents = this.data.filter(event => {
      const eventTime = new Date(event.timestamp).getTime();
      return eventTime <= currentTimestamp && !event.processed;
    });
    
    if (availableEvents.length === 0) return;
    
    // Group events by attack type and stage for continuous flow
    const currentStageEvents = availableEvents.filter(e => e.stage === this.currentStage);
    let nextEvent = null;
    
    // Prioritize events from current stage for continuous flow
    if (currentStageEvents.length > 0) {
      // Process similar events together for visual continuity
      const lastProcessedType = this.lastProcessedEventType;
      const sameTypeEvents = currentStageEvents.filter(e => e.attack_type === lastProcessedType);
      
      if (sameTypeEvents.length > 0) {
        nextEvent = sameTypeEvents[0];
      } else {
        nextEvent = currentStageEvents[0];
      }
    } else {
      // Move to next available event from any stage
      nextEvent = availableEvents[0];
    }
    
    if (nextEvent) {
      this.lastEventProcessedTime = currentTimestamp;
      this.lastProcessedEventType = nextEvent.attack_type;
      nextEvent.processed = true;
      this.createPacketFlow(nextEvent);
      
      // Handle zero-day exploit info box first
      if (nextEvent.attack_type === 'zero_day_exploit' && !this.cveExplained) {
        console.log('Zero-day exploit detected:', nextEvent);
        console.log('Showing zero-day info box');
        this.cveExplained = true;
        this.highlightZeroDay(nextEvent);
      }
      
      // Delay camera follow for major events to let the packet animation start first
      if (nextEvent.stage !== this.lastFollowedStage && (nextEvent.severity >= 9 || nextEvent.attack_type === 'ot_system_access')) {
        // Add delay for zero-day camera movement
        if (nextEvent.attack_type === 'zero_day_exploit') {
          setTimeout(() => {
            this.followAttack(nextEvent);
          }, 2000); // Wait 2 seconds for packet to start traveling
        } else {
          this.followAttack(nextEvent);
        }
        this.lastFollowedStage = nextEvent.stage;
      }
      
      // Update current technique display with better formatting
      const techniqueDiv = document.getElementById('current-technique');
      if (techniqueDiv) {
        if (nextEvent.technique) {
          const toolName = nextEvent.tool || 'Windows Tools';
          techniqueDiv.textContent = `${nextEvent.technique}: ${toolName}`;
        } else if (nextEvent.attack_type) {
          techniqueDiv.textContent = nextEvent.attack_type.replace(/_/g, ' ').toUpperCase();
        }
      }
      
      // Update current action description
      const actionDiv = document.getElementById('current-action');
      if (actionDiv) {
        let actionText = '';
        if (nextEvent.attack_type === 'port_scan') {
          actionText = `Scanning ${nextEvent.destination_ip} port ${nextEvent.target_port}`;
        } else if (nextEvent.attack_type === 'zero_day_exploit') {
          actionText = `Exploiting CVE-2024-39717 on Versa Director`;
        } else if (nextEvent.attack_type === 'rdp_lateral_movement') {
          actionText = `RDP from ${nextEvent.source_ip.split('.').pop()} → ${nextEvent.destination_ip}`;
        } else if (nextEvent.attack_type === 'ot_system_access') {
          actionText = `Accessing OT: ${nextEvent.description}`;
        } else if (nextEvent.attack_type === 'multi_hop_exfiltration') {
          actionText = `Exfiltrating data through proxy chain`;
        } else if (nextEvent.attack_type === 'log_deletion') {
          actionText = `Clearing event logs to hide tracks`;
        } else if (nextEvent.attack_type === 'lotl_discovery') {
          const tool = nextEvent.tool || 'legitimate Windows tools';
          const command = nextEvent.command ? ` - ${nextEvent.command.substring(0, 30)}...` : '';
          actionText = `Discovery using ${tool}${command}`;
        } else if (nextEvent.attack_type === 'credential_harvesting') {
          actionText = `Harvesting credentials from ${nextEvent.destination_ip}`;
        } else {
          actionText = nextEvent.description || 'Processing...';
        }
        actionDiv.textContent = actionText;
      }
    }
  }
  
  activateConnectionPath(sourceIp, destIp) {
    // Highlight the network path being used
    if (this.networkConnections) {
      this.networkConnections.forEach(conn => {
        if (conn.from === sourceIp && conn.to === destIp) {
          // Brighten the connection line
          gsap.to(conn.line.material, {
            opacity: 0.9,
            duration: 0.5,
            onComplete: () => {
              gsap.to(conn.line.material, {
                opacity: 0.5,
                duration: 2,
                delay: 1
              });
            }
          });
          
          // Animate flow indicator along the path
          if (conn.flowIndicator) {
            conn.flowIndicator.visible = true;
            const tl = gsap.timeline();
            let progress = 0;
            tl.to({ progress }, {
              progress: 1,
              duration: 1.5,
              ease: "none",
              onUpdate: function() {
                const point = conn.curve.getPoint(this.targets()[0].progress);
                conn.flowIndicator.position.copy(point);
              },
              onComplete: () => {
                conn.flowIndicator.visible = false;
              }
            });
          }
        }
      });
    }
  }

  followAttack(event) {
    // Keep a wider view that shows all active nodes
    const sourcePos = this.getNodePosition(event.source_ip);
    const destPos = this.getNodePosition(event.destination_ip);
    
    if (sourcePos && destPos) {
      // Calculate center point between source and destination
      const centerX = (sourcePos.x + destPos.x) / 2;
      const centerZ = (sourcePos.z + destPos.z) / 2;
      
      // Maintain top-down view at consistent height
      // Only pan horizontally to keep action centered
      gsap.to(this.camera.position, {
        x: centerX,
        y: 700, // Keep consistent height for overview
        z: 400 + Math.abs(destPos.x - sourcePos.x) * 0.2, // Slight adjustment based on distance
        duration: 2,
        ease: "power2.inOut"
      });
      
      // Look at the center of action
      gsap.to(this.controls.target, {
        x: centerX,
        y: 0,
        z: centerZ,
        duration: 2,
        ease: "power2.inOut"
      });
    }
  }
  
  createPacketFlow(event) {
    const sourcePos = this.getNodePosition(event.source_ip);
    const destPos = this.getNodePosition(event.destination_ip);
    
    if (!sourcePos || !destPos) return;
    
    // Zero-day exploit is handled by highlightZeroDay function called from processEvents
    
    // Special handling for Critical Access events - but avoid duplicates
    if (event.category === 'credential_access' && !this.criticalAccessShown) {
      this.criticalAccessShown = true;
      this.highlightCriticalAccess(event);
      // Reset flag after some time to allow future critical access events
      setTimeout(() => {
        this.criticalAccessShown = false;
      }, 10000);
    }
    
    // Highlight NTDS.dit extraction - the domain compromise climax
    if (event.attack_type === 'credential_harvesting' && event.description && event.description.includes('NTDS.dit') && !this.ntdsShown) {
      this.ntdsShown = true;
      this.highlightNTDSExtraction(event);
    }
    
    // Highlight OT system compromise - show critical infrastructure box
    if (event.attack_type === 'ot_system_access' && !this.otShown) {
      this.otShown = true;
      this.highlightCriticalInfrastructure(event);
      // Reset after some time to allow multiple OT systems
      setTimeout(() => {
        this.otShown = false;
      }, 15000);
    }
    
    // Highlight final exfiltration - the data theft climax
    if (event.attack_type === 'multi_hop_exfiltration' && event.stage === 5) {
      this.highlightExfiltration(event);
    }
    
    // Don't pause for RDP - just show the movement without explanation box
    // The legend already shows what's happening
    // if (event.attack_type === 'rdp_lateral_movement' && !this.rdpExplained) {
    //   this.explainRDPCredentials(event);
    //   this.rdpExplained = true;
    // }
    
    // Activate the connection path visualization
    this.activateConnectionPath(event.source_ip, event.destination_ip);
    
    // Determine number of packets based on attack type for better visibility
    let packetCount = 1;
    if (event.attack_type === 'lotl_discovery' || event.attack_type === 'wmi_lateral_movement') {
      packetCount = 3; // Multiple packets for LOTL and WMI
    } else if (event.attack_type === 'rdp_lateral_movement') {
      packetCount = 2; // Two packets for RDP
    } else if (event.category === 'credential_access') {
      packetCount = 5; // Many packets for credential theft
    }
    
    // Create multiple packets with slight delays for visual effect
    for (let i = 0; i < packetCount; i++) {
      setTimeout(() => {
        this.createSinglePacket(event, sourcePos, destPos, i === 0); // Only first packet triggers effects
      }, i * 200); // 200ms delay between packets
    }
  }
  
  createSinglePacket(event, sourcePos, destPos, isFirst = true) {
    // Create packet with size based on severity (larger for credential_access)
    const size = event.category === 'credential_access' ? 8 : 2 + (event.severity / 10) * 4;
    const packetGeometry = new THREE.SphereGeometry(size, 8, 8);
    const packetMaterial = new THREE.MeshBasicMaterial({
      color: this.getEventColor(event),
      emissive: this.getEventColor(event),
      emissiveIntensity: 2
    });
    const packet = new THREE.Mesh(packetGeometry, packetMaterial);
    packet.position.copy(sourcePos);
    
    // Create trail
    const points = [sourcePos, destPos];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.getEventColor(event),
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    
    this.flowGroup.add(packet);
    this.flowGroup.add(line);
    
    // Animate packet with multi-hop if specified
    if (event.proxy_chain && event.proxy_chain.length > 0) {
      // Multi-hop animation through proxy chain
      this.animateMultiHop(packet, event, isFirst);
    } else {
      // Direct animation - slower for better visibility
      gsap.to(packet.position, {
        x: destPos.x,
        y: destPos.y,
        z: destPos.z,
        duration: 4,
        ease: "power2.inOut",
        onComplete: () => {
          if (event.success && isFirst) {
            this.createImpactEffect(destPos, event);
            this.markNodeCompromised(event.destination_ip);
          }
        }
      });
    }
    
    const flow = {
      packet,
      line,
      event,
      lifetime: 3.0,
      age: 0
    };
    
    this.activeFlows.push(flow);
  }
  
  animateMultiHop(packet, event, isFirst = true) {
    // Animate through multiple hops with clear path visualization
    const timeline = gsap.timeline();
    
    // Build the full path including source and destination
    let fullPath = [];
    
    // Start with proxy chain if it exists
    if (event.proxy_chain && event.proxy_chain.length > 0) {
      fullPath = [...event.proxy_chain];
    } else {
      fullPath = [event.source_ip];
    }
    
    // Add destination if not already in path
    if (!fullPath.includes(event.destination_ip)) {
      fullPath.push(event.destination_ip);
    }
    
    // Create visual trail for the path
    const trailMaterial = new THREE.LineBasicMaterial({
      color: this.getEventColor(event),
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    });
    
    // Animate through each hop
    for (let i = 1; i < fullPath.length; i++) {
      const fromIp = fullPath[i - 1];
      const toIp = fullPath[i];
      
      const fromPos = this.getNodePosition(fromIp);
      const toPos = this.getNodePosition(toIp);
      
      if (!fromPos || !toPos) continue;
      
      // Create a line segment for this hop
      timeline.call(() => {
        const points = [fromPos, toPos];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, trailMaterial.clone());
        this.flowGroup.add(line);
        
        // Fade out the line after a delay
        gsap.to(line.material, {
          opacity: 0,
          delay: 3,
          duration: 2,
          onComplete: () => {
            this.flowGroup.remove(line);
            line.geometry.dispose();
            line.material.dispose();
          }
        });
      });
      
      // Animate packet to next hop
      timeline.to(packet.position, {
        x: toPos.x,
        y: toPos.y,
        z: toPos.z,
        duration: 1.5,
        ease: "power2.inOut"
      });
      
      // Small pause at each hop to show the routing
      if (i < fullPath.length - 1) {
        timeline.call(() => {
          // Create a pulse effect at intermediate hops
          this.createHopEffect(toPos, event);
        });
        timeline.to({}, { duration: 0.3 }); // Pause
      }
    }
    
    // Final impact at destination (only for first packet)
    timeline.call(() => {
      const destPos = this.getNodePosition(event.destination_ip);
      if (event.success && destPos && isFirst) {
        this.createImpactEffect(destPos, event);
        this.markNodeCompromised(event.destination_ip);
      }
    });
  }
  
  createHopEffect(position, event) {
    // Create a small pulse effect at hop points
    const ringGeometry = new THREE.RingGeometry(2, 5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.getEventColor(event),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    this.flowGroup.add(ring);
    
    gsap.to(ring.scale, {
      x: 3,
      y: 3,
      z: 3,
      duration: 0.5,
      ease: "power2.out"
    });
    
    gsap.to(ringMaterial, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        this.flowGroup.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
      }
    });
  }
  
  highlightZeroDay(event) {
    // Pause all animations so user can read
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Show zero-day exploitation info box
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 550px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 25px;
      border-radius: 12px;
      border: 3px solid #9933ff;
      font-family: monospace;
      z-index: 2500;
      box-shadow: 0 0 40px rgba(153, 51, 255, 0.6), inset 0 0 2px rgba(153, 51, 255, 0.3);
    `;
    
    warningDiv.innerHTML = `
      <div style="font-size: 22px; color: #ffff00; margin-bottom: 15px; text-align: center; font-weight: bold; text-shadow: 0 0 10px #ffff00;">
        ⚠️ ZERO-DAY EXPLOIT - CVE-2024-39717 ⚠️
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #666; padding: 12px; border-radius: 5px; margin-bottom: 12px;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px; font-weight: bold;">📍 WHAT JUST HAPPENED:</div>
        <div style="color: #ffffff; font-size: 13px; line-height: 1.5;">
          Attackers exploited an <strong>unknown vulnerability</strong> in Versa Director - the central SD-WAN controller. They now have complete administrative access without any authentication.
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #6699ff; padding: 12px; border-radius: 5px; margin-bottom: 12px;">
        <div style="color: #66ccff; font-size: 14px; margin-bottom: 8px; font-weight: bold;">🔧 HOW THEY DID IT:</div>
        <div style="color: #e6f3ff; font-size: 13px; line-height: 1.5;">
          Authentication bypass on port 4566 → Deploy VersaMem webshell → Gain persistent backdoor access to entire network infrastructure
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 2px solid #ff6600; border-radius: 5px; padding: 12px; margin-bottom: 12px; animation: pulse 1.5s infinite;">
        <div style="color: #ff9933; font-size: 14px; margin-bottom: 8px; font-weight: bold;">⚡ WHY THIS MATTERS:</div>
        <div style="color: #ffe6cc; font-size: 13px; line-height: 1.5; font-weight: normal;">
          • <strong>Zero-Day:</strong> No patch existed when attack began<br>
          • <strong>Full Control:</strong> Complete access to SD-WAN infrastructure<br>
          • <strong>Undetectable:</strong> Uses legitimate management protocols<br>
          • <strong>Persistence:</strong> Webshell provides permanent backdoor
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #00ff00; padding: 12px; border-radius: 5px;">
        <div style="color: #00ff66; font-size: 14px; margin-bottom: 8px; font-weight: bold;">🔒 MITIGATION (CISA URGENT):</div>
        <div style="color: #ccffcc; font-size: 12px; line-height: 1.5;">
          <strong>UPDATE:</strong> Versa Director to 22.1.4+ immediately<br>
          <strong>BLOCK:</strong> Port 4566 from internet access<br>
          <strong>CHECK:</strong> /var/versa/vnms/web/custom_logo/ for shells<br>
          <strong>DEADLINE:</strong> Federal agencies by Sept 13, 2024
        </div>
      </div>
    `;
    
    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 40px rgba(153, 51, 255, 0.6), inset 0 0 2px rgba(153, 51, 255, 0.3); }
        50% { box-shadow: 0 0 60px rgba(153, 51, 255, 0.9), inset 0 0 4px rgba(153, 51, 255, 0.5); }
        100% { box-shadow: 0 0 40px rgba(153, 51, 255, 0.6), inset 0 0 2px rgba(153, 51, 255, 0.3); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(warningDiv);
    
    // Resume after 7 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(warningDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (warningDiv.parentNode) {
            document.body.removeChild(warningDiv);
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 7000);
  }
  
  highlightNTDSExtraction(event) {
    // Pause all animations so user can focus
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Highlight the critical NTDS.dit extraction moment
    const ntdsDiv = document.createElement('div');
    ntdsDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 450px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 25px;
      border-radius: 12px;
      border: 3px solid #ff6600;
      font-family: monospace;
      z-index: 2400;
      box-shadow: 0 0 40px rgba(255, 102, 0, 0.6), inset 0 0 2px rgba(255, 102, 0, 0.3);
      animation: ntdsPulse 1.5s infinite;
    `;
    ntdsDiv.innerHTML = `
      <div style="font-size: 22px; color: #ffff00; margin-bottom: 10px; text-align: center;">
        💣 DOMAIN COMPROMISED 💣
      </div>
      <div style="font-size: 18px; text-align: center; margin-bottom: 15px;">
        NTDS.DIT EXTRACTION
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #666; padding: 12px; border-radius: 6px; margin: 10px 0;">
        <div style="color: #ffff00; font-size: 16px; margin-bottom: 8px;">WHAT IS NTDS.DIT?</div>
        <div style="font-size: 13px; line-height: 1.5; color: #ffffff;">
          The Active Directory database containing:<br>
          • ALL user passwords (hashed)<br>
          • ALL computer accounts<br>
          • ALL service accounts<br>
          • Complete network access map
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); padding: 12px; border-radius: 6px; border: 2px solid #ff6666;">
        <div style="color: #ff6666; font-size: 16px; margin-bottom: 8px;">IMPACT</div>
        <div style="font-size: 13px; line-height: 1.5; color: #ffcccc;">
          ⚠️ Complete network ownership<br>
          ⚠️ Can impersonate ANY user<br>
          ⚠️ Access to ALL systems<br>
          ⚠️ Game over for defenders
        </div>
      </div>
    `;
    document.body.appendChild(ntdsDiv);
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ntdsPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(255, 102, 0, 0.6), inset 0 0 2px rgba(255, 102, 0, 0.3); }
        50% { transform: scale(1.02); box-shadow: 0 0 60px rgba(255, 102, 0, 0.9), inset 0 0 4px rgba(255, 102, 0, 0.5); }
      }
    `;
    document.head.appendChild(style);
    
    // Resume after 6 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(ntdsDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (ntdsDiv.parentNode) {
            ntdsDiv.remove();
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 6000);
  }
  
  highlightCriticalInfrastructure(event) {
    // Pause all animations so user can focus
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Show critical infrastructure compromise warning
    const critDiv = document.createElement('div');
    critDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 600px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 25px;
      border-radius: 12px;
      border: 3px solid #ff0000;
      font-family: monospace;
      z-index: 2500;
      box-shadow: 0 0 50px rgba(255, 0, 0, 0.7), inset 0 0 3px rgba(255, 0, 0, 0.3);
      animation: criticalPulse 1s infinite;
    `;
    
    critDiv.innerHTML = `
      <div style="font-size: 24px; color: #ffff00; margin-bottom: 15px; text-align: center; font-weight: bold; text-shadow: 0 0 15px #ffff00;">
        🚨 CRITICAL INFRASTRUCTURE COMPROMISED 🚨
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #666; padding: 12px; border-radius: 5px; margin-bottom: 12px;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px; font-weight: bold;">⚡ SYSTEMS BREACHED:</div>
        <div style="color: #ffffff; font-size: 13px; line-height: 1.8;">
          • <strong>WATER TREATMENT:</strong> Chemical dosing controls accessed<br>
          • <strong>POWER GRID:</strong> Substation SCADA compromised<br>
          • <strong>INDUSTRIAL:</strong> PLC logic manipulation possible<br>
          • <strong>EMERGENCY SYSTEMS:</strong> 911 dispatch vulnerable
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 2px solid #ffff00; border-radius: 5px; padding: 12px; margin-bottom: 12px;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px; font-weight: bold;">⚠️ POTENTIAL IMPACT:</div>
        <div style="color: #ffffcc; font-size: 13px; line-height: 1.6;">
          Attackers can now manipulate physical infrastructure:<br>
          • Contaminate water supply<br>
          • Cause power blackouts<br>
          • Damage industrial equipment<br>
          • Disrupt emergency services
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #ff6666; padding: 12px; border-radius: 5px;">
        <div style="color: #ff6666; font-size: 14px; margin-bottom: 8px; font-weight: bold;">🔴 NATION-STATE CAPABILITY:</div>
        <div style="color: #ffcccc; font-size: 12px; line-height: 1.5;">
          This access enables kinetic cyber warfare - digital attacks with physical consequences. Volt Typhoon has pre-positioned for potential conflict scenarios.
        </div>
      </div>
    `;
    
    // Add critical pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes criticalPulse {
        0% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.7), inset 0 0 3px rgba(255, 0, 0, 0.3); transform: scale(1); }
        50% { box-shadow: 0 0 80px rgba(255, 0, 0, 1), inset 0 0 6px rgba(255, 0, 0, 0.5); transform: scale(1.02); }
        100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.7), inset 0 0 3px rgba(255, 0, 0, 0.3); transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(critDiv);
    
    // Fade in
    gsap.to(critDiv, {
      opacity: 1,
      duration: 0.5,
      from: { opacity: 0 }
    });
    
    // Resume after 8 seconds (longer for critical infrastructure)
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(critDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (critDiv.parentNode) {
            document.body.removeChild(critDiv);
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 8000);
  }
  
  highlightOTCompromise(event) {
    // Pause all animations so user can focus
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Highlight critical OT/SCADA system compromise
    const otDiv = document.createElement('div');
    otDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 550px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 25px;
      border-radius: 12px;
      border: 3px solid #00ff00;
      font-family: monospace;
      z-index: 2400;
      box-shadow: 0 0 40px rgba(0, 255, 0, 0.6), inset 0 0 2px rgba(0, 255, 0, 0.3);
      opacity: 0;
    `;
    
    // Determine which OT system based on the event
    let systemName = 'CRITICAL INFRASTRUCTURE';
    let systemType = 'OT/SCADA System';
    let impact = 'Physical world impact possible';
    
    if (event.description) {
      if (event.description.includes('Water')) {
        systemName = 'WATER TREATMENT PLANT';
        systemType = 'Municipal Water SCADA';
        impact = 'Chemical balance controls compromised';
      } else if (event.description.includes('Power')) {
        systemName = 'POWER GRID CONTROL';
        systemType = 'Electrical Grid SCADA';
        impact = 'Substation controls accessible';
      } else if (event.description.includes('HMI')) {
        systemName = 'HUMAN-MACHINE INTERFACE';
        systemType = 'Industrial Control Panel';
        impact = 'Direct equipment manipulation possible';
      }
    }
    
    otDiv.innerHTML = `
      <div style="font-size: 24px; color: #000000; background: #ffff00; padding: 8px; margin: -25px -25px 15px -25px; border-radius: 8px 8px 0 0; text-align: center; font-weight: bold;">
        ⚠️ ${systemName} COMPROMISED ⚠️
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #00ff66; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <div style="font-size: 18px; color: #00ff66; margin-bottom: 10px;">CRITICAL BREACH</div>
        <div style="font-size: 14px; line-height: 1.6; color: #ffffff;">
          <strong>System:</strong> ${systemType}<br>
          <strong>Access Level:</strong> Full administrative control<br>
          <strong>Risk:</strong> ${impact}
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); padding: 12px; border-radius: 6px; border: 2px solid #ff6666;">
        <div style="color: #ff6666; font-size: 16px; margin-bottom: 8px;">POTENTIAL CONSEQUENCES</div>
        <div style="font-size: 13px; line-height: 1.5; color: #ffcccc;">
          🔴 Physical damage to equipment<br>
          🔴 Service disruption to thousands<br>
          🔴 Safety system manipulation<br>
          🔴 Irreversible process changes
        </div>
      </div>
    `;
    document.body.appendChild(otDiv);
    
    // Add subtle pulsing animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes otPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(0, 255, 0, 0.6), inset 0 0 2px rgba(0, 255, 0, 0.3); }
        50% { box-shadow: 0 0 60px rgba(0, 255, 0, 0.9), inset 0 0 4px rgba(0, 255, 0, 0.5); }
      }
    `;
    document.head.appendChild(style);
    
    // Resume after 6 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(otDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (otDiv.parentNode) {
            otDiv.remove();
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 6000);
  }
  
  highlightExfiltration(event) {
    // Pause all animations so user can focus
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Highlight the final data exfiltration
    const exfilDiv = document.createElement('div');
    exfilDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 450px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 20px;
      border-radius: 10px;
      border: 3px solid #ff00ff;
      font-family: monospace;
      z-index: 2400;
      box-shadow: 0 0 40px rgba(255, 0, 255, 0.6), inset 0 0 2px rgba(255, 0, 255, 0.3);
      animation: exfilPulse 1s infinite;
    `;
    exfilDiv.innerHTML = `
      <div style="font-size: 20px; color: #ffff00; margin-bottom: 10px; text-align: center;">
        📤 DATA EXFILTRATION 📤
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #666; padding: 10px; border-radius: 6px; margin: 10px 0;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px;">MULTI-HOP ROUTING</div>
        <div style="font-size: 12px; line-height: 1.4; color: #ffffff;">
          🎣 Target → Guam<br>
          🎣 Guam → Pacific Router<br>
          🎣 Pacific → New Caledonia<br>
          🎣 New Caledonia → China C2
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); padding: 10px; border-radius: 6px; border: 2px solid #ff6666;">
        <div style="color: #ff6666; font-size: 14px; margin-bottom: 6px;">STOLEN DATA</div>
        <div style="font-size: 11px; line-height: 1.3; color: #ffcccc;">
          • Domain credentials (NTDS.dit)<br>
          • SCADA configurations<br>
          • Network topology maps<br>
          • Industrial control logic<br>
          • Critical process parameters
        </div>
      </div>
      
      <div style="margin-top: 10px; padding: 8px; background: rgba(40, 40, 40, 0.9); border-radius: 4px; border: 1px solid #ffff00;">
        <div style="font-size: 11px; color: #ffff00; text-align: center;">
          IMPACT: Complete infrastructure blueprint<br>
          stolen for future attacks
        </div>
      </div>
    `;
    document.body.appendChild(exfilDiv);
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes exfilPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255, 0, 255, 0.6), inset 0 0 2px rgba(255, 0, 255, 0.3); }
        50% { box-shadow: 0 0 60px rgba(255, 0, 255, 0.9), inset 0 0 4px rgba(255, 0, 255, 0.5); }
      }
    `;
    document.head.appendChild(style);
    
    // Resume after 6 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(exfilDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (exfilDiv.parentNode) {
            exfilDiv.remove();
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 6000);
  }
  
  explainRDPCredentials(event) {
    // Pause visualization briefly
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Explain how RDP credentials were obtained
    const rdpDiv = document.createElement('div');
    rdpDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 500px;
      background: rgba(255, 136, 0, 0.95);
      color: white;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #ff8800;
      font-family: monospace;
      z-index: 2300;
      box-shadow: 0 0 30px rgba(255, 136, 0, 0.6);
      opacity: 0;
    `;
    rdpDiv.innerHTML = `
      <div style="font-size: 18px; color: #ffffff; margin-bottom: 10px; text-align: center; font-weight: bold;">
        🔑 RDP LATERAL MOVEMENT EXPLAINED
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 5px; margin-bottom: 10px;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px;">WHERE DID THE PASSWORDS COME FROM?</div>
        <div style="font-size: 12px; line-height: 1.5;">
          The attackers obtained administrator credentials from the initial <strong>Versa Director</strong> compromise. This SD-WAN controller had stored credentials for network management that included Domain Admin privileges.
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 5px;">
        <div style="color: #88ff88; font-size: 14px; margin-bottom: 8px;">HOW RDP WORKS HERE:</div>
        <div style="font-size: 12px; line-height: 1.5;">
          <strong>RDP (Remote Desktop Protocol)</strong> is like TeamViewer or remote control software - it lets you control another computer as if you were sitting at it. The attackers are using LEGITIMATE admin credentials to hop from computer to computer, making this activity look normal to security systems.
        </div>
      </div>
      
      <div style="font-size: 11px; color: #ffccaa; margin-top: 10px; text-align: center; font-style: italic;">
        This is why the initial compromise is so critical - one set of admin credentials opens every door.
      </div>
    `;
    document.body.appendChild(rdpDiv);
    
    // Fade in
    gsap.to(rdpDiv, {
      opacity: 1,
      duration: 0.5
    });
    
    // Resume after 6 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(rdpDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (rdpDiv.parentNode) {
            rdpDiv.remove();
          }
        }
      });
    }, 6000);
  }
  
  highlightCriticalAccess(event) {
    // Pause all animations so user can focus
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    gsap.globalTimeline.pause();
    
    // Create a warning banner in bottom left
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 500px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 25px;
      border-radius: 10px;
      border: 3px solid #ff3333;
      font-family: monospace;
      z-index: 3000;
      text-align: left;
      box-shadow: 0 0 40px rgba(255, 51, 51, 0.6), inset 0 0 2px rgba(255, 51, 51, 0.3);
    `;
    
    // Determine what happened in layman's terms
    let criticalTitle = 'CRITICAL ACCESS ACHIEVED';
    let whatHappened = '';
    let howItHappened = '';
    let whyItMatters = '';
    let technicalDetails = '';
    
    if (event.attack_type === 'ntds_extraction' || (event.description && event.description.includes('NTDS'))) {
      criticalTitle = 'MASTER PASSWORD FILE STOLEN';
      whatHappened = 'The attackers just stole the master file containing EVERY username and password in your entire organization.';
      howItHappened = 'They used a Windows feature called "Volume Shadow Copy" - essentially Windows\' own backup system - to secretly copy the password database (NTDS.dit) that should be locked and protected.';
      whyItMatters = 'With this file, attackers can log in as ANYONE - your CEO, IT admins, or any employee. They now have permanent access to everything.';
      technicalDetails = 'Technique: T1003.003 (NTDS.dit extraction via Volume Shadow Copy Service)';
    } else if (event.attack_type === 'volume_shadow_copy') {
      criticalTitle = 'BACKUP SYSTEM HIJACKED';
      whatHappened = 'Windows\' backup feature is being used against itself to steal protected files.';
      howItHappened = 'The attackers are using legitimate Windows commands (vssadmin, ntdsutil) that IT admins normally use for backups. Since these are "normal" tools, security software doesn\'t flag them as malicious.';
      whyItMatters = 'This gives access to files that are normally locked while Windows is running, including the password database.';
      technicalDetails = 'Technique: T1003.003 (Credential Access via VSS)';
    } else if (event.description && event.description.includes('Domain Controller')) {
      criticalTitle = 'DOMAIN CONTROLLER COMPROMISED';
      whatHappened = 'The attackers have taken control of the Domain Controller - the server that manages ALL user accounts and permissions.';
      howItHappened = 'Using stolen administrator credentials from the initial Versa Director compromise, they connected via RDP (Remote Desktop) through multiple jump boxes to hide their tracks.';
      whyItMatters = 'The Domain Controller is like having the master key to every door in a building. They can now create new admin accounts, modify permissions, and access any computer in the network.';
      technicalDetails = 'Technique: T1021.001 (RDP with valid accounts)';
    } else {
      criticalTitle = 'ADMINISTRATOR ACCESS GAINED';
      whatHappened = 'The attackers have gained high-level access to critical systems.';
      howItHappened = 'Using credentials stolen from the initial compromise, they\'re moving laterally through the network using legitimate administrative tools.';
      whyItMatters = 'This level of access allows them to access sensitive data, install backdoors, and move toward critical infrastructure systems.';
      technicalDetails = `Technique: ${event.technique || 'T1078'} (Valid Accounts)`;
    }
    
    warningDiv.innerHTML = `
      <div style="color: #ff0000; font-size: 22px; margin-bottom: 15px; text-align: center; font-weight: bold; text-shadow: 0 0 10px #ff0000;">
        ⚠️ ${criticalTitle} ⚠️
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #666; padding: 12px; border-radius: 5px; margin-bottom: 12px;">
        <div style="color: #ffff00; font-size: 14px; margin-bottom: 8px; font-weight: bold;">📍 WHAT JUST HAPPENED:</div>
        <div style="color: #ffffff; font-size: 13px; line-height: 1.5;">
          ${whatHappened}
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 1px solid #6699ff; padding: 12px; border-radius: 5px; margin-bottom: 12px;">
        <div style="color: #66ccff; font-size: 14px; margin-bottom: 8px; font-weight: bold;">🔧 HOW THEY DID IT:</div>
        <div style="color: #e6f3ff; font-size: 13px; line-height: 1.5;">
          ${howItHappened}
        </div>
      </div>
      
      <div style="background: rgba(40, 40, 40, 0.9); border: 2px solid #ff6600; border-radius: 5px; padding: 12px; margin-bottom: 12px; animation: pulse 1.5s infinite;">
        <div style="color: #ff9933; font-size: 14px; margin-bottom: 8px; font-weight: bold;">⚡ WHY THIS MATTERS:</div>
        <div style="color: #ffe6cc; font-size: 13px; line-height: 1.5; font-weight: normal;">
          ${whyItMatters}
        </div>
      </div>
      
      <div style="font-size: 11px; color: #888888; border-top: 1px solid #333; padding-top: 8px;">
        ${technicalDetails}
      </div>
    `;
    
    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 40px rgba(255, 51, 51, 0.6), inset 0 0 2px rgba(255, 51, 51, 0.3); }
        50% { box-shadow: 0 0 60px rgba(255, 51, 51, 0.9), inset 0 0 4px rgba(255, 51, 51, 0.5); }
        100% { box-shadow: 0 0 40px rgba(255, 51, 51, 0.6), inset 0 0 2px rgba(255, 51, 51, 0.3); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(warningDiv);
    
    // Resume after 7 seconds
    setTimeout(() => {
      // Resume playback
      if (wasPlaying) {
        this.isPlaying = true;
        if (gsap && gsap.globalTimeline) {
          gsap.globalTimeline.resume();
        }
      }
      
      // Fade out the box
      gsap.to(warningDiv, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
          if (warningDiv.parentNode) {
            document.body.removeChild(warningDiv);
          }
          if (style.parentNode) {
            style.remove();
          }
        }
      });
    }, 7000);
  }
  
  markNodeCompromised(ip) {
    const node = this.nodeMap.get(ip);
    if (node && node.mesh) {
      // Flash red to indicate compromise
      const originalColor = node.mesh.material.color.getHex();
      const originalEmissive = node.mesh.material.emissive.getHex();
      
      gsap.to(node.mesh.material.color, {
        r: 1,
        g: 0,
        b: 0,
        duration: 0.5,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          // Leave it slightly red-tinted to show it's compromised
          node.mesh.material.color.setHex(originalColor);
          node.mesh.material.emissive.setHex(0xff0000);
          node.mesh.material.emissiveIntensity = 0.2;
        }
      });
    }
  }
  
  getNodePosition(ip) {
    const node = this.nodeMap.get(ip);
    if (node) return node.mesh.position.clone();
    
    // Check for partial IP matches (for proxy nodes)
    for (let [nodeIp, nodeData] of this.nodeMap) {
      if (ip.startsWith(nodeIp.split('.').slice(0, 3).join('.'))) {
        return nodeData.mesh.position.clone();
      }
    }
    
    // Default position if not found
    return new THREE.Vector3(
      (Math.random() - 0.5) * 200,
      50,
      (Math.random() - 0.5) * 200
    );
  }
  
  getEventColor(event) {
    const colorMap = {
      'reconnaissance': 0xffff00,
      'exploitation': 0x9900ff,
      'persistence': 0xff00ff,
      'discovery': 0xffff00,
      'credential_access': 0xff0000,
      'lateral_movement': 0xff8800,
      'exfiltration': 0x00ffff,
      'defense_evasion': 0x666666,
      'benign': 0x0080ff
    };
    return colorMap[event.category] || 0x808080;
  }
  
  createImpactEffect(position, event) {
    // Create expanding ring
    const ringGeometry = new THREE.RingGeometry(1, 8, 32);
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
    
    gsap.to(ring.scale, {
      x: 15,
      y: 15,
      z: 15,
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
  }
  
  updateFlows(deltaTime) {
    this.activeFlows = this.activeFlows.filter(flow => {
      flow.age += deltaTime;
      
      if (flow.age > flow.lifetime) {
        this.flowGroup.remove(flow.packet);
        this.flowGroup.remove(flow.line);
        flow.packet.geometry.dispose();
        flow.packet.material.dispose();
        flow.line.geometry.dispose();
        flow.line.material.dispose();
        return false;
      }
      
      const fadeStart = flow.lifetime * 0.6;
      if (flow.age > fadeStart) {
        const fadeProgress = (flow.age - fadeStart) / (flow.lifetime - fadeStart);
        flow.line.material.opacity = 0.5 * (1 - fadeProgress);
      }
      
      return true;
    });
  }
  
  // ... (rest of the methods remain similar to the original timeline)
  
  initUI() {
    const timelineDiv = document.createElement('div');
    timelineDiv.id = 'timeline-container';
    timelineDiv.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                  background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; 
                  border: 1px solid rgba(255,255,255,0.2); min-width: 700px; z-index: 1000;">
        <div style="color: white; font-family: monospace; margin-bottom: 10px;">
          <span id="stage-name" style="font-size: 18px; color: #00ffff;">Stage: Initializing</span>
          <span id="time-display" style="float: right;">Hour: 0 / 72</span>
        </div>
        <div style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; margin-bottom: 10px;">
          <div id="progress-bar" style="background: linear-gradient(90deg, #9900ff, #ffff00, #ff8800, #ff0000); 
                                         height: 100%; width: 0%; border-radius: 5px; transition: width 0.1s;"></div>
        </div>
        <div style="text-align: center;">
          <button id="play-pause" style="background: #00ffff; border: none; padding: 5px 15px; 
                                          border-radius: 5px; color: black; cursor: pointer; margin: 0 5px;">⏸ Pause</button>
          <button id="speed-1x" style="background: #00ffff; border: none; padding: 5px 15px; 
                                        border-radius: 5px; color: black; cursor: pointer; margin: 0 5px;">1x</button>
          <button id="speed-10x" style="background: #444; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">10x</button>
          <button id="speed-30x" style="background: #444; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">30x</button>
          <button id="speed-45x" style="background: #444; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">45x</button>
          <button id="speed-60x" style="background: #444; border: none; padding: 5px 15px; 
                                         border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">60x</button>
          <button id="restart" style="background: #444; border: none; padding: 5px 15px; 
                                       border-radius: 5px; color: white; cursor: pointer; margin: 0 5px;">↺ Restart</button>
        </div>
        <div id="event-stats" style="color: #888; font-size: 11px; margin-top: 10px; text-align: center; line-height: 1.4;">
          <div style="color: #00ffff; margin-bottom: 3px;">Intelligence Sources:</div>
          <div>CISA Advisory AA24-038A | Microsoft Threat Intelligence</div>
          <div style="font-size: 10px;">FBI PIN 240131-001 | MITRE ATT&CK G1017</div>
        </div>
      </div>
    `;
    document.body.appendChild(timelineDiv);
    
    // Add event listeners
    document.getElementById('play-pause').addEventListener('click', () => this.togglePlayback());
    document.getElementById('speed-1x').addEventListener('click', () => this.setSpeed(1));
    document.getElementById('speed-10x').addEventListener('click', () => this.setSpeed(10));
    document.getElementById('speed-30x').addEventListener('click', () => this.setSpeed(30));
    document.getElementById('speed-45x').addEventListener('click', () => this.setSpeed(45));
    document.getElementById('speed-60x').addEventListener('click', () => this.setSpeed(60));
    document.getElementById('restart').addEventListener('click', () => this.restart());
  }
  
  // Include all the remaining methods from the original timeline (update, onStageChange, etc.)
  // They remain largely the same with minor adjustments for Volt Typhoon specific content
  
  update(deltaTime) {
    if (!this.isPlaying) return;
    
    // Speed calculation: scale the time progression
    // At 1x: 72 hours takes 720 seconds (12 minutes)
    // At 10x: 72 hours takes 72 seconds
    // At 60x: 72 hours takes 12 seconds
    this.currentTime += deltaTime * this.playbackSpeed * 360 * 1000;
    
    if (this.currentTime > this.duration) {
      this.currentTime = this.duration;
      this.isPlaying = false;
    }
    
    const currentHour = (this.currentTime / (3600 * 1000));
    
    const newStage = this.stages.findIndex(s => currentHour >= s.start && currentHour < s.end);
    if (newStage !== this.currentStage && newStage >= 0) {
      this.currentStage = newStage;
      this.onStageChange(this.stages[this.currentStage]);
    }
    
    const currentTimestamp = this.startTime + this.currentTime;
    this.processEvents(currentTimestamp);
    
    this.updateFlows(deltaTime);
    this.updateUI(currentHour);
  }
  
  onStageChange(stage) {
    console.log(`=== STAGE: ${stage.name} - ${stage.description} ===`);
    if (stage.details) {
      console.log(`Details: ${stage.details}`);
    }
    
    this.animateCamera(stage);
    
    // Stage announcement
    const stageDiv = document.createElement('div');
    stageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #${stage.color.toString(16).padStart(6, '0')};
      font-size: 36px;
      font-weight: bold;
      text-shadow: 0 0 20px currentColor;
      pointer-events: none;
      z-index: 2000;
      text-align: center;
    `;
    stageDiv.innerHTML = `${stage.name}<br><span style="font-size: 18px;">${stage.description}</span>`;
    document.body.appendChild(stageDiv);
    
    gsap.from(stageDiv, {
      scale: 0,
      duration: 0.5,
      ease: "back.out"
    });
    
    gsap.to(stageDiv, {
      opacity: 0,
      delay: 3,
      duration: 1,
      onComplete: () => stageDiv.remove()
    });
  }
  
  animateCamera(stage) {
    // Maintain a consistent top-down overview
    // Only slight adjustments to center on the active zone
    
    let targetX = 0;
    if (stage.focus === 'proxy-to-versa') {
      targetX = -400; // Focus on proxy zone
    } else if (stage.focus === 'ot-systems') {
      targetX = 400; // Focus on OT zone
    } else {
      targetX = 0; // Center on IT network
    }
    
    gsap.to(this.camera.position, {
      x: targetX,
      y: 700, // Always maintain same height
      z: 400, // Consistent distance
      duration: 3,
      ease: "power2.inOut"
    });
    
    gsap.to(this.controls.target, {
      x: targetX,
      y: 0,
      z: 0,
      duration: 3,
      ease: "power2.inOut"
    });
  }
  
  updateCounters() {
    const processedEvents = this.data.filter(e => e.processed).length;
    const compromised = new Set(this.data.filter(e => e.processed && e.success).map(e => e.destination_ip)).size;
    const techniques = new Set(this.data.filter(e => e.processed && e.technique).map(e => e.technique)).size;
    
    // Update timeline counters
    const eventEl = document.getElementById('timeline-event-count');
    const compEl = document.getElementById('timeline-compromised-count');
    const techEl = document.getElementById('timeline-technique-count');
    
    if (eventEl) eventEl.textContent = processedEvents;
    if (compEl) compEl.textContent = compromised;
    if (techEl) techEl.textContent = techniques;
  }
  
  updateUI(currentHour) {
    const stage = this.stages[this.currentStage];
    const stageName = document.getElementById('stage-name');
    if (stage) {
      stageName.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">Stage ${this.currentStage + 1}: ${stage.name}</div>
        <div style="font-size: 13px; color: #00ffff; margin-bottom: 3px;">${stage.description}</div>
        <div style="font-size: 11px; color: #888; line-height: 1.4;">${stage.details || ''}</div>
      `;
    } else {
      stageName.textContent = 'Stage: Complete';
    }
    document.getElementById('time-display').textContent = `Hour: ${Math.floor(currentHour)} / 72`;
    document.getElementById('progress-bar').style.width = `${(currentHour / 72) * 100}%`;
    
    // Also update counters in updateUI for consistency
    this.updateCounters();
  }
  
  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('play-pause');
    btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
  }
  
  setSpeed(speed) {
    this.playbackSpeed = speed;
    
    ['speed-1x', 'speed-10x', 'speed-30x', 'speed-45x', 'speed-60x'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.background = '#444';
        btn.style.color = 'white';
      }
    });
    
    let activeId = '';
    if (speed === 1) activeId = 'speed-1x';
    else if (speed === 10) activeId = 'speed-10x';
    else if (speed === 30) activeId = 'speed-30x';
    else if (speed === 45) activeId = 'speed-45x';
    else if (speed === 60) activeId = 'speed-60x';
    
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) {
      activeBtn.style.background = '#00ffff';
      activeBtn.style.color = 'black';
    }
  }
  
  restart() {
    // Clean up all info boxes and overlays first
    this.cleanupAllInfoBoxes();
    
    // Reset timeline variables
    this.currentTime = 0;
    this.currentStage = 0;
    this.isPlaying = true;
    this.lastEventProcessedTime = 0;
    this.lastProcessedEventType = null;
    this.lastFollowedStage = undefined;
    this.rdpExplained = false; // Reset RDP explanation flag
    this.cveExplained = false; // Reset CVE explanation flag
    this.criticalAccessShown = false; // Reset critical access flag
    this.ntdsShown = false; // Reset NTDS flag
    this.otShown = false; // Reset OT flag
    
    // Resume any paused animations
    gsap.globalTimeline.resume();
    
    // Clean up active flows
    this.activeFlows.forEach(flow => {
      this.flowGroup.remove(flow.packet);
      this.flowGroup.remove(flow.line);
      flow.packet.geometry.dispose();
      flow.packet.material.dispose();
      flow.line.geometry.dispose();
      flow.line.material.dispose();
    });
    this.activeFlows = [];
    
    // Reset all events to unprocessed
    this.data.forEach(event => {
      event.processed = false;
    });
    
    // Reset node colors
    this.nodeMap.forEach(node => {
      if (node.mesh && node.mesh.material) {
        node.mesh.material.emissiveIntensity = 0.1;
      }
    });
    
    // Reset UI elements
    document.getElementById('play-pause').textContent = '⏸ Pause';
    
    // Reset Current Attack Phase display
    const techniqueDiv = document.getElementById('current-technique');
    if (techniqueDiv) {
      techniqueDiv.textContent = 'Initializing Attack...';
    }
    
    const actionDiv = document.getElementById('current-action');
    if (actionDiv) {
      actionDiv.textContent = 'Preparing to compromise critical infrastructure...';
    }
    
    // Reset stage display
    const stageDiv = document.getElementById('stage-name');
    if (stageDiv) {
      stageDiv.textContent = 'Stage: Initializing';
    }
    
    // Reset camera to initial position
    this.camera.position.set(-700, 800, 600);
    this.controls.target.set(-700, 0, -100);
    this.controls.update();
  }
  
  cleanupAllInfoBoxes() {
    // Remove all possible info boxes that might be on screen
    const selectorsToRemove = [
      // Info boxes we create dynamically
      'div[style*="ZERO-DAY EXPLOIT"]',
      'div[style*="CRITICAL ACCESS"]',
      'div[style*="NTDS.DIT EXTRACTION"]',
      'div[style*="MASTER PASSWORD FILE"]',
      'div[style*="DOMAIN COMPROMISED"]',
      'div[style*="WATER TREATMENT"]',
      'div[style*="POWER GRID"]',
      'div[style*="OT/SCADA"]',
      'div[style*="DATA EXFILTRATION"]',
      'div[style*="RDP LATERAL MOVEMENT"]',
      'div[style*="CRITICAL INFRASTRUCTURE"]',
      'div[style*="BACKUP SYSTEM HIJACKED"]',
      'div[style*="DOMAIN CONTROLLER COMPROMISED"]',
      'div[style*="ADMINISTRATOR ACCESS GAINED"]'
    ];
    
    // Remove each type of info box
    selectorsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.remove();
      });
    });
    
    // Also remove by looking for specific z-index values we use
    const highZIndexElements = document.querySelectorAll('div');
    highZIndexElements.forEach(element => {
      const zIndex = element.style.zIndex;
      // Remove elements with our custom z-index values
      if (zIndex && (zIndex === '2300' || zIndex === '2400' || zIndex === '2500' || 
                     zIndex === '2999' || zIndex === '3000')) {
        element.remove();
      }
    });
    
    // Remove any animation styles we added
    document.querySelectorAll('style').forEach(style => {
      if (style.textContent && 
          (style.textContent.includes('@keyframes pulse') ||
           style.textContent.includes('@keyframes ntdsPulse') ||
           style.textContent.includes('@keyframes otPulse') ||
           style.textContent.includes('@keyframes criticalPulse') ||
           style.textContent.includes('@keyframes exfilPulse') ||
           style.textContent.includes('@keyframes pulseGlow'))) {
        style.remove();
      }
    });
    
    // Kill any active GSAP animations on removed elements
    gsap.killTweensOf('*');
  }
  
  dispose() {
    this.flowGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.scene.remove(this.flowGroup);
    
    this.labelSprites.forEach(sprite => {
      if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.dispose();
      this.scene.remove(sprite);
    });
    
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) timelineContainer.remove();
    
    const legend = document.getElementById('legend');
    if (legend) legend.remove();
    
    const techniqueDisplay = document.getElementById('technique-display');
    if (techniqueDisplay) techniqueDisplay.remove();
  }
}