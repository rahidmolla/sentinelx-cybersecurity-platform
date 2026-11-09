import dns from 'dns/promises';
import net from 'net';

export function isPrivateOrReservedIp(ip) {
  if (!ip) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [a, b, c, d] = parts;

    // 0.0.0.0/8
    if (a === 0) return true;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 169.254.0.0/16 (Link Local / Cloud Metadata)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.0.0.0/24 & 192.0.2.0/24
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 198.18.0.0/15
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 198.51.100.0/24
    if (a === 198 && b === 51 && c === 100) return true;
    // 203.0.113.0/24
    if (a === 203 && b === 0 && c === 113) return true;
    // Multicast & Reserved
    if (a >= 224) return true;
    // Broadcast
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.includes('::ffff:')) {
      const match = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
      if (match && match[1]) {
        return isPrivateOrReservedIp(match[1]);
      }
    }
    return false;
  }

  return true;
}

export async function validateAndResolveHost(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    throw new Error('Host must be a non-empty string');
  }

  const cleanHost = hostname.toLowerCase().trim();

  // Prohibited hostnames (Localhost & Cloud Metadata)
  if (cleanHost === 'localhost' || cleanHost.endsWith('.localhost')) {
    throw new Error(`SSRF Blocked: Prohibited hostname '${cleanHost}' (Localhost resolution forbidden)`);
  }

  if (cleanHost === 'metadata.google.internal' || cleanHost === 'instance-data') {
    throw new Error(`SSRF Blocked: Prohibited cloud metadata endpoint`);
  }

  // Direct IP entered as hostname
  if (net.isIP(cleanHost)) {
    if (isPrivateOrReservedIp(cleanHost)) {
      throw new Error(`SSRF Blocked: Destination IP '${cleanHost}' is a private, loopback, or reserved address`);
    }
    return {
      resolvedIp: cleanHost,
      allIps: [cleanHost],
      hostname: cleanHost,
      isDirectIp: true,
      isNxDomain: false
    };
  }

  // Resolve hostname
  try {
    const addresses = await dns.resolve4(cleanHost);
    if (addresses && addresses.length > 0) {
      for (const ip of addresses) {
        if (isPrivateOrReservedIp(ip)) {
          throw new Error(`SSRF Blocked: Host '${cleanHost}' resolves to private or reserved IP: ${ip}`);
        }
      }
      return {
        resolvedIp: addresses[0],
        allIps: addresses,
        hostname: cleanHost,
        isDirectIp: false,
        isNxDomain: false
      };
    }
  } catch (err) {
    if (err.message.includes('SSRF Blocked')) {
      throw err;
    }
    // Try IPv6
    try {
      const v6 = await dns.resolve6(cleanHost);
      if (v6 && v6.length > 0) {
        for (const ip of v6) {
          if (isPrivateOrReservedIp(ip)) {
            throw new Error(`SSRF Blocked: Host '${cleanHost}' resolves to private/reserved IPv6: ${ip}`);
          }
        }
        return {
          resolvedIp: v6[0],
          allIps: v6,
          hostname: cleanHost,
          isDirectIp: false,
          isNxDomain: false
        };
      }
    } catch (v6Err) {
      if (v6Err.message.includes('SSRF Blocked')) {
        throw v6Err;
      }
    }

    // Host does not resolve on DNS (NXDOMAIN / ENOTFOUND)
    return {
      resolvedIp: null,
      allIps: [],
      hostname: cleanHost,
      isDirectIp: false,
      isNxDomain: true,
      dnsError: err.code || err.message
    };
  }

  return {
    resolvedIp: null,
    allIps: [],
    hostname: cleanHost,
    isDirectIp: false,
    isNxDomain: true
  };
}
