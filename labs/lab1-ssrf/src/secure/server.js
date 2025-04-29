const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const port = 3001; // Different port to avoid conflicts

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulated internal service that should be protected
const internalService = {
  getSecretKey: () => 'super-secret-key-123',
  getInternalData: () => ({ data: 'sensitive-internal-data' })
};

// Whitelist of allowed domains
const ALLOWED_DOMAINS = [
  'ipfs.io',
  'arweave.net',
  'nftstorage.link'
];

// Function to validate URL
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Check if domain is in whitelist
    if (!ALLOWED_DOMAINS.some(domain => parsedUrl.hostname.endsWith(domain))) {
      return false;
    }

    // Check for localhost or internal IPs
    if (parsedUrl.hostname === 'localhost' || 
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname.startsWith('192.168.') ||
        parsedUrl.hostname.startsWith('10.') ||
        parsedUrl.hostname.startsWith('172.')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Secure endpoint with proper validation
app.post('/fetch-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid or unauthorized URL' });
    }

    // Set timeout and max redirects
    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      validateStatus: status => status < 400
    });
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching metadata:', error.message);
    return res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Internal API endpoint with proper access control
app.get('/internal/api', (req, res) => {
  // Check for proper authentication (simulated)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer internal-service-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({
    secretKey: internalService.getSecretKey(),
    internalData: internalService.getInternalData()
  });
});

app.listen(port, () => {
  console.log(`Secure metadata fetcher running at http://localhost:${port}`);
}); 