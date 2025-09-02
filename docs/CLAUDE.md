# CLAUDE.md - Volt Typhoon APT Visualization Architecture

## Project Overview

VT_Viz is a Three.js-based interactive visualization depicting the Volt Typhoon APT group's real-world attack on U.S. critical infrastructure. This educational tool visualizes the complete 72-hour attack chain from initial compromise through data exfiltration, based entirely on official CISA advisories and Microsoft threat intelligence reports.

## Key Design Decisions

### 1. Intelligence-Driven Approach
- **Decision**: Base everything on official government sources (CISA, FBI, NSA)
- **Rationale**: Educational value and accuracy over artistic interpretation
- **Implementation**: Every technique shown maps to documented Volt Typhoon operations

### 2. Linear Network Layout
- **Decision**: Left-to-right flow (Proxies → IT → OT)
- **Rationale**: Clear visual narrative of attack progression
- **Implementation**: `volt-typhoon-timeline.js` positions nodes in three distinct zones

### 3. Timeline-Based Animation
- **Decision**: 72-hour timeline with 5 stages plus info boxes
- **Rationale**: Matches actual dwell time observed in Volt Typhoon attacks
- **Implementation**: GSAP timeline controls packet animations, stage transitions, and info box displays

### 4. Side/Top-Down Camera View
- **Decision**: Angled perspective with dynamic following
- **Rationale**: Shows both network topology and packet flow clearly
- **Implementation**: Camera at Y=800, Z=600 with staged movement

## Architecture Components

### Core Files

```
src/
├── volt-typhoon-timeline.js  # Main timeline and attack logic (1600+ lines)
├── scene.js                   # Three.js scene setup
├── main.js                    # Application entry point
├── controls.js                # User interaction handlers
└── data-loader.js            # JSON data loading

public/
└── data/
    └── sample.json               # Attack event timeline (117 events)

scripts/
└── generate-volt-typhoon-data.js  # Data generation script (creates 117 attack events)
```

### Data Flow

```
generate-volt-typhoon-data.js
           ↓
    Attack Events JSON
           ↓
    VoltTyphoonTimeline
           ↓
    Three.js Scene
           ↓
    GSAP Animations
```

## Key Classes & Methods

### VoltTyphoonTimeline Class

```javascript
class VoltTyphoonTimeline {
  constructor(scene, data, camera, controls) {
    this.playbackSpeed = 45;  // Default 45x speed (1x = 12 minutes)
    this.stages = [...];      // 5 attack stages
    this.nodeMap = new Map(); // IP to node mapping
    this.cveExplained = false; // Track info box displays
    this.criticalAccessShown = false;
    this.ntdsShown = false;
    this.otShown = false;
  }

  createNetworkInfrastructure() {
    // Creates 3 zones: proxy chain, IT, OT
    // Nodes sized 50-60 units for visibility
    // Labels use 40px font
  }

  createPacketFlow(event) {
    // Animates attack packets between nodes
    // Color-coded by attack type
    // Handles multi-hop routing
  }

  animateMultiHop(packet, event) {
    // Special handling for proxy chain traversal
    // Shows realistic multi-hop routing
    // Follows: China → New Caledonia → Pacific → Guam → Target
  }

  update(deltaTime) {
    // Speed calculation: deltaTime * playbackSpeed * 360 * 1000
    // 1x = 12 minutes (720 seconds), 45x = 16 seconds
  }
}
```

## Visual Design System

### Node Sizes (Enlarged for visibility)
- **Proxy nodes**: 60×80×60 BoxGeometry (red)
- **IT nodes**: 50×60×50 BoxGeometry (blue)
- **OT nodes**: 40r×70h CylinderGeometry (green)

### Color Coding
- **Red (0xff0000)**: Compromised proxy infrastructure
- **Blue (0x0080ff)**: IT systems
- **Green (0x00ff00)**: OT/SCADA systems
- **Purple (0x9900ff)**: Initial exploitation
- **Yellow (0xffff00)**: Discovery/reconnaissance
- **Orange (0xff8800)**: Lateral movement
- **Magenta (0xff00ff)**: Exfiltration

### Network Layout
```javascript
// Proxy Chain (Far Left)
{ ip: '45.76.128.0', pos: (-1000, 50, 0) }   // China C2
{ ip: '103.56.54.0', pos: (-800, 50, 0) }    // New Caledonia
{ ip: '203.119.88.0', pos: (-600, 50, 0) }   // Pacific
{ ip: '202.181.24.0', pos: (-400, 50, 0) }   // Guam

// IT Network (Center)
{ ip: '192.168.100.10', pos: (-200, 50, 0) } // Versa Director
{ ip: '192.168.100.50', pos: (0, 50, 100) }  // Domain Controller

// OT Systems (Right)
{ ip: '10.1.1.10', pos: (600, 50, 0) }       // SCADA Master
{ ip: '10.1.1.30', pos: (600, 50, -200) }    // Water Treatment
```

## Camera System

### Initial Position
- Position: (-700, 800, 600)
- Target: (-700, 0, -100)
- Provides side/top-down view of proxy chain

### Stage Transitions
1. **Initial Compromise**: Focus on proxy chain
2. **Discovery**: Move to Versa/IT boundary
3. **Lateral Movement**: Center on IT network
4. **Domain Compromise**: Shift to OT systems
5. **Exfiltration**: Pull back for full view

## Performance Optimizations

1. **Particle Pooling**: Reuse packet meshes
2. **Efficient Updates**: Only process active flows
3. **Optimized Geometries**: Simple shapes for nodes
4. **Label Sprites**: 2D sprites for text (not 3D)

## Attack Data Structure

```javascript
{
  id: 1,
  timestamp: "2024-11-15T00:00:00.000Z",
  source_ip: "103.56.54.0",
  destination_ip: "192.168.100.10",
  technique: "T1190",           // MITRE ATT&CK
  stage: 1,                      // 1-6
  attack_type: "zero_day_exploit",
  target_port: 4566,
  tool: "VersaMem",
  success: true,
  proxy_chain: ["New Caledonia", "Pacific", "Guam"],
  description: "CVE-2024-39717 - Versa Director Authentication Bypass"
}
```

## UI Components

### Timeline Control Panel (Bottom)
- Play/Pause button
- Speed controls (1x, 10x, 30x, 45x, 60x)
- Progress bar with gradient
- Stage information display
- Source citations

### Info Panel (Top Left)
- Complete attack timeline
- CVE and technique details for each stage
- Impact assessment
- Data stolen and potential consequences

### Legend (Right)
- Network zone colors
- Packet type colors
- Current technique display
- Real-time action description

## Intelligence Integration

### Sources Used
- CISA Advisory AA24-038A
- Microsoft Threat Intelligence
- FBI PIN 240131-001
- MITRE ATT&CK G1017

### Key Intelligence Points
- 5+ year persistence documented
- Living Off the Land exclusively
- New Caledonia proxy infrastructure
- NTDS.dit enables OT access
- Water/power grid targeting confirmed

## Recent Updates (December 2024)

### Info Box System Overhaul
- Completely rewrote all highlight functions for consistency
- Fixed persistent zero-day box display issue
- Improved readability with dark backgrounds instead of gradients
- Added proper fade-in/fade-out animations
- Synchronized resume timing to prevent stuck visualizations

### Color Scheme Improvements
- Dark backgrounds (rgba(0,0,0,0.95)) for all info boxes
- Colored borders instead of gradient backgrounds
- High contrast white text on dark backgrounds
- Semantic colors: purple (zero-day), red (critical), orange (compromise)
- Subtle glow effects with box-shadow

### Timeline Flow Fixes
- Removed unnecessary RDP pause (commented out explainRDPCredentials)
- Fixed OT system access to show critical infrastructure box
- Improved event sequencing for continuous flow
- Enhanced data generation (117 events from 53)

### Speed & Timing
- Fixed calculation: 360 instead of 3600 (1x = 12 minutes for 72 hours)
- Added delays for packet visibility before camera moves
- Sequential event processing with appropriate spacing
- Default 45x speed for optimal viewing

### Camera System
- Side/top-down angle for better visibility
- Dynamic following of active zones
- 2-second delay for zero-day camera movement
- Accounts for UI panel placement

### UI Updates
- Moved info panel to right side (top: 300px, right: 20px)
- Current Technique display at top center
- Removed broken counters
- Added CISA mitigation guidance
- Enhanced stage descriptions with CVE details

## Future Enhancements

1. **Additional APT Groups**: Expand to other threat actors
2. **Real-time Feeds**: Connect to threat intelligence APIs
3. **Network Traffic Analysis**: Show actual packet contents
4. **Defense Simulation**: Add blue team responses
5. **Export Capabilities**: Generate reports from timeline

## Troubleshooting

### Common Issues & Solutions

1. **Info boxes not appearing**
   - Check z-index (should be 2400-2500)
   - Remove initial opacity: 0 in style definition
   - Ensure gsap.to() animates opacity from 0 to 1
   - Verify function is being called with console.log

2. **Visualization gets stuck/paused**
   - Check isPlaying flag is properly reset
   - Ensure gsap.globalTimeline.resume() is called
   - Separate resume timing from fade animations
   - Add try-catch with resume in error handler

3. **Speed too slow/fast**
   - Current formula: `deltaTime * playbackSpeed * 360 * 1000`
   - 1x = 12 minutes for 72 hours
   - Default 45x = ~16 seconds

4. **Camera view blocked**
   - Adjust initial position in scene.js
   - Account for UI panels in positioning
   - Add delays before camera moves

5. **Labels unreadable**
   - Use 40px font size minimum
   - White text on dark backgrounds
   - Add text-shadow for contrast

6. **Duplicate info boxes**
   - Use flags (cveExplained, criticalAccessShown, etc.)
   - Call cleanupAllInfoBoxes() on restart
   - Remove boxes in onComplete callbacks

## Commands

```bash
# Development
npm run dev           # Start dev server (http://localhost:3000/)
npm run build        # Production build
npm run preview      # Preview production build
npm run generate-data # Generate attack event data

# Quick Start
git clone https://github.com/ahays248/VT_Viz.git
cd VT_Viz
npm install
npm run dev
```

## Code Style Guidelines

- Use ES6 modules
- Async/await for data loading
- GSAP for animations
- Three.js best practices
- No comments unless essential
- Focus on readability

## Lessons Learned

See [LESSONS-LEARNED-THREEJS.md](./LESSONS-LEARNED-THREEJS.md) for comprehensive insights on:
- GSAP timeline management with Three.js
- Info box timing and display patterns
- Performance optimization strategies
- Educational visualization pacing
- Debugging complex animation sequences
- Color scheme and readability best practices

## Security Considerations

- Educational purposes only
- No offensive capabilities
- Public sources only
- Defensive perspective
- COPPA compliant (no child data)

---

*Last Updated: January 2025*
*Repository: https://github.com/ahays248/VT_Viz*
*Purpose: Educational cybersecurity visualization*
*Classification: Public/Unclassified*