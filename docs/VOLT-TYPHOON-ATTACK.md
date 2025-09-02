# Volt Typhoon APT - Telecommunications Infrastructure Attack Visualization

## 🎯 Threat Actor Profile

**Volt Typhoon** (also known as Bronze Silhouette, Vanguard Panda, DEV-0391) is a **Chinese state-sponsored APT group** that has been targeting critical infrastructure since at least 2021. In 2024, they significantly expanded operations targeting telecommunications providers in the Pacific region.

## 🔍 What Makes This Attack Unique

### Living Off the Land (LOTL)
Volt Typhoon **exclusively uses built-in Windows tools** - no custom malware:
- `powershell.exe` - Discovery and execution
- `wmic.exe` - Remote command execution  
- `ntdsutil.exe` - Active Directory database theft
- `vssadmin.exe` - Volume Shadow Copy for stealth
- `wevtutil.exe` - Log deletion to hide tracks

### Multi-Hop Proxy Chain
They route attacks through compromised SOHO routers:
- **New Caledonia** VPN device (primary hub)
- **Guam** telecommunications infrastructure
- **Pacific region** Cisco RV320/Netgear routers
- Makes attribution extremely difficult

## 📊 Attack Timeline Visualization

### Stage 1: Initial Access (Hours 0-6)
**What You'll See:** Purple packets from New Caledonia proxy scanning the Versa Director

**Real Technique:** CVE-2024-39717 Zero-Day Exploitation
- Targets Versa Director SD-WAN controllers
- Ports scanned: **443, 4566, 4570**
- Deploys **VersaMem web shell** for persistence
- **MITRE ATT&CK:** T1190 (Exploit Public-Facing Application)

### Stage 2: Discovery & Credential Harvesting (Hours 6-24)
**What You'll See:** Yellow discovery packets spreading through the network

**Real Techniques:**
- PowerShell commands for user enumeration
- WMI queries for system information
- No malware dropped - only legitimate tools
- **MITRE ATT&CK:** T1059.001 (PowerShell), T1047 (WMI)

### Stage 3: Lateral Movement (Hours 24-48)
**What You'll See:** Orange RDP connections between servers

**Real Techniques:**
- **RDP** (port 3389) with stolen credentials
- **WMI** (port 135) for remote execution
- **WinRM** (port 5985) for PowerShell remoting
- Uses valid accounts to avoid detection
- **MITRE ATT&CK:** T1021.001 (RDP), T1021.006 (WinRM)

### Stage 4: Domain Compromise (Hours 48-60)
**What You'll See:** Critical red packets targeting the Domain Controller

**Real Technique:** NTDS.dit Extraction
```cmd
vssadmin create shadow /for=C:
ntdsutil "ac i ntds" "ifm" "create full c:\temp" q q
```
- Creates Volume Shadow Copy to avoid detection
- Extracts entire Active Directory database
- Gains access to ALL domain credentials
- **MITRE ATT&CK:** T1003.003 (NTDS), T1006 (Volume Shadow Copy)

### Stage 5: Data Exfiltration (Hours 60-72)
**What You'll See:** Large data flows through multiple proxy nodes

**Real Technique:** Multi-Hop Proxy Exfiltration
- Data flows: Target → Compromised Router 1 → Router 2 → China C2
- Uses HTTPS (port 443) to blend with normal traffic
- Exfiltrates in 1MB chunks to avoid detection
- **MITRE ATT&CK:** T1090.003 (Multi-hop Proxy)

### Stage 6: Covering Tracks (Hours 70-72)
**What You'll See:** Brief cleanup activities on compromised systems

**Real Technique:** Event Log Deletion
```cmd
wevtutil cl System
wevtutil cl Security
```
- Clears Windows Event Logs
- Maintains long-term undetected access
- **MITRE ATT&CK:** T1070.001 (Clear Windows Event Logs)

## 🎮 Visualization Controls

- **Speed Controls:** Watch at 1x, 10x, or 60x speed
- **Camera:** Automatically zooms to show critical stages
- **Packet Colors:**
  - Purple: Zero-day exploitation
  - Yellow: Discovery/reconnaissance
  - Orange: Lateral movement
  - Red: Critical compromise
  - Green: Exfiltration

## 🛡️ Defense Recommendations

Based on this attack pattern:

1. **Patch Versa Director** - CVE-2024-39717 is actively exploited
2. **Monitor PowerShell** - Detect unusual PS commands
3. **Restrict RDP** - Limit internal RDP access
4. **Protect NTDS.dit** - Monitor Volume Shadow Copy usage
5. **Network Segmentation** - Limit lateral movement paths
6. **Log Forwarding** - Send logs to SIEM before deletion possible

## 🔗 Intelligence Sources

- [CISA Advisory AA24-038A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a)
- [Microsoft Threat Intelligence](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/)
- [MITRE ATT&CK G1017](https://attack.mitre.org/groups/G1017/)

## ⚠️ Why This Matters

Volt Typhoon's pre-positioning in telecommunications infrastructure is assessed by CISA to enable **disruption during geopolitical tensions**. They maintain persistence for **years** without detection, ready to activate during a crisis.

The visualization shows how even sophisticated networks can be compromised using only legitimate tools - making detection extremely challenging.

---

**Note:** This visualization uses publicly available threat intelligence to demonstrate real APT tactics. All IP addresses and specific targets have been anonymized.