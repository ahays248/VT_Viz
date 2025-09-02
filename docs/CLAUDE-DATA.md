# CLAUDE-DATA.md - Data Processing & Loading

## Purpose
Handles loading, parsing, and processing of cybersecurity datasets, mapping data attributes to visual properties, and supporting real-time data streaming.

## Supported Data Formats

### CSV Format
```csv
timestamp,severity,category,source_ip,destination_ip,attack_type,confidence,data_volume
2024-01-15T10:23:45Z,8,malware,192.168.1.105,10.0.0.1,trojan,0.95,1024
2024-01-15T10:23:46Z,3,benign,192.168.1.20,8.8.8.8,http,0.99,512
```

### JSON Format
```json
{
  "events": [
    {
      "timestamp": "2024-01-15T10:23:45Z",
      "severity": 8,
      "category": "malware",
      "source_ip": "192.168.1.105",
      "destination_ip": "10.0.0.1",
      "attack_type": "trojan",
      "confidence": 0.95,
      "data_volume": 1024,
      "metadata": {
        "port": 443,
        "protocol": "tcp",
        "country": "US"
      }
    }
  ]
}
```

## Data Loading Pipeline

### File Loader
```javascript
async function loadDataset(path, format = 'auto') {
  try {
    const response = await fetch(path);
    const contentType = response.headers.get('content-type');
    
    if (format === 'auto') {
      format = detectFormat(contentType, path);
    }
    
    switch (format) {
      case 'csv':
        return parseCSV(await response.text());
      case 'json':
        return parseJSON(await response.json());
      case 'stream':
        return setupStream(response.body);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Data loading failed:', error);
    return generateSampleData();
  }
}
```

### CSV Parser
```javascript
function parseCSV(csvText) {
  const parsed = d3.csvParse(csvText, d => ({
    timestamp: new Date(d.timestamp),
    severity: +d.severity,
    category: d.category,
    source_ip: d.source_ip,
    destination_ip: d.destination_ip,
    attack_type: d.attack_type,
    confidence: +d.confidence,
    data_volume: +d.data_volume || 100
  }));
  
  return validateAndClean(parsed);
}
```

### Data Validation
```javascript
function validateAndClean(data) {
  return data.filter(event => {
    // Required fields
    if (!event.timestamp || !event.severity) return false;
    
    // Severity range
    if (event.severity < 0 || event.severity > 10) {
      event.severity = Math.max(0, Math.min(10, event.severity));
    }
    
    // Confidence range
    if (event.confidence < 0 || event.confidence > 1) {
      event.confidence = Math.max(0, Math.min(1, event.confidence));
    }
    
    // Default values
    event.category = event.category || 'unknown';
    event.attack_type = event.attack_type || 'generic';
    
    return true;
  });
}
```

## Data Processing

### Statistical Analysis
```javascript
function analyzeDataset(data) {
  const stats = {
    total: data.length,
    timeRange: d3.extent(data, d => d.timestamp),
    severityDistribution: d3.rollup(data, v => v.length, d => d.severity),
    categoryBreakdown: d3.rollup(data, v => v.length, d => d.category),
    attackTypes: [...new Set(data.map(d => d.attack_type))],
    
    // Calculated metrics
    averageSeverity: d3.mean(data, d => d.severity),
    criticalEvents: data.filter(d => d.severity >= 8).length,
    anomalyRate: data.filter(d => d.confidence < 0.5).length / data.length
  };
  
  return stats;
}
```

### Time-based Aggregation
```javascript
function aggregateByTime(data, interval = 'minute') {
  const timeFormat = {
    second: '%Y-%m-%d %H:%M:%S',
    minute: '%Y-%m-%d %H:%M',
    hour: '%Y-%m-%d %H',
    day: '%Y-%m-%d'
  };
  
  const format = d3.timeFormat(timeFormat[interval]);
  
  return d3.rollup(
    data,
    events => ({
      count: events.length,
      avgSeverity: d3.mean(events, d => d.severity),
      categories: d3.rollup(events, v => v.length, d => d.category),
      peak: d3.max(events, d => d.severity)
    }),
    d => format(d.timestamp)
  );
}
```

### IP Geolocation
```javascript
async function geolocateIPs(data) {
  const uniqueIPs = new Set();
  data.forEach(event => {
    uniqueIPs.add(event.source_ip);
    uniqueIPs.add(event.destination_ip);
  });
  
  const geoCache = new Map();
  
  // Batch API call for efficiency
  const ips = [...uniqueIPs];
  const geoData = await fetchGeolocation(ips);
  
  geoData.forEach(geo => {
    geoCache.set(geo.ip, {
      lat: geo.latitude,
      lon: geo.longitude,
      country: geo.country,
      city: geo.city
    });
  });
  
  // Enhance events with geo data
  return data.map(event => ({
    ...event,
    source_geo: geoCache.get(event.source_ip),
    dest_geo: geoCache.get(event.destination_ip)
  }));
}
```

## Data to Visual Mapping

### Coordinate Mapping
```javascript
function mapToCoordinates(event) {
  // IP-based positioning
  const sourceHash = hashIP(event.source_ip);
  const destHash = hashIP(event.destination_ip);
  
  // Spherical coordinates for interesting patterns
  const radius = 200 + event.severity * 20;
  const theta = (sourceHash / 0xFFFFFFFF) * Math.PI * 2;
  const phi = (destHash / 0xFFFFFFFF) * Math.PI;
  
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi)
  };
}

function hashIP(ip) {
  const parts = ip.split('.');
  return parts.reduce((acc, part, i) => 
    acc + parseInt(part) * Math.pow(256, 3 - i), 0);
}
```

### Attribute Scaling
```javascript
const scaleConfig = {
  size: d3.scaleLinear()
    .domain([0, 10]) // severity
    .range([2, 20])
    .clamp(true),
  
  opacity: d3.scaleLinear()
    .domain([0, 1]) // confidence
    .range([0.3, 1.0])
    .clamp(true),
  
  speed: d3.scaleLinear()
    .domain([0, 10000]) // data_volume
    .range([0.1, 2.0])
    .clamp(true)
};

function mapAttributes(event) {
  return {
    size: scaleConfig.size(event.severity),
    opacity: scaleConfig.opacity(event.confidence),
    speed: scaleConfig.speed(event.data_volume),
    color: threatColorMap[event.attack_type] || 0x808080
  };
}
```

### Category Clustering
```javascript
function assignToCluster(event) {
  const clusters = {
    'malware': { center: new THREE.Vector3(0, 0, 0), radius: 200 },
    'intrusion': { center: new THREE.Vector3(500, 0, 0), radius: 150 },
    'ddos': { center: new THREE.Vector3(-500, 0, 0), radius: 150 },
    'phishing': { center: new THREE.Vector3(0, 500, 0), radius: 100 },
    'benign': { center: new THREE.Vector3(0, -500, 0), radius: 300 }
  };
  
  const cluster = clusters[event.category] || clusters['benign'];
  
  // Random position within cluster
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * cluster.radius;
  const height = (Math.random() - 0.5) * 100;
  
  return {
    x: cluster.center.x + r * Math.cos(angle),
    y: cluster.center.y + height,
    z: cluster.center.z + r * Math.sin(angle)
  };
}
```

## Real-time Data Streaming

### WebSocket Connection
```javascript
class DataStream {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.buffer = [];
    this.callbacks = [];
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.buffer.push(data);
      this.processBuffer();
    };
  }
  
  processBuffer() {
    if (this.buffer.length >= BATCH_SIZE || 
        Date.now() - this.lastProcess > BATCH_TIMEOUT) {
      const batch = this.buffer.splice(0, BATCH_SIZE);
      this.callbacks.forEach(cb => cb(batch));
      this.lastProcess = Date.now();
    }
  }
  
  onData(callback) {
    this.callbacks.push(callback);
  }
}
```

### Incremental Updates
```javascript
function handleStreamData(newEvents) {
  // Process new events
  const processed = newEvents.map(event => ({
    ...event,
    id: generateId(),
    timestamp: new Date(event.timestamp),
    particle: null
  }));
  
  // Add to dataset
  dataset.push(...processed);
  
  // Create particles for new events
  processed.forEach(event => {
    const particle = createParticle(event);
    addParticleToSystem(particle);
    event.particle = particle;
  });
  
  // Update statistics
  updateStats(dataset);
  
  // Trigger animations
  animateNewParticles(processed);
}
```

## Sample Data Generation

### Synthetic Dataset
```javascript
function generateSampleData(count = 1000) {
  const categories = ['malware', 'intrusion', 'ddos', 'phishing', 'benign'];
  const attackTypes = {
    'malware': ['trojan', 'ransomware', 'worm', 'virus'],
    'intrusion': ['brute_force', 'sql_injection', 'xss', 'privilege_escalation'],
    'ddos': ['syn_flood', 'udp_flood', 'http_flood', 'amplification'],
    'phishing': ['spear_phishing', 'whaling', 'clone_phishing', 'popup'],
    'benign': ['http', 'https', 'dns', 'ntp']
  };
  
  const data = [];
  const startTime = Date.now() - 3600000; // 1 hour ago
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const isBenign = category === 'benign';
    
    data.push({
      timestamp: new Date(startTime + Math.random() * 3600000),
      severity: isBenign ? Math.random() * 3 : 3 + Math.random() * 7,
      category: category,
      source_ip: generateRandomIP(),
      destination_ip: generateRandomIP(),
      attack_type: attackTypes[category][
        Math.floor(Math.random() * attackTypes[category].length)
      ],
      confidence: isBenign ? 0.9 + Math.random() * 0.1 : 0.5 + Math.random() * 0.5,
      data_volume: Math.floor(Math.random() * 10000)
    });
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp);
}

function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}
```

## Caching Strategy

### Memory Cache
```javascript
class DataCache {
  constructor(maxSize = 100000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // LRU eviction
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }
    
    this.cache.set(key, value);
    this.updateAccessOrder(key);
  }
  
  get(key) {
    const value = this.cache.get(key);
    if (value) this.updateAccessOrder(key);
    return value;
  }
  
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) this.accessOrder.splice(index, 1);
    this.accessOrder.push(key);
  }
}
```

## Performance Considerations

### Batch Processing
```javascript
function processBatch(events, batchSize = 100) {
  const batches = [];
  
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  
  return new Promise((resolve) => {
    let processed = [];
    let currentBatch = 0;
    
    function processNext() {
      if (currentBatch >= batches.length) {
        resolve(processed);
        return;
      }
      
      const batch = batches[currentBatch++];
      processed.push(...batch.map(processEvent));
      
      // Yield to browser
      requestAnimationFrame(processNext);
    }
    
    processNext();
  });
}
```

### Web Workers
```javascript
// dataWorker.js
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'parse':
      const parsed = parseData(data);
      self.postMessage({ type: 'parsed', data: parsed });
      break;
      
    case 'analyze':
      const stats = analyzeData(data);
      self.postMessage({ type: 'stats', data: stats });
      break;
  }
};

// Main thread
const worker = new Worker('dataWorker.js');
worker.postMessage({ type: 'parse', data: rawData });
worker.onmessage = (e) => {
  if (e.data.type === 'parsed') {
    updateVisualization(e.data.data);
  }
};
```

---

Last Updated: Data module initialization
Module Version: 1.0.0