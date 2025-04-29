const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulated wallet with private key (in real world, this would be securely stored)
const WALLET_PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY);

// Vulnerable: No proper authentication
app.post('/sign-transaction', async (req, res) => {
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

    // Sign transaction (vulnerable: no authentication check)
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

// Vulnerable: Hardcoded API key
const API_KEY = 'test-api-key-123';

app.post('/execute-transaction', async (req, res) => {
  try {
    const { signedTransaction, apiKey } = req.body;
    
    if (!signedTransaction) {
      return res.status(400).json({ error: 'Missing signed transaction' });
    }

    // Vulnerable: Simple string comparison for API key
    if (apiKey !== API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
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
  console.log(`Vulnerable signer API running at http://localhost:${port}`);
}); 