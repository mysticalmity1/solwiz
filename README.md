# SolWizards ⚔️🧙‍♂️

SolWizards is a real-time, turn-based multiplayer NFT battle game built on the Solana blockchain. Players connect their wallets, select their Wizard NFTs, equip attacks, and battle other players in real-time arenas.

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Socket.io-client, @solana/wallet-adapter-react
- **Backend**: Node.js, Express, Socket.io, Mongoose/MongoDB, @metaplex-foundation/js
- **Blockchain**: Solana Devnet, Phantom Wallet integration

## Features
- **Wallet Authentication**: Connect seamlessly with Phantom.
- **On-Chain Progression**: Wizard levels are updated directly on the NFT metadata via Metaplex when players level up.
- **Strategic Combat**: Select 4 attacks from your class pool before battling. MP management and type-advantages matter!
- **Real-Time Multiplayer**: Instant matchmaking and turn resolution via WebSockets (Socket.io).
- **Stat Growth**: Base stats scale logarithmically via off-chain deterministic logic for balanced continuous progression.

## Getting Started Locally

### Environment Setup
1. Clone this repository.
2. In the `backend` folder, duplicate `.env.example` to `.env` and fill in your `MONGO_URI`, `SOLANA_RPC_URL`, and `BACKEND_KEYPAIR` (Base58 encoded secret key for Metaplex updates).
3. In the `frontend` folder, duplicate `.env.local.example` to `.env.local` and specify the API and Socket URLs.

### Starting the Backend
```bash
cd backend
npm install
npm run dev # or node server.js
```

### Starting the Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to play!

## How to Play
1. Make sure your Phantom wallet is on **Devnet** and holds a SolWizards NFT.
2. **Connect** your wallet on the main screen.
3. Head to the **Profile** to select your active Wizard and equip 4 attacks.
4. Go to the **Battle Arena** to Host a room or Join an opponent's room.
5. Win battles to gain XP and Level Up (updates NFT metadata!).

## Deployment
- **Backend (Render)**: Connect to render.com, use `backend/render.yaml` for a Node web service.
- **Frontend (Vercel)**: Import `frontend` directory into Vercel. Use `vercel.json` config.

---
*Built for the magic of Solana.* 🌐✨
