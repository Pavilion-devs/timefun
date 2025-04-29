# Lab 2: Broken Authentication in Signer API

This lab demonstrates broken authentication vulnerabilities in a Web3 transaction signing API.

## Overview

The lab simulates a transaction signing service that allows users to sign and execute blockchain transactions. The vulnerable version demonstrates common authentication flaws that could lead to unauthorized access and transaction signing.

## Architecture

The lab consists of two servers:
- **Vulnerable Server** (Port 3000): Demonstrates broken authentication
- **Secure Server** (Port 3001): Shows proper security implementation

### Key Components
- Express.js backend
- Ethers.js for blockchain interactions
- JWT for authentication (secure version)
- Transaction signing and execution endpoints

## Vulnerability

The vulnerable version:
- Lacks proper authentication for transaction signing
- Uses hardcoded API keys
- Implements weak API key validation
- Could allow unauthorized transaction signing

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- curl (for testing)

### Installation

1. Navigate to the lab directory:
```bash
cd labs/lab2-broken-auth
```

2. Install dependencies:
```bash
npm install
```

3. Start the vulnerable server:
```bash
npm run start:vulnerable
```

4. Start the secure server (in a different terminal):
```bash
npm run start:secure
```

## Testing

### Step-by-Step Testing Guide

#### 1. Testing the Vulnerable Server (Port 3000)

##### A. Unauthenticated Signing (Insecure)
```bash
curl -X POST http://localhost:3000/sign-transaction \
  -H "Content-Type: application/json" \
  -d '{"to": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "value": "1.0"}'
```
Expected Response:
```json
{
  "success": true,
  "signedTransaction": "0x01f86e8080850ba43b740082520894742d35cc6634c0532925a3b844bc454e4438f44e880de0b6b3a764000080c080a07c8e6fb8cd9494fdf9b63039e7e2798d61ca3ea6f169bc0a92319ca6ec5d9ae4a02bcc4393f439b89e7df15db82612e7f14f00843d4fe449276207ceece9fd2c7e"
}
```

##### B. Simple API Key Authentication (Insecure)
```bash
curl -X POST http://localhost:3000/execute-transaction \
  -H "Content-Type: application/json" \
  -d '{"signedTransaction": "0x...", "apiKey": "test-api-key-123"}'
```
Expected Response:
```json
{
  "success": true,
  "transactionHash": "0x904e23b2604bd"
}
```

#### 2. Testing the Secure Server (Port 3001)

##### A. Login to Get JWT Token
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "secure-password"}'
```
Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### B. Authenticated Signing (Secure)
1. Copy the token from the login response
2. Use it in the Authorization header:
```bash
curl -X POST http://localhost:3001/sign-transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN" \
  -d '{"to": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "value": "1.0"}'
```
Expected Response:
```json
{
  "success": true,
  "signedTransaction": "0x01f86e8080850ba43b740082520894742d35cc6634c0532925a3b844bc454e4438f44e880de0b6b3a764000080c080a07c8e6fb8cd9494fdf9b63039e7e2798d61ca3ea6f169bc0a92319ca6ec5d9ae4a02bcc4393f439b89e7df15db82612e7f14f00843d4fe449276207ceece9fd2c7e"
}
```

##### C. Authenticated Execution (Secure)
```bash
curl -X POST http://localhost:3001/execute-transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COPIED_TOKEN" \
  -d '{"signedTransaction": "0x..."}'
```

### Common Issues and Solutions

1. **Invalid Token Error**
   - Make sure you're using the token from the login response
   - Check that the token hasn't expired (tokens expire after 1 hour)
   - Ensure the Authorization header format is correct: `Bearer YOUR_TOKEN`

2. **Missing Parameters**
   - Ensure all required fields are included in the request body
   - Check the format of the Ethereum address and value

3. **Server Not Running**
   - Verify both servers are running on the correct ports
   - Check for any error messages in the server console

## Exploitation

The lab includes several exploitation scenarios:

1. **Unauthorized Transaction Signing**
   - Access signing endpoint without authentication
   - Sign transactions without proper authorization
   - Execute transactions with weak API key validation

2. **API Key Exposure**
   - Discover hardcoded API keys
   - Bypass simple API key validation
   - Execute unauthorized transactions

3. **Authentication Bypass**
   - Access protected endpoints without proper authentication
   - Exploit weak authentication mechanisms
   - Perform unauthorized actions

## Mitigation

The secure version demonstrates proper mitigation techniques:

### 1. JWT Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
```

### 2. Secure Token Generation
```javascript
// routes/auth.js
const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate credentials (in real world, check against database)
  if (username === 'admin' && password === 'secure-password') {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  }
  
  return res.status(401).json({ error: 'Invalid credentials' });
});
```

### 3. Protected Route Implementation
```javascript
// routes/transactions.js
const authenticateToken = require('../middleware/auth');

app.post('/sign-transaction', authenticateToken, async (req, res) => {
  try {
    const { to, value, data } = req.body;
    
    if (!to || !value) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create and sign transaction
    const transaction = {
      to,
      value: ethers.parseEther(value.toString()),
      data: data || '0x',
      nonce: 0,
      gasLimit: 21000,
      gasPrice: ethers.parseUnits('50', 'gwei')
    };

    const signedTx = await wallet.signTransaction(transaction);
    return res.json({ success: true, signedTransaction: signedTx });
  } catch (error) {
    console.error('Error signing transaction:', error.message);
    return res.status(500).json({ error: 'Failed to sign transaction' });
  }
});
```

## Learning Objectives

- Understand how broken authentication can affect Web3 systems
- Learn to identify and exploit authentication vulnerabilities
- Implement proper security measures to prevent unauthorized access
- Understand the importance of secure authentication in Web3 applications

## Security Best Practices

1. **Authentication**
   - Use JWT or similar token-based authentication
   - Implement proper token validation
   - Store sensitive data in environment variables

2. **API Security**
   - Implement rate limiting
   - Use secure API key management
   - Validate all inputs

3. **Transaction Security**
   - Implement proper authorization checks
   - Validate transaction parameters
   - Use secure key storage

## Contributing

Feel free to submit issues and enhancement requests! 