# Web2 Holes in Web3 Armor: SSRF & Broken Auth in Off-Chain Signers

This project demonstrates how common Web2 vulnerabilities can be exploited to compromise Web3 systems through off-chain infrastructure. It includes two hands-on labs and a detailed research article.

## Project Structure

```
.
├── README.md
├── labs/
│   ├── lab1-ssrf/           # SSRF vulnerability in metadata fetcher
│   └── lab2-broken-auth/    # Broken authentication in signer API
├── article/                 # Research article and documentation
└── docs/                    # Additional documentation
```

## Labs Overview

### Lab 1: SSRF in Metadata Fetcher
Demonstrates how Server-Side Request Forgery can be exploited in a metadata fetcher service to access internal resources and potentially compromise Web3 systems.

### Lab 2: Broken Authentication in Signer API
Shows how broken authentication in a transaction signing API can lead to unauthorized transaction execution.

## Getting Started

Each lab is self-contained and includes:
- Vulnerable version of the application
- Secure version with mitigations
- Exploitation scripts
- Detailed documentation

Follow the README in each lab directory ( labs/lab1-ssrf/README.md) AND (labs/lab2-broken-auth/README.md) for specific setup and exploitation instructions.

## Prerequisites

- Node.js (v14 or higher)
- Docker (optional, for containerized setup)
- Python 3.x (for exploitation scripts)

## Setup Instructions

1. Clone this repository
2. Navigate to the specific lab directory
3. Follow the setup instructions in the lab's README

## Security Notice

This project is for educational purposes only. The vulnerabilities demonstrated are intentionally introduced for learning purposes. Do not deploy these applications in production environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License 