# CLAUDE.md - VT_Viz Project Context

## Project Overview
VT_Viz is an interactive 3D visualization of the Volt Typhoon APT group's attack on U.S. critical infrastructure. This educational tool visualizes the complete 72-hour attack chain from initial compromise through data exfiltration, based entirely on official CISA advisories and Microsoft threat intelligence reports.

## Core Concept
- **Timeline-Based Attack Simulation**: 5 stages over 72 hours (compressed to minutes)
- **Network Topology Visualization**: Proxy chains, IT systems, and OT/SCADA networks
- **Educational Info Boxes**: Detailed explanations appear at critical moments
- **Real Attack Data**: Based on CVE-2024-39717 and documented Volt Typhoon tactics

## Technical Architecture

### Rendering Pipeline
1. **Scene Setup**: Three.js WebGLRenderer with camera controls
2. **Network Nodes**: BoxGeometry (IT), CylinderGeometry (OT), styled by zone
3. **Attack Packets**: Animated spheres with color-coded attack types
4. **Timeline Control**: GSAP for animations and sequencing
5. **Info Boxes**: DOM overlays with attack explanations

### Data Flow
1. Load attack event data (117 events in JSON)
2. Map events to timeline (72 hours → playback time)
3. Create packet animations between network nodes
4. Trigger info boxes at critical moments
5. Update visualization based on playback speed

### Attack Stages
1. **Initial Access** (0-6h): CVE-2024-39717 zero-day exploit
2. **Discovery** (6-24h): Living Off the Land techniques
3. **Lateral Movement** (24-48h): RDP chain to Domain Controller
4. **Domain Compromise** (48-60h): NTDS.dit extraction
5. **Exfiltration** (60-72h): Multi-hop proxy to China

## Key Files and Responsibilities

### src/volt-typhoon-timeline.js (1600+ lines)
- Main timeline control and attack logic
- Network infrastructure creation
- Packet flow animations
- Info box display functions
- Camera movement coordination

### src/scene.js
- Three.js scene setup
- Camera positioning
- Renderer configuration
- Lighting setup

### src/main.js
- Application initialization
- Component coordination
- Loading screen management

### src/controls.js
- Playback controls (play/pause/restart)
- Speed controls (1x to 60x)
- Camera controls (orbit)

### src/data-loader.js
- JSON data loading
- Event data parsing

### scripts/generate-volt-typhoon-data.js
- Generates 117 attack events
- Maps to MITRE ATT&CK techniques
- Creates realistic timing

## Visual Design System

### Color Coding
- **Purple (#9900ff)**: Zero-day exploitation
- **Yellow (#ffff00)**: Discovery/reconnaissance  
- **Orange (#ff8800)**: Lateral movement
- **Red (#ff0000)**: Credential theft/critical access
- **Cyan (#00ffff)**: Data exfiltration
- **Green (#00ff00)**: OT/SCADA systems

### Network Zones
- **Proxy Chain** (Left): Red boxes - compromised routers
- **IT Network** (Center): Blue boxes - corporate systems
- **OT Systems** (Right): Green cylinders - critical infrastructure

### Info Box Design
- Dark backgrounds (rgba(0,0,0,0.95))
- Colored borders matching alert type
- High contrast white text
- Appear bottom-left, fade after 7-8 seconds

## Intelligence Sources

### Primary References
- **CISA Advisory AA24-038A**: Main threat intelligence
- **Microsoft Security Blog**: Technical analysis
- **FBI PIN 240131-001**: Infrastructure impacts
- **MITRE ATT&CK G1017**: Technique mapping

### Key Intelligence Points
- CVE-2024-39717: Versa Director zero-day
- Living Off the Land exclusively (no malware)
- 5+ year persistence in networks
- Targets water treatment and power grids

## Performance Optimizations

### Implemented
- Object pooling for packet animations
- Efficient timeline updates (only process due events)
- Simple geometries for network nodes
- Sprite-based text labels
- GSAP for smooth animations

### Speed Controls
- 1x: 12 minutes for 72 hours (realistic pacing)
- 45x: ~16 seconds (default - good balance)
- 60x: ~12 seconds (maximum speed)

## Recent Updates (January 2025)

### Info Box System
- Complete rewrite of all highlight functions
- Dark backgrounds for readability
- Proper fade animations and timing
- Fixed zero-day box display issues

### Timeline Flow
- 117 events for continuous action
- Removed unnecessary pauses
- Sequential event processing
- Camera follows attack progression

## Repository

- **GitHub**: https://github.com/ahays248/VT_Viz
- **Quick Start**: `git clone` → `npm install` → `npm run dev`
- **Documentation**: See /docs folder for detailed guides

## Educational Purpose

This visualization helps defenders understand:
- Real APT attack chains
- Living Off the Land techniques
- Critical infrastructure vulnerabilities
- Multi-stage attack progression
- Defensive priorities (CISA guidance)

---

*This document serves as the primary context for AI assistants working on the VT_Viz project.*
*For detailed architecture, see /docs/CLAUDE.md*