import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Volt Typhoon specific infrastructure based on 2024 intelligence
const voltTyphoonInfra = {
  // Compromised SOHO routers used as proxies (New Caledonia hub)
  proxyNodes: [
    { ip: '103.56.54.0', location: 'New Caledonia', type: 'Compromised VPN Device' },
    { ip: '203.119.88.0', location: 'Pacific Region', type: 'Cisco RV320' },
    { ip: '202.181.24.0', location: 'Guam', type: 'Netgear ProSafe' },
    { ip: '118.102.0.0', location: 'Hong Kong', type: 'Fortinet Device' }
  ],
  
  // Target telecommunications and IT infrastructure  
  telecomTargets: [
    { ip: '192.168.100.10', name: 'Versa Director', type: 'SD-WAN Controller', ports: [443, 4566, 4570] },
    { ip: '192.168.100.20', name: 'Exchange Server', type: 'Email', ports: [443, 25, 587] },
    { ip: '192.168.100.30', name: 'Web Server', type: 'Public Facing', ports: [80, 443] },
    { ip: '192.168.100.40', name: 'Jump Box', type: 'Admin Access', ports: [3389, 22] },
    { ip: '192.168.100.50', name: 'Domain Controller', type: 'Active Directory', ports: [445, 3389, 5985] },
    { ip: '192.168.100.60', name: 'File Server', type: 'Data Storage', ports: [445, 139] },
    { ip: '192.168.100.70', name: 'Backup Server', type: 'Critical Data', ports: [1433, 3306] }
  ],
  
  // OT/SCADA Critical Infrastructure
  otSystems: [
    { ip: '10.1.1.10', name: 'SCADA Master', type: 'Control System', ports: [502, 102] },
    { ip: '10.1.1.20', name: 'PLC Controller', type: 'Industrial Control', ports: [502] },
    { ip: '10.1.1.30', name: 'Water Treatment', type: 'Critical Infrastructure', ports: [20000] },
    { ip: '10.1.1.40', name: 'Power Substation', type: 'Energy Grid', ports: [2404] }
  ],
  
  // MITRE ATT&CK techniques used by Volt Typhoon
  techniques: {
    'T1190': 'Exploit Public-Facing Application',
    'T1133': 'External Remote Services',
    'T1078': 'Valid Accounts',
    'T1046': 'Network Service Discovery',
    'T1021.001': 'Remote Desktop Protocol',
    'T1021.004': 'SSH',
    'T1021.006': 'Windows Remote Management',
    'T1047': 'Windows Management Instrumentation',
    'T1003.003': 'NTDS.dit extraction',
    'T1059.001': 'PowerShell',
    'T1059.003': 'Windows Command Shell',
    'T1070.001': 'Clear Windows Event Logs',
    'T1090.003': 'Multi-hop Proxy',
    'T1505.003': 'Web Shell (VersaMem)',
    'T1583.006': 'Web Services',
    'T1006': 'Volume Shadow Copy'
  },
  
  // Living Off the Land binaries
  lotlTools: [
    'wmic.exe',
    'powershell.exe',
    'netsh.exe',
    'ntdsutil.exe',
    'vssadmin.exe',
    'net.exe',
    'tasklist.exe',
    'reg.exe',
    'certutil.exe',
    'bitsadmin.exe'
  ]
};

function generateVoltTyphoonAttack() {
  const events = [];
  let eventId = 0;
  const baseTime = new Date('2024-11-15T00:00:00Z'); // Recent campaign
  
  // Phase 1: Initial Compromise via Versa Director Zero-Day (CVE-2024-39717)
  console.log('Phase 1: Exploiting Versa Director Zero-Day...');
  
  // Scanning for vulnerable Versa Director instances
  for (let hour = 0; hour < 6; hour++) {
    const proxy = voltTyphoonInfra.proxyNodes[0]; // New Caledonia hub
    
    // Port scanning for Versa Director with full proxy chain
    [443, 4566, 4570].forEach(port => {
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 1800000).toISOString(),
        severity: 3,
        category: 'reconnaissance',
        technique: 'T1046',
        source_ip: '45.76.128.0',  // Start from China C2
        destination_ip: voltTyphoonInfra.telecomTargets[0].ip,
        attack_type: 'port_scan',
        target_port: port,
        target_service: 'versa_director',
        confidence: 0.95,
        data_volume: 64,
        stage: 1,
        description: `Network Service Discovery - Scanning Versa Director port ${port}`,
        tool: 'nmap',
        proxy_chain: [
          '45.76.128.0',   // China C2
          '103.56.54.0',   // New Caledonia
          '203.119.88.0',  // Pacific Region
          '202.181.24.0'   // Guam
        ]
      });
    });
  }
  
  // Exploit Versa Director vulnerability
  events.push({
    id: eventId++,
    timestamp: new Date(baseTime.getTime() + 6 * 3600000).toISOString(),
    severity: 9,
    category: 'exploitation',
    technique: 'T1190',
    source_ip: '45.76.128.0',  // Start from China C2
    destination_ip: voltTyphoonInfra.telecomTargets[0].ip,
    attack_type: 'zero_day_exploit',
    target_port: 4566,
    confidence: 0.85,
    data_volume: 4096,
    stage: 1,
    success: true,
    description: 'CVE-2024-39717 - Versa Director Authentication Bypass',
    cve: 'CVE-2024-39717',
    proxy_chain: [
      '45.76.128.0',   // China C2
      '103.56.54.0',   // New Caledonia
      '203.119.88.0',  // Pacific Region
      '202.181.24.0'   // Guam
    ]
  });
  
  // Deploy VersaMem web shell - multiple deployment attempts for persistence
  for (let i = 0; i < 3; i++) {
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + (6.5 + i * 0.1) * 3600000).toISOString(),
      severity: 9,
      category: 'persistence',
      technique: 'T1505.003',
      source_ip: '45.76.128.0',
      destination_ip: voltTyphoonInfra.telecomTargets[0].ip,
      attack_type: 'web_shell_deployment',
      target_port: 443,
      confidence: 0.9,
      data_volume: 8192,
      stage: 1,
      success: i === 2, // Third attempt succeeds
      description: `VersaMem Web Shell Deployment ${i === 2 ? 'SUCCESS' : 'Attempt ' + (i + 1)}`,
      tool: 'VersaMem',
      proxy_chain: [
        '45.76.128.0',   // China C2
        '103.56.54.0',   // New Caledonia
        '203.119.88.0',  // Pacific Region
        '202.181.24.0'   // Guam
      ]
    });
  }
  
  // Phase 2: Credential Harvesting & Discovery (Hour 6-24)
  console.log('Phase 2: Credential Harvesting with LOTL...');
  
  // Create more frequent discovery events for continuous activity
  for (let hour = 6; hour < 24; hour += 0.5) { // Every 30 minutes instead of every hour
    // Use different proxy nodes for obfuscation
    const proxy = voltTyphoonInfra.proxyNodes[Math.floor(hour) % voltTyphoonInfra.proxyNodes.length];
    
    // Living off the land discovery commands - more frequent
    if (Math.floor(hour) % 2 === 0) { // Every 2 hours instead of 3
      const lotlTool = voltTyphoonInfra.lotlTools[Math.floor(Math.random() * 5)];
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 1800000).toISOString(),
        severity: 5,
        category: 'discovery',
        technique: 'T1059.001',
        source_ip: voltTyphoonInfra.telecomTargets[0].ip, // From compromised system
        destination_ip: voltTyphoonInfra.telecomTargets[Math.floor(Math.random() * 3) + 1].ip,
        attack_type: 'lotl_discovery',
        confidence: 0.8,
        data_volume: 512,
        stage: 2,
        description: `LOTL Discovery using ${lotlTool}`,
        tool: lotlTool,
        command: getLOTLCommand(lotlTool),
        proxy_chain: [proxy.location, 'Versa Director']
      });
    }
    
    // PowerShell credential harvesting
    if (hour === 12) {
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000).toISOString(),
        severity: 8,
        category: 'credential_access',
        technique: 'T1059.001',
        source_ip: voltTyphoonInfra.telecomTargets[0].ip,
        destination_ip: voltTyphoonInfra.telecomTargets[2].ip, // Domain Controller
        attack_type: 'credential_harvesting',
        target_port: 5985,
        confidence: 0.85,
        data_volume: 2048,
        stage: 2,
        success: true,
        description: 'PowerShell Credential Harvesting via WinRM',
        tool: 'powershell.exe',
        command: 'Get-WmiObject -Class Win32_UserAccount'
      });
    }
  }
  
  // Phase 3: Lateral Movement via RDP and WMI (Hour 24-48)
  console.log('Phase 3: Lateral Movement using RDP and WMI...');
  
  const compromisedSystems = [
    voltTyphoonInfra.telecomTargets[0].ip,
    voltTyphoonInfra.telecomTargets[2].ip
  ];
  
  // More frequent lateral movement for continuous activity
  for (let hour = 24; hour < 48; hour += 0.25) { // Every 15 minutes
    const sourceSystem = compromisedSystems[Math.floor(Math.random() * compromisedSystems.length)];
    const targetIndex = Math.floor(Math.random() * voltTyphoonInfra.telecomTargets.length);
    const targetSystem = voltTyphoonInfra.telecomTargets[targetIndex];
    
    // RDP lateral movement - more frequent
    if (Math.floor(hour * 2) % 3 === 0) { // More often
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000).toISOString(),
        severity: 7,
        category: 'lateral_movement',
        technique: 'T1021.001',
        source_ip: sourceSystem,
        destination_ip: targetSystem.ip,
        attack_type: 'rdp_lateral_movement',
        target_port: 3389,
        confidence: 0.85,
        data_volume: 4096,
        stage: 3,
        success: Math.random() > 0.3,
        description: `RDP Lateral Movement to ${targetSystem.name}`,
        tool: 'mstsc.exe',
        valid_account: true
      });
      
      // If successful, add to compromised systems
      if (events[events.length - 1].success && !compromisedSystems.includes(targetSystem.ip)) {
        compromisedSystems.push(targetSystem.ip);
      }
    }
    
    // WMI lateral movement
    if (hour % 6 === 0) {
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 1800000).toISOString(),
        severity: 7,
        category: 'lateral_movement',
        technique: 'T1047',
        source_ip: sourceSystem,
        destination_ip: targetSystem.ip,
        attack_type: 'wmi_lateral_movement',
        target_port: 135,
        confidence: 0.8,
        data_volume: 1024,
        stage: 3,
        success: Math.random() > 0.4,
        description: `WMI Lateral Movement to ${targetSystem.name}`,
        tool: 'wmic.exe',
        command: 'wmic /node:target process call create'
      });
    }
  }
  
  // Phase 4: Domain Compromise & NTDS.dit Extraction (Hour 48-60)
  console.log('Phase 4: Domain Compromise and NTDS.dit Extraction...');
  
  // Multiple credential access attempts for visual emphasis
  for (let i = 0; i < 3; i++) {
    // Create Volume Shadow Copy attempts
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + (48 + i * 0.2) * 3600000).toISOString(),
      severity: 8,
      category: 'credential_access',
      technique: 'T1006',
      source_ip: voltTyphoonInfra.telecomTargets[4].ip, // From DC
      destination_ip: voltTyphoonInfra.telecomTargets[4].ip,
      attack_type: 'volume_shadow_copy',
      confidence: 0.9,
      data_volume: 512,
      stage: 4,
      success: i === 2, // Last attempt succeeds
      description: `Creating Volume Shadow Copy for NTDS.dit - Attempt ${i + 1}`,
      tool: 'vssadmin.exe',
      command: 'vssadmin create shadow /for=C:'
    });
  }
  
  // Multiple NTDS.dit extraction attempts for emphasis
  for (let i = 0; i < 5; i++) {
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + (49 + i * 0.1) * 3600000).toISOString(),
      severity: 10,
      category: 'credential_access',
      technique: 'T1003.003',
      source_ip: voltTyphoonInfra.telecomTargets[4].ip,
      destination_ip: voltTyphoonInfra.telecomTargets[4].ip,
      attack_type: 'ntds_extraction',
      confidence: 0.95,
      data_volume: 524288 / 5, // Split into chunks
      stage: 4,
      success: true,
      description: `NTDS.dit Database Extraction - Chunk ${i + 1}/5 - CRITICAL DOMAIN COMPROMISE`,
      tool: 'ntdsutil.exe',
      command: 'ntdsutil "ac i ntds" "ifm" "create full c:\\temp" q q'
    });
  }
  
  // Now pivot to OT systems using DC credentials
  for (let i = 0; i < voltTyphoonInfra.otSystems.length; i++) {
    const otSystem = voltTyphoonInfra.otSystems[i];
    const hour = 52 + i * 2;
    
    // Access OT system from Domain Controller
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + hour * 3600000).toISOString(),
      severity: 9,
      category: 'lateral_movement',
      technique: 'T1021.001',
      source_ip: voltTyphoonInfra.telecomTargets[4].ip, // From DC
      destination_ip: otSystem.ip,
      attack_type: 'ot_system_access',
      target_port: otSystem.ports[0],
      confidence: 0.9,
      data_volume: 2048,
      stage: 4,
      success: true,
      description: `Accessing ${otSystem.name} via ${otSystem.type}`,
      tool: 'rdp',
      proxy_chain: ['Pacific', 'Guam']
    });
    
    // SCADA/OT specific attacks
    if (otSystem.name.includes('SCADA')) {
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + (hour + 0.5) * 3600000).toISOString(),
        severity: 10,
        category: 'collection',
        technique: 'T1005',
        source_ip: voltTyphoonInfra.telecomTargets[4].ip,
        destination_ip: otSystem.ip,
        attack_type: 'scada_enumeration',
        target_port: 502, // Modbus
        confidence: 0.95,
        data_volume: 8192,
        stage: 4,
        success: true,
        description: 'SCADA System Enumeration - Modbus Protocol',
        protocol: 'modbus'
      });
    }
  }
  
  // Phase 5: Data Staging and Multi-hop Exfiltration (Hour 60-70)
  console.log('Phase 5: Multi-hop Data Exfiltration from IT and OT systems...');
  
  // Continuous exfiltration showing data streaming out
  for (let hour = 60; hour < 70; hour += 0.5) { // Every 30 minutes for continuous flow
    const proxyChain = [
      '202.181.24.0',  // Guam
      '203.119.88.0',  // Pacific Region
      '103.56.54.0',   // New Caledonia
      '45.76.128.0'    // China C2
    ];
    
    // Rotate through different compromised servers as sources
    const sources = [
      voltTyphoonInfra.telecomTargets[2].ip,  // Web Server
      voltTyphoonInfra.telecomTargets[4].ip,  // Domain Controller
      voltTyphoonInfra.otSystems[0].ip        // SCADA Master
    ];
    
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + hour * 3600000).toISOString(),
      severity: 9,
      category: 'exfiltration',
      technique: 'T1090.003',
      source_ip: sources[Math.floor(hour / 2) % sources.length],
      destination_ip: '45.76.128.0',  // China C2
      attack_type: 'multi_hop_exfiltration',
      target_port: 443,
      confidence: 0.85,
      data_volume: 1048576, // 1MB chunks
      stage: 5,
      success: true,
      description: 'Multi-hop Proxy Exfiltration via Compromised Routers',
      proxy_chain: proxyChain,
      encrypted: true
    });
  }
  
  // Phase 6: Log Deletion and Persistence (Hour 70-72)
  console.log('Phase 6: Covering Tracks...');
  
  compromisedSystems.forEach(system => {
    events.push({
      id: eventId++,
      timestamp: new Date(baseTime.getTime() + 71 * 3600000).toISOString(),
      severity: 6,
      category: 'defense_evasion',
      technique: 'T1070.001',
      source_ip: system,
      destination_ip: system,
      attack_type: 'log_deletion',
      confidence: 0.9,
      data_volume: 256,
      stage: 6,
      success: true,
      description: 'Clear Windows Event Logs',
      tool: 'wevtutil.exe',
      command: 'wevtutil cl System & wevtutil cl Security'
    });
  });
  
  // No benign traffic - focus only on the attack
  
  return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function getLOTLCommand(tool) {
  const commands = {
    'wmic.exe': 'wmic process list brief',
    'powershell.exe': 'Get-Process | Select-Object Name, Id',
    'netsh.exe': 'netsh wlan show profiles',
    'net.exe': 'net user /domain',
    'tasklist.exe': 'tasklist /v',
    'reg.exe': 'reg query HKLM\\Software',
    'certutil.exe': 'certutil -store',
    'ntdsutil.exe': 'ntdsutil "ac i ntds" ifm',
    'vssadmin.exe': 'vssadmin list shadows',
    'bitsadmin.exe': 'bitsadmin /list /allusers /verbose'
  };
  return commands[tool] || 'unknown command';
}

// Generate the Volt Typhoon attack data
const attackData = {
  metadata: {
    source: 'Volt Typhoon APT Campaign - Telecommunications Infrastructure Attack',
    version: '1.0.0',
    description: 'Based on 2024 CISA advisories and Microsoft threat intelligence',
    threat_actor: 'Volt Typhoon (Bronze Silhouette, Vanguard Panda, DEV-0391)',
    campaign: 'Operation Silent Bridge - Pacific Telecommunications Targeting',
    timeframe: '72-hour attack progression',
    references: [
      'https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a',
      'CVE-2024-39717 - Versa Director Zero-Day',
      'MITRE ATT&CK Group G1017'
    ]
  },
  narrative: {
    overview: 'Volt Typhoon uses Living Off the Land techniques to compromise telecommunications infrastructure, establishing persistent access for potential disruption during geopolitical tensions.',
    stages: [
      {
        stage: 1,
        name: 'Initial Access',
        time: 'Hour 0-6',
        description: 'Exploit Versa Director zero-day (CVE-2024-39717) and deploy VersaMem web shell'
      },
      {
        stage: 2,
        name: 'Discovery & Credential Access',
        time: 'Hour 6-24',
        description: 'Use LOTL tools (PowerShell, WMI) for network discovery and credential harvesting'
      },
      {
        stage: 3,
        name: 'Lateral Movement',
        time: 'Hour 24-48',
        description: 'Move laterally via RDP (T1021.001) and WMI (T1047) using valid accounts'
      },
      {
        stage: 4,
        name: 'Domain Compromise',
        time: 'Hour 48-60',
        description: 'Extract NTDS.dit using Volume Shadow Copy for full domain compromise'
      },
      {
        stage: 5,
        name: 'Data Exfiltration',
        time: 'Hour 60-72',
        description: 'Multi-hop proxy exfiltration through compromised SOHO routers'
      },
      {
        stage: 6,
        name: 'Persistence & Evasion',
        time: 'Hour 70-72',
        description: 'Clear event logs and maintain stealth for long-term persistence'
      }
    ]
  },
  events: generateVoltTyphoonAttack()
};

// Add statistics
attackData.statistics = {
  total_events: attackData.events.length,
  techniques_used: [...new Set(attackData.events.filter(e => e.technique).map(e => e.technique))].length,
  compromised_systems: [...new Set(attackData.events.filter(e => e.success).map(e => e.destination_ip))].length,
  data_exfiltrated_mb: Math.round(attackData.events.filter(e => e.category === 'exfiltration').reduce((sum, e) => sum + e.data_volume, 0) / 1024),
  lotl_tools_used: [...new Set(attackData.events.filter(e => e.tool).map(e => e.tool))].length,
  proxy_nodes_used: 4
};

// Write the file
fs.writeFileSync(
  path.join(__dirname, '../public/data/volt-typhoon-attack.json'),
  JSON.stringify(attackData, null, 2)
);

console.log(`\n✅ Generated Volt Typhoon attack dataset`);
console.log(`📊 Statistics:`);
console.log(`   - Total Events: ${attackData.statistics.total_events}`);
console.log(`   - MITRE ATT&CK Techniques: ${attackData.statistics.techniques_used}`);
console.log(`   - Compromised Systems: ${attackData.statistics.compromised_systems}`);
console.log(`   - Data Exfiltrated: ${attackData.statistics.data_exfiltrated_mb} MB`);
console.log(`   - LOTL Tools Used: ${attackData.statistics.lotl_tools_used}`);
console.log(`   - Proxy Nodes: ${attackData.statistics.proxy_nodes_used}`);