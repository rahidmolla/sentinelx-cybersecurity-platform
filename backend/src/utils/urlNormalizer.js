export function normalizeUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  let raw = input.trim();

  // If no scheme is provided, default to https:// for safe scanning
  if (!/^https?:\/\//i.test(raw)) {
    raw = 'https://' + raw;
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (err) {
    throw new Error(`Invalid URL format: ${err.message}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Disallowed protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Construct normalized clean URL
  const portPart = (parsed.port && !(parsed.protocol === 'http:' && parsed.port === '80') && !(parsed.protocol === 'https:' && parsed.port === '443'))
    ? `:${parsed.port}`
    : '';

  const normalized = `${parsed.protocol}//${hostname}${portPart}${parsed.pathname || '/'}${parsed.search}${parsed.hash}`;

  return {
    originalUrl: input,
    normalizedUrl: normalized,
    protocol: parsed.protocol.replace(':', ''),
    hostname: hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    pathname: parsed.pathname || '/',
    search: parsed.search || '',
    hash: parsed.hash || ''
  };
}
