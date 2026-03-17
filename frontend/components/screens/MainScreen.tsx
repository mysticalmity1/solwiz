'use client';

import { useGame } from '../../context/GameContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { WalletMultiButtonDynamic } from '../ui/WalletButton';

export const MainScreen = () => {
  const { walletAddress, activeWizard, user } = useGame();
  const router = useRouter();

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] p-4">
        <h1 className="heading-font text-3xl md:text-5xl text-center text-[var(--accent)] mb-8 drop-shadow-[0_0_15px_var(--accent)]">
          SOLWIZARDS
        </h1>
        <p className="mb-8 text-center text-gray-300 max-w-md">
          A real-time multiplayer NFT battle game on Solana. Connect your Phantom wallet to begin your journey.
        </p>
        <WalletMultiButtonDynamic className="!bg-[var(--accent)] !font-bold hover:!bg-opacity-80 transition-all rounded" />
      </div>
    );
  }

  const shortenedAddress = walletAddress ? `${walletAddress.substring(0,4)}...${walletAddress.substring(walletAddress.length-4)}` : '';
  const pendingLevelUps = user?.activeWizardMint ? false : false; // Can use useGame active status

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-4xl mx-auto">
      {/* TOP BAR */}
      <header className="flex justify-between items-center mb-8 glass-card p-4">
        <div className="flex items-center gap-4">
          <WalletMultiButtonDynamic className="!bg-[var(--bg-card)] !text-sm border border-[var(--border)] rounded" />
          <span className="font-mono text-sm">{shortenedAddress}</span>
        </div>
        <button 
          onClick={() => router.push('/battle')}
          className="btn-primary"
        >
          PLAY ⚔️
        </button>
      </header>

      {/* LEVEL UP NOTIF */}
      {/* Example logic: normally hook this to game context pending flags */}
      {/* <div className="bg-yellow-500 text-black font-bold p-3 text-center mb-6 rounded shadow cursor-pointer animate-pulse" 
           onClick={() => router.push('/profile')}>
        ⬆️ Wizard can level up!
      </div> */}

      {/* HERO SECTION */}
      <main className="flex-grow flex flex-col items-center justify-center mb-12">
        {activeWizard ? (
          <div className="flex flex-col items-center">
            <motion.div 
              className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-gray-800 border-2 border-[var(--accent)] shadow-[0_0_30px_rgba(74,158,218,0.3)] flex items-center justify-center mb-6 relative overflow-hidden"
              animate={{ y: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {/* Show NFT image here if exists */}
              <span className="text-8xl">🧙</span>
            </motion.div>
            
            <h2 className="heading-font text-2xl text-[var(--text)] text-center mb-2">
              {user?.username || "Wizard"}
            </h2>
            <div className="flex gap-2 mb-4">
              <span className="bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1 rounded-full text-sm font-bold">
                {activeWizard.wizardType}
              </span>
              <span className="bg-[var(--accent)] px-3 py-1 rounded-full text-sm font-bold text-white">
                Lvl {activeWizard.level}
              </span>
            </div>
            
            <button 
              onClick={() => router.push('/profile')}
              className="btn-secondary"
            >
              WIZARD PROFILE
            </button>
          </div>
        ) : (
          <div className="glass-card p-8 text-center flex flex-col items-center max-w-md">
            <h3 className="text-xl mb-4 font-bold text-[var(--warning)]">No Active Wizard</h3>
            <p className="mb-6 opacity-80 text-sm">
              You need to select a wizard to participate in battles. Go to your Profile to see your Solana NFTs.
            </p>
            <button onClick={() => router.push('/profile')} className="btn-primary">
              GO TO PROFILE
            </button>
          </div>
        )}
      </main>

      {/* RECENT BATTLES */}
      <section>
        <h3 className="heading-font text-lg mb-4 text-[var(--accent)]">RECENT BATTLES</h3>
        <div className="glass-card p-4 flex flex-col gap-3 min-h-[150px]">
          {user?.battleIds && user.battleIds.length > 0 ? (
            user.battleIds.slice(0,3).map((battle: any, i: number) => (
              <div key={i} className="bg-black/40 border border-[var(--border)] p-3 rounded flex justify-between items-center text-sm">
                <div>
                  <span className={`font-bold ${battle.winner === walletAddress ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {battle.winner === walletAddress ? 'WON' : 'LOST'}
                  </span>
                  <span className="mx-2 opacity-50">vs</span>
                  <span className="opacity-90">{battle.player1.walletAddress === walletAddress ? battle.player2.wizardName : battle.player1.wizardName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--accent)] font-bold">+{battle.xpAwarded} XP</span>
                  <div className="text-[10px] opacity-50">{new Date(battle.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          ) : (
             <div className="m-auto opacity-50 text-sm">No battles yet... Step into the arena!</div>
          )}
        </div>
      </section>

    </div>
  );
};
