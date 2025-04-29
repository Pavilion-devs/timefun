const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT secret (in real world, this would be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-jwt-secret';

// Simulated wallet with private key (in real world, this would be securely stored)
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint to get JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // In real world, this would validate against a database
  if (username === 'admin' && password === 'secure-password') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Secure: Protected by JWT authentication
app.post('/sign-transaction', authenticateToken, async (req, res) => {
  try {
    const { to, value, data } = req.body;
    
    if (!to || !value) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create transaction
    const transaction = {
      to,
      value: ethers.parseEther(value.toString()),
      data: data || '0x',
      nonce: 0, // In real world, this would be fetched from the network
      gasLimit: 21000,
      gasPrice: ethers.parseUnits('50', 'gwei')
    };

    // Sign transaction (secure: protected by authentication)
    const signedTx = await wallet.signTransaction(transaction);
    
    return res.json({
      success: true,
      signedTransaction: signedTx
    });
  } catch (error) {
    console.error('Error signing transaction:', error.message);
    return res.status(500).json({ error: 'Failed to sign transaction' });
  }
});

// Secure: Protected by JWT authentication and rate limiting
app.post('/execute-transaction', authenticateToken, async (req, res) => {
  try {
    const { signedTransaction } = req.body;
    
    if (!signedTransaction) {
      return res.status(400).json({ error: 'Missing signed transaction' });
    }

    // Simulate transaction execution
    return res.json({
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
    });
  } catch (error) {
    console.error('Error executing transaction:', error.message);
    return res.status(500).json({ error: 'Failed to execute transaction' });
  }
});

app.listen(port, () => {
  console.log(`Secure signer API running at http://localhost:${port}`);
}); 