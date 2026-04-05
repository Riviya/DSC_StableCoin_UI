# DSC — Decentralized Stablecoin Protocol

> A fully collateral-backed, algorithmically controlled stablecoin pegged to **$1.00 USD**, built on Ethereum (Sepolia Testnet).

<!-- SUGGESTION: Replace the banner below with a screenshot of your homepage -->
<!-- ![DSC Dashboard Banner](./public/screenshots/banner.png) -->

🔗 **Live Demo:** [dsc.vercel](https://dscstablecoin.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Smart Contracts](#smart-contracts)
- [Project Structure](#project-structure)
- [Pages & Components](#pages--components)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

DSC is a decentralized stablecoin protocol that allows users to mint **DSC tokens** — a crypto-native, dollar-pegged asset — by locking up overcollateralized crypto assets (WETH, LINK). The protocol enforces solvency through a **health factor** system backed by real-time Chainlink oracle price feeds. If a user's health factor drops below 1.0, their position becomes eligible for liquidation.

This project combines a full **Next.js** frontend with live **Solidity smart contracts** deployed on the Ethereum Sepolia testnet, and uses **The Graph** subgraph for efficient on-chain data indexing.

---

## Demo


> Watch the demo : [Video](https://www.loom.com/share/65464d4452c54e469311bb202669329d)




<!--
| Dashboard | Protocol Overview | Transaction History |
|:---------:|:-----------------:|:-------------------:|
| ![Dashboard](./public/screenshots/dashboard.png) | ![Protocol](./public/screenshots/protocol.png) | ![History](./public/screenshots/history.png) |
-->

---

## Features

### 🎮 Demo Mode — No Wallet Required
Simulate the full protocol with a mock wallet and pre-loaded balances. No gas, no real funds, no setup. Ideal for recruiters and first-time visitors to explore freely.

### 🔗 On-Chain Mode — Live Contracts
Connect a real wallet via **RainbowKit** and interact with deployed smart contracts on **Ethereum Sepolia** using actual collateral.

### 💰 Core Protocol Actions

| Action | Description |
|--------|-------------|
| **Deposit Collateral** | Lock WETH or LINK as collateral to increase your borrowing power |
| **Mint DSC** | Issue DSC tokens against your deposited collateral |
| **Burn DSC** | Repay DSC debt to improve your health factor |
| **Redeem Collateral** | Withdraw your collateral after reducing outstanding debt |
| **Redeem & Burn (Combo)** | Simultaneously burn DSC and withdraw collateral in one transaction |

### 📊 Protocol Analytics
- Live protocol-wide statistics: total DSC supply, total collateral value (USD), collateralization ratio, lifetime burns
- DSC supply growth chart (7-month history, sourced from The Graph subgraph)
- Collateral composition breakdown (WETH vs LINK)

### 📜 Transaction History
- Protocol-wide transaction feed (Mint, Burn, Deposit, Redeem) sourced from The Graph
- Filter by type, date range, hash/address search, or your own wallet
- Stats bar showing total volume and latest activity
- Export to CSV
- Direct Etherscan links per transaction

### 🛡️ Health Factor Monitoring
Real-time health factor with color-coded status (Safe / Caution / Danger) calculated from your live collateral-to-debt ratio.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Next.js Frontend                      │
│                                                           │
│   ┌───────────┐   ┌───────────┐   ┌──────────────────┐   │
│   │ Dashboard │   │ Protocol  │   │ Transaction      │   │
│   │  (Home)   │   │ Overview  │   │ History          │   │
│   └───────────┘   └───────────┘   └──────────────────┘   │
│                                                           │
│   ┌───────────────┐   ┌──────────────────────────────┐   │
│   │  RainbowKit   │   │  Wagmi + @wagmi/core          │   │
│   │  (Wallet UI)  │   │  (Web3 React hooks)           │   │
│   └───────────────┘   └──────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────┘
                           │
           ┌───────────────┼──────────────────┐
           │               │                  │
  ┌────────▼────────┐  ┌───▼────────┐  ┌─────▼──────────┐
  │  DSCEngine      │  │  DSC Token │  │  The Graph     │
  │  (Solidity)     │  │  (ERC-20)  │  │  Subgraph      │
  └────────┬────────┘  └────────────┘  └────────────────┘
           │
  ┌────────▼────────┐
  │ Chainlink Oracles│
  │ ETH/USD, LINK/USD│
  └─────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [CSS Modules](https://github.com/css-modules/css-modules) | Scoped component styles |
| [RainbowKit](https://www.rainbowkit.com/) | Wallet connection UI |
| [Wagmi v2](https://wagmi.sh/) | Web3 React hooks |
| [Viem](https://viem.sh/) | Low-level Ethereum client |
| [Recharts](https://recharts.org/) | Data visualization charts |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date formatting |

### Blockchain & Data
| Technology | Purpose |
|-----------|---------|
| [Solidity](https://soliditylang.org/) | Smart contract language |
| [Ethereum Sepolia](https://sepolia.etherscan.io/) | Testnet deployment target |
| [Chainlink Oracles](https://chain.link/) | Real-time ETH/USD and LINK/USD price feeds |
| [The Graph](https://thegraph.com/) | On-chain event indexing & querying |
| [graphql-request](https://github.com/jasonkuhrt/graphql-request) | GraphQL subgraph queries |
| [@tanstack/react-query](https://tanstack.com/query) | Server state management |

---

## Getting Started

### Prerequisites
- **Node.js** `>= 18.18.0`
- **pnpm** (recommended) — install with `npm install -g pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/Riviya/DSC_StableCoin_UI.git
cd DSC_StableCoin_UI

# Install all dependencies from the lockfile
pnpm install
```

Or if you are scaffolding from scratch, here are every package used in this project:

```bash
# Next.js app
pnpm create next-app@latest

# Wallet connection UI
pnpm add @rainbow-me/rainbowkit@latest

# Web3 React hooks + Ethereum client
pnpm add wagmi viem@2.x @tanstack/react-query

# Icon libraries
pnpm add react-icons

# Wagmi core (for contract reads/writes outside React components)
pnpm add @wagmi/core viem

# The Graph CLI (for subgraph development)
pnpm add -g @graphprotocol/graph-cli

# GraphQL client (for querying the subgraph)
pnpm install graphql-request
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app defaults to **Demo Mode** — no wallet or environment setup required to explore.

### Production Build

```bash
pnpm build
pnpm start
```

---

## Environment Variables

Create a `.env.local` file at the root of the project:

```env
# WalletConnect Project ID — required for On-Chain Mode
# Get yours free at https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

> **Note:** The app works fully in **Demo Mode** without any environment setup. The WalletConnect Project ID is only required when enabling On-Chain Mode to connect a real wallet.

---

## Smart Contracts

All contracts are deployed on **Ethereum Sepolia Testnet**.

| Contract | Address | Etherscan |
|---------|---------|-----------|
| **DSCEngine** | `0xfF303a5Cac35A27a845329761FAc4BE761050A0f` | [View](https://sepolia.etherscan.io/address/0xfF303a5Cac35A27a845329761FAc4BE761050A0f) |
| **DSC Token (ERC-20)** | `0xB5Aaf885eA19e897dE253a47503127Be8BaDd466` | [View](https://sepolia.etherscan.io/address/0xB5Aaf885eA19e897dE253a47503127Be8BaDd466) |

### Supported Collateral Tokens

| Token | Sepolia Address | Price Feed |
|-------|---------|------------|
| **WETH** (Wrapped Ether) | `0xdd13E55209Fd76AfE204dBda4007C227904f0a81` | Chainlink ETH/USD |
| **LINK** (Chainlink Token) | `0x779877A7B0D9E8603169DdbD7836e478b4624789` | Chainlink LINK/USD |

### Protocol Rules

| Parameter | Value |
|-----------|-------|
| Minimum collateralization ratio | **150%** |
| Liquidation threshold | **50%** (health factor below 1.0 = liquidatable) |
| Liquidation bonus | 10% incentive for liquidators |
| Peg target | **$1.00 USD** |

### The Graph Subgraph Endpoint
```
https://api.studio.thegraph.com/query/117195/dsc-protocol-subgraph/v0.0.1
```

---

## Project Structure

```
stablecoin-ui/
├── public/                          # Static assets
│   └── screenshots/                 # (add your screenshots here)
├── src/
│   ├── app/
│   │   ├── constants/
│   │   │   └── demoConstants.ts     # Mock values for demo mode
│   │   ├── history/
│   │   │   ├── page.tsx             # Transaction history page
│   │   │   └── fetchGraphHistory.ts # The Graph data fetching logic
│   │   ├── hooks/
│   │   │   ├── useDemoMode.ts       # Demo/Live mode toggle hook
│   │   │   ├── useMockWallet.ts     # Simulated wallet state & actions
│   │   │   └── getEthPriceUSD.ts    # Chainlink price feed reader
│   │   ├── protocol/
│   │   │   ├── page.tsx             # Protocol analytics page
│   │   │   └── fetchGraphProtocolData.ts
│   │   ├── stylings/                # CSS Modules (per-page styles)
│   │   │   ├── Home.module.css
│   │   │   ├── History.module.css
│   │   │   ├── Protocol.module.css
│   │   │   ├── Header.module.css
│   │   │   └── NavBar.module.css
│   │   ├── globals.css
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home / Dashboard entry point
│   │   └── providers.tsx            # Wagmi + RainbowKit + React Query
│   ├── components/
│   │   ├── Header.tsx               # Top navigation bar
│   │   ├── Home.tsx                 # Main dashboard (all protocol actions)
│   │   ├── NavBar.tsx               # Collapsible side navigation
│   │   ├── LayoutWrapper.tsx        # Conditional header rendering per route
│   │   ├── DemoWrapper.tsx          # Injects mock state into children (Demo Mode)
│   │   └── ModeToggle.tsx           # Demo ↔ On-Chain mode switch button
│   ├── utils/
│   │   ├── addresses.ts             # Deployed contract addresses
│   │   ├── DSCEngine.ts             # DSCEngine ABI
│   │   ├── DSCABI.ts                # DSC Token ABI
│   │   └── sepoliaConfig.ts         # RPC + chain configuration
│   └── rainbowKitConfig.tsx         # RainbowKit wallet config
├── .env.local                       # (create this — not committed)
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Pages & Components

### `/` — Dashboard

The main interaction hub. Shows your real-time protocol stats and exposes all five protocol actions.

**Stats displayed:**
- **Health Factor** — color-coded (green ≥ 1.5 / orange ≥ 1.2 / red < 1.2)
- **Collateral Value** — USD equivalent of locked collateral
- **DSC Minted** — outstanding DSC debt
- **DSC Balance** — DSC tokens currently in your wallet

**Actions available (each as a card):**
- Deposit Collateral (with token selector + MAX button)
- Mint DSC (with max mintable preview)
- Burn DSC
- Redeem Collateral
- Redeem Collateral + Burn DSC (combined operation)

---

### `/protocol` — Protocol Overview

A read-only analytics dashboard showing the health of the entire protocol.

- Total DSC supply (live, from chain)
- Total collateral locked in USD (from subgraph + Chainlink)
- Average collateralization ratio
- Lifetime DSC burned
- **Line chart:** DSC net supply over the last 7 months
- **Pie chart:** Collateral composition (WETH vs LINK share)
- Educational explainers on stablecoin mechanics

---

### `/history` — Transaction History

A filterable, paginated table of all protocol events, sourced from The Graph.

**Filters:**
- My Transactions toggle (filters to connected wallet address)
- Transaction type chips (Mint / Burn / Deposit / Redeem)
- Free-text search (hash or address)
- Date range picker (start → end)

**Additional features:**
- Summary stats (transaction count, total USD volume, latest activity time)
- Pagination (10 per page)
- Refresh button
- Export to CSV
- Etherscan link on every transaction hash
- Skeleton loaders while fetching

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing TypeScript conventions and CSS Module patterns used throughout the project.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built as a hands-on exploration of DeFi stablecoin mechanics, collateral modeling, and on-chain UX.

[Live Demo](https://dscstablecoin.vercel.app/) &nbsp;·&nbsp; [GitHub](https://github.com/Riviya/DSC_StableCoin_UI) &nbsp;·&nbsp; [Etherscan (DSCEngine)](https://sepolia.etherscan.io/address/0xfF303a5Cac35A27a845329761FAc4BE761050A0f)

</div>