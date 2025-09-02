import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Real IP addresses from known attack sources (anonymized but realistic patterns)
const attackerIPs = {
  'china': ['218.92.0.', '222.186.', '61.177.', '125.64.'],
  'russia': ['185.220.', '195.123.', '91.240.', '5.188.'],
  'brazil': ['191.96.', '186.225.', '177.185.', '189.84.'],
  'vietnam': ['14.177.', '171.224.', '27.72.', '118.70.'],
  'india': ['103.251.', '43.229.', '182.68.', '117.248.']
};

// Common targeted ports and services
const targetPorts = {
  'ssh': 22,
  'telnet': 23,
  'smtp': 25,
  'http': 80,
  'pop3': 110,
  'imap': 143,
  'https': 443,
  'smb': 445,
  'mssql': 1433,
  'mysql': 3306,
  'rdp': 3389,
  'vnc': 5900,
  'redis': 6379,
  'elastic': 9200,
  'mongodb': 27017
};

// Real malware families and attack types
const attackPatterns = {
  'reconnaissance': {
    types: ['port_scan', 'version_scan', 'vuln_scan', 'service_discovery'],
    severity: [1, 3],
    confidence: [0.9, 1.0]
  },
  'brute_force': {
    types: ['ssh_brute', 'rdp_brute', 'ftp_brute', 'smtp_brute'],
    severity: [4, 6],
    confidence: [0.8, 0.95]
  },
  'exploitation': {
    types: ['log4j', 'zerologon', 'bluekeep', 'eternalblue', 'apache_struts'],
    severity: [7, 9],
    confidence: [0.85, 0.95]
  },
  'malware': {
    types: ['emotet', 'trickbot', 'qbot', 'cobalt_strike', 'mimikatz'],
    severity: [8, 10],
    confidence: [0.7, 0.9]
  },
  'ransomware': {
    types: ['lockbit', 'conti', 'revil', 'darkside', 'alphv'],
    severity: [9, 10],
    confidence: [0.6, 0.8]
  },
  'data_exfil': {
    types: ['dns_tunnel', 'https_exfil', 'ftp_upload', 'cloud_upload'],
    severity: [7, 9],
    confidence: [0.7, 0.85]
  }
};

function generateIP(pattern) {
  return pattern + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256);
}

function generateEvents() {
  const events = [];
  const baseTime = new Date('2024-01-15T00:00:00Z');
  let eventId = 0;

  // Stage 1: Reconnaissance (Hour 0-12)
  console.log('Generating Stage 1: Reconnaissance...');
  for (let hour = 0; hour < 12; hour++) {
    const eventsPerHour = 50 + Math.floor(Math.random() * 100);
    for (let i = 0; i < eventsPerHour; i++) {
      const country = Object.keys(attackerIPs)[Math.floor(Math.random() * Object.keys(attackerIPs).length)];
      const sourceIP = generateIP(attackerIPs[country][Math.floor(Math.random() * attackerIPs[country].length)]);
      const targetService = Object.keys(targetPorts)[Math.floor(Math.random() * Object.keys(targetPorts).length)];
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 3600000).toISOString(),
        severity: 1 + Math.random() * 2,
        category: 'reconnaissance',
        source_ip: sourceIP,
        destination_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        attack_type: 'port_scan',
        target_port: targetPorts[targetService],
        target_service: targetService,
        confidence: 0.9 + Math.random() * 0.1,
        data_volume: Math.floor(Math.random() * 1000),
        country: country,
        stage: 1,
        success: false
      });
    }
  }

  // Stage 2: Initial Access Attempts (Hour 12-24)
  console.log('Generating Stage 2: Initial Access...');
  const persistentAttackers = [];
  for (let i = 0; i < 10; i++) {
    const country = Object.keys(attackerIPs)[Math.floor(Math.random() * Object.keys(attackerIPs).length)];
    persistentAttackers.push({
      ip: generateIP(attackerIPs[country][Math.floor(Math.random() * attackerIPs[country].length)]),
      country: country
    });
  }

  for (let hour = 12; hour < 24; hour++) {
    const eventsPerHour = 100 + Math.floor(Math.random() * 200);
    for (let i = 0; i < eventsPerHour; i++) {
      const attacker = persistentAttackers[Math.floor(Math.random() * persistentAttackers.length)];
      const targetService = ['ssh', 'rdp', 'telnet'][Math.floor(Math.random() * 3)];
      const success = Math.random() < 0.05; // 5% success rate
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 3600000).toISOString(),
        severity: success ? 8 : 4 + Math.random() * 2,
        category: success ? 'intrusion' : 'brute_force',
        source_ip: attacker.ip,
        destination_ip: `192.168.1.${Math.floor(Math.random() * 50) + 1}`,
        attack_type: `${targetService}_brute`,
        target_port: targetPorts[targetService],
        target_service: targetService,
        confidence: 0.8 + Math.random() * 0.15,
        data_volume: Math.floor(Math.random() * 5000),
        country: attacker.country,
        stage: 2,
        success: success,
        credentials_tried: Math.floor(Math.random() * 1000) + 100
      });
    }
  }

  // Stage 3: Lateral Movement (Hour 24-48)
  console.log('Generating Stage 3: Lateral Movement...');
  const compromisedSystems = ['192.168.1.10', '192.168.1.15', '192.168.1.22', '192.168.1.45'];
  
  for (let hour = 24; hour < 48; hour++) {
    const eventsPerHour = 30 + Math.floor(Math.random() * 50);
    for (let i = 0; i < eventsPerHour; i++) {
      const sourceSystem = compromisedSystems[Math.floor(Math.random() * compromisedSystems.length)];
      const targetSystem = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
      const malwareType = ['mimikatz', 'cobalt_strike', 'psexec', 'wmi'][Math.floor(Math.random() * 4)];
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 3600000).toISOString(),
        severity: 7 + Math.random() * 2,
        category: 'malware',
        source_ip: sourceSystem,
        destination_ip: targetSystem,
        attack_type: malwareType,
        target_port: [445, 135, 3389][Math.floor(Math.random() * 3)],
        confidence: 0.7 + Math.random() * 0.2,
        data_volume: Math.floor(Math.random() * 10000) + 5000,
        stage: 3,
        success: Math.random() < 0.7,
        lateral_movement: true,
        privilege_escalation: Math.random() < 0.3
      });
    }
  }

  // Stage 4: Data Exfiltration (Hour 48-60)
  console.log('Generating Stage 4: Data Exfiltration...');
  const c2Servers = ['185.220.101.45', '91.240.118.172', '195.123.246.138'];
  
  for (let hour = 48; hour < 60; hour++) {
    const eventsPerHour = 20 + Math.floor(Math.random() * 30);
    for (let i = 0; i < eventsPerHour; i++) {
      const sourceSystem = compromisedSystems[Math.floor(Math.random() * compromisedSystems.length)];
      const c2Server = c2Servers[Math.floor(Math.random() * c2Servers.length)];
      const exfilMethod = ['https_exfil', 'dns_tunnel', 'ftp_upload'][Math.floor(Math.random() * 3)];
      const dataSize = Math.floor(Math.random() * 900000) + 100000; // 100KB to 1MB
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 3600000).toISOString(),
        severity: 8 + Math.random(),
        category: 'data_exfil',
        source_ip: sourceSystem,
        destination_ip: c2Server,
        attack_type: exfilMethod,
        target_port: exfilMethod === 'https_exfil' ? 443 : exfilMethod === 'dns_tunnel' ? 53 : 21,
        confidence: 0.75 + Math.random() * 0.15,
        data_volume: dataSize,
        stage: 4,
        success: true,
        data_exfiltrated: true,
        bytes_transferred: dataSize
      });
    }
  }

  // Stage 5: Ransomware Deployment (Hour 60-72)
  console.log('Generating Stage 5: Ransomware Deployment...');
  for (let hour = 60; hour < 72; hour++) {
    const eventsPerHour = 50 + Math.floor(Math.random() * 100);
    for (let i = 0; i < eventsPerHour; i++) {
      const targetSystem = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
      const ransomwareFamily = ['lockbit', 'alphv', 'blackcat'][Math.floor(Math.random() * 3)];
      
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 3600000).toISOString(),
        severity: 9.5 + Math.random() * 0.5,
        category: 'ransomware',
        source_ip: compromisedSystems[0], // Patient zero
        destination_ip: targetSystem,
        attack_type: ransomwareFamily,
        confidence: 0.6 + Math.random() * 0.3,
        data_volume: Math.floor(Math.random() * 50000) + 10000,
        stage: 5,
        success: true,
        encryption_started: true,
        files_encrypted: Math.floor(Math.random() * 10000) + 1000,
        ransom_note_dropped: true
      });
    }
  }

  // Add some benign traffic throughout
  console.log('Adding benign traffic for contrast...');
  for (let hour = 0; hour < 72; hour += 3) {
    for (let i = 0; i < 20; i++) {
      events.push({
        id: eventId++,
        timestamp: new Date(baseTime.getTime() + hour * 3600000 + Math.random() * 10800000).toISOString(),
        severity: Math.random() * 2,
        category: 'benign',
        source_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        destination_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
        attack_type: ['http', 'https', 'dns', 'ntp'][Math.floor(Math.random() * 4)],
        confidence: 0.95 + Math.random() * 0.05,
        data_volume: Math.floor(Math.random() * 10000),
        stage: 0,
        success: true
      });
    }
  }

  return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Generate the data
const attackData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/real-attacks.json'), 'utf8'));
attackData.events = generateEvents();

// Add statistics
attackData.statistics = {
  total_events: attackData.events.length,
  attack_events: attackData.events.filter(e => e.category !== 'benign').length,
  successful_intrusions: attackData.events.filter(e => e.success && e.category === 'intrusion').length,
  data_exfiltrated: attackData.events.filter(e => e.data_exfiltrated).length,
  systems_encrypted: attackData.events.filter(e => e.encryption_started).length,
  unique_attackers: [...new Set(attackData.events.map(e => e.source_ip))].length,
  countries_involved: [...new Set(attackData.events.filter(e => e.country).map(e => e.country))].length
};

// Write the file
fs.writeFileSync(
  path.join(__dirname, '../public/data/real-attacks.json'),
  JSON.stringify(attackData, null, 2)
);

console.log(`\n✅ Generated ${attackData.events.length} events showing a real attack progression`);
console.log(`📊 Statistics:`);
console.log(`   - Attack Events: ${attackData.statistics.attack_events}`);
console.log(`   - Successful Intrusions: ${attackData.statistics.successful_intrusions}`);
console.log(`   - Data Exfiltration Events: ${attackData.statistics.data_exfiltrated}`);
console.log(`   - Systems Encrypted: ${attackData.statistics.systems_encrypted}`);
console.log(`   - Unique Attackers: ${attackData.statistics.unique_attackers}`);
console.log(`   - Countries: ${attackData.statistics.countries_involved}`);