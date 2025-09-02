import * as d3 from 'd3';

export async function loadDataset(path = '/data/real-attacks.json') {
  try {
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return processJSONData(data);
    } else if (path.endsWith('.csv')) {
      const text = await response.text();
      return processCSVData(text);
    } else {
      console.warn('Unknown data format, generating sample data');
      return generateSampleData();
    }
  } catch (error) {
    console.error('Error loading dataset:', error);
    console.log('Using sample data instead');
    return generateSampleData();
  }
}

function processJSONData(data) {
  if (Array.isArray(data)) {
    return data.length > 0 ? data.map(validateEvent) : generateSampleData();
  } else if (data.events && Array.isArray(data.events)) {
    return data.events.length > 0 ? data.events.map(validateEvent) : generateSampleData();
  } else {
    throw new Error('Invalid JSON data format');
  }
}

function processCSVData(csvText) {
  const parsed = d3.csvParse(csvText, d => ({
    timestamp: new Date(d.timestamp || Date.now()),
    severity: +d.severity || 5,
    category: d.category || 'unknown',
    source_ip: d.source_ip || generateRandomIP(),
    destination_ip: d.destination_ip || generateRandomIP(),
    attack_type: d.attack_type || 'unknown',
    confidence: +d.confidence || 0.5,
    data_volume: +d.data_volume || 100
  }));
  
  return parsed.map(validateEvent);
}

function validateEvent(event) {
  return {
    timestamp: event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp || Date.now()),
    severity: Math.max(0, Math.min(10, event.severity || 5)),
    category: event.category || 'unknown',
    source_ip: event.source_ip || generateRandomIP(),
    destination_ip: event.destination_ip || generateRandomIP(),
    attack_type: event.attack_type || 'unknown',
    confidence: Math.max(0, Math.min(1, event.confidence || 0.5)),
    data_volume: Math.max(1, event.data_volume || 100)
  };
}

export function generateSampleData(count = 5000) {
  const categories = ['malware', 'intrusion', 'ddos', 'phishing', 'benign'];
  const attackTypes = {
    'malware': ['trojan', 'ransomware', 'worm', 'virus', 'rootkit'],
    'intrusion': ['brute_force', 'sql_injection', 'xss', 'privilege_escalation', 'backdoor'],
    'ddos': ['syn_flood', 'udp_flood', 'http_flood', 'amplification', 'slowloris'],
    'phishing': ['spear_phishing', 'whaling', 'clone_phishing', 'popup', 'pharming'],
    'benign': ['http', 'https', 'dns', 'ntp', 'ssh']
  };
  
  const data = [];
  const startTime = Date.now() - 3600000;
  
  for (let i = 0; i < count; i++) {
    const category = weightedRandom(categories, [0.2, 0.2, 0.15, 0.15, 0.3]);
    const isBenign = category === 'benign';
    
    const baseSeveity = isBenign ? 0 : 5;
    const severityRange = isBenign ? 3 : 5;
    
    data.push({
      timestamp: new Date(startTime + (i / count) * 3600000 + Math.random() * 1000),
      severity: baseSeveity + Math.random() * severityRange,
      category: category,
      source_ip: generateRandomIP(isBenign),
      destination_ip: generateRandomIP(!isBenign),
      attack_type: attackTypes[category][Math.floor(Math.random() * attackTypes[category].length)],
      confidence: isBenign ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.6,
      data_volume: Math.floor(Math.random() * Math.random() * 10000)
    });
  }
  
  const anomalies = Math.floor(count * 0.01);
  for (let i = 0; i < anomalies; i++) {
    const idx = Math.floor(Math.random() * data.length);
    data[idx].severity = 9 + Math.random();
    data[idx].confidence = Math.random() * 0.3;
    data[idx].data_volume = 50000 + Math.random() * 50000;
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp);
}

function generateRandomIP(isInternal = false) {
  if (isInternal && Math.random() > 0.3) {
    const subnet = Math.random() > 0.5 ? '192.168' : '10.0';
    return `${subnet}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }
  
  return `${Math.floor(Math.random() * 224) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

export function analyzeDataset(data) {
  return {
    total: data.length,
    timeRange: d3.extent(data, d => d.timestamp),
    severityDistribution: d3.rollup(data, v => v.length, d => Math.floor(d.severity)),
    categoryBreakdown: d3.rollup(data, v => v.length, d => d.category),
    attackTypes: [...new Set(data.map(d => d.attack_type))],
    averageSeverity: d3.mean(data, d => d.severity),
    criticalEvents: data.filter(d => d.severity >= 8).length,
    anomalyRate: data.filter(d => d.confidence < 0.5).length / data.length,
    topSourceIPs: Array.from(
      d3.rollup(data, v => v.length, d => d.source_ip)
    ).sort((a, b) => b[1] - a[1]).slice(0, 10),
    peakTime: d3.rollup(
      data, 
      v => v.length, 
      d => d.timestamp.getHours()
    )
  };
}