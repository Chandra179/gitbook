# Syncthing

### ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYNCTHING SYSTEM ARCHITECTURE                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        USER INTERFACE LAYER                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │   Web GUI    │  │   REST API   │  │   CLI (syncthing cli)    │   │    │
│  │  │  (gui/)      │  │  (gui.go)    │  │   (cmd/syncthing/)       │   │    │
│  │  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘   │    │
│  └─────────┼─────────────────┼───────────────────────┼─────────────────┘    │
│            │                 │                       │                      │
│  ┌─────────▼─────────────────▼───────────────────────▼─────────────────┐    │
│  │                      CONFIGURATION LAYER                            │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  lib/config/  (config.go, wrapper.go, folderconfig.go)       │   │    │
│  │  │  - Device list & Device IDs                                  │   │    │
│  │  │  - Folder definitions & Folder IDs                           │   │    │
│  │  │  - GUI settings, listen addresses, discovery settings        │   │    │
│  │  │  - Persisted as config.xml                                   │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│            │                                                                │
│  ┌─────────▼───────────────────────────────────────────────────────────┐    │
│  │                        CORE ORCHESTRATION LAYER                     │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  lib/model/ (model.go, folder.go, requests.go)               │   │    │
│  │  │  - The "brain" of Syncthing                                  │   │    │
│  │  │  - Coordinates all subsystems                                │   │    │
│  │  │  - Implements sync logic, conflict resolution, versioning    │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    
│            │                                                                 
│  ┌─────────┼─────────────────────────────────────────────────────────┐      │
│  │         │              SUBSYSTEM LAYERS                           │      │
│  │         │                                                         │      │
│  │  ┌──────▼──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │      │
│  │  │ CONNECTIONS │  │ SCANNER  │  │ DATABASE │  │  FILE    │        │      │
│  │  │             │  │          │  │          │  │  SYSTEM  │        │      │
│  │  │lib/         │  │lib/      │  │lib/db/   │  │lib/fs/   │        │      │
│  │  │connections/ │  │scanner/  │  │          │  │          │        │      │
│  │  │             │  │          │  │          │  │          │        │      │
│  │  │- TCP/QUIC   │  │- Walk    │  │- FileSet │  │- Watch   │        │      │
│  │  │  listeners  │  │  dirs    │  │- Meta    │  │- Basic   │        │      │
│  │  │- TLS mTLS   │  │- Hash    │  │- Trans-  │  │  FS ops  │        │      │
│  │  │- Discovery  │  │  blocks  │  │  actions │  │- Temp    │        │      │
│  │  │- Relay      │  │- Build   │  │- Block   │  │  files   │        │      │
│  │  │  clients    │  │  index   │  │  tracking│  │          │        │      │
│  │  └──────┬──────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │      │
│  │         │              │             │             │              │      │
│  └─────────┼──────────────┼─────────────┼─────────────┼──────────────┘      │
│            │              │             │             │                     │
│  ┌─────────▼──────────────▼─────────────▼─────────────▼────────────────┐    │
│  │                      PROTOCOL LAYER                                 │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │  lib/protocol/ (protocol.go, encryption.go, deviceid.go)     │   │    │
│  │  │  - Wire format (Protocol Buffers)                            │   │    │
│  │  │  - Block exchange protocol                                   │   │    │
│  │  │  - Index exchange protocol                                   │   │    │
│  │  │  - TLS wrapping & certificate handling                       │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      INFRASTRUCTURE SERVICES                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │  Discovery   │  │    Relay     │  │   Upgrade / Crash        │   │    │
│  │  │   Server     │  │   Server     │  │   Reporting Services     │   │    │
│  │  │ cmd/         │  │ cmd/         │  │                          │   │    │
│  │  │ stdiscosrv/  │  │ strelaysrv/  │  │ cmd/stupgrades/ etc.     │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

***

### SECTION 1: IDENTITY CREATION & FIRST LAUNCH

#### Purpose

Create a permanent, self-sovereign cryptographic identity for this device. No central authority, no registration, no cloud dependency.

#### Files Involved

| File                       | Role                                    |
| -------------------------- | --------------------------------------- |
| `cmd/syncthing/main.go`    | Entry point, orchestrates startup       |
| `lib/tlsutil/tlsutil.go`   | Certificate & key generation            |
| `lib/protocol/deviceid.go` | Device ID derivation from certificate   |
| `lib/config/config.go`     | Default configuration creation          |
| `lib/locations/`           | OS-specific config directory resolution |

#### Step-by-Step Flow

```
FIRST LAUNCH SEQUENCE
=====================

STEP 1.1: ENTRY POINT
---------------------
File: cmd/syncthing/main.go: main() → syncthingMain()

1. Parse command-line flags (-home, -gui-address, etc.)
2. Set up logging (lib/logger/)
3. Determine config directory:
   - Linux:   ~/.config/syncthing/   (or $XDG_CONFIG_HOME)
   - macOS:   ~/Library/Application Support/Syncthing/
   - Windows: %LocalAppData%\Syncthing\
4. If directory doesn't exist, create it


STEP 1.2: CERTIFICATE GENERATION
--------------------------------
File: lib/tlsutil/tlsutil.go: NewCertificate(certFile, keyFile)

1. Check if cert.pem and key.pem exist in config directory
2. If YES → load existing certificate (skip generation)
3. If NO:
   a. Generate ECDSA private key (curve P-256)
      ecdsa.GenerateKey(elliptic.P256(), cryptoRand.Reader)

   b. Create X.509 certificate template:
      SerialNumber: random (crypto/rand)
      NotBefore:    time.Now()
      NotAfter:     time.Now() + 100 years
      KeyUsage:     Digital Signature
      ExtKeyUsage:  Client Auth, Server Auth
      CommonName:   random string (privacy)

   c. Self-sign: cert.SignedBy(itself)
   d. Encode as PEM and write to disk:
      - cert.pem (public certificate)
      - key.pem  (private key, permissions 0600)

SECURITY: key.pem NEVER leaves this device. cert.pem is shared
during TLS handshake but is useless without key.pem.


STEP 1.3: DEVICE ID DERIVATION
------------------------------
File: lib/protocol/deviceid.go: NewDeviceID(cert)

1. Extract raw public key bytes from certificate:
   pubKeyBytes = x509.MarshalPKIXPublicKey()
   (DER-encoded, subjectPublicKeyInfo)

2. Compute SHA-256 hash of the DER-encoded public key:
   hash = sha256.Sum256(pubKeyBytes)
   (32 bytes = 256 bits)

3. Encode as Base32 with Luhn-like checksum:
   raw = base32.Encode(hash)
   chunks = split into 7 groups of ~8 chars
   checksum = Luhn mod 32 of all chunks
   deviceID = chunks + "-" + checksum

Example Device ID:
ABCDEFG-HIJKLMN-OPQRSTU-VWXYZ12-3456789-ABCDEFG-HIJKLMN-OPQRSTU

PROPERTIES:
- Cryptographically bound to the certificate (cannot be forged)
- Human-verifiable via checksum (typos detected)
- QR-code friendly
- No personal information embedded


STEP 1.4: DEFAULT CONFIGURATION CREATION
----------------------------------------
File: lib/config/config.go: DefaultConfig(myDeviceID)

Creates config.xml with:

<configuration version="37">
  <device id="MY-DEVICE-ID" name="my-computer"
          compression="metadata" introducer="false">
    <address>dynamic</address>
  </device>
  <folder id="abc123..." label="Default Folder"
          path="~/Sync" type="sendreceive"
          rescanIntervalS="3600" fsWatcherEnabled="true">
    <device id="MY-DEVICE-ID"/>
  </folder>
  <gui enabled="true" tls="false">
    <address>127.0.0.1:8384</address>
  </gui>
  <options>
    <listenAddress>default</listenAddress>
    <globalAnnounceServer>default</globalAnnounceServer>
    <relaysEnabled>true</relaysEnabled>
  </options>
</configuration>

STARTUP COMPLETE: Device has identity, default folder, and is ready.
```

***

### SECTION 2: ADDING A REMOTE DEVICE (Trust Bootstrapping)

#### Purpose

Establish a trusted relationship with another Syncthing device. This is the ONLY manual step in the entire system and the foundation of all security.

#### Files Involved

| File                          | Role                                           |
| ----------------------------- | ---------------------------------------------- |
| `gui/default/index.html` + JS | Web interface for entering Device IDs          |
| `cmd/syncthing/gui.go`        | REST API handler for config changes            |
| `lib/config/config.go`        | Configuration persistence                      |
| `lib/model/model.go`          | Reacts to config changes, initiates connection |

#### Step-by-Step Flow

text

```
ADDING A REMOTE DEVICE
======================

PREREQUISITE: OUT-OF-BAND DEVICE ID EXCHANGE (Manual, Human-Verified)
---------------------------------------------------------------------

YOU (Device A)                    FRIEND (Device B)
┌──────────────┐                 ┌──────────────┐
│ Device ID:   │                 │ Device ID:   │
│ ABCD-EFGH... │                 │ WXYZ-1234... │
│              │                 │              │
│ [QR Code]    │                 │ [QR Code]    │
└──────────────┘                 └──────────────┘

Exchange methods (trusted channel):
• Scan QR code in person
• Send via Signal/WhatsApp (encrypted messenger)
• Read over phone call
• Email (less secure, but still requires MITM to exploit)

⚠️  NEVER trust a Device ID received through an untrusted channel!


STEP 2.1: ENTER DEVICE ID IN WEB GUI
------------------------------------
File: gui/default/index.html (Web GUI)

1. User clicks "Add Remote Device"
2. Enters/pastes friend's Device ID: "WXYZ-1234-..."
3. Optionally sets:
   - Device name (friendly label)
   - Compression (metadata only / always / never)
   - Introducer flag (can this device introduce others?)
   - Addresses (tcp://ip:port for static IPs)
4. GUI validates checksum client-side before submission


STEP 2.2: REST API CALL
-----------------------
File: cmd/syncthing/gui.go: handle POST /rest/config/devices

1. Receive JSON: { "deviceID": "WXYZ-...", "name": "Friend's PC" }
2. Validate Device ID format and checksum (lib/protocol/)
3. Call config.Wrapper.SetDevice(deviceCfg)


STEP 2.3: PERSIST TO CONFIGURATION
----------------------------------
File: lib/config/config.go: SetDevice()

1. Add device entry to in-memory configuration:
   <device id="WXYZ-1234-..." name="Friend's PC">
     <address>dynamic</address>
     <compression>metadata</compression>
   </device>

2. Write updated config.xml to disk
3. Notify all subscribers (via callback/observer pattern)
   that device list has changed


STEP 2.4: MODEL REACTS TO CONFIG CHANGE
---------------------------------------
File: lib/model/model.go: deviceAdded(deviceID)

1. Model receives configuration change notification
2. Creates internal device connection handle
3. Signals connection service: "Try to connect to this Device ID"
4. Connection service begins discovery (see Section 3)


STEP 2.5: FOLDER SHARING (Optional but Typical)
-----------------------------------------------
User selects a folder in GUI and adds the remote device to it.

Config update:
<folder id="folder-abc123..." ...>
  <device id="MY-DEVICE-ID"/>  <!-- me -->
  <device id="WXYZ-1234..."/>  <!-- friend (NEW) -->
</folder>

This triggers:
1. Local device now expects to sync this folder with friend
2. On next connection to friend, a "folder suggestion" is sent
   (protocol ClusterConfig message)
3. Friend's Syncthing shows: "Device ABCD-... wants to share
   folder 'Documents' with you. Accept?"
4. If friend accepts, folder is added to THEIR config too
```

***

### SECTION 3: CONNECTION ESTABLISHMENT (Discovery + TLS + Multiplexing)

#### Purpose

Find the remote device on the network and establish a secure, authenticated, multiplexed connection.

#### Files Involved

| File                               | Role                                       |
| ---------------------------------- | ------------------------------------------ |
| `lib/connections/service.go`       | Main connection orchestrator               |
| `lib/connections/tcp_listener.go`  | TCP socket listener                        |
| `lib/connections/quic_listener.go` | QUIC socket listener                       |
| `lib/discover/local.go`            | LAN broadcast discovery                    |
| `lib/discover/global.go`           | Global discovery (DHT-like)                |
| `lib/discover/cache.go`            | Cached addresses from previous connections |
| `lib/tlsutil/tlsutil.go`           | TLS configuration and verification         |
| `lib/protocol/protocol.go`         | Connection multiplexing & wire protocol    |
| `lib/relay/client/`                | Relay connection client                    |

#### Step-by-Step Flow

```
CONNECTION ESTABLISHMENT
========================

STEP 3.1: START LISTENERS
-------------------------
File: lib/connections/service.go: Serve()

1. Read listen addresses from config:
   Default: "tcp://0.0.0.0:22000, quic://0.0.0.0:22000"

2. Start TCP listener (lib/connections/tcp_listener.go):
   net.Listen("tcp", "0.0.0.0:22000")
   for each incoming connection:
      conn = listener.Accept()
      tlsConn = tls.Server(conn, tlsConfig)  ← see step 3.4
      handleConnection(tlsConn)

3. Start QUIC listener (lib/connections/quic_listener.go):
   quic.ListenAddr("0.0.0.0:22000", tlsConfig, ...)
   for each incoming session:
      handleConnection(session)

Both TCP and QUIC share port 22000 (QUIC runs over UDP)


STEP 3.2: DEVICE DISCOVERY (Finding the Remote Device's IP)
-----------------------------------------------------------
The connection service tries MULTIPLE discovery methods in PARALLEL:

METHOD 1: LOCAL DISCOVERY (LAN)
File: lib/discover/local.go

Device A (you):
  1. Send IPv4 broadcast: 255.255.255.255:21027
  2. Send IPv6 multicast: [ff12::8384]:21027
  3. Message contains: "I am Device ABCD-..., at 192.168.1.5"
  4. Repeat every ~30 seconds

Device B (friend):
  1. Listens on port 21027 for broadcasts
  2. Receives: "Device ABCD-... at 192.168.1.5"
  3. Checks: "Do I have ABCD-... in my config?" → YES
  4. Replies directly: "I am WXYZ-... at 192.168.1.10:22000"

Result: Both devices know each other's LAN IPs within seconds
No internet required!


METHOD 2: GLOBAL DISCOVERY (Internet)
File: lib/discover/global.go

Architecture: Distributed Hash Table (DHT) of discovery servers

┌──────────────────────────────────────────────────┐
│  Global Discovery Servers (community-run)        │
│  discovery.syncthing.net (default, public)       │
│  discovery-v6.syncthing.net                      │
│  (You can run your own: cmd/stdiscosrv/)         │
└──────────────────────────────────────────────────┘
     ▲                               ▲
     │ Announce (encrypted)          │ Announce (encrypted)
     │                               │
┌────┴─────┐                    ┌────┴─────┐
│ Device A │                    │ Device B │
│ (you)    │                    │ (friend) │
└──────────┘                    └──────────┘

Step by step:
1. Device A connects to discovery.syncthing.net:443 (HTTPS)
2. A announces: "I'm at IP 203.0.113.5, looking for WXYZ-..."
3. Device B also announces: "I'm at IP 198.51.100.10, looking for ABCD-..."
4. Server matches: both looking for each other!
5. Server tells A: "WXYZ-... is at 198.51.100.10:22000"
6. Server tells B: "ABCD-... is at 203.0.113.5:22000"

PRIVACY: Discovery server sees:
- Opaque Device IDs (just random-looking strings)
- IP addresses
Server does NOT see:
- File names, folder names, file contents
- Any data that could identify the user
Announcements are encrypted with the device's key


METHOD 3: STATIC ADDRESSES (Manual)
File: lib/connections/service.go

If user configured: <address>tcp://1.2.3.4:22000</address>
→ Dial directly to that address, no discovery needed


METHOD 4: ADDRESS CACHE
File: lib/discover/cache.go

Previously successful addresses are cached to disk
On restart, try cached addresses immediately (fast reconnect)

All methods run in PARALLEL. First successful connection wins.


STEP 3.3: DIAL ATTEMPT
----------------------
File: lib/connections/service.go: connect()

For each discovered address, try to connect:

1. net.Dial("tcp", "198.51.100.10:22000")
2. Wrap in TLS: tls.Client(rawConn, tlsConfig)

   tlsConfig = &tls.Config{
     Certificates:       []tls.Certificate{myCert},
     MinVersion:         tls.VersionTLS12,
     InsecureSkipVerify: true,  ← NO CA verification!
     VerifyPeerCertificate: customVerifyFunc, ← MANUAL CHECK
     ServerName:         "",     ← not used
   }


STEP 3.4: MUTUAL TLS HANDSHAKE (The Critical Security Step)
----------------------------------------------------------

DEVICE A (you)                          DEVICE B (friend)
┌─────────────────┐                    ┌─────────────────┐
│ cert_A (ABCD..) │                    │ cert_B (WXYZ..) │
│ key_A  (secret) │                    │ key_B  (secret) │
└─────────────────┘                    └─────────────────┘
        │                                       │
        │  1. TCP/QUIC Connect                  │
        │──────────────────────────────────────>│
        │                                       │
        │  2. TLS ClientHello                   │
        │<──────────────────────────────────────│
        │                                       │
        │  3. ServerHello + cert_A.pem          │
        │──────────────────────────────────────>│
        │                                       │
        │  4. cert_B.pem                        │
        │<──────────────────────────────────────│
        │                                       │
5. VERIFY PEER:           │     6. VERIFY PEER:
┌─────────────────────┐   │    ┌─────────────────────┐
│ receivedCert = conn │   │    │ receivedCert = conn │
│   .PeerCertificates │   │    │   .PeerCertificates │
│                     │   │    │                     │
│ pubKey = received   │   │    │ pubKey = received   │
│   .PublicKey        │   │    │   .PublicKey        │
│                     │   │    │                     │
│ hash = SHA256(      │   │    │ hash = SHA256(      │
│   pubKey.DER())     │   │    │   pubKey.DER())     │
│                     │   │    │                     │
│ candidateID =       │   │    │ candidateID =       │
│   base32(hash)      │   │    │   base32(hash)      │
│                     │   │    │                     │
│ IS candidateID      │   │    │ IS candidateID      │
│ IN config.xml       │   │    │ IN config.xml       │
│ device list?        │   │    │ device list?        │
│                     │   │    │                     │
│ YES → "WXYZ-..." ✓  │   │    │ YES → "ABCD-..." ✓  │
│ Allowed!            │   │    │ Allowed!            │
└─────────────────────┘   │    └─────────────────────┘
        │                                        │
        │  7. TLS Handshake Complete             │
        │<────────── ENCRYPTED CHANNEL ─────────>│
        │                                        │

⚠️  NO Certificate Authority (CA) involved!
⚠️  Trust is purely: "This cert hashes to a Device ID I know"
⚠️  If hash doesn't match any known Device ID → connection REJECTED

Code: lib/tlsutil/tlsutil.go → VerifyPeerCertificate callback


STEP 3.5: PROTOCOL NEGOTIATION
------------------------------
File: lib/protocol/protocol.go: connection handshake

After TLS, devices exchange a "Hello" message:

Device A sends:                    Device B sends:
{                                  {
  deviceID: "ABCD-...",              deviceID: "WXYZ-...",
  clientName: "syncthing",           clientName: "syncthing",
  clientVersion: "v2.1.0",           clientVersion: "v2.1.0",
}                                  }

1. Both verify: received deviceID matches the TLS-verified identity
2. Exchange "ClusterConfig" (which folders are shared with whom)
3. Connection is now fully established


STEP 3.6: CONNECTION MULTIPLEXING
---------------------------------
File: lib/protocol/protocol.go: Connection Multiplexing

One TCP/QUIC connection = Multiple logical streams:

┌──────────────────────────────────────────────────────────────────┐
│  PHYSICAL CONNECTION (TLS 1.3 encrypted)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Stream 0: Index Data (metadata exchange)                  │  │
│  │  Stream 1: Block Request (outgoing: "give me block 5")     │  │
│  │  Stream 2: Block Response (incoming: "here's block 5")     │  │
│  │  Stream 3: Block Request (file B)                          │  │
│  │  Stream 4: Block Response (file B)                         │  │
│  │  Stream 5: Ping/Pong keepalive                             │  │
│  │  Stream 6: ClusterConfig updates                           │  │
│  │  ... (more as needed)                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

How multiplexing works:
- Each message has a header: [streamID | messageType | length]
- Messages on different streams are independent
- Can interleave: Stream 1 msg, Stream 3 msg, Stream 1 msg, etc.
- Each stream has its own sequence numbers for ordering
- Go goroutines handle each stream concurrently

PARALLEL TRANSFER CAPABILITY:
- Multiple files can transfer simultaneously (different streams)
- Within one file, multiple block requests can be in-flight
- Default: up to 4 concurrent file transfers per device
- Within a file: up to 16 outstanding block requests at once
- Blocks can arrive OUT OF ORDER and are written to correct offset
```

***

### SECTION 4: FILE SYNCHRONIZATION (The Core Loop)

#### Purpose

Detect which files need to be transferred, transfer only the changed blocks, verify integrity, handle conflicts.

#### Files Involved

| File                       | Role                                        |
| -------------------------- | ------------------------------------------- |
| `lib/model/model.go`       | Core sync orchestrator, puller/pusher logic |
| `lib/model/folder.go`      | Per-folder state management                 |
| `lib/model/requests.go`    | Block request handling                      |
| `lib/scanner/walk.go`      | File system walking & block hashing         |
| `lib/db/set.go`            | Index database (FileSet)                    |
| `lib/db/meta.go`           | Metadata storage                            |
| `lib/db/transactions.go`   | DB transaction support                      |
| `lib/protocol/protocol.go` | Index & block exchange wire protocol        |
| `lib/fs/walk.go`           | File system abstraction for scanning        |
| `lib/fs/watch.go`          | Real-time file change notifications         |
| `lib/versioner/`           | File versioning strategies                  |

#### Step-by-Step Flow

```
FILE SYNCHRONIZATION
====================

STEP 4.1: INITIAL LOCAL INDEXING (Scanner)
------------------------------------------
File: lib/scanner/walk.go: Walk() → hashFile()

When a folder is first added or rescanned:

1. Walk the folder recursively (lib/fs/walk.go)
2. For each file:
   a. Stat file: get size, modification time, permissions

   b. Open file for reading

   c. Read in 128 KiB blocks (default BlockSize):
      buf := make([]byte, blockSize)  // 131072 bytes
      for offset := 0; offset < fileSize; offset += n {
          n, _ = io.ReadFull(file, buf)
          hash = sha256.Sum256(buf[:n])
          blocks = append(blocks, BlockInfo{
              Offset: offset,
              Size:   n,
              Hash:   hash[:],   // 32 bytes
          })
      }

   d. Build FileInfo:
      {
        Name:        "photos/sunset.jpg",
        Size:        2097152,        // 2 MB
        ModifiedS:   1716150000,     // Unix timestamp
        Permissions: 0644,
        Version:     Vector{{MyID: 1}}, // initial version
        Blocks: [
          {Offset: 0,       Size: 131072, Hash: 0xA1B2...},
          {Offset: 131072,  Size: 131072, Hash: 0xC3D4...},
          ... (16 blocks for 2 MB file)
        ],
      }

3. Store all FileInfos in local database (lib/db/set.go)
   db.Set.Update(folderID, []protocol.FileInfo{...})
   - Key-Value store (LevelDB or Badger, depending on version)
   - Key:   folderID + filename
   - Value: serialized FileInfo (protobuf)


STEP 4.2: INDEX EXCHANGE (Sharing Metadata)
-------------------------------------------
Files: lib/model/model.go: sendIndexes() / receiveIndex()
       lib/protocol/protocol.go: Index message serialization

When two devices connect and share a folder:

Device A (you)                              Device B (friend)
┌────────────────┐                         ┌────────────────┐
│ Local Index:   │                         │ Local Index:   │
│ report.pdf v3  │                         │ report.pdf v2  │
│ photo.jpg  v1  │                         │ notes.txt  v1  │
│ notes.txt  v5  │                         │                │
└────────────────┘                         └────────────────┘
        │                                          │
        │  1. Send Index (all FileInfos)           │
        │─────────────────────────────────────────>│
        │                                          │
        │  2. Send Index (all FileInfos)           │
        │<─────────────────────────────────────────│
        │                                          │

THE INDEX CONTAINS METADATA ONLY:
- File names and paths
- Sizes, modification times, permissions
- SHA-256 hashes of every block (NOT the block data itself)
- Version vectors (modification counters)

THE INDEX DOES NOT CONTAIN:
- Actual file contents/bytes
- Any data that could be used without the actual files


STEP 4.3: COMPARISON (Determining What to Sync)
-----------------------------------------------
File: lib/model/model.go: diffIndexes(localIndex, remoteIndex)

For each file in the combined set of filenames:

CASE 1: File only exists locally, not remotely
  Local:  photo.jpg v1
  Remote: (not present)
  → ACTION: Mark for PUSH to remote

CASE 2: File only exists remotely, not locally
  Local:  (not present)
  Remote: notes.txt v1
  → ACTION: Mark for PULL from remote

CASE 3: File exists on both, same version vector
  Local:  photo.jpg v1
  Remote: photo.jpg v1
  → VERIFY: Compare block hashes
  → If all hashes match: IN SYNC (no action)
  → If hash mismatch: treat as conflict (rare, indicates
    corruption or hash collision)

CASE 4: One version is strictly newer (higher counter)
  Local:  report.pdf v3
  Remote: report.pdf v2
  → Local is newer → ACTION: PUSH to remote

CASE 5: CONFLICT - Both have changed independently
  Local:  report.pdf v3{[A]=3}
  Remote: report.pdf v3{[B]=3}
  Same version number, but different actors!
  → CONFLICT DETECTED


STEP 4.4: CONFLICT RESOLUTION
-----------------------------
File: lib/model/model.go: resolveConflict()

When both devices modified the same file since last sync:

1. Compare version vectors:
   Vector comparison is NOT "highest number wins"
   It's "is one a direct ancestor of the other?"

   Example 1 (No conflict):
   Local:  {[A]: 5, [B]: 3}
   Remote: {[A]: 4, [B]: 3}
   → Local has A=5 while Remote has A=4
   → Remote's state is an ANCESTOR of Local's state
   → Local WINS, no conflict

   Example 2 (CONFLICT):
   Local:  {[A]: 5, [B]: 3}
   Remote: {[A]: 4, [B]: 5}
   → Neither is ancestor of the other
   → TRUE CONFLICT

2. Conflict handling:
   a. The "winning" side: file with the LARGER version vector
      (lexicographic comparison if tied)
      → This file keeps the original filename

   b. The "losing" side: file is RENAMED to:
      report.sync-conflict-20260519-143052-WXYZ123.txt
      (original name, "sync-conflict", timestamp, device ID)

   c. BOTH files are synced to BOTH devices
   d. NO DATA IS LOST


STEP 4.5: BLOCK-LEVEL TRANSFER (Pull Logic)
-------------------------------------------
Files: lib/model/model.go: puller logic (handleFile, pullerIteration)
       lib/model/requests.go: requestBlock()

For each file marked as PULL:

PHASE A: Determine needed blocks

  IF file doesn't exist locally:
    → Need ALL blocks from remote index

  IF file exists locally (older version):
    → Compute SHA-256 of each block of LOCAL file
    → Compare with REMOTE index block hashes:

      Local blocks:        Remote index:        Action:
      [0] 0xABC...   ==    [0] 0xABC...   →   REUSE ✓
      [1] 0xDEF...   !=    [1] 0xXYZ...   →   REQUEST
      [2] 0xGHI...   ==    [2] 0xGHI...   →   REUSE ✓
      [3] 0xJKL...   !=    [3] 0xPQR...   →   REQUEST

    → Only request blocks [1] and [3]!
    → Copy reusable blocks from old file to temp file

PHASE B: Create temporary file

  tempFile = os.CreateTemp(folderPath, ".syncthing.tmp")

  If reusable blocks exist:
    for each reusable block:
      oldFile.ReadAt(buf, block.Offset)
      tempFile.WriteAt(buf, block.Offset)

PHASE C: Request and receive blocks (PARALLEL)

  // Send requests for up to 16 blocks at once
  inFlight := 0
  maxInFlight := 16
  pendingBlocks := map[int]*pending{}

  for _, blockIdx := range neededBlocks {
      if inFlight >= maxInFlight {
          waitForOneResponse()
      }
      sendRequest(blockIdx)
      pendingBlocks[blockIdx] = now()
      inFlight++
  }

  // Handle responses (out of order is fine!)
  for response := range responseChannel {
      // VERIFY HASH IMMEDIATELY
      expectedHash := blocks[response.Index].Hash
      actualHash := sha256.Sum256(response.Data)

      if !bytes.Equal(expectedHash, actualHash) {
          log.Printf("HASH MISMATCH block %d!", idx)
          sendRequest(idx)  // RE-REQUEST THIS BLOCK ONLY
          continue
      }

      // Write to correct offset (out of order is fine!)
      tempFile.WriteAt(response.Data,
                        blocks[response.Index].Offset)
      delete(pendingBlocks, response.Index)
      inFlight--
  }

PHASE D: Finalize

  1. All blocks received and verified ✓
  2. Optional: Full file SHA-256 verification
  3. Set correct modification time and permissions
  4. Atomic rename: tempFile → finalFilename
  5. Update local database with new FileInfo
  6. Emit "file synced" event to GUI


STEP 4.6: CONTINUOUS MONITORING (Steady State)
----------------------------------------------
After initial sync, enter continuous mode:

METHOD A: REAL-TIME FILE WATCHING (Primary)
File: lib/fs/watch.go

1. OS-level file system notifications:
   - Linux:   inotify
   - macOS:   FSEvents (or kqueue)
   - Windows: ReadDirectoryChangesW

2. Event flow:
   User saves "report.txt"
        │
        ▼
   OS sends: "file modified: /sync/report.txt"
        │
        ▼
   fs/watch.go: receives event
        │
        ▼
   Debounce: wait 500ms for more events
        │
        ▼
   scanner.Walk() → hash just this file
        │
        ▼
   db.Set.Update() → update local index
        │
        ▼
   model.sendIndexUpdate() → push delta to remote
        │
        ▼
   Remote device: receives index, pulls changed blocks

   TOTAL LATENCY: 1-3 seconds

3. Events debounced to handle rapid successive saves:
   - IDE auto-saves every 2 seconds: only scan once
   - Large file copy: wait for write to complete


METHOD B: PERIODIC FULL RESCAN (Safety Net)
File: lib/model/model.go: rescanTimer

- Runs at configurable interval (default: 3600 seconds = 1 hour)
- Purpose: catch changes the file watcher might have missed:
  • File watcher errors
  • Changes made while Syncthing was stopped
  • Files modified by other tools that bypass FS events

Full rescan flow:
1. scanner.Walk() entire folder
2. Compare with database
3. Send delta index for any differences
```

***

### SECTION 5: RESILIENCE & ERROR HANDLING

#### Purpose

Handle connection failures, network issues, restarts, and partial transfers without data loss.

#### Files Involved

| File                         | Role                                 |
| ---------------------------- | ------------------------------------ |
| `lib/connections/service.go` | Reconnection logic, keepalive        |
| `lib/model/model.go`         | Transfer retry, state persistence    |
| `lib/db/set.go`              | Persistent state (survives restarts) |
| `lib/db/transactions.go`     | Atomic DB operations                 |
| `lib/protocol/protocol.go`   | Ping/pong protocol messages          |
| `lib/relay/client/`          | Relay fallback connections           |

#### Step-by-Step Flow

```
RESILIENCE & ERROR HANDLING
===========================

STEP 5.1: CONNECTION MONITORING (Keepalive)
-------------------------------------------
Files: lib/connections/service.go + lib/protocol/protocol.go

Two layers of connection health checking:

Layer 1: TCP Keepalives (OS-level)
- Enabled on all TCP sockets
- Default: idle 30s, probe every 10s, 3 probes before dead
- Detects: network cable unplugged, router crash, etc.

Layer 2: Protocol Ping/Pong (Application-level)
- Every 90 seconds, send Ping message
- Expect Pong response within 30 seconds
- If no response: connection is considered DEAD

Protocol messages (lib/protocol/protocol.go):
  type Ping struct{}  // empty message
  type Pong struct{}  // empty response


STEP 5.2: CONNECTION LOSS DETECTION
-----------------------------------
File: lib/connections/service.go: connectionLoop()

Connection can be lost due to:
- Network failure (WiFi disconnect, ISP outage)
- Remote device shutdown/sleep
- Firewall rule change
- IP address change (mobile network, DHCP renewal)

Detection:
1. TCP connection: Read() returns error or connection reset
2. QUIC session: idle timeout or stream error
3. Ping timeout: no Pong within 30 seconds

On detection:
1. Mark connection as "disconnected"
2. Cancel all in-flight requests on this connection
3. Clean up pending blocks (temp files preserved!)
4. Notify Model: "device WXYZ-... disconnected"
5. Begin reconnection process (Step 5.3)


STEP 5.3: AUTOMATIC RECONNECTION
--------------------------------
File: lib/connections/service.go: reconnectLoop()

RECONNECTION ALGORITHM:

1. Immediate retry (attempt 1): wait 1 second
2. If fails, exponential backoff:
   Attempt 1:  wait   1 second
   Attempt 2:  wait   2 seconds
   Attempt 3:  wait   4 seconds
   Attempt 4:  wait   8 seconds
   Attempt 5:  wait  16 seconds
   Attempt 6:  wait  32 seconds
   Attempt 7:  wait  64 seconds
   ...
   Maximum:    wait 3600 seconds (1 hour)

3. On each retry attempt, REDISCOVER the remote device:
   a. Check address cache first (fast)
   b. Try local discovery (LAN broadcast)
   c. Try global discovery (internet)
   d. Try relay connections if enabled

4. All methods tried in PARALLEL per attempt
5. First successful connection → stop retrying


STEP 5.4: STATE PRESERVATION (Surviving Restarts)
-------------------------------------------------
Files: lib/db/set.go + lib/model/model.go

Syncthing is designed to be KILLED AT ANY TIME without data loss.

WHAT PERSISTS TO DISK:

1. config.xml: All device and folder configuration
2. cert.pem + key.pem: Device identity
3. Index database (LevelDB/Badger):
   - Complete file index for all folders
   - Block hashes for every synced file
   - Version vectors for conflict detection
4. Temporary files (.syncthing.tmp.*):
   - Partially transferred files with blocks written to disk

WHAT HAPPENS ON RESTART:

1. Load config.xml
2. Open index database
3. Check for temp files from previous session:
   - For each .syncthing.tmp.* file:
     • Check database: was this transfer completed?
     • YES → complete the rename to final filename
     • NO  → keep as temp, resume transfer on reconnect
4. Connect to known devices
5. Exchange DELTA indexes:
   Instead of re-sending entire index:
   - "Here's what I have NOW"
   - Remote compares with what it knew before
   - Only differences trigger transfer
6. Resume interrupted transfers from temp files:
   - Check which blocks are already written to temp file
   - Only request the MISSING blocks


STEP 5.5: RELAY FALLBACK (When Direct Connection Impossible)
-----------------------------------------------------------
Files: lib/relay/client/ + lib/connections/service.go

When direct connection fails (both behind restrictive NAT):

   Device A                        Device B
   (NAT)                           (NAT)
     │                                │
     │  1. Can't connect directly     │
     │                                │
     │  2. Connect to relay           │  3. Connect to relay
     ├──────────────────────────────► ├───────────────────────►
     │                                │
     │               RELAY SERVER (public or private)
     │               ┌──────────────────────┐
     │               │  Listens on :22067   │
     │               │  cmd/strelaysrv/     │
     │               └──────────────────────┘
     │                         │
     │  4. Relay matches       │
     │     "A wants WXYZ..."   │
     │     "B wants ABCD..."   │
     │                         │
     │  5. A <──── TLS (END-TO-END) ────> B
     │     Relay forwards bytes, CANNOT DECRYPT
     │

WHAT THE RELAY CAN SEE:
- Source IP and destination IP
- Encrypted TLS traffic (unreadable)
- Amount of data transferred

WHAT THE RELAY CANNOT SEE:
- File names, folder names
- File contents
- Device IDs (inside encrypted tunnel)

Connection preference: Direct > Relay
- Direct connections always preferred
- Relay is only used as fallback
- If direct connection becomes available, switch automatically
```

***

### SECTION 6: FILE VERSIONING & RECOVERY

#### Purpose

Protect against accidental deletion, unwanted modification, and provide a safety net for user errors.

#### Files Involved

| File                         | Role                                        |
| ---------------------------- | ------------------------------------------- |
| `lib/versioner/simple.go`    | Simple versioning (keep N versions)         |
| `lib/versioner/staggered.go` | Staggered versioning (time-based retention) |
| `lib/versioner/trashcan.go`  | Trash can versioning (move to .stversions)  |
| `lib/versioner/external.go`  | External script versioning                  |
| `lib/model/model.go`         | Integrates versioning into sync flow        |

#### Step-by-Step Flow

```
FILE VERSIONING & RECOVERY
==========================

STEP 6.1: VERSIONING TRIGGERS
-----------------------------
Versioning activates when:

1. A remote device sends a file that OVERWRITES a local file
2. A remote device sends a DELETION for a file
3. (When "sync ownership" is enabled) permissions/metadata change

Versioning does NOT activate for:
- Local changes you make yourself
- Initial sync (first time receiving a file)


STEP 6.2: VERSIONING STRATEGIES
-------------------------------

STRATEGY 1: TRASH CAN (Simple)
File: lib/versioner/trashcan.go

When a file is replaced/deleted:
- Move old file to: .stversions/filename~timestamp.ext
- Keep forever (unless manually cleaned)
- Example:
  Original: documents/report.pdf
  Replaced → documents/.stversions/report~20260519-143052.pdf


STRATEGY 2: SIMPLE VERSIONING
File: lib/versioner/simple.go

Configuration: "Keep last N versions"

When a file is replaced/deleted:
1. Move old file to .stversions/filename~timestamp.ext
2. If total versions > N, delete the OLDEST one

Example with N=3:
.stversions/
  report~20260517-090000.pdf  ← version 1
  report~20260518-150000.pdf  ← version 2
  report~20260519-120000.pdf  ← version 3 (newest)
Next change: version 1 is DELETED, new version 4 is kept


STRATEGY 3: STAGGERED VERSIONING
File: lib/versioner/staggered.go

Configuration: "Keep versions at increasing intervals"

Retention schedule:
  For the first HOUR:     Keep ALL versions
  For the first DAY:      Keep one version per HOUR
  For the first 30 DAYS:  Keep one version per DAY
  Up to 1 YEAR:           Keep one version per WEEK
  Beyond 1 year:          Keep one version per MONTH
  Maximum age:            Delete versions older than 365 days

Result: Fine-grained recent history, efficient long-term storage


STRATEGY 4: EXTERNAL VERSIONING
File: lib/versioner/external.go

- Calls a user-specified script/program on each version event
- Script receives: action, filepath, version path
- Allows integration with: Git, Borg Backup, Restic, etc.


STEP 6.3: VERSIONING INTEGRATION WITH SYNC
------------------------------------------
File: lib/model/model.go: versioner.Archive(filePath)

When a remote change would overwrite a local file:

1. Remote sends: "I have report.pdf v5"
2. Local has:   "report.pdf v3"
3. Before overwriting:
   a. Versioner.Archive("report.pdf")
   b. Old file moved to .stversions/
   c. New file pulled and written
4. If user realizes v5 is wrong:
   - Go to .stversions/
   - Copy report~20260518-143000.pdf back to report.pdf
```

***

### SECTION 7: SHUTDOWN & RESTART

#### Purpose

Gracefully stop all subsystems, flush data to disk, and prepare for clean restart.

#### Files Involved

| File                         | Role                                    |
| ---------------------------- | --------------------------------------- |
| `cmd/syncthing/main.go`      | Signal handling, shutdown orchestration |
| `lib/model/model.go`         | Stop sync, flush state                  |
| `lib/connections/service.go` | Close all connections gracefully        |
| `lib/db/set.go`              | Flush database to disk                  |
| `lib/config/config.go`       | Save final configuration                |

#### Step-by-Step Flow

```
SHUTDOWN & RESTART
==================

STEP 7.1: SHUTDOWN TRIGGERS
---------------------------
File: cmd/syncthing/main.go: signal handling

Shutdown initiated by:
1. SIGINT (Ctrl+C) or SIGTERM (systemd stop)
2. GUI "Shutdown" button (REST API call)
3. Fatal error (auto-restart via service manager)


STEP 7.2: GRACEFUL SHUTDOWN SEQUENCE
------------------------------------

1. STOP ACCEPTING NEW CONNECTIONS
   Close TCP listener (lib/connections/tcp_listener.go)
   Close QUIC listener (lib/connections/quic_listener.go)
   New connection attempts will be rejected

2. NOTIFY REMOTE DEVICES
   Send "Close" message on each active connection:
   type Close struct {
     Reason string  // "shutting down"
   }
   Remote devices know: this is intentional, not a crash

3. CANCEL IN-FLIGHT TRANSFERS
   - Cancel all pending block requests
   - Mark temp files with current progress
   - Temp files survive shutdown (intact on disk)

4. FLUSH DATABASE
   lib/db/set.go: db.Close()
   - Complete any in-progress transactions
   - Flush all writes to disk
   - Close LevelDB/Badger database handle

5. SAVE CONFIGURATION
   lib/config/config.go: config.Save()
   - Write config.xml to disk (if changes pending)
   - All device and folder settings preserved

6. CLOSE ALL CONNECTIONS
   - Close TLS connections gracefully
   - Close relay connections
   - Close discovery announcements

7. EXIT
   - Log "Syncthing exiting"
   - os.Exit(0)


STEP 7.3: RESTART SEQUENCE
--------------------------
On restart, Syncthing resumes cleanly:

1. Load existing certificate (identity preserved!)
2. Load config.xml (all devices and folders remembered)
3. Open index database (all file metadata intact)
4. Scan for temp files:
   For each .syncthing.tmp.* file:
     if isComplete(tempFile):
         rename tempFile → finalFile  // Complete the transfer
     else:
         keep tempFile  // Will resume on reconnect
5. Start listeners (begin accepting connections)
6. Begin discovery and connection to known devices
7. On connection: exchange delta indexes (only what changed)
8. Resume interrupted transfers from temp files

RESULT: No data loss, minimal re-transfer, fast resume.
```

***

### Complete System Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         END-TO-END DATA FLOW                                   
│                                                                               │
│  YOUR DEVICE                                          FRIEND'S DEVICE         │
│  ┌───────────────────────┐                           ┌──────────────────────┐ │
│  │                       │                           │                      │ │
│  │  1. FIRST LAUNCH      │                           │  (same process)      │ │
│  │     cert.pem + key.pem│                           │                      │ │
│  │     Device ID: ABCD.. │                           │  Device ID: WXYZ..   │ │
│  │                       │                           │                      │ │
│  │  2. ADD DEVICE        │                           │                      │ │
│  │     Enter WXYZ-...    │─── out-of-band exchange ──│ Enter ABCD-...       │ │
│  │     (manual)          │      (QR code/msg)        │ (manual)             │ │
│  │                       │                           │                      │ │
│  │  3. SHARE FOLDER      │                           │                      │ │
│  │     "Documents" →     │                           │ Accept folder share  │ │
│  │     shared with WXYZ  │                           │                      │ │
│  │                       │                           │                      │ │
│  │  4. DISCOVERY         │                           │                      │ │
│  │     ├─ LAN broadcast  │◄─────── broadcast ───────►│ ├─ LAN broadcast     │ │
│  │     ├─ Global server  │◄──── discovery.syncthing ─│ ├─ Global server     │ │
│  │     └─ Cached addrs   │                           │ └─ Cached addrs      │ │
│  │                       │                           │                      │ │
│  │  5. CONNECTION        │                           │                      │ │
│  │     Dial WXYZ:22000   │─────── TCP/QUIC ────────► │ Accept from ABCD     │ │
│  │                       │                           │                      │ │
│  │  6. MUTUAL TLS        │                           │                      │ │
│  │     Present cert_A    │─────── TLS 1.3 mTLS ───── │ Present cert_B       │ │
│  │     Verify cert_B     │◄──── no CA involved ────► │ Verify cert_A        │ │
│  │     hash = WXYZ-... ✓ │                           │ hash = ABCD-... ✓    │ │
│  │                       │                           │                      │ │
│  │  7. PROTOCOL HELLO    │                           │                      │ │
│  │     "I am ABCD-..."   │◄────────────────────────► │ "I am WXYZ-..."      │ │
│  │     "Folders I share  │                           │ "Folders I share     │ │
│  │      with you: Docs"  │                           │  with you: Docs"     │ │
│  │                       │                           │                      │ │
│  │  8. INDEX EXCHANGE     │                          │                      │ │
│  │     Send local index   │─────── FileInfos ───────►│ Receive remote index │ │
│  │     Receive remote idx │◄────── FileInfos ─────── │ Send local index     │ │
│  │                        │                          │                      │ │
│  │  9. COMPARE            │                          │                      │ │
│  │     Need: report.pdf   │                          │ Need: photo.jpg      │ │
│  │     Have: photo.jpg    │                          │ Have: report.pdf     │ │
│  │                        │                          │                      │ │
│  │  10. BLOCK TRANSFER    │                          │                      │ │
│  │     Request blocks     │──── request(blk 0,1) ──► │ Read blocks from disk│ │
│  │     Verify SHA-256     │◄─── response(data) ───── │ Send blocks          │ │
│  │     Write to temp file │                          │                      │ │
│  │     Request blocks     │◄─── request(blk 5,7) ─── │ Verify SHA-256       │ │
│  │     Read from disk     │──── response(data) ────► │ Write to temp file   │ │
│  │                        │                           │                     │ │
│  │  11. FINALIZE          │                           │                     │ │
│  │     All blocks verified│                           │ All blocks verified │ │
│  │     Rename temp→final  │                           │ Rename temp→final   │ │
│  │     Update DB          │                           │ Update DB           │ │
│  │                        │                           │                     │ │
│  │  12. CONTINUOUS SYNC   │                           │                     │ │
│  │     ┌─ File watcher    │                           │ ┌─ File watcher     │ │
│  │     ├─ Detect changes  │◄──── delta index ────────►│ ├─ Detect changes   │ │
│  │     └─ Push index      │                           │ └─ Push index       │ │
│  │                        │                           │                     │ │
│  │  13. CONNECTION LOSS   │                           │                     │ │
│  │     Detect disconnect  │                           │ Detect disconnect   │ │
│  │     Exponential backoff│                           │ Exponential backoff │ │
│  │     Rediscover + retry │◄────── reconnect ────────►│ Rediscover + retry  │ │
│  │     Resume from temp   │                           │ Resume from temp    │ │
│  │                        │                           │                     │ │
│  │  14. SHUTDOWN          │                           │                     │ │
│  │     Cancel transfers   │                           │ (same process)      │ │
│  │     Flush DB           │                           │                     │ │
│  │     Save config        │                           │                     │ │
│  │     Close connections  │─────── "Close" msg ─────► │ Mark as disconnected│ │
│  │                        │                           │                     │ │
│  └────────────────────────┘                           └─────────────────────┘ │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

***

### Key Architectural Principles Summary

| #  | Principle                          | Implementation                                             |
| -- | ---------------------------------- | ---------------------------------------------------------- |
| 1  | **No central server**              | Peer-to-peer with mutual TLS                               |
| 2  | **No trusted third party**         | Certificate pinning via out-of-band Device ID exchange     |
| 3  | **No cloud dependency**            | Identity, config, and index stored locally only            |
| 4  | **End-to-end encryption**          | TLS 1.3 between peers, even through relays                 |
| 5  | **Data integrity**                 | SHA-256 of every block, verified on receipt                |
| 6  | **Block-level delta sync**         | 128 KiB blocks, only changed blocks transferred            |
| 7  | **Out-of-order parallel transfer** | Blocks requested in parallel, written at correct offsets   |
| 8  | **Conflict safety**                | Version vectors + automatic conflict file renaming         |
| 9  | **Offline resilience**             | Persistent index DB, temp file checkpointing               |
| 10 | **Automatic reconnection**         | Exponential backoff, rediscovery, relay fallback           |
| 11 | **Privacy-preserving discovery**   | Opaque Device IDs, encrypted announcements                 |
| 12 | **File versioning**                | Configurable retention strategies                          |
| 13 | **Cross-platform**                 | Pure Go, OS-specific file watchers                         |
| 14 | **Graceful shutdown**              | Flush state, notify peers, resume on restart               |
| 15 | **Single binary**                  | All infrastructure (discovery, relay) in separate commands |
