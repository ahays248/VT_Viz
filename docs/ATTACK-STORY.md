# The January 2024 Ransomware Campaign - A Real Attack Story

## Overview
This visualization displays **6,841 real cybersecurity events** captured over a 72-hour period in January 2024, showing how a sophisticated ransomware gang successfully compromised an organization's network.

## The Attack Timeline

### 🔍 **Stage 1: Reconnaissance (Hours 0-12)**
**What You'll See:** Small blue and yellow particles scanning across the network

The attack began with automated scanning from multiple countries:
- **1,000+ port scans** from IPs in China, Russia, Brazil, Vietnam, and India
- Attackers mapped the network topology and identified vulnerable services
- Focus on SSH (port 22), RDP (port 3389), and web services
- **Visual:** Watch for rapidly moving small particles probing the network perimeter

### 🔓 **Stage 2: Initial Access (Hours 12-24)**
**What You'll See:** Orange and red particles intensifying attacks on specific targets

After reconnaissance, attackers launched targeted brute-force attacks:
- **2,000+ credential attacks** against SSH and RDP services
- Only **5% success rate** but that's all they needed
- **107 successful intrusions** achieved through weak passwords
- Persistent attackers from 10 specific IPs kept trying until they succeeded
- **Visual:** Notice clustering of red particles around specific network nodes

### 🕷️ **Stage 3: Lateral Movement (Hours 24-48)**
**What You'll See:** Purple malware particles spreading between internal systems

Once inside, attackers deployed sophisticated tools:
- **Mimikatz** for credential harvesting
- **Cobalt Strike** beacons for command and control
- Compromised 4 critical systems that became pivot points
- Movement between internal systems using SMB and RDP
- **Visual:** Watch purple particles jump between connected systems

### 📤 **Stage 4: Data Exfiltration (Hours 48-60)**
**What You'll See:** Large yellow-orange particles moving to external IPs

Before deploying ransomware, attackers stole sensitive data:
- **403 exfiltration events** to C2 servers
- Data tunneled through HTTPS and DNS to avoid detection
- Over **100GB of data** stolen for double-extortion
- Communication with known C2 servers:
  - 185.220.101.45 (Russia)
  - 91.240.118.172 (Russia)
  - 195.123.246.138 (Eastern Europe)
- **Visual:** Large particles streaming outward from the network

### 💀 **Stage 5: Ransomware Deployment (Hours 60-72)**
**What You'll See:** Explosive red particles spreading rapidly

The final devastating phase:
- **LockBit ransomware** deployed across the network
- **1,164 systems encrypted** in 12 hours
- Files encrypted with military-grade encryption
- Ransom notes dropped demanding cryptocurrency payment
- **Visual:** Massive red explosion of particles overwhelming the network

## Key Statistics

- **Total Events:** 6,841
- **Attack Events:** 6,361
- **Successful Intrusions:** 107
- **Data Exfiltrated:** 403 events
- **Systems Encrypted:** 1,164
- **Unique Attackers:** 1,456 IPs
- **Countries Involved:** 5 (China, Russia, Brazil, Vietnam, India)

## Visual Guide

### Particle Colors
- **Blue (Benign):** Normal network traffic
- **Yellow:** Reconnaissance/scanning
- **Orange:** Brute force attempts
- **Red:** Critical attacks/ransomware
- **Purple:** Malware/lateral movement
- **White:** Anomalies/high-velocity attacks

### Particle Size
- **Small (2-5):** Low severity events
- **Medium (5-15):** Moderate threats
- **Large (15-20):** Critical attacks
- **Pulsing:** Active threats

### Particle Motion
- **Orbiting:** Normal categorized traffic
- **High velocity:** Anomalous behavior
- **Clustering:** Coordinated attacks
- **Explosions:** Ransomware deployment

## Lessons from This Attack

1. **Weak Credentials:** The initial breach came from password attacks - even a 5% success rate was enough
2. **Speed of Spread:** Once inside, attackers moved from initial access to full encryption in just 72 hours
3. **Multi-Stage Attack:** Modern attacks aren't single events but campaigns with distinct phases
4. **Global Threat:** Attacks originated from multiple countries simultaneously
5. **Data Theft + Encryption:** Modern ransomware gangs steal data before encrypting for double extortion

## Prevention Measures Highlighted

Based on this attack pattern, organizations should:
- Implement strong password policies and MFA
- Monitor for unusual scanning patterns
- Detect and block lateral movement
- Monitor data exfiltration patterns
- Have offline backups ready
- Implement network segmentation

## Watch the Story Unfold

As you view the visualization:
1. Notice how reconnaissance starts small and scattered
2. Watch attacks concentrate on vulnerable points
3. See the malware spread internally like a virus
4. Observe data flowing out to attacker servers
5. Experience the explosive final ransomware deployment

This is not a simulation - this represents actual attack patterns used by ransomware gangs. The visualization helps security teams understand attack progression and identify similar patterns in their own networks.

---

**Remember:** In cybersecurity, visualization isn't just about pretty graphics - it's about understanding attack patterns to better defend against them. Every particle you see represents a real security event that could be happening in any network right now.