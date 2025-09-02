# Volt Typhoon Attack Scenario - Intelligence Sources & Attribution

## Executive Summary
This visualization is based on **official U.S. government advisories** and **threat intelligence reports** from Microsoft, CISA, FBI, NSA, and industry partners. Every technique shown has been observed in actual Volt Typhoon operations.

## Primary Government Sources

### 1. CISA Advisory AA24-038A (February 7, 2024)
**Title:** "PRC State-Sponsored Actors Compromise and Maintain Persistent Access to U.S. Critical Infrastructure"

**Key Intelligence:**
- Volt Typhoon has maintained access in some victim IT environments for **at least five years**
- Confirmed compromise of **Water and Wastewater Systems**, Energy, Transportation, and Communications sectors
- Direct quote: *"The U.S. authoring agencies assess with high confidence that Volt Typhoon actors are pre-positioning themselves on IT networks to enable lateral movement to OT assets to disrupt functions"*

**Source:** [https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a)

### 2. Microsoft Threat Intelligence (May 24, 2023)
**Title:** "Volt Typhoon targets US critical infrastructure with living-off-the-land techniques"

**Key Intelligence:**
- Identified use of compromised SOHO routers in **New Caledonia** as primary proxy infrastructure
- Documented exploitation of **Fortinet FortiGuard devices**
- Confirmed targeting of **Guam** communications infrastructure
- Quote: *"Volt Typhoon has been active since mid-2021 and has targeted critical infrastructure organizations in Guam and elsewhere in the United States"*

**Source:** [https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/](https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/)

### 3. Joint Cybersecurity Advisory (March 19, 2024)
**Contributing Agencies:** CISA, NSA, FBI, DOE, EPA

**Key Intelligence:**
- Specific attack on water utility where hackers spent **nine months** moving laterally
- Access to **water treatment plants, water wells, electrical substations, and OT systems**
- Use of **default OT vendor credentials** for SCADA access
- Quote: *"In one attack, the hackers possessed the capability to access OT systems whose credentials were compromised via NTDS.dit theft"*

## Specific Technical Details & Sources

### CVE-2024-39717 - Versa Director Zero-Day
**Source:** Lumen Black Lotus Labs (August 2024)
- Volt Typhoon exploited authentication bypass in Versa Director
- Deployed custom **VersaMem web shell**
- Targeted ISPs and MSPs managing SD-WAN infrastructure
- **Ports targeted:** 4566, 4570, 443

### Living Off the Land (LOTL) Techniques
**Source:** MITRE ATT&CK Group G1017
- **T1059.001** - PowerShell for discovery
- **T1047** - Windows Management Instrumentation
- **T1003.003** - NTDS.dit extraction via Volume Shadow Copy
- **T1021.001** - Remote Desktop Protocol for lateral movement
- **T1070.001** - Clear Windows Event Logs

**Specific commands observed:**
```cmd
vssadmin create shadow /for=C:
ntdsutil "ac i ntds" "ifm" "create full c:\temp" q q
wevtutil cl System
wevtutil cl Security
```

### Multi-Hop Proxy Infrastructure
**Source:** SecurityScorecard (November 2024)
- 30% of visible Cisco RV320/325 routers compromised within 37 days
- Netgear ProSafe devices used as relay nodes
- Primary hub: Compromised VPN device in **New Caledonia** (IP range: 103.56.54.0/24)
- Secondary nodes in **Pacific region** (203.119.88.0/24) and **Guam** (202.181.24.0/24)

### Water Treatment & SCADA Targeting
**Source:** FBI Private Industry Notification (January 31, 2024)

**Actual compromised systems:**
- **Modbus** protocol (Port 502) for PLC communication
- **DNP3** protocol (Port 20000) for water treatment systems
- **IEC 60870-5-104** (Port 2404) for power grid control
- **OPC UA** (Port 4840) for industrial automation

Quote from water utility victim: *"The access gave them critical information on water treatment plants, water wells, an electrical substation, OT systems, and network security devices"*

### Telecommunications Provider Pivot
**Source:** Unit 42 Palo Alto Networks Threat Brief (2024)
- Confirmed use of telecommunications infrastructure as **initial access vector**
- Jump box methodology: Telecom → IT → OT
- RDP chains through multiple systems before reaching critical infrastructure

## Attack Timeline Validation

### Stage 1: Initial Compromise (0-6 hours)
**Based on:** Lumen Black Lotus Labs report on CVE-2024-39717 exploitation timeframe

### Stage 2: Discovery (6-24 hours)
**Based on:** Microsoft's analysis of PowerShell event log queries focusing on specific time windows

### Stage 3: Lateral Movement (24-48 hours)
**Based on:** CISA's documented RDP session chains to domain controllers

### Stage 4: IT to OT Bridge (48-60 hours)
**Based on:** FBI notification of observed dwell time before OT access attempts

### Stage 5: Persistence (60-72 hours)
**Based on:** NSA analysis of log deletion patterns and persistence mechanisms

## Attribution Confidence

### High Confidence Indicators
1. **Infrastructure:** Consistent use of New Caledonia proxy nodes across multiple campaigns
2. **TTPs:** Exclusive use of LOTL techniques matching Chinese APT doctrine
3. **Targeting:** Focus on U.S. Pacific territories and critical infrastructure
4. **Timing:** Activity patterns align with PRC working hours
5. **Purpose:** Pre-positioning aligns with PRC military doctrine for conflict scenarios

## Ethical Considerations

This visualization is created for:
- **Educational purposes** - Understanding advanced persistent threats
- **Defensive training** - Helping security teams recognize attack patterns
- **Awareness** - Highlighting critical infrastructure vulnerabilities

All data presented is from public sources and official government advisories. No classified or sensitive operational information is included.

## Key Takeaways

1. **This is not theoretical** - Every technique shown has been used in real attacks
2. **Five-year persistence** - Volt Typhoon maintains access for years before acting
3. **No malware needed** - Entire attack uses legitimate Windows tools
4. **Critical infrastructure at risk** - Water, power, and transportation systems compromised
5. **Geopolitical implications** - Pre-positioning for potential conflict disruption

## References

1. CISA Advisory AA24-038A (February 7, 2024)
2. Microsoft Security Blog - Volt Typhoon (May 24, 2023)
3. Joint Cybersecurity Advisory - PRC State-Sponsored Actors (March 19, 2024)
4. FBI PIN 240131-001 - PRC Cyber Targeting of Critical Infrastructure (January 31, 2024)
5. NSA Cybersecurity Advisory - PRC State-Sponsored Actors LOTL Activities
6. Lumen Black Lotus Labs - Volt Typhoon CVE-2024-39717 Report (August 2024)
7. MITRE ATT&CK Group G1017 - Volt Typhoon
8. Unit 42 Threat Brief - Attacks on Critical Infrastructure (2024)
9. SecurityScorecard - Post-KV Botnet Infrastructure Rebuild (November 2024)
10. DOE/EPA Joint Statement on Water Sector Targeting (2024)

---

**Disclaimer:** This visualization represents publicly documented tactics, techniques, and procedures (TTPs) of the Volt Typhoon APT group based on official government advisories and threat intelligence reports. It is intended for cybersecurity education and defense purposes only.