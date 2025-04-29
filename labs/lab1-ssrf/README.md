# Lab 1: SSRF in Metadata Fetcher

This lab demonstrates a Server-Side Request Forgery (SSRF) vulnerability in a metadata fetcher service commonly used in Web3 applications.

## Overview

The lab simulates a metadata fetcher service that accepts URLs to fetch NFT metadata. The vulnerable version allows attackers to make requests to internal services, potentially exposing sensitive information or triggering unauthorized actions.

## Architecture

The lab consists of two servers:
- **Vulnerable Server** (Port 3000): Demonstrates SSRF vulnerability
- **Secure Server** (Port 3001): Shows proper security implementation

### Key Components
- Express.js backend
- Axios for HTTP requests
- Internal API endpoint with sensitive data
- Metadata fetching endpoint

## Vulnerability

The vulnerable version:
- Accepts any URL without proper validation
- Makes requests to the provided URL without restrictions
- Doesn't implement proper URL whitelisting or blacklisting
- Could be used to access internal services or trigger unintended actions

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- curl (for testing)

### Installation

1. Navigate to the lab directory:
```bash
cd labs/lab1-ssrf
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

### Test Cases

1. **Access Internal API (Vulnerable)**
```bash
curl -X POST http://localhost:3000/fetch-metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000/internal/api"}'
```

2. **Access Internal API (Secure)**
```bash
curl -X POST http://localhost:3001/fetch-metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3001/internal/api"}'
```

3. **Test Allowed Domain (Secure)**
```bash
curl -X POST http://localhost:3001/fetch-metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ipfs.io/ipfs/QmSomeHash"}'
```

4. **Test Internal Network (Vulnerable)**
```bash
curl -X POST http://localhost:3000/fetch-metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "http://192.168.1.1"}'
```

## Exploitation

The lab includes several exploitation scenarios:

1. **Internal Service Access**
   - Access internal API endpoints
   - Retrieve sensitive data
   - Scan internal networks

2. **Data Exfiltration**
   - Read sensitive files
   - Access internal services
   - Extract configuration data

3. **Service Abuse**
   - Trigger unintended actions
   - Abuse internal services
   - Perform network scanning

## Mitigation

The secure version demonstrates proper mitigation techniques:
- URL whitelisting (only allows specific domains)
- Input validation (blocks internal IPs and localhost)
- Request sanitization (timeouts and redirect limits)
- Proper error handling
- Authentication for internal endpoints

## Learning Objectives

- Understand how SSRF vulnerabilities can affect Web3 systems
- Learn to identify and exploit SSRF vulnerabilities
- Implement proper security measures to prevent SSRF attacks
- Understand the importance of securing off-chain infrastructure in Web3 applications

## Security Best Practices

1. **URL Validation**
   - Implement strict URL whitelisting
   - Block internal IP ranges
   - Validate URL format

2. **Request Security**
   - Set timeouts
   - Limit redirects
   - Validate response status

3. **Access Control**
   - Implement proper authentication
   - Use secure tokens
   - Restrict internal endpoints

## Contributing

Feel free to submit issues and enhancement requests! 