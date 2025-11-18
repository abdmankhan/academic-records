# Windows Docker Desktop Port Conflicts - Fix Guide

## Problem

When running Hyperledger Fabric on Windows/WSL2 with Docker Desktop, you may encounter port binding errors like:

```
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:9051 -> 127.0.0.1:0: listen tcp 0.0.0.0:9051: bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

## Root Cause

Windows reserves certain port ranges (typically 8000-8999 and some others) for system use. When Docker tries to bind to these ports, Windows blocks the operation.

## Solution

### Option 1: Use Alternative Ports (Recommended)

The `docker-compose.yaml` has been updated to use alternative ports for Windows:

- **CA Org3**: Changed from `9054` to `10054`
- **CouchDB3**: Changed from `8984` to `15984`
- **Peer0 Org2**: May need to change from `9051` to `10051` (if still having issues)

### Option 2: Release Reserved Ports in Windows

1. Open PowerShell as Administrator
2. Check reserved ports:
   ```powershell
   netsh interface ipv4 show excludedportrange protocol=tcp
   ```
3. If you see ports you need, you can try to exclude them (advanced, not recommended)

### Option 3: Use Docker Desktop Port Settings

1. Open Docker Desktop
2. Go to Settings → Resources → Advanced
3. Check "Expose daemon on tcp://localhost:2375" (if needed)
4. Restart Docker Desktop

## Quick Fix Script

Run this script to ensure all containers start:

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/fixWindowsPorts.sh
```

## Manual Fix

If specific ports are still blocked:

1. **Find which port is blocked** from the error message
2. **Edit `docker-compose.yaml`** and change the port mapping
3. **Use a port above 10000** (safer range for Windows)

Example:
```yaml
# Before (blocked)
ports:
  - "9051:9051"

# After (working)
ports:
  - "10051:9051"
```

## Verify Network is Running

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Check all containers
docker ps

# Should see:
# - 1 orderer
# - 6 peers (2 per org)
# - 6 CouchDB instances
# - 3 CAs
# - 1 CLI container
```

## If CLI Container Keeps Stopping

The CLI container depends on all peers being up. If a peer fails to start due to port conflicts, the CLI may not start properly.

**Fix:**
```bash
# Start all containers
docker-compose up -d

# Wait for peers to start
sleep 20

# Manually start CLI if needed
docker start cli

# Or recreate it
docker-compose up -d cli
```

## Testing the Fix

After fixing ports, test the network:

```bash
# Test chaincode query
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"GetAllCertificates","Args":[]}'

# Test chaincode invoke (from backend)
# The backend should now be able to create certificates
```

## Current Port Mappings (Windows-Friendly)

| Service | Original Port | Windows Port | Status |
|---------|--------------|--------------|--------|
| Orderer | 7050 | 7050 | ✅ OK |
| Peer0 Org1 | 7051 | 7051 | ✅ OK |
| Peer1 Org1 | 8051 | 8051 | ⚠️ May conflict |
| Peer0 Org2 | 9051 | 9051 | ❌ Blocked → Use 10051 |
| Peer1 Org2 | 10051 | 10051 | ✅ OK |
| Peer0 Org3 | 11051 | 11051 | ✅ OK |
| Peer1 Org3 | 12051 | 12051 | ✅ OK |
| CA Org1 | 7054 | 7054 | ✅ OK |
| CA Org2 | 8054 | 8054 | ⚠️ May conflict |
| CA Org3 | 9054 | 10054 | ✅ Fixed |
| CouchDB0 | 5984 | 5984 | ✅ OK |
| CouchDB1 | 6984 | 6984 | ✅ OK |
| CouchDB2 | 7984 | 7984 | ✅ OK |
| CouchDB3 | 8984 | 15984 | ✅ Fixed |
| CouchDB4 | 9984 | 9984 | ✅ OK |
| CouchDB5 | 10984 | 10984 | ✅ OK |

## Alternative: Use Docker Network Without Port Mapping

If port conflicts persist, you can run the network without exposing ports to the host (containers can still communicate internally):

1. Remove `ports:` sections from `docker-compose.yaml`
2. Access services only from within Docker network
3. Use `docker exec` to run commands

**Note:** This means you can't access CouchDB web UI or some services from Windows, but the blockchain network will work.

## Still Having Issues?

1. **Check Docker Desktop is running** in Windows
2. **Restart Docker Desktop** completely
3. **Check WSL2 integration** is enabled in Docker Desktop settings
4. **Try restarting WSL2**: `wsl --shutdown` then restart
5. **Check Windows Firewall** isn't blocking Docker

## Summary

The main fix is to change blocked ports to higher port numbers (10000+). The `docker-compose.yaml` has been updated with some fixes, but you may need to adjust more ports based on your specific Windows configuration.





