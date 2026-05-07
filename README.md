# FundChain DApp

A full decentralized crowdfunding application built on Ethereum, powered by React + Web3.js.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MetaMask browser extension
- A deployed `Fund.sol` contract (deploy via Remix IDE)

### Install & Run

```bash
cd fundchain-dapp
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 📁 Project Structure

```
fundchain-dapp/
├── contracts/
│   └── Fund.sol               ← Your Solidity contract
├── src/
│   ├── contracts/
│   │   └── Fund.js            ← ABI + network config
│   ├── context/
│   │   └── Web3Context.js     ← Web3 state management
│   ├── components/
│   │   ├── Header.js          ← Wallet connection
│   │   ├── StatsPanel.js      ← Campaign stats + progress
│   │   ├── ContributePanel.js ← sendEth() + refund()
│   │   ├── RequestsPanel.js   ← voteRequest()
│   │   ├── ManagerPanel.js    ← createRequest() + makePayment()
│   │   └── InfoPanel.js       ← Contract info + ABI reference
│   ├── utils/
│   │   └── helpers.js         ← Formatting utilities
│   ├── App.js
│   └── App.css
└── public/
    └── index.html
```

---

## 🔧 Deploy & Use

### Step 1 — Deploy Fund.sol in Remix
1. Open [remix.ethereum.org](https://remix.ethereum.org)
2. Paste `contracts/Fund.sol`
3. Compile with Solidity `^0.8.0`
4. Deploy with:
   - `_target`: funding goal in wei (e.g. `1000000000000000000` = 1 ETH)
   - `_deadline`: duration in seconds (e.g. `2592000` = 30 days)
5. Copy the deployed contract address

### Step 2 — Connect & Load
1. Open the DApp at `http://localhost:3000`
2. Click **Connect Wallet** → MetaMask or WalletConnect
3. Paste your contract address → **Load Contract**

### Step 3 — Interact
| Tab | Who | What |
|-----|-----|------|
| Contribute | Anyone | Send ETH, request refund |
| Spending Requests | Contributors | Vote on spending |
| Manager | Deployer only | Create requests, execute payments |
| Contract Info | Anyone | View all contract state |

---

## 🔑 WalletConnect Setup

To enable WalletConnect, replace the Infura placeholder in `Web3Context.js`:

```js
const provider = new WalletConnectProvider({
  rpc: {
    1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",     // Mainnet
    11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // Sepolia
  },
});
```

Get a free key at [infura.io](https://infura.io)

---

## 🌐 Supported Networks

| Network | Chain ID |
|---------|----------|
| Ethereum Mainnet | 1 |
| Sepolia Testnet | 11155111 |
| Goerli Testnet | 5 |
| Polygon Mainnet | 137 |
| Mumbai Testnet | 80001 |

---

## 📦 Production Build

```bash
npm run build
# Outputs to /build — deploy to Vercel, Netlify, or IPFS
```

---

## ⚠️ Security Notes

- Always verify contract addresses before interacting
- The `makePayment()` function requires: target reached + majority votes
- Refunds only available after deadline if target not met
- Manager is the address that deployed the contract
