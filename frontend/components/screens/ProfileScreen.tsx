'use client';

import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { WizardCard } from '../ui/WizardCard';
import { LevelUpModal } from '../ui/LevelUpModal';
import { StatBar } from '../ui/StatBar';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Attack, WizardStats } from '../../types';

export const ProfileScreen = () => {
  const { walletAddress, ownedWizards, activeWizard, setActiveWizard, refreshWizards } = useGame();
  const [activeTab, setActiveTab] = useState<'WIZARDS' | 'ATTACKS' | 'STATS'>('WIZARDS');
  const router = useRouter();

  const [isLevelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [levelUpWizard, setLevelUpWizard] = useState<WizardStats | null>(null);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);

  const [availableAttacks, setAvailableAttacks] = useState<Attack[]>([]);
  const [selectedAttackIds, setSelectedAttackIds] = useState<string[]>([]);
  const [isSavingAttacks, setIsSavingAttacks] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!walletAddress) router.push('/');
  }, [walletAddress, router]);

  useEffect(() => {
    if (activeTab === 'ATTACKS' && activeWizard) {
      loadAttacks();
    }
  }, [activeTab, activeWizard]);

  const loadAttacks = async () => {
    if (!activeWizard) return;
    try {
       const res = await axios.get(`${API_URL}/api/attacks/catalog/${activeWizard.wizardType}?level=${activeWizard.level}`);
       setAvailableAttacks(res.data);
       
       // Sync local UI state with DB
       if (activeWizard.selectedAttackIds.length > 0 && typeof activeWizard.selectedAttackIds[0] === 'object') {
           setSelectedAttackIds((activeWizard.selectedAttackIds as Attack[]).map(a => a._id));
       } else {
           setSelectedAttackIds(activeWizard.selectedAttackIds as string[]);
       }
    } catch(err) {
       console.error("Failed to fetch attacks:", err);
    }
  };

  const handleSelectWizard = (wizard: WizardStats) => {
    setActiveWizard(wizard);
  };

  const handleLevelUpClick = (wizard: WizardStats) => {
    setLevelUpWizard(wizard);
    setLevelUpModalOpen(true);
  };

  const executeLevelUp = async () => {
    if (!levelUpWizard || !walletAddress) return;
    setIsUpdatingLevel(true);
    try {
      await axios.post(`${API_URL}/api/wizards/levelup`, {
        mintAddress: levelUpWizard.mintAddress,
        walletAddress
      });
      await refreshWizards();
    } catch(err) {
      console.error(err);
      alert("Failed to level up. Check console.");
    } finally {
      setIsUpdatingLevel(false);
      setLevelUpModalOpen(false);
      setLevelUpWizard(null);
    }
  };

  const handleToggleAttack = (attack: Attack) => {
    if (!attack.isUnlocked) return;
    
    if (selectedAttackIds.includes(attack._id)) {
      setSelectedAttackIds(prev => prev.filter(id => id !== attack._id));
    } else {
      if (selectedAttackIds.length < 4) {
        setSelectedAttackIds(prev => [...prev, attack._id]);
      }
    }
  };

  const saveAttacks = async () => {
    if (selectedAttackIds.length !== 4) return alert("Must select exactly 4 attacks.");
    if (!walletAddress || !activeWizard) return;
    
    setIsSavingAttacks(true);
    try {
      await axios.post(`${API_URL}/api/attacks/select`, {
        mintAddress: activeWizard.mintAddress,
        walletAddress,
        attackIds: selectedAttackIds
      });
      await refreshWizards();
      alert("Attacks saved!");
    } catch(err) {
      console.error(err);
      alert("Error saving attacks.");
    } finally {
      setIsSavingAttacks(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => router.push('/')} className="text-[var(--accent)] hover:underline">
          &larr; Back to Dashboard
        </button>
        <h2 className="heading-font text-xl">PROFILE</h2>
      </header>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-2">
        {['WIZARDS', 'ATTACKS', 'STATS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-bold text-sm tracking-wide rounded-t transition-all ${activeTab === tab ? 'bg-[var(--accent)] text-white shadow-inner' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="flex-grow">
        {/* WIZARDS TAB */}
        {activeTab === 'WIZARDS' && (
          <div>
            {ownedWizards.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-gray-400 mb-4 font-mono text-sm max-w-md mx-auto line-relaxed">
                  No SolWizards NFTs found in this wallet. 
                  Make sure your Phantom Wallet is on Devnet and you own a SOLWIZ asset.
                </p>
                <button onClick={() => refreshWizards()} className="btn-secondary">RETRY FETCH</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownedWizards.map(wiz => (
                  <WizardCard 
                    key={wiz.mintAddress} 
                    wizard={wiz} 
                    isActive={activeWizard?.mintAddress === wiz.mintAddress}
                    onSelect={handleSelectWizard}
                    onLevelUp={handleLevelUpClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ATTACKS TAB */}
        {activeTab === 'ATTACKS' && (
          <div>
            {!activeWizard ? (
              <p className="text-center opacity-50 mt-10">Select a wizard first.</p>
            ) : (
              <>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--accent)] mb-1">Combat Deck</h3>
                    <p className="text-xs opacity-70">Select exactly 4 attacks for battle.</p>
                  </div>
                  <div className="font-mono text-sm">
                    Selected: <span className={selectedAttackIds.length === 4 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{selectedAttackIds.length}</span>/4
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {availableAttacks.map(atk => {
                    const isSelected = selectedAttackIds.includes(atk._id);
                    const isLocked = !atk.isUnlocked;

                    return (
                      <div 
                        key={atk._id}
                        onClick={() => handleToggleAttack(atk)}
                        className={`flex flex-col p-3 rounded glass-card cursor-pointer transition-all ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : isSelected ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] bg-blue-900/20' : 'hover:bg-white/5'}`}
                        title={isLocked ? `Requires Level ${atk.minLevel}` : ''}
                      >
                         <div className="flex justify-between mb-2">
                           <span className="font-bold flex items-center gap-2">
                             {atk.emoji} {atk.name} 
                           </span>
                           {isLocked && <span>🔒</span>}
                         </div>
                         <div className="text-xs opacity-70 mb-2 h-10">{atk.description}</div>
                         <div className="flex justify-between text-[10px] font-mono mt-auto pt-2 border-t border-[var(--border)]">
                           <span className="text-red-400">DMG: {atk.damage}</span>
                           <span className="text-blue-400">MP: {atk.mpCost}</span>
                           <span className={atk.effect !== 'none' ? 'text-purple-400' : 'opacity-40'}>EFF: {atk.effect} {atk.effect !== 'none' && `(${atk.effectChance}%)`}</span>
                         </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={saveAttacks}
                    disabled={selectedAttackIds.length !== 4 || isSavingAttacks}
                    className="btn-primary"
                  >
                    {isSavingAttacks ? 'SAVING...' : 'SAVE ATTACK DECK'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'STATS' && (
          <div>
            {!activeWizard ? (
              <p className="text-center opacity-50 mt-10">Select a wizard first.</p>
            ) : (
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold heading-font text-[var(--accent)]">{activeWizard.wizardType} Stats</h3>
                  <div className="px-3 py-1 bg-black/40 rounded border border-[var(--border)] font-mono text-xs">
                    Multiplier: ×{(1 + ((activeWizard.level - 1) * 0.03)).toFixed(2)} (Lvl {activeWizard.level})
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-x-8 gap-y-4 text-sm font-mono items-center">
                  <div className="font-bold opacity-50 border-b border-gray-700 pb-2">NFT Base Stats</div>
                  <div className="font-bold opacity-50 border-b border-gray-700 pb-2 flex">Applied In-Game</div>

                  <div>ATK: {activeWizard.baseStats.attack}</div>
                  <StatBar label="" value={activeWizard.computedStats.attack} max={200} color="#e74c3c" />

                  <div>DEF: {activeWizard.baseStats.defense}</div>
                  <StatBar label="" value={activeWizard.computedStats.defense} max={200} color="#3498db" />

                  <div>SPD: {activeWizard.baseStats.speed}</div>
                  <StatBar label="" value={activeWizard.computedStats.speed} max={200} color="#f1c40f" />

                  <div className="mt-4 pt-4 border-t border-gray-700">HP: {activeWizard.baseStats.hp}</div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                     <StatBar label="" value={activeWizard.computedStats.hp} max={300} color="#2ecc71" />
                  </div>

                  <div>MP: {activeWizard.baseStats.mp}</div>
                  <StatBar label="" value={activeWizard.computedStats.mp} max={300} color="#9b59b6" />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {levelUpWizard && (
        <LevelUpModal 
          isOpen={isLevelUpModalOpen}
          isLoading={isUpdatingLevel}
          wizard={levelUpWizard}
          onConfirm={executeLevelUp}
        />
      )}

    </div>
  );
};
