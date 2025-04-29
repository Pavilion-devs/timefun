const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulated internal service that should be protected
const internalService = {
  getSecretKey: () => 'super-secret-key-123',
  getInternalData: () => ({ data: 'sensitive-internal-data' })
};

// Vulnerable endpoint that accepts any URL
app.post('/fetch-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Vulnerable: No URL validation or whitelisting
    const response = await axios.get(url);
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching metadata:', error.message);
    return res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Simulated internal API endpoint (vulnerable to SSRF)
app.get('/internal/api', (req, res) => {
  // This endpoint should only be accessible internally
  return res.json({
    secretKey: internalService.getSecretKey(),
    internalData: internalService.getInternalData()
  });
});

app.listen(port, () => {
  console.log(`Vulnerable metadata fetcher running at http://localhost:${port}`);
  console.log('WARNING: This is a vulnerable version for educational purposes only!');
}); 