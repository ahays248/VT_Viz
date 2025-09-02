# Volt Typhoon APT Attack Visualization

## 🎯 Overview

An interactive 3D visualization of the Volt Typhoon (Chinese state-sponsored APT) attack on U.S. critical infrastructure, based on official CISA advisories and Microsoft threat intelligence. This educational tool demonstrates the complete 72-hour attack chain from initial compromise through data exfiltration.

## 🚨 Key Features

### Real Attack Simulation
- **CVE-2024-39717**: Versa Director zero-day exploitation
- **Living Off the Land (LOTL)**: No malware, only legitimate Windows tools
- **Multi-hop proxy routing**: China → New Caledonia → Pacific → Guam → Target
- **Critical infrastructure targeting**: Water treatment, power grid, SCADA systems

### Interactive Timeline
- **6 Attack Stages** over 72 hours
- **Speed controls**: 1x to 60x playback speed
- **Dynamic camera**: Follows attack progression
- **Real-time packet flow**: Visual network traffic

## 🛡️ Intelligence Sources

This visualization is based entirely on public intelligence reports:

- **CISA Advisory AA24-038A** (February 7, 2024)
  - "PRC State-Sponsored Actors Compromise and Maintain Persistent Access to U.S. Critical Infrastructure"
  - Documents 5+ year persistence in victim networks

- **Microsoft Threat Intelligence** (May 24, 2023)
  - "Volt Typhoon targets US critical infrastructure with living-off-the-land techniques"
  - Identified New Caledonia proxy infrastructure

- **FBI Private Industry Notification 240131-001** (January 31, 2024)
  - Details on water utility compromises
  - SCADA/OT system access methods

- **MITRE ATT&CK Group G1017**
  - Complete TTP mapping for Volt Typhoon

## 🎮 Controls

### Playback Controls
- **Play/Pause**: Start or pause the attack simulation
- **Speed Options**: 
  - 1x: Real-time (12 minutes for 72 hours)
  - 10x, 30x, 45x, 60x: Faster playback (default: 45x)
- **Restart**: Reset to beginning

### Camera Controls
- **Left Click + Drag**: Rotate view
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out
- **R Key**: Reset camera position

## 🏗️ Architecture

### Technology Stack
```
Frontend:
├── Three.js         # 3D visualization
├── GSAP            # Timeline animations
├── Vite            # Build system
└── ES6 Modules     # Modern JavaScript

Data:
├── Attack Events   # JSON timeline data
├── Network Topology # Node positioning
└── MITRE Techniques # ATT&CK framework
```

### Network Zones
1. **Proxy Chain** (Far Left) - Compromised routers
2. **IT Network** (Center) - Corporate systems
3. **OT/SCADA** (Right) - Critical infrastructure

## 🚀 Installation

```bash
# Clone repository
git clone [repository-url]
cd VizOne

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
VizOne/
├── src/
│   ├── volt-typhoon-timeline.js   # Main visualization logic
│   ├── scene.js                   # Three.js scene setup
│   ├── main.js                    # Application entry
│   └── controls.js                # User interactions
├── public/
│   └── data/
│       └── volt-typhoon-attack.json  # Attack event data
├── scripts/
│   └── generate-volt-typhoon-data.js # Data generation
└── docs/
    ├── CLAUDE.md                  # Architecture documentation
    ├── LESSONS-LEARNED-THREEJS.md # Development insights
    └── VOLT-TYPHOON-SOURCES.md   # Intelligence sources
```

## 📊 Attack Timeline

### Stage 1: Initial Access (0-6 hours)
- **CVE-2024-39717**: Versa Director authentication bypass
- **Ports**: 4566, 4570, 443
- **Tool**: VersaMem web shell

### Stage 2: Discovery (6-24 hours)
- **T1059.001**: PowerShell enumeration
- **Tools**: powershell.exe, wmic.exe, ntdsutil.exe
- **Technique**: Living Off the Land (no malware)

### Stage 3: Lateral Movement (24-48 hours)
- **T1021.001**: RDP chain through jump boxes
- **T1047**: WMI for remote execution
- **Target**: Domain Controller

### Stage 4: Domain Compromise (48-60 hours)
- **T1003.003**: NTDS.dit extraction
- **Method**: Volume Shadow Copy
- **Impact**: Full AD compromise, OT access

### Stage 5: Exfiltration (60-72 hours)
- **T1090.003**: Multi-hop proxy chains
- **Route**: Target → Guam → Pacific → New Caledonia → China
- **T1070.001**: Windows Event Log clearing

## ⚠️ Critical Impact

### Data Compromised
- Active Directory credentials
- SCADA configurations
- Water treatment parameters
- Power grid topology
- Industrial control logic

### Potential Consequences
- **Water Systems**: Chemical balance manipulation
- **Power Grid**: Substation disruption
- **Industrial**: Equipment destruction
- **Communications**: Network outages

## 🛡️ Defense Recommendations

1. **Patch Management**: Apply Versa Director updates immediately (CVE-2024-39717)
2. **Network Segmentation**: Isolate OT from IT networks
3. **MFA**: Require for all administrative access
4. **Monitoring**: Watch for LOTL techniques (PowerShell, WMI, RDP)
5. **Logging**: Centralize and protect event logs (attackers clear logs)
6. **Port Security**: Block port 4566 from internet access
7. **Webshell Detection**: Check /var/versa/vnms/web/custom_logo/ for VersaMem shells

## 📚 Educational Purpose

This visualization is designed for:
- Cybersecurity training and awareness
- Understanding APT tactics and techniques
- Incident response preparation
- Critical infrastructure defense education
- Demonstrating real-world attack chains

### Key Learning Features
- **Interactive Info Boxes**: Detailed explanations appear during critical attack moments
- **MITRE ATT&CK Mapping**: Each technique is labeled with official IDs
- **Mitigation Guidance**: CISA-recommended defensive actions
- **Visual Attack Flow**: See how attacks progress through networks
- **Impact Visualization**: Understand consequences of each compromise

**Note**: All data shown is from public sources. No classified or sensitive operational information is included.

## 🔗 Resources

- [CISA Volt Typhoon Advisory](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a)
- [Microsoft Threat Intelligence](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/)
- [MITRE ATT&CK - Volt Typhoon](https://attack.mitre.org/groups/G1017/)
- [Full Intelligence Sources](./docs/VOLT-TYPHOON-SOURCES.md)

## ⚖️ License

MIT License - Educational Use

## 🙏 Acknowledgments

- CISA for public threat intelligence
- Microsoft Security for detailed analysis
- FBI for infrastructure impact data
- The cybersecurity community for collaborative defense

---

**Disclaimer**: This is an educational visualization based on public intelligence reports. It is intended to help defenders understand and protect against these threats.