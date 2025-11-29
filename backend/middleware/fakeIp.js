/**
 * Fake IP Middleware
 * 
 * This middleware completely removes the client's real IP address and replaces it
 * with a randomly generated fake IPv4 address. It ensures that:
 * - Real IP headers are stripped
 * - A fake IP is generated and attached to the request
 * - Backend logs and responses only show the fake IP
 */

/**
 * Generate a random IPv4 address
 * @returns {string} A random IPv4 address (e.g., "192.168.1.42")
 */
function generateFakeIP() {
  const octet1 = Math.floor(Math.random() * 256);
  const octet2 = Math.floor(Math.random() * 256);
  const octet3 = Math.floor(Math.random() * 256);
  const octet4 = Math.floor(Math.random() * 256);
  
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
}

/**
 * Middleware to strip real IP and inject fake IP
 */
function fakeIpMiddleware(req, res, next) {
  // Generate a fake IP for this request
  const fakeIP = generateFakeIP();
  
  // Strip all real IP-related headers
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  delete req.headers['x-client-ip'];
  delete req.headers['cf-connecting-ip'];
  delete req.headers['true-client-ip'];
  
  // Attach fake IP to request object
  req.fakeIP = fakeIP;
  
  // Override req.ip with fake IP
  Object.defineProperty(req, 'ip', {
    get: function() {
      return fakeIP;
    },
    configurable: true
  });
  
  // Override connection and socket remote addresses
  if (req.connection) {
    Object.defineProperty(req.connection, 'remoteAddress', {
      get: function() {
        return fakeIP;
      },
      configurable: true
    });
  }
  
  if (req.socket) {
    Object.defineProperty(req.socket, 'remoteAddress', {
      get: function() {
        return fakeIP;
      },
      configurable: true
    });
  }
  
  // Log the fake IP (for debugging)
  console.log(`🎭 Fake IP assigned: ${fakeIP} for ${req.method} ${req.path}`);
  
  next();
}

module.exports = fakeIpMiddleware;
