import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({
  url: process.env['DATABASE_URL'] ?? 'file:./dev.db',
  authToken: process.env['TURSO_AUTH_TOKEN'],
})
const prisma = new PrismaClient({ adapter })

const r = (ids: string[]) => JSON.stringify(ids)

async function main() {
  await prisma.term.deleteMany()
  await prisma.module.deleteMany()
  await prisma.userStats.deleteMany()

  // ── Modules ────────────────────────────────────────────────────────────────
  await prisma.module.createMany({
    data: [
      { id: 'net', code: 'NET-101', name: 'Networking Fundamentals', color: '#22c55e', progress: 0.62 },
      { id: 'sec', code: 'SEC-201', name: 'Security Essentials',     color: '#f59e0b', progress: 0.41 },
      { id: 'sys', code: 'SYS-110', name: 'Systems & Hardware',      color: '#3b82f6', progress: 0.18 },
      { id: 'cld', code: 'CLD-301', name: 'Cloud & Virtualization',  color: '#a855f7', progress: 0.05 },
    ],
  })

  // ── NET-101: Networking Fundamentals (CompTIA Network+) ───────────────────
  await prisma.term.createMany({
    data: [
      {
        id: 'osi', term: 'OSI Model', expand: 'Open Systems Interconnection Model',
        def: 'A conceptual 7-layer framework (Physical, Data Link, Network, Transport, Session, Presentation, Application) that standardizes how systems communicate over a network.',
        moduleId: 'net', topic: 'OSI Model', related: r(['tcp', 'ip', 'http', 'dns']),
      },
      {
        id: 'tcp', term: 'TCP', expand: 'Transmission Control Protocol',
        def: 'A connection-oriented Layer 4 protocol that guarantees reliable, ordered, error-checked delivery via a three-way handshake (SYN → SYN-ACK → ACK).',
        moduleId: 'net', topic: 'Protocols', related: r(['udp', 'ip', 'osi', 'dns', 'http']),
      },
      {
        id: 'udp', term: 'UDP', expand: 'User Datagram Protocol',
        def: 'A connectionless Layer 4 protocol that sends datagrams without acknowledgement or ordering, trading reliability for speed. Used by DNS, DHCP, video streaming.',
        moduleId: 'net', topic: 'Protocols', related: r(['tcp', 'ip', 'dns']),
      },
      {
        id: 'ip', term: 'IP', expand: 'Internet Protocol',
        def: 'A Layer 3 protocol responsible for addressing and routing packets across interconnected networks. IPv4 uses 32-bit addresses; IPv6 uses 128-bit.',
        moduleId: 'net', topic: 'Addressing', related: r(['tcp', 'udp', 'subnet', 'osi', 'dhcp', 'ipv6']),
      },
      {
        id: 'ipv6', term: 'IPv6', expand: 'Internet Protocol version 6',
        def: 'The 128-bit successor to IPv4 that provides ~3.4×10³⁸ unique addresses, built-in IPSec, stateless address autoconfiguration (SLAAC), and eliminates the need for NAT.',
        moduleId: 'net', topic: 'Addressing', related: r(['ip', 'nat', 'dhcp', 'subnet']),
      },
      {
        id: 'dns', term: 'DNS', expand: 'Domain Name System',
        def: 'A hierarchical distributed naming system that translates human-readable hostnames (e.g. example.com) into IP addresses. Operates over UDP port 53.',
        moduleId: 'net', topic: 'Protocols', related: r(['tcp', 'udp', 'dhcp', 'http', 'ip']),
      },
      {
        id: 'dhcp', term: 'DHCP', expand: 'Dynamic Host Configuration Protocol',
        def: 'A network protocol that automatically assigns IP addresses, subnet masks, default gateways, and DNS server addresses to hosts via a DORA process (Discover, Offer, Request, Acknowledge).',
        moduleId: 'net', topic: 'Protocols', related: r(['ip', 'dns', 'subnet', 'default_gw']),
      },
      {
        id: 'subnet', term: 'Subnet Mask', expand: 'Subnetwork Mask',
        def: 'A 32-bit number written in dotted-decimal (e.g. 255.255.255.0) that separates the network portion from the host portion of an IP address.',
        moduleId: 'net', topic: 'Addressing', related: r(['ip', 'dhcp', 'cidr', 'default_gw']),
      },
      {
        id: 'cidr', term: 'CIDR', expand: 'Classless Inter-Domain Routing',
        def: 'An IP addressing scheme using variable-length prefix notation (e.g. /24) that replaced fixed class-based addressing, enabling efficient allocation and route aggregation.',
        moduleId: 'net', topic: 'Addressing', related: r(['ip', 'subnet']),
      },
      {
        id: 'nat', term: 'NAT', expand: 'Network Address Translation',
        def: 'A router function that rewrites the source/destination IP in packets passing between a private LAN and the public internet, allowing many hosts to share one public IP.',
        moduleId: 'net', topic: 'Addressing', related: r(['ip', 'ipv6', 'default_gw', 'firewall']),
      },
      {
        id: 'arp', term: 'ARP', expand: 'Address Resolution Protocol',
        def: 'A Layer 2/3 protocol that resolves a known IPv4 address to its MAC address by broadcasting a request on the local network segment. ARP cache stores recent mappings.',
        moduleId: 'net', topic: 'Protocols', related: r(['ip', 'mac_addr', 'switch']),
      },
      {
        id: 'mac_addr', term: 'MAC Address', expand: 'Media Access Control Address',
        def: 'A 48-bit hardware identifier (written as 6 colon-separated hex octets, e.g. AA:BB:CC:DD:EE:FF) permanently burned into a NIC, used for Layer 2 frame delivery.',
        moduleId: 'net', topic: 'Addressing', related: r(['arp', 'switch', 'vlan']),
      },
      {
        id: 'http', term: 'HTTP', expand: 'HyperText Transfer Protocol',
        def: 'An application-layer request/response protocol (port 80) that forms the foundation of data exchange on the web. HTTPS is HTTP encrypted with TLS (port 443).',
        moduleId: 'net', topic: 'Protocols', related: r(['tcp', 'dns', 'tls', 'ftp', 'ssh']),
      },
      {
        id: 'ftp', term: 'FTP', expand: 'File Transfer Protocol',
        def: 'An application-layer protocol (ports 20/21) for transferring files between client and server. Transmits credentials and data in plaintext; use SFTP or FTPS instead.',
        moduleId: 'net', topic: 'Protocols', related: r(['tcp', 'http', 'ssh', 'sftp']),
      },
      {
        id: 'sftp', term: 'SFTP', expand: 'SSH File Transfer Protocol',
        def: 'A secure file transfer protocol that runs over SSH (port 22), providing encrypted file access, transfer, and management — unrelated to FTP despite the name.',
        moduleId: 'net', topic: 'Protocols', related: r(['ftp', 'ssh', 'tcp']),
      },
      {
        id: 'ssh', term: 'SSH', expand: 'Secure Shell',
        def: 'An encrypted network protocol (port 22) for secure remote login, command execution, and tunneling. Uses public-key cryptography for host and optional user authentication.',
        moduleId: 'net', topic: 'Protocols', related: r(['sftp', 'tcp', 'rsa', 'tls']),
      },
      {
        id: 'smtp', term: 'SMTP', expand: 'Simple Mail Transfer Protocol',
        def: 'The application-layer protocol (port 25, or 587 with STARTTLS) for sending email between mail servers. Receiving mail uses IMAP (port 143/993) or POP3 (port 110/995).',
        moduleId: 'net', topic: 'Protocols', related: r(['tcp', 'tls', 'dns']),
      },
      {
        id: 'snmp', term: 'SNMP', expand: 'Simple Network Management Protocol',
        def: 'An application-layer protocol (UDP port 161) for collecting and organizing information about managed devices (routers, switches, servers) and setting device parameters.',
        moduleId: 'net', topic: 'Protocols', related: r(['udp', 'router', 'switch']),
      },
      {
        id: 'ntp', term: 'NTP', expand: 'Network Time Protocol',
        def: 'An application-layer protocol (UDP port 123) that synchronizes clocks across networked devices to within milliseconds using a hierarchy of time servers called strata.',
        moduleId: 'net', topic: 'Protocols', related: r(['udp', 'dns']),
      },
      {
        id: 'icmp', term: 'ICMP', expand: 'Internet Control Message Protocol',
        def: 'A Layer 3 helper protocol used for diagnostics and error reporting. The ping command uses ICMP Echo Request/Reply; traceroute uses ICMP Time Exceeded messages.',
        moduleId: 'net', topic: 'Protocols', related: r(['ip', 'router']),
      },
      {
        id: 'vlan', term: 'VLAN', expand: 'Virtual Local Area Network',
        def: 'A logical segmentation of a physical network at Layer 2 that groups hosts independent of physical location. Inter-VLAN routing requires a Layer 3 device.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['switch', 'router', 'mac_addr']),
      },
      {
        id: 'vpn', term: 'VPN', expand: 'Virtual Private Network',
        def: 'An encrypted tunnel between a client and a server (or site to site) that extends a private network over a public one, hiding traffic and providing secure remote access.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['tls', 'ipsec', 'firewall']),
      },
      {
        id: 'ipsec', term: 'IPSec', expand: 'Internet Protocol Security',
        def: 'A suite of protocols that authenticates and encrypts each IP packet in a session. Used in site-to-site VPNs; operates in Tunnel mode (full packet) or Transport mode (payload only).',
        moduleId: 'net', topic: 'Protocols', related: r(['vpn', 'tls', 'ip']),
      },
      {
        id: 'router', term: 'Router', expand: 'Layer 3 Forwarding Device',
        def: 'A Layer 3 device that forwards packets between networks based on IP routing tables. Uses protocols like OSPF, BGP, or static routes to determine the best path.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['switch', 'ip', 'nat', 'default_gw', 'vlan']),
      },
      {
        id: 'switch', term: 'Switch', expand: 'Layer 2 Switching Device',
        def: 'A Layer 2 device that forwards Ethernet frames within a network based on MAC address tables, creating separate collision domains per port.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['router', 'vlan', 'mac_addr', 'arp']),
      },
      {
        id: 'default_gw', term: 'Default Gateway', expand: 'Default Network Gateway',
        def: 'The router IP address a host sends packets to when the destination is outside its local subnet. Configured statically or received via DHCP.',
        moduleId: 'net', topic: 'Addressing', related: r(['router', 'ip', 'dhcp', 'subnet']),
      },
      {
        id: 'firewall', term: 'Firewall', expand: 'Network Traffic Filter',
        def: 'A security device (hardware or software) that inspects and filters network traffic based on rules. Stateful firewalls track connection state; next-gen firewalls add DPI and application awareness.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['ids', 'ips', 'acl', 'vpn', 'nat']),
      },
      {
        id: 'bandwidth', term: 'Bandwidth', expand: 'Network Throughput Capacity',
        def: 'The maximum data transfer rate of a network link, measured in bits per second (bps). Distinct from throughput (actual achieved rate) and latency (delay).',
        moduleId: 'net', topic: 'Infrastructure', related: r(['latency', 'router', 'switch']),
      },
      {
        id: 'latency', term: 'Latency', expand: 'Network Round-Trip Delay',
        def: 'The time it takes for a packet to travel from source to destination (one-way) or back (RTT). Affected by propagation, transmission, processing, and queuing delays.',
        moduleId: 'net', topic: 'Infrastructure', related: r(['bandwidth', 'icmp']),
      },
    ],
  })

  // ── SEC-201: Security Essentials (CompTIA Security+) ─────────────────────
  await prisma.term.createMany({
    data: [
      // Cryptography
      {
        id: 'tls', term: 'TLS', expand: 'Transport Layer Security',
        def: 'A cryptographic protocol (successor to SSL) that provides authentication, integrity, and confidentiality for network communications. TLS 1.3 is the current standard.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['http', 'aes', 'rsa', 'pki', 'cert_auth']),
      },
      {
        id: 'aes', term: 'AES', expand: 'Advanced Encryption Standard',
        def: 'A symmetric block cipher (NIST FIPS 197) operating on 128-bit blocks with key sizes of 128, 192, or 256 bits. The most widely deployed symmetric cipher.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['tls', 'rsa', 'pki', 'sym_enc']),
      },
      {
        id: 'rsa', term: 'RSA', expand: 'Rivest–Shamir–Adleman',
        def: 'An asymmetric public-key algorithm whose security relies on the difficulty of factoring large integers. Used for key exchange and digital signatures; typical key sizes are 2048–4096 bits.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['tls', 'aes', 'pki', 'digital_sig', 'asym_enc']),
      },
      {
        id: 'pki', term: 'PKI', expand: 'Public Key Infrastructure',
        def: 'A framework of policies, procedures, hardware, and software for creating, distributing, revoking, and managing digital certificates that bind public keys to identities.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['tls', 'rsa', 'cert_auth', 'digital_sig']),
      },
      {
        id: 'cert_auth', term: 'CA', expand: 'Certificate Authority',
        def: 'A trusted entity that issues and signs digital certificates. A root CA signs intermediate CAs, which sign end-entity certificates, forming a chain of trust.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['pki', 'tls', 'digital_sig', 'rsa']),
      },
      {
        id: 'digital_sig', term: 'Digital Signature', expand: 'Asymmetric Authentication Stamp',
        def: 'A cryptographic mechanism that uses a private key to sign data and a public key to verify it, providing authentication, non-repudiation, and integrity assurance.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['rsa', 'pki', 'hash_fn', 'cert_auth']),
      },
      {
        id: 'hash_fn', term: 'Hash Function', expand: 'Cryptographic Hash Function',
        def: 'A one-way function that maps arbitrary input to a fixed-size digest (e.g. SHA-256 = 256 bits). Collision-resistant; used for integrity checks, password storage, and digital signatures.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['digital_sig', 'rainbow_table', 'salting', 'aes']),
      },
      {
        id: 'salting', term: 'Salting', expand: 'Hash Salt',
        def: 'A random value appended to a password before hashing so identical passwords produce different digests, defeating precomputed rainbow table attacks.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['hash_fn', 'rainbow_table', 'brute_force']),
      },
      {
        id: 'sym_enc', term: 'Symmetric Encryption', expand: 'Shared-Key Encryption',
        def: 'Encryption where the same key is used for both encryption and decryption. Fast and efficient for bulk data; the key-exchange problem is solved by asymmetric encryption.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['aes', 'asym_enc', 'tls']),
      },
      {
        id: 'asym_enc', term: 'Asymmetric Encryption', expand: 'Public-Key Encryption',
        def: 'Encryption using a mathematically linked key pair: a public key to encrypt and a private key to decrypt. Slower than symmetric; used for key exchange and digital signatures.',
        moduleId: 'sec', topic: 'Cryptography', related: r(['rsa', 'sym_enc', 'pki', 'tls']),
      },
      // Access Control
      {
        id: 'mfa', term: 'MFA', expand: 'Multi-Factor Authentication',
        def: 'Authentication requiring two or more factors from distinct categories: something you know (password), something you have (token), and something you are (biometric).',
        moduleId: 'sec', topic: 'Access Control', related: r(['rbac', 'sso', 'pki', 'least_priv']),
      },
      {
        id: 'rbac', term: 'RBAC', expand: 'Role-Based Access Control',
        def: 'An access control model that assigns permissions to roles (not directly to users), then assigns users to roles. Simplifies administration and enforces least privilege.',
        moduleId: 'sec', topic: 'Access Control', related: r(['mfa', 'least_priv', 'sep_duties', 'acl']),
      },
      {
        id: 'acl', term: 'ACL', expand: 'Access Control List',
        def: 'An ordered list of permit/deny rules applied to a resource (file, directory, or network interface) that defines which subjects can perform which operations.',
        moduleId: 'sec', topic: 'Access Control', related: r(['rbac', 'firewall', 'least_priv']),
      },
      {
        id: 'least_priv', term: 'Least Privilege', expand: 'Principle of Least Privilege',
        def: 'A security principle stating that every user, process, or program should have only the minimum access rights needed to perform its function, reducing the blast radius of a compromise.',
        moduleId: 'sec', topic: 'Access Control', related: r(['rbac', 'sep_duties', 'zero_trust', 'acl']),
      },
      {
        id: 'sep_duties', term: 'Separation of Duties', expand: 'Segregation of Duties',
        def: 'A control that divides critical tasks among multiple people or systems so no single individual can complete a high-risk action alone, reducing insider threat and fraud.',
        moduleId: 'sec', topic: 'Access Control', related: r(['least_priv', 'rbac']),
      },
      {
        id: 'sso', term: 'SSO', expand: 'Single Sign-On',
        def: 'An authentication scheme that lets a user log in once and gain access to multiple systems without re-authenticating. Implemented via SAML, OAuth/OIDC, or Kerberos.',
        moduleId: 'sec', topic: 'Access Control', related: r(['mfa', 'saml', 'oauth', 'kerberos']),
      },
      {
        id: 'saml', term: 'SAML', expand: 'Security Assertion Markup Language',
        def: 'An XML-based open standard for exchanging authentication and authorization data between an identity provider (IdP) and a service provider (SP), enabling SSO for web applications.',
        moduleId: 'sec', topic: 'Access Control', related: r(['sso', 'oauth', 'pki']),
      },
      {
        id: 'oauth', term: 'OAuth', expand: 'Open Authorization',
        def: 'An open standard (OAuth 2.0) for delegated authorization. Lets a user grant a third-party application limited access to their resources without sharing passwords.',
        moduleId: 'sec', topic: 'Access Control', related: r(['sso', 'saml']),
      },
      {
        id: 'kerberos', term: 'Kerberos', expand: 'Kerberos Authentication Protocol',
        def: 'A ticket-based network authentication protocol using a Key Distribution Center (KDC) to issue time-limited tickets, preventing password exposure over the network.',
        moduleId: 'sec', topic: 'Access Control', related: r(['sso', 'mfa']),
      },
      // Threats & Attacks
      {
        id: 'malware', term: 'Malware', expand: 'Malicious Software',
        def: 'Any software intentionally designed to cause damage, gain unauthorized access, or disrupt systems. Includes viruses, worms, trojans, ransomware, spyware, and rootkits.',
        moduleId: 'sec', topic: 'Threats', related: r(['ransomware', 'phishing', 'exploit', 'ids']),
      },
      {
        id: 'ransomware', term: 'Ransomware', expand: 'Encryption-Based Extortion Malware',
        def: 'Malware that encrypts a victim\'s files and demands payment (ransom) for the decryption key. Spreads via phishing, RDP exploits, and supply-chain compromise.',
        moduleId: 'sec', topic: 'Threats', related: r(['malware', 'phishing', 'incident_resp', 'aes']),
      },
      {
        id: 'phishing', term: 'Phishing', expand: 'Deceptive Email / Social Engineering Attack',
        def: 'A social engineering attack that uses deceptive emails, websites, or messages to trick users into revealing credentials, clicking malicious links, or downloading malware.',
        moduleId: 'sec', topic: 'Threats', related: r(['social_eng', 'malware', 'mfa', 'zero_day']),
      },
      {
        id: 'social_eng', term: 'Social Engineering', expand: 'Human Manipulation Attack',
        def: 'Psychological manipulation of people into performing actions or divulging confidential information. Techniques include pretexting, baiting, tailgating, and vishing.',
        moduleId: 'sec', topic: 'Threats', related: r(['phishing', 'mfa', 'least_priv']),
      },
      {
        id: 'sqli', term: 'SQL Injection', expand: 'SQLi — Database Injection Attack',
        def: 'An attack that inserts malicious SQL code into an input field to manipulate the backend database — dumping data, bypassing authentication, or executing OS commands.',
        moduleId: 'sec', topic: 'Threats', related: r(['xss', 'exploit', 'vuln']),
      },
      {
        id: 'xss', term: 'XSS', expand: 'Cross-Site Scripting',
        def: 'A web vulnerability where an attacker injects malicious scripts into pages viewed by other users. Stored XSS persists in the database; reflected XSS is echoed back immediately.',
        moduleId: 'sec', topic: 'Threats', related: r(['sqli', 'exploit', 'vuln', 'csrf']),
      },
      {
        id: 'csrf', term: 'CSRF', expand: 'Cross-Site Request Forgery',
        def: 'An attack that tricks an authenticated user\'s browser into sending unauthorized requests to a web application, exploiting the site\'s trust in the user\'s session.',
        moduleId: 'sec', topic: 'Threats', related: r(['xss', 'exploit', 'mfa']),
      },
      {
        id: 'ddos', term: 'DDoS', expand: 'Distributed Denial of Service',
        def: 'An attack that overwhelms a target\'s bandwidth or resources with traffic from many distributed sources (botnet), making it unavailable to legitimate users.',
        moduleId: 'sec', topic: 'Threats', related: r(['ids', 'ips', 'firewall', 'botnet']),
      },
      {
        id: 'botnet', term: 'Botnet', expand: 'Network of Compromised Hosts',
        def: 'A network of malware-infected devices (bots) controlled by a command-and-control server. Used to launch DDoS attacks, send spam, and spread malware.',
        moduleId: 'sec', topic: 'Threats', related: r(['ddos', 'malware', 'c2']),
      },
      {
        id: 'zero_day', term: 'Zero-Day', expand: 'Zero-Day Vulnerability or Exploit',
        def: 'A vulnerability unknown to the software vendor (and therefore unpatched), or an exploit that targets such a vulnerability. "Zero days" for defenders to respond before first use.',
        moduleId: 'sec', topic: 'Threats', related: r(['exploit', 'vuln', 'patch_mgmt', 'ids']),
      },
      {
        id: 'vuln', term: 'Vulnerability', expand: 'Security Weakness',
        def: 'A weakness in a system, application, or process that could be exploited to compromise confidentiality, integrity, or availability. Scored via CVSS.',
        moduleId: 'sec', topic: 'Threats', related: r(['exploit', 'zero_day', 'vuln_scan', 'pentest']),
      },
      {
        id: 'exploit', term: 'Exploit', expand: 'Vulnerability Exploitation',
        def: 'Code, data, or a sequence of commands that takes advantage of a vulnerability to cause unintended behavior — gaining unauthorized access, escalating privileges, or executing code.',
        moduleId: 'sec', topic: 'Threats', related: r(['vuln', 'zero_day', 'malware', 'buffer_overflow']),
      },
      {
        id: 'buffer_overflow', term: 'Buffer Overflow', expand: 'Memory Boundary Violation',
        def: 'A vulnerability where a program writes more data to a buffer than it can hold, overwriting adjacent memory. Can enable arbitrary code execution or privilege escalation.',
        moduleId: 'sec', topic: 'Threats', related: r(['exploit', 'vuln', 'sqli']),
      },
      {
        id: 'mitm', term: 'MitM', expand: 'Man-in-the-Middle Attack',
        def: 'An attack where an adversary secretly intercepts and potentially alters communication between two parties. ARP spoofing and rogue Wi-Fi APs are common vectors.',
        moduleId: 'sec', topic: 'Threats', related: r(['arp', 'tls', 'vpn', 'phishing']),
      },
      {
        id: 'brute_force', term: 'Brute Force', expand: 'Brute Force Attack',
        def: 'An attack that tries all possible passwords or keys until the correct one is found. Online attacks target logins; offline attacks crack captured hashes.',
        moduleId: 'sec', topic: 'Threats', related: r(['rainbow_table', 'salting', 'mfa', 'acl']),
      },
      {
        id: 'rainbow_table', term: 'Rainbow Table', expand: 'Precomputed Hash Lookup Table',
        def: 'A precomputed table of password→hash pairs used to reverse hash functions efficiently. Defeated by salting, which ensures identical passwords produce different hashes.',
        moduleId: 'sec', topic: 'Threats', related: r(['brute_force', 'hash_fn', 'salting']),
      },
      // Architecture & Defense
      {
        id: 'ids', term: 'IDS', expand: 'Intrusion Detection System',
        def: 'A passive security system that monitors network or host activity for malicious patterns and generates alerts. Signature-based detects known threats; anomaly-based detects deviations.',
        moduleId: 'sec', topic: 'Architecture', related: r(['ips', 'siem', 'firewall', 'ddos']),
      },
      {
        id: 'ips', term: 'IPS', expand: 'Intrusion Prevention System',
        def: 'An active security system that sits inline on a network and can block or modify traffic in real time when it detects an attack, unlike the passive IDS.',
        moduleId: 'sec', topic: 'Architecture', related: r(['ids', 'firewall', 'siem']),
      },
      {
        id: 'siem', term: 'SIEM', expand: 'Security Information and Event Management',
        def: 'A platform that aggregates, correlates, and analyzes log data from across the environment to detect threats and support incident response and compliance reporting.',
        moduleId: 'sec', topic: 'Architecture', related: r(['ids', 'ips', 'incident_resp']),
      },
      {
        id: 'zero_trust', term: 'Zero Trust', expand: 'Zero Trust Architecture',
        def: '"Never trust, always verify." A security model that assumes no implicit trust for any user or device, requiring continuous authentication and authorization regardless of network location.',
        moduleId: 'sec', topic: 'Architecture', related: r(['mfa', 'least_priv', 'rbac', 'vpn']),
      },
      {
        id: 'cia_triad', term: 'CIA Triad', expand: 'Confidentiality, Integrity, Availability',
        def: 'The three core security objectives: Confidentiality (only authorized parties access data), Integrity (data is accurate and unaltered), Availability (systems are accessible when needed).',
        moduleId: 'sec', topic: 'Architecture', related: r(['aes', 'hash_fn', 'ddos', 'rbac']),
      },
      {
        id: 'dmz', term: 'DMZ', expand: 'Demilitarized Zone',
        def: 'A network segment between the internal trusted network and the untrusted internet, hosting public-facing services (web, mail, DNS) while isolating them from internal systems.',
        moduleId: 'sec', topic: 'Architecture', related: r(['firewall', 'ids', 'vpn']),
      },
      {
        id: 'def_in_depth', term: 'Defense in Depth', expand: 'Layered Security Strategy',
        def: 'A security strategy that applies multiple overlapping controls (firewalls, encryption, MFA, monitoring) so that a failure in one layer does not compromise the whole system.',
        moduleId: 'sec', topic: 'Architecture', related: r(['cia_triad', 'zero_trust', 'ids', 'firewall']),
      },
      // Operations
      {
        id: 'incident_resp', term: 'Incident Response', expand: 'IR — Security Incident Response',
        def: 'A structured process for handling security breaches: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned (PICERL).',
        moduleId: 'sec', topic: 'Operations', related: r(['siem', 'forensics', 'vuln', 'ransomware']),
      },
      {
        id: 'forensics', term: 'Digital Forensics', expand: 'Computer Forensics',
        def: 'The practice of collecting, preserving, and analyzing digital evidence following a security incident, maintaining chain of custody to ensure admissibility.',
        moduleId: 'sec', topic: 'Operations', related: r(['incident_resp', 'chain_custody']),
      },
      {
        id: 'chain_custody', term: 'Chain of Custody', expand: 'Evidence Chain of Custody',
        def: 'A documented record tracking the handling of evidence from collection through analysis to court presentation, ensuring integrity and admissibility.',
        moduleId: 'sec', topic: 'Operations', related: r(['forensics', 'incident_resp']),
      },
      {
        id: 'pentest', term: 'Penetration Testing', expand: 'Ethical Hacking Assessment',
        def: 'An authorized simulated attack on a system to identify exploitable vulnerabilities. Phases: Reconnaissance → Scanning → Exploitation → Post-Exploitation → Reporting.',
        moduleId: 'sec', topic: 'Operations', related: r(['vuln_scan', 'vuln', 'exploit', 'zero_day']),
      },
      {
        id: 'vuln_scan', term: 'Vulnerability Scan', expand: 'Automated Security Scanning',
        def: 'An automated process that probes systems for known vulnerabilities using a database of CVEs (Common Vulnerabilities and Exposures). Less invasive than penetration testing.',
        moduleId: 'sec', topic: 'Operations', related: r(['pentest', 'vuln', 'patch_mgmt']),
      },
      {
        id: 'patch_mgmt', term: 'Patch Management', expand: 'Software Patch Management',
        def: 'The process of identifying, testing, and deploying software updates (patches) to fix vulnerabilities, improve stability, or add features in a controlled manner.',
        moduleId: 'sec', topic: 'Operations', related: r(['vuln_scan', 'zero_day', 'vuln']),
      },
    ],
  })

  // ── SYS-110: Systems & Hardware (CompTIA A+) ──────────────────────────────
  await prisma.term.createMany({
    data: [
      // Hardware
      {
        id: 'cpu', term: 'CPU', expand: 'Central Processing Unit',
        def: 'The primary component of a computer that executes instructions. Key specs: core count, clock speed (GHz), cache hierarchy (L1/L2/L3), and instruction set (x86-64, ARM).',
        moduleId: 'sys', topic: 'Hardware', related: r(['ram', 'gpu', 'motherboard', 'cache_cpu', 'thermal']),
      },
      {
        id: 'ram', term: 'RAM', expand: 'Random Access Memory',
        def: 'Volatile primary memory that temporarily stores data and instructions the CPU is actively using. Cleared on power loss. Types: DDR4/DDR5 (PC), LPDDR (mobile).',
        moduleId: 'sys', topic: 'Hardware', related: r(['cpu', 'virtual_mem', 'motherboard', 'ssd']),
      },
      {
        id: 'motherboard', term: 'Motherboard', expand: 'System Board / Mainboard',
        def: 'The main circuit board connecting all components: CPU socket, RAM slots, PCIe slots, SATA ports, M.2 slots, I/O ports, and firmware chip (BIOS/UEFI).',
        moduleId: 'sys', topic: 'Hardware', related: r(['cpu', 'ram', 'bios', 'pcie', 'sata']),
      },
      {
        id: 'bios', term: 'BIOS', expand: 'Basic Input/Output System',
        def: 'Legacy firmware stored on a ROM chip that initializes hardware at boot (POST), then hands off to the bootloader. Largely superseded by UEFI.',
        moduleId: 'sys', topic: 'Hardware', related: r(['uefi', 'motherboard', 'mbr', 'post']),
      },
      {
        id: 'uefi', term: 'UEFI', expand: 'Unified Extensible Firmware Interface',
        def: 'Modern replacement for BIOS. Supports drives >2 TB via GPT, Secure Boot (verifies bootloader signatures), faster startup, and a graphical setup interface.',
        moduleId: 'sys', topic: 'Hardware', related: r(['bios', 'gpt', 'secure_boot', 'motherboard']),
      },
      {
        id: 'pcie', term: 'PCIe', expand: 'Peripheral Component Interconnect Express',
        def: 'A high-speed serial expansion bus standard used to connect GPUs, NVMe SSDs, NICs, and other add-in cards. Organized in lanes (x1, x4, x8, x16); each PCIe 4.0 lane = ~2 GB/s.',
        moduleId: 'sys', topic: 'Hardware', related: r(['gpu', 'nvme', 'motherboard']),
      },
      {
        id: 'gpu', term: 'GPU', expand: 'Graphics Processing Unit',
        def: 'A processor with thousands of smaller cores optimized for parallel workloads: rendering graphics, scientific simulation, and AI/ML inference. Connects via PCIe.',
        moduleId: 'sys', topic: 'Hardware', related: r(['cpu', 'pcie', 'vram']),
      },
      {
        id: 'psu', term: 'PSU', expand: 'Power Supply Unit',
        def: 'Converts AC mains power to regulated DC voltages (3.3 V, 5 V, 12 V) for components. Rated in watts; 80 PLUS certification indicates efficiency. Modular vs non-modular.',
        moduleId: 'sys', topic: 'Hardware', related: r(['motherboard', 'cpu', 'gpu']),
      },
      {
        id: 'thermal', term: 'Thermal Paste', expand: 'Thermal Interface Material',
        def: 'A thermally conductive compound applied between a CPU/GPU die and its heat sink to fill microscopic air gaps and improve heat transfer, reducing operating temperatures.',
        moduleId: 'sys', topic: 'Hardware', related: r(['cpu', 'gpu', 'heat_sink']),
      },
      {
        id: 'heat_sink', term: 'Heat Sink', expand: 'Passive Cooling Component',
        def: 'A metal component (usually aluminum or copper) with fins that absorbs heat from a processor and dissipates it into the surrounding air via conduction and convection.',
        moduleId: 'sys', topic: 'Hardware', related: r(['thermal', 'cpu', 'gpu']),
      },
      {
        id: 'cache_cpu', term: 'CPU Cache', expand: 'L1/L2/L3 Cache',
        def: 'High-speed SRAM built into or near the CPU to reduce memory latency. L1 (fastest, ~64 KB per core) → L2 (~256 KB) → L3 (shared, several MB). A cache miss falls back to RAM.',
        moduleId: 'sys', topic: 'Hardware', related: r(['cpu', 'ram', 'virtual_mem']),
      },
      // Storage
      {
        id: 'ssd', term: 'SSD', expand: 'Solid State Drive',
        def: 'A non-volatile storage device using NAND flash memory. No moving parts means lower latency and better shock resistance than HDDs. Interfaces: SATA (~550 MB/s) or NVMe (>7 GB/s).',
        moduleId: 'sys', topic: 'Storage', related: r(['hdd', 'nvme', 'sata', 'raid']),
      },
      {
        id: 'hdd', term: 'HDD', expand: 'Hard Disk Drive',
        def: 'A magnetic storage device using spinning platters and a moving read/write head. Capacities up to 20+ TB at lower cost than SSDs; sensitive to shock and slower seek times.',
        moduleId: 'sys', topic: 'Storage', related: r(['ssd', 'raid', 'sata']),
      },
      {
        id: 'nvme', term: 'NVMe', expand: 'Non-Volatile Memory Express',
        def: 'A storage protocol designed for SSDs that communicates directly over PCIe, bypassing the legacy AHCI/SATA bottleneck. M.2 NVMe SSDs achieve sequential reads of 3–7+ GB/s.',
        moduleId: 'sys', topic: 'Storage', related: r(['ssd', 'pcie', 'sata', 'm2']),
      },
      {
        id: 'sata', term: 'SATA', expand: 'Serial Advanced Technology Attachment',
        def: 'The interface standard for connecting HDDs and SSDs to a motherboard. SATA III maxes at 6 Gbps (~550 MB/s). Superseded for SSDs by the faster NVMe/PCIe interface.',
        moduleId: 'sys', topic: 'Storage', related: r(['hdd', 'ssd', 'nvme', 'motherboard']),
      },
      {
        id: 'm2', term: 'M.2', expand: 'M.2 Form Factor Slot',
        def: 'A small rectangular slot on the motherboard for expansion cards. Supports both SATA and NVMe protocols in the same physical connector; key notch (M-key, B-key) determines compatibility.',
        moduleId: 'sys', topic: 'Storage', related: r(['nvme', 'sata', 'pcie', 'motherboard']),
      },
      {
        id: 'raid', term: 'RAID', expand: 'Redundant Array of Independent Disks',
        def: 'A storage technology that combines multiple disks. RAID 0: striping (performance, no redundancy). RAID 1: mirroring. RAID 5: striping with distributed parity. RAID 10: mirror+stripe.',
        moduleId: 'sys', topic: 'Storage', related: r(['ssd', 'hdd', 'lvm']),
      },
      {
        id: 'lvm', term: 'LVM', expand: 'Logical Volume Manager',
        def: 'A Linux abstraction layer (Physical Volumes → Volume Groups → Logical Volumes) that allows flexible, resizable storage pools, snapshots, and striping across multiple disks.',
        moduleId: 'sys', topic: 'Storage', related: r(['raid', 'ssd', 'ntfs', 'ext4']),
      },
      // OS & Filesystems
      {
        id: 'ntfs', term: 'NTFS', expand: 'New Technology File System',
        def: 'The default Windows filesystem. Supports file/folder permissions (ACLs), journaling for crash recovery, compression, encryption (EFS), and files larger than 4 GB (unlike FAT32).',
        moduleId: 'sys', topic: 'Filesystems', related: r(['fat32', 'mbr', 'gpt', 'registry', 'acl']),
      },
      {
        id: 'fat32', term: 'FAT32', expand: 'File Allocation Table 32',
        def: 'An older filesystem compatible with virtually all OSes. Limitations: max 4 GB per file, max 8 TB volume. Used for USB drives and SD cards needing cross-platform compatibility.',
        moduleId: 'sys', topic: 'Filesystems', related: r(['ntfs', 'ext4', 'mbr']),
      },
      {
        id: 'ext4', term: 'ext4', expand: 'Fourth Extended Filesystem',
        def: 'The default Linux filesystem. Supports volumes up to 1 exabyte, journaling, extents for large files, and delayed allocation for performance. Successor to ext2/ext3.',
        moduleId: 'sys', topic: 'Filesystems', related: r(['ntfs', 'fat32', 'lvm']),
      },
      {
        id: 'mbr', term: 'MBR', expand: 'Master Boot Record',
        def: 'Legacy partitioning scheme stored in the first 512 bytes of a disk. Supports up to 4 primary partitions and disks up to 2 TB. Superseded by GPT for modern systems.',
        moduleId: 'sys', topic: 'Filesystems', related: r(['gpt', 'bios', 'ntfs', 'fat32']),
      },
      {
        id: 'gpt', term: 'GPT', expand: 'GUID Partition Table',
        def: 'A modern partitioning standard (part of UEFI) that supports 128 partitions, disks larger than 2 TB, and stores partition data redundantly at both ends of the disk.',
        moduleId: 'sys', topic: 'Filesystems', related: r(['mbr', 'uefi', 'ntfs', 'secure_boot']),
      },
      {
        id: 'secure_boot', term: 'Secure Boot', expand: 'UEFI Secure Boot',
        def: 'A UEFI security feature that only allows the system to boot software signed with trusted keys, blocking bootkits and rootkits from loading before the OS.',
        moduleId: 'sys', topic: 'Filesystems', related: r(['uefi', 'gpt', 'bios']),
      },
      // Processes & OS
      {
        id: 'virtual_mem', term: 'Virtual Memory', expand: 'Virtual Memory / Swap Space',
        def: 'An OS technique that uses disk space as an overflow extension of RAM (paging/swapping). Allows running more processes than physical RAM permits, at the cost of performance.',
        moduleId: 'sys', topic: 'Processes', related: r(['ram', 'cpu', 'process', 'hdd']),
      },
      {
        id: 'process', term: 'Process', expand: 'OS Process',
        def: 'An instance of a running program with its own memory space (code, heap, stack), file handles, and at least one thread. Managed by the OS scheduler.',
        moduleId: 'sys', topic: 'Processes', related: r(['thread', 'virtual_mem', 'cpu', 'driver']),
      },
      {
        id: 'thread', term: 'Thread', expand: 'OS Thread of Execution',
        def: 'The smallest unit of CPU execution within a process. Threads share the process\'s memory space and resources but have their own stack and registers, enabling parallelism.',
        moduleId: 'sys', topic: 'Processes', related: r(['process', 'cpu', 'cache_cpu']),
      },
      {
        id: 'driver', term: 'Driver', expand: 'Device Driver',
        def: 'Software that provides an interface between the OS and a hardware device (GPU, NIC, printer). Runs in kernel mode; a faulty driver can cause BSODs or kernel panics.',
        moduleId: 'sys', topic: 'Processes', related: r(['bsod', 'motherboard', 'gpu', 'process']),
      },
      {
        id: 'registry', term: 'Registry', expand: 'Windows Registry',
        def: 'A hierarchical database in Windows that stores configuration settings for the OS, applications, and user preferences. Organized into hives (HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER, etc.).',
        moduleId: 'sys', topic: 'Processes', related: r(['ntfs', 'bios', 'driver', 'process']),
      },
      {
        id: 'post', term: 'POST', expand: 'Power-On Self-Test',
        def: 'A diagnostic sequence run by BIOS/UEFI at power-on that tests CPU, RAM, and essential hardware before handing off to the bootloader. Failure produces beep codes or error messages.',
        moduleId: 'sys', topic: 'Hardware', related: r(['bios', 'uefi', 'motherboard', 'bsod']),
      },
      {
        id: 'bsod', term: 'BSOD', expand: 'Blue Screen of Death',
        def: 'A Windows stop error screen caused by a critical kernel-mode failure (driver crash, hardware fault, memory error). Displays a stop code and generates a memory dump for analysis.',
        moduleId: 'sys', topic: 'Processes', related: r(['driver', 'ram', 'virtual_mem', 'post']),
      },
      {
        id: 'usb', term: 'USB', expand: 'Universal Serial Bus',
        def: 'A standardized serial interface for connecting peripherals. USB 2.0: 480 Mbps. USB 3.2 Gen 2: 10 Gbps. USB4: up to 40 Gbps (same connector as Thunderbolt 3/4).',
        moduleId: 'sys', topic: 'Hardware', related: r(['motherboard', 'sata', 'pcie']),
      },
      {
        id: 'vram', term: 'VRAM', expand: 'Video RAM',
        def: 'Dedicated high-bandwidth memory on a GPU used to store frame buffers, textures, and shader data. GDDR6X and HBM are current generations; capacity affects max resolution and texture detail.',
        moduleId: 'sys', topic: 'Hardware', related: r(['gpu', 'ram', 'pcie']),
      },
    ],
  })

  // ── CLD-301: Cloud & Virtualization (CompTIA Cloud+) ─────────────────────
  await prisma.term.createMany({
    data: [
      {
        id: 'vm', term: 'VM', expand: 'Virtual Machine',
        def: 'An emulation of a physical computer running a guest OS on top of a hypervisor. Each VM has its own virtualized CPU, RAM, storage, and NICs, fully isolated from other VMs.',
        moduleId: 'cld', topic: 'IaaS', related: r(['hypervisor', 'container', 'snapshot']),
      },
      {
        id: 'hypervisor', term: 'Hypervisor', expand: 'Virtual Machine Monitor',
        def: 'Software that creates and manages VMs. Type 1 (bare-metal: ESXi, Hyper-V) runs directly on hardware. Type 2 (hosted: VirtualBox, VMware Workstation) runs on top of an OS.',
        moduleId: 'cld', topic: 'IaaS', related: r(['vm', 'container', 'vm_snapshot']),
      },
      {
        id: 'container', term: 'Container', expand: 'OS-Level Virtualization Unit',
        def: 'A lightweight isolated runtime that packages an application and its dependencies, sharing the host OS kernel. Faster and more portable than VMs; Docker is the dominant runtime.',
        moduleId: 'cld', topic: 'Containers', related: r(['vm', 'hypervisor', 'docker', 'kubernetes']),
      },
      {
        id: 'docker', term: 'Docker', expand: 'Container Runtime and Platform',
        def: 'The dominant container platform. A Dockerfile defines the image; `docker run` starts a container. Docker Hub stores public images; Docker Compose orchestrates multi-container apps.',
        moduleId: 'cld', topic: 'Containers', related: r(['container', 'kubernetes', 'microservices']),
      },
      {
        id: 'kubernetes', term: 'Kubernetes', expand: 'Container Orchestration Platform',
        def: 'An open-source system for automating deployment, scaling, and management of containerized applications. Groups containers into pods; manages load balancing and self-healing.',
        moduleId: 'cld', topic: 'Containers', related: r(['docker', 'container', 'microservices', 'iaas']),
      },
      {
        id: 'iaas', term: 'IaaS', expand: 'Infrastructure as a Service',
        def: 'A cloud model where the provider supplies virtualized compute, storage, and networking. The customer manages the OS and above. Examples: AWS EC2, Azure VMs, Google Compute Engine.',
        moduleId: 'cld', topic: 'Cloud Models', related: r(['paas', 'saas_cld', 'vm', 'hypervisor']),
      },
      {
        id: 'paas', term: 'PaaS', expand: 'Platform as a Service',
        def: 'A cloud model where the provider manages the runtime, OS, and infrastructure; the customer deploys applications. Examples: Heroku, AWS Elastic Beanstalk, Google App Engine.',
        moduleId: 'cld', topic: 'Cloud Models', related: r(['iaas', 'saas_cld', 'container']),
      },
      {
        id: 'saas_cld', term: 'SaaS', expand: 'Software as a Service',
        def: 'A cloud delivery model where the provider hosts and manages the entire application stack; users access it via browser. Examples: Microsoft 365, Google Workspace, Salesforce.',
        moduleId: 'cld', topic: 'Cloud Models', related: r(['paas', 'iaas']),
      },
      {
        id: 'snapshot', term: 'Snapshot', expand: 'VM/Volume Snapshot',
        def: 'A point-in-time copy of a VM\'s disk state. Enables fast rollback after failed changes or patching. Snapshots chain deltas; keeping too many degrades performance.',
        moduleId: 'cld', topic: 'IaaS', related: r(['vm', 'backup', 'rpo']),
      },
      {
        id: 'backup', term: 'Backup', expand: 'Data Backup and Recovery',
        def: 'Copying data to secondary storage to protect against loss. Full backup copies everything. Incremental copies only changes since the last backup. Differential since the last full.',
        moduleId: 'cld', topic: 'IaaS', related: r(['snapshot', 'rto', 'rpo', 'raid']),
      },
      {
        id: 'rto', term: 'RTO', expand: 'Recovery Time Objective',
        def: 'The maximum acceptable time for restoring a system after a disruption. RTO defines the speed target; the recovery solution must achieve restoration within this window.',
        moduleId: 'cld', topic: 'IaaS', related: r(['rpo', 'backup', 'snapshot']),
      },
      {
        id: 'rpo', term: 'RPO', expand: 'Recovery Point Objective',
        def: 'The maximum acceptable amount of data loss measured in time. An RPO of 1 hour means backups must occur at least every hour to limit data loss to at most 60 minutes.',
        moduleId: 'cld', topic: 'IaaS', related: r(['rto', 'backup', 'snapshot']),
      },
      {
        id: 'microservices', term: 'Microservices', expand: 'Microservices Architecture',
        def: 'An architectural style that structures an application as a collection of small, independently deployable services communicating over APIs. Contrast with monolithic architecture.',
        moduleId: 'cld', topic: 'Containers', related: r(['container', 'docker', 'kubernetes', 'iaas']),
      },
    ],
  })

  // ── SEC cross-refs that need separate insert ──────────────────────────────
  await prisma.term.createMany({
    data: [
      {
        id: 'c2', term: 'C2', expand: 'Command and Control Server',
        def: 'Infrastructure used by attackers to send instructions to and receive data from compromised hosts (bots/implants). Takedown of C2 disrupts entire botnet operations.',
        moduleId: 'sec', topic: 'Threats', related: r(['botnet', 'malware']),
      },
      {
        id: 'vm_snapshot', term: 'VM Snapshot', expand: 'Virtual Machine Snapshot',
        def: 'A saved state of a VM\'s disk, memory, and settings at a point in time, allowing rollback. Commonly used before patching or testing configuration changes.',
        moduleId: 'cld', topic: 'IaaS', related: r(['vm', 'hypervisor', 'snapshot']),
      },
    ],
  })

  // ── SEC-201: Ports & Services ─────────────────────────────────────────────
  await prisma.term.createMany({
    data: [
      { id: 'port_21',    term: 'Port 21',   expand: 'FTP — File Transfer Protocol',             def: 'Port 21 (control) / 20 (data). Unencrypted file transfer; credentials sent in plaintext. Replaced by SFTP (port 22) or FTPS (port 990). Block at perimeter or restrict to explicit allow-list.', moduleId: 'sec', topic: 'Ports & Services', related: r(['ftp', 'sftp', 'firewall', 'port_22']) },
      { id: 'port_22',    term: 'Port 22',   expand: 'SSH — Secure Shell',                       def: 'Encrypted remote administration, tunneling, and file transfer (SFTP/SCP). Change from default 22 to reduce automated brute-force noise. Key-based auth preferred over password.', moduleId: 'sec', topic: 'Ports & Services', related: r(['ssh', 'sftp', 'tool_sshkeygen', 'brute_force', 'port_21']) },
      { id: 'port_23',    term: 'Port 23',   expand: 'Telnet — Unencrypted Remote Login',        def: 'Legacy remote terminal protocol transmitting all data including credentials in cleartext. Should be disabled entirely and replaced with SSH. Common finding in penetration tests and audits.', moduleId: 'sec', topic: 'Ports & Services', related: r(['ssh', 'mitm', 'firewall', 'port_22']) },
      { id: 'port_25',    term: 'Port 25',   expand: 'SMTP — Mail Transfer',                     def: 'Server-to-server email relay. Often blocked outbound by ISPs to prevent spam. Submission from mail clients uses port 587 (STARTTLS) or 465 (implicit TLS). Open relay = major vulnerability.', moduleId: 'sec', topic: 'Ports & Services', related: r(['smtp', 'tls', 'port_587', 'port_465']) },
      { id: 'port_53',    term: 'Port 53',   expand: 'DNS — Domain Name System',                 def: 'UDP (queries <512 bytes) and TCP (zone transfers, large responses). DNS tunneling can exfiltrate data through seemingly legitimate DNS traffic. DNSSEC adds cryptographic validation.', moduleId: 'sec', topic: 'Ports & Services', related: r(['dns', 'udp', 'tcp', 'firewall']) },
      { id: 'port_67',    term: 'Port 67/68', expand: 'DHCP — Dynamic Host Configuration',      def: 'UDP ports 67 (server) and 68 (client). Rogue DHCP servers can perform DHCP starvation or man-in-the-middle attacks by issuing malicious gateway/DNS assignments.', moduleId: 'sec', topic: 'Ports & Services', related: r(['dhcp', 'udp', 'mitm', 'firewall']) },
      { id: 'port_80',    term: 'Port 80',   expand: 'HTTP — Unencrypted Web Traffic',           def: 'Unencrypted web traffic. Should redirect to HTTPS (443). Leaving 80 open without redirect exposes users to downgrade attacks and packet sniffing. Many scanners probe 80 first.', moduleId: 'sec', topic: 'Ports & Services', related: r(['http', 'port_443', 'tls', 'mitm']) },
      { id: 'port_110',   term: 'Port 110',  expand: 'POP3 — Post Office Protocol',              def: 'Downloads email from server; default clears messages from server after download. Unencrypted on 110; use POP3S on port 995. Largely superseded by IMAP for modern clients.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_995', 'port_143', 'smtp']) },
      { id: 'port_123',   term: 'Port 123',  expand: 'NTP — Network Time Protocol',              def: 'UDP port 123. Critical for Kerberos auth (clock skew >5 min = auth failure), log correlation, and certificate validation. NTP amplification is a common DDoS reflection attack vector.', moduleId: 'sec', topic: 'Ports & Services', related: r(['ntp', 'udp', 'kerberos', 'ddos']) },
      { id: 'port_135',   term: 'Port 135',  expand: 'RPC / DCOM — Remote Procedure Call',      def: 'Windows RPC endpoint mapper. Historically exploited by worms (Blaster, Sasser). Should be blocked at network perimeters. Required internally for Active Directory and Windows management.', moduleId: 'sec', topic: 'Ports & Services', related: r(['firewall', 'exploit', 'port_445']) },
      { id: 'port_137',   term: 'Port 137–139', expand: 'NetBIOS — Legacy Windows Networking',  def: 'NetBIOS Name Service (137 UDP), Datagram (138 UDP), Session (139 TCP). Legacy pre-AD Windows networking. NetBIOS name resolution can be spoofed (LLMNR/NBT-NS poisoning). Block at perimeter.', moduleId: 'sec', topic: 'Ports & Services', related: r(['firewall', 'mitm', 'port_445']) },
      { id: 'port_143',   term: 'Port 143',  expand: 'IMAP — Internet Message Access Protocol', def: 'Keeps mail on server, supports multiple devices. Unencrypted on 143; use IMAPS on 993. Supports server-side search and folder management. Standard for modern email clients.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_993', 'port_110', 'smtp']) },
      { id: 'port_161',   term: 'Port 161/162', expand: 'SNMP — Network Management',            def: 'UDP 161 (agent queries) / 162 (traps to manager). SNMPv1/v2c use community strings (plaintext passwords). SNMPv3 adds auth and encryption. Misconfigured SNMP leaks network topology.', moduleId: 'sec', topic: 'Ports & Services', related: r(['snmp', 'udp', 'firewall', 'tool_nmap']) },
      { id: 'port_389',   term: 'Port 389',  expand: 'LDAP — Directory Services',               def: 'Lightweight Directory Access Protocol for querying Active Directory and other directory services. Cleartext on 389; use LDAPS on 636 or LDAP with STARTTLS. Unauthenticated LDAP queries can enumerate users.', moduleId: 'sec', topic: 'Ports & Services', related: r(['port_636', 'kerberos', 'sso', 'firewall']) },
      { id: 'port_443',   term: 'Port 443',  expand: 'HTTPS — Encrypted Web Traffic',           def: 'HTTP over TLS. Certificate presented by server is verified against trusted CAs. HSTS prevents downgrade to HTTP. Many firewalls allow 443 outbound freely, making it attractive for C2 tunneling.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'http', 'cert_auth', 'pki', 'c2', 'port_80']) },
      { id: 'port_445',   term: 'Port 445',  expand: 'SMB — Server Message Block',              def: 'Windows file and printer sharing. SMBv1 was exploited by EternalBlue (MS17-010), enabling WannaCry and NotPetya ransomware. Disable SMBv1; block 445 at perimeter. Never expose to internet.', moduleId: 'sec', topic: 'Ports & Services', related: r(['exploit', 'ransomware', 'firewall', 'port_135', 'port_137']) },
      { id: 'port_465',   term: 'Port 465',  expand: 'SMTPS — SMTP over Implicit TLS',         def: 'SMTP with implicit TLS (connection starts encrypted immediately). Originally unofficial; now recognized for mail submission. Alternative to port 587 with STARTTLS.', moduleId: 'sec', topic: 'Ports & Services', related: r(['smtp', 'tls', 'port_587', 'port_25']) },
      { id: 'port_514',   term: 'Port 514',  expand: 'Syslog — System Log Protocol',            def: 'UDP 514 (traditional) or TCP 514/6514 (reliable/TLS). Centralizes logs from routers, switches, servers to a SIEM. Unencrypted UDP syslog can be spoofed; use TLS transport for integrity.', moduleId: 'sec', topic: 'Ports & Services', related: r(['siem', 'ids', 'udp', 'tls']) },
      { id: 'port_587',   term: 'Port 587',  expand: 'SMTP Submission — Mail Client to Server', def: 'Authenticated SMTP submission from mail clients with STARTTLS upgrade. Preferred over port 25 for client-to-server mail. Requires authentication, reducing open-relay abuse.', moduleId: 'sec', topic: 'Ports & Services', related: r(['smtp', 'tls', 'port_465', 'port_25', 'mfa']) },
      { id: 'port_636',   term: 'Port 636',  expand: 'LDAPS — LDAP over TLS',                   def: 'LDAP wrapped in TLS for encrypted directory queries. Prevents credential interception during AD authentication lookups. Use instead of plain LDAP (389) for all directory traffic.', moduleId: 'sec', topic: 'Ports & Services', related: r(['port_389', 'tls', 'pki', 'kerberos']) },
      { id: 'port_993',   term: 'Port 993',  expand: 'IMAPS — IMAP over Implicit TLS',          def: 'IMAP with implicit TLS. Secure version of IMAP for email retrieval. Should be preferred over port 143 for all client connections.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_143', 'port_995']) },
      { id: 'port_995',   term: 'Port 995',  expand: 'POP3S — POP3 over Implicit TLS',          def: 'POP3 with implicit TLS. Secure version of POP3 for email retrieval. Should replace port 110 for all client connections to prevent credential exposure.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_110', 'port_993']) },
      { id: 'port_1433',  term: 'Port 1433', expand: 'MSSQL — Microsoft SQL Server',            def: 'Default Microsoft SQL Server port. Never expose to internet directly. SQL injection vulnerabilities can enable xp_cmdshell for OS command execution. Require strong passwords and restrict source IPs.', moduleId: 'sec', topic: 'Ports & Services', related: r(['sqli', 'firewall', 'exploit', 'tool_nmap']) },
      { id: 'port_1521',  term: 'Port 1521', expand: 'Oracle DB — Oracle Database Listener',    def: 'Default Oracle Database listener port. TNS listener attacks and SQL injection are primary vectors. Should be firewalled; only application servers need direct DB access.', moduleId: 'sec', topic: 'Ports & Services', related: r(['sqli', 'firewall', 'exploit']) },
      { id: 'port_3306',  term: 'Port 3306', expand: 'MySQL — MySQL/MariaDB Database',           def: 'Default MySQL and MariaDB port. Frequently targeted in automated scans. Bind to localhost or restrict to app-server IPs only. SQL injection via web apps is the primary attack vector.', moduleId: 'sec', topic: 'Ports & Services', related: r(['sqli', 'firewall', 'exploit', 'port_1433']) },
      { id: 'port_3389',  term: 'Port 3389', expand: 'RDP — Remote Desktop Protocol',           def: 'Windows Remote Desktop. High-value target: BlueKeep (CVE-2019-0708), brute-force, and credential stuffing. Never expose to internet; use VPN gateway. Enable NLA and MFA. Patch immediately.', moduleId: 'sec', topic: 'Ports & Services', related: r(['brute_force', 'mitm', 'vpn', 'mfa', 'exploit']) },
      { id: 'port_5060',  term: 'Port 5060/5061', expand: 'SIP — VoIP Signaling',              def: 'Session Initiation Protocol for VoIP. Port 5060 (cleartext) / 5061 (TLS). SIP scanning can enumerate extensions; toll fraud via unauthorized calls is common. Use TLS and authenticate all endpoints.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'firewall', 'port_5061']) },
      { id: 'port_5061',  term: 'Port 5061', expand: 'SIPS — SIP over TLS',                     def: 'SIP over TLS for encrypted VoIP signaling. Protects call setup and authentication from eavesdropping. Should be used instead of port 5060 for all production VoIP deployments.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_5060']) },
      { id: 'port_8080',  term: 'Port 8080', expand: 'HTTP Alternate / Web Proxy',              def: 'Common alternate HTTP port for development servers, reverse proxies, and web caches. Often left open in firewalls as an "alternate" — attackers exploit this as a bypass. Treat identically to port 80.', moduleId: 'sec', topic: 'Ports & Services', related: r(['http', 'port_80', 'firewall', 'port_8443']) },
      { id: 'port_8443',  term: 'Port 8443', expand: 'HTTPS Alternate',                         def: 'Common alternate HTTPS port used by Tomcat, JBoss, Jenkins, and other middleware. Often misconfigured with self-signed certificates. Same security requirements as port 443.', moduleId: 'sec', topic: 'Ports & Services', related: r(['tls', 'port_443', 'port_8080', 'cert_auth']) },
    ],
  })

  // ── SYS-110: CLI Tools (CompTIA A+) ──────────────────────────────────────
  await prisma.term.createMany({
    data: [
      { id: 'cli_ipconfig',  term: 'ipconfig / ifconfig', expand: 'IP Configuration Utility',           def: 'Windows: `ipconfig` displays/releases/renews IP settings. Linux/macOS: `ifconfig` (legacy) or `ip addr`. `ipconfig /all` shows MAC, DHCP server, lease info. Essential first step in network troubleshooting.', moduleId: 'sys', topic: 'CLI Tools', related: r(['ip', 'dhcp', 'subnet', 'default_gw', 'cli_ping']) },
      { id: 'cli_ping',      term: 'ping',                 expand: 'ICMP Echo Test Utility',            def: 'Sends ICMP Echo Requests to test reachability and measure round-trip time. `ping 8.8.8.8` tests internet. `-t` (Windows) pings until stopped. If no response: host down, firewall blocking ICMP, or wrong IP.', moduleId: 'sys', topic: 'CLI Tools', related: r(['icmp', 'latency', 'cli_tracert', 'cli_ipconfig']) },
      { id: 'cli_tracert',   term: 'tracert / traceroute', expand: 'Network Path Tracer',               def: 'Maps each hop to a destination using TTL-expiry ICMP/UDP packets. Windows: `tracert`. Linux: `traceroute`. Identifies where packets are dropped or delayed. `*` = ICMP blocked at that hop.', moduleId: 'sys', topic: 'CLI Tools', related: r(['icmp', 'router', 'latency', 'cli_ping']) },
      { id: 'cli_netstat',   term: 'netstat',               expand: 'Network Statistics Utility',       def: '`netstat -an` lists all active connections and listening ports. `netstat -b` (Windows) shows the owning process. Used to detect unexpected listening services or active C2 connections.', moduleId: 'sys', topic: 'CLI Tools', related: r(['tcp', 'udp', 'process', 'port_443', 'c2']) },
      { id: 'cli_nslookup',  term: 'nslookup / dig',        expand: 'DNS Query Tool',                   def: '`nslookup` (Windows/cross-platform) and `dig` (Unix) query DNS servers interactively. Test A, MX, CNAME, TXT records. `nslookup -type=mx domain.com` checks mail server records.', moduleId: 'sys', topic: 'CLI Tools', related: r(['dns', 'port_53', 'cli_ipconfig']) },
      { id: 'cli_arp_cmd',   term: 'arp -a',                expand: 'ARP Cache Viewer',                 def: 'Displays the local ARP cache mapping IP addresses to MAC addresses. `arp -a` lists all entries. ARP poisoning (duplicate MACs) is visible here. Used to verify gateway MAC and detect MitM.', moduleId: 'sys', topic: 'CLI Tools', related: r(['arp', 'mac_addr', 'mitm', 'cli_ipconfig']) },
      { id: 'cli_dir',       term: 'dir / ls',              expand: 'Directory Listing Command',        def: 'Windows: `dir` lists files and folders. Unix: `ls -la` shows all files including hidden, with permissions, owner, and size. `dir /a` shows hidden files in Windows. Foundation of filesystem navigation.', moduleId: 'sys', topic: 'CLI Tools', related: r(['ntfs', 'ext4', 'cli_cd', 'cli_mkdir']) },
      { id: 'cli_cd',        term: 'cd / chdir',            expand: 'Change Directory Command',         def: 'Navigate the filesystem. `cd ..` moves up one level. `cd /` goes to root (Unix) or drive root. `cd %USERPROFILE%` (Windows) or `cd ~` (Unix) goes to home directory.', moduleId: 'sys', topic: 'CLI Tools', related: r(['cli_dir', 'process', 'ntfs']) },
      { id: 'cli_mkdir',     term: 'mkdir / md',            expand: 'Make Directory Command',           def: 'Creates a new directory. `mkdir -p /path/to/dir` (Unix) creates intermediate directories. `md` is the Windows shorthand. Permissions on newly created dirs inherit from parent or umask.', moduleId: 'sys', topic: 'CLI Tools', related: r(['cli_dir', 'ntfs', 'cli_del']) },
      { id: 'cli_del',       term: 'del / rm',              expand: 'Delete Files/Directories',         def: 'Windows: `del file.txt`, `rmdir /s /q dir`. Unix: `rm -rf dir` (irreversible — no recycle bin). `rm -rf /` is catastrophic. Always double-check the path before running recursive deletions.', moduleId: 'sys', topic: 'CLI Tools', related: r(['cli_dir', 'ntfs', 'cli_copy']) },
      { id: 'cli_copy',      term: 'copy / xcopy / robocopy', expand: 'File Copy Utilities',           def: 'Windows: `copy` (simple), `xcopy` (recursive, with attributes), `robocopy` (robust, resumable, log-capable). Unix: `cp -r`. `robocopy /MIR` mirrors source to dest including deletions.', moduleId: 'sys', topic: 'CLI Tools', related: r(['ntfs', 'raid', 'cli_dir', 'cli_del']) },
      { id: 'cli_diskpart',  term: 'diskpart / fdisk',      expand: 'Disk Partition Manager',           def: 'Windows: `diskpart` interactive tool to create, delete, format, and assign partitions. Unix: `fdisk`, `gdisk` (GPT), or `parted`. Required for MBR/GPT conversion and drive provisioning.', moduleId: 'sys', topic: 'CLI Tools', related: r(['mbr', 'gpt', 'ntfs', 'fat32', 'cli_chkdsk']) },
      { id: 'cli_chkdsk',    term: 'chkdsk / fsck',         expand: 'Filesystem Check Utility',         def: 'Scans and repairs filesystem errors. Windows: `chkdsk C: /f /r` fixes errors and recovers bad sectors. Unix: `fsck /dev/sda1` (must unmount first). Run after unclean shutdowns or disk errors.', moduleId: 'sys', topic: 'CLI Tools', related: r(['ntfs', 'hdd', 'ssd', 'bsod', 'cli_diskpart']) },
      { id: 'cli_sfc',       term: 'sfc /scannow',          expand: 'System File Checker',              def: 'Windows-only. Scans all protected OS files and replaces corrupted ones from a cached copy. Run as Administrator. `DISM /Online /Cleanup-Image /RestoreHealth` repairs the component store first if SFC fails.', moduleId: 'sys', topic: 'CLI Tools', related: r(['ntfs', 'driver', 'bsod', 'registry']) },
      { id: 'cli_net',       term: 'net user / net localgroup', expand: 'Windows User Management CLI', def: '`net user username password /add` creates a local user. `net localgroup Administrators username /add` elevates. `net user username /delete` removes. Widely used in post-exploitation for persistence.', moduleId: 'sys', topic: 'CLI Tools', related: r(['rbac', 'mfa', 'least_priv', 'cli_sc']) },
      { id: 'cli_sc',        term: 'sc / systemctl',        expand: 'Service Control Manager',          def: 'Windows: `sc query` lists services, `sc start/stop ServiceName`. Unix: `systemctl start/stop/status service`. Services run as SYSTEM by default in Windows — misconfigured service permissions are an escalation path.', moduleId: 'sys', topic: 'CLI Tools', related: r(['process', 'driver', 'cli_tasklist', 'cli_net']) },
      { id: 'cli_tasklist',  term: 'tasklist / ps',         expand: 'Process Listing Utility',          def: 'Windows: `tasklist` lists running processes with PID and memory. `tasklist /fi "imagename eq malware.exe"` filters. Unix: `ps aux` shows all processes. `top`/`htop` for live monitoring.', moduleId: 'sys', topic: 'CLI Tools', related: r(['process', 'cpu', 'ram', 'cli_taskkill', 'malware']) },
      { id: 'cli_taskkill',  term: 'taskkill / kill',       expand: 'Process Termination Utility',      def: 'Windows: `taskkill /PID 1234 /F` force-terminates a process. Unix: `kill -9 PID` sends SIGKILL (cannot be caught). Used to stop unresponsive processes or terminate detected malware processes.', moduleId: 'sys', topic: 'CLI Tools', related: r(['process', 'cli_tasklist', 'malware']) },
      { id: 'cli_regedit',   term: 'regedit',               expand: 'Windows Registry Editor',          def: 'GUI tool to view and edit the Windows registry. `reg query/add/delete` for scripted access. Registry Run keys (HKCU/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run) are common malware persistence locations.', moduleId: 'sys', topic: 'CLI Tools', related: r(['registry', 'malware', 'bsod', 'cli_sfc']) },
      { id: 'cli_gpupdate',  term: 'gpupdate /force',       expand: 'Group Policy Update',              def: 'Forces immediate reapplication of Group Policy Objects on a Windows machine. `gpupdate /force` refreshes both computer and user policy. Used after making AD policy changes without waiting for the default 90-min refresh cycle.', moduleId: 'sys', topic: 'CLI Tools', related: r(['rbac', 'least_priv', 'cli_net']) },
    ],
  })

  // ── SEC-201: Security Tools ───────────────────────────────────────────────
  await prisma.term.createMany({
    data: [
      { id: 'tool_nmap',      term: 'Nmap',              expand: 'Network Mapper',                      def: 'Open-source network scanner. `nmap -sV -O target` detects open ports, services, and OS. `-sS` SYN scan is stealthy. `--script vuln` runs NSE vulnerability scripts. Used in reconnaissance phase of penetration tests.', moduleId: 'sec', topic: 'Security Tools', related: r(['tool_wireshark', 'vuln_scan', 'pentest', 'port_22', 'port_443', 'firewall']) },
      { id: 'tool_tcpdump',   term: 'tcpdump',           expand: 'CLI Packet Capture Tool',             def: 'Command-line packet analyzer. `tcpdump -i eth0 port 80 -w capture.pcap` captures HTTP traffic to file. Reads the same pcap format as Wireshark. Essential for network forensics and troubleshooting on headless servers.', moduleId: 'sec', topic: 'Security Tools', related: r(['tool_wireshark', 'tcp', 'udp', 'mitm', 'forensics']) },
      { id: 'tool_wireshark', term: 'Wireshark',         expand: 'GUI Packet Analyzer',                 def: 'GUI-based network protocol analyzer. Captures and dissects packets in real time. Display filters (e.g. `http.request`, `tcp.port==443`) isolate traffic. Decrypts TLS if session keys are available. Critical for incident response.', moduleId: 'sec', topic: 'Security Tools', related: r(['tool_tcpdump', 'tcp', 'tls', 'mitm', 'incident_resp']) },
      { id: 'tool_chmod',     term: 'chmod / icacls',    expand: 'Permission Management Commands',      def: 'Unix: `chmod 644 file` (owner rw, group/other r). `chmod 700 script.sh` (owner rwx only). Windows: `icacls file /grant user:F`. Misconfigured permissions (world-writable files, SUID binaries) are common privilege-escalation vectors.', moduleId: 'sec', topic: 'Security Tools', related: r(['rbac', 'acl', 'least_priv', 'exploit']) },
      { id: 'tool_openssl',   term: 'openssl',           expand: 'TLS/PKI Command-Line Toolkit',        def: 'Generates keys and CSRs: `openssl req -new -key priv.key -out csr.csr`. Tests TLS: `openssl s_client -connect host:443`. Inspects certs: `openssl x509 -text -in cert.pem`. Core tool for PKI management.', moduleId: 'sec', topic: 'Security Tools', related: r(['tls', 'pki', 'rsa', 'cert_auth', 'tool_sshkeygen']) },
      { id: 'tool_sshkeygen', term: 'ssh-keygen',        expand: 'SSH Key Pair Generator',              def: '`ssh-keygen -t ed25519 -C "comment"` generates an Ed25519 key pair. Public key goes to `~/.ssh/authorized_keys` on target. Eliminates password-based SSH auth. Private key should be passphrase-protected.', moduleId: 'sec', topic: 'Security Tools', related: r(['ssh', 'rsa', 'port_22', 'tool_openssl', 'mfa']) },
      { id: 'tool_curl',      term: 'curl / wget',       expand: 'HTTP Command-Line Clients',           def: '`curl -I url` shows response headers. `curl -X POST -d data url` sends form data. `wget url` downloads files. Used in security to test API endpoints, check redirects, and verify TLS configurations without a browser.', moduleId: 'sec', topic: 'Security Tools', related: r(['http', 'tls', 'port_80', 'port_443', 'tool_nmap']) },
      { id: 'tool_gpg',       term: 'GPG',               expand: 'GNU Privacy Guard',                   def: 'Open-source implementation of OpenPGP. `gpg --gen-key` creates a key pair. `gpg -e -r recipient file` encrypts. `gpg --sign file` signs. Used for email encryption (PGP), package signing (apt, rpm), and file integrity.', moduleId: 'sec', topic: 'Security Tools', related: r(['digital_sig', 'rsa', 'asym_enc', 'hash_fn', 'pki']) },
      { id: 'tool_nessus',    term: 'Nessus / OpenVAS',  expand: 'Vulnerability Scanners',              def: 'Automated vulnerability assessment tools. Nessus (commercial, Tenable) and OpenVAS (open-source) compare system configurations against CVE databases, generating CVSS-scored findings with remediation guidance.', moduleId: 'sec', topic: 'Security Tools', related: r(['vuln_scan', 'vuln', 'zero_day', 'tool_nmap', 'pentest']) },
      { id: 'tool_metasploit',term: 'Metasploit',        expand: 'Penetration Testing Framework',       def: 'Open-source exploit development and delivery framework (msfconsole). Contains hundreds of verified exploits, payloads (Meterpreter), and post-exploitation modules. Used exclusively for authorized penetration testing.', moduleId: 'sec', topic: 'Security Tools', related: r(['exploit', 'pentest', 'vuln', 'buffer_overflow', 'tool_nessus']) },
      { id: 'tool_burpsuite', term: 'Burp Suite',        expand: 'Web Application Security Proxy',      def: 'Intercepts and modifies HTTP/S traffic between browser and server. Finds XSS, SQLi, CSRF, IDOR, and other web vulnerabilities. The Repeater and Scanner modules are core to web application penetration testing.', moduleId: 'sec', topic: 'Security Tools', related: r(['xss', 'sqli', 'csrf', 'pentest', 'tls']) },
      { id: 'tool_johnripper', term: 'John the Ripper',  expand: 'Password Cracking Tool',              def: 'Offline password cracker supporting hundreds of hash types. `john --wordlist=rockyou.txt hashes.txt` runs dictionary attack. Highlights weak passwords in post-compromise audits. Use only on hashes you are authorized to test.', moduleId: 'sec', topic: 'Security Tools', related: r(['hash_fn', 'brute_force', 'rainbow_table', 'salting', 'tool_hashcat']) },
      { id: 'tool_hashcat',   term: 'Hashcat',           expand: 'GPU-Accelerated Hash Cracker',        def: 'GPU-accelerated password recovery tool. Supports mask attacks, rule-based mutations, and combination attacks. Orders of magnitude faster than CPU-based crackers for common hash types (MD5, bcrypt, NTLM).', moduleId: 'sec', topic: 'Security Tools', related: r(['hash_fn', 'brute_force', 'salting', 'tool_johnripper', 'rainbow_table']) },
      { id: 'tool_aircrack',  term: 'Aircrack-ng',       expand: 'Wireless Security Audit Suite',       def: 'Suite for auditing Wi-Fi security. Captures WPA2 handshakes (airodump-ng), then cracks the PSK offline with a dictionary (aircrack-ng). Highlights why strong, unique Wi-Fi passwords and WPA3 are necessary.', moduleId: 'sec', topic: 'Security Tools', related: r(['brute_force', 'hash_fn', 'tool_hashcat']) },
      { id: 'tool_netcat',    term: 'Netcat (nc)',        expand: 'Network Swiss Army Knife',            def: '`nc -lvp 4444` listens on port 4444. `nc host 80` connects. Used for port scanning, file transfer, and creating reverse/bind shells. Often called the "Swiss Army knife" of networking. Frequently abused by attackers.', moduleId: 'sec', topic: 'Security Tools', related: r(['tcp', 'port_22', 'tool_nmap', 'c2', 'tool_tcpdump']) },
      { id: 'tool_snort',     term: 'Snort / Suricata',  expand: 'Open-Source IDS/IPS Engines',         def: 'Snort and Suricata are signature-based network intrusion detection/prevention engines. Inspect packets in real time against rule sets. Suricata supports multi-threading and can block traffic inline (IPS mode).', moduleId: 'sec', topic: 'Security Tools', related: r(['ids', 'ips', 'ddos', 'firewall', 'siem']) },
    ],
  })

  // ── Stats ─────────────────────────────────────────────────────────────────
  await prisma.userStats.create({
    data: {
      streak: 12,
      correct: 7,
      wrong: 2,
      activity: JSON.stringify(
        Array.from({ length: 28 }, (_, i) => {
          const seed = (i * 9301 + 49297) % 233280
          return Math.round((seed / 233280) * 30)
        })
      ),
    },
  })

  // ── Default user ──────────────────────────────────────────────────────────
  await prisma.user.deleteMany()
  const hash = await bcrypt.hash('password', 10)
  await prisma.user.create({ data: { username: 'student', password: hash } })

  const termCount = await prisma.term.count()
  console.log(`Seed complete. ${termCount} terms, 1 default user (student/password).`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
