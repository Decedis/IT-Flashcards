import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env['DATABASE_URL'] ?? 'file:./prisma/dev.db' })
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

  const termCount = await prisma.term.count()
  console.log(`Seed complete. ${termCount} terms across 4 modules.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
