export interface WizardNFT {
  mintAddress: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: {
    type: string;
    level: number;
    attack: number;
    defense: number;
    speed: number;
    hp: number;
    mp: number;
  };
}

export interface BaseStats {
  attack: number;
  defense: number;
  speed: number;
  hp: number;
  mp: number;
}

export interface ComputedStats extends BaseStats {}

export interface WizardStats {
  _id: string;
  mintAddress: string;
  ownerWallet: string;
  wizardType: string;
  level: number;
  totalXp: number;
  xpToNextLevel: number;
  baseStats: BaseStats;
  computedStats: ComputedStats;
  selectedAttackIds: Attack[] | string[];
  levelUpPending: boolean;
}

export interface Attack {
  _id: string;
  name: string;
  wizardType: string;
  description: string;
  damage: number;
  mpCost: number;
  minLevel: number;
  attackType: string;
  effect: string;
  effectChance: number;
  cooldown: number;
  emoji: string;
  isUnlocked?: boolean;
}

export interface User {
  _id: string;
  walletAddress: string;
  username: string;
  activeWizardMint: string | null;
  selectedAttacks: string[] | Attack[];
  battleIds: any[];
  totalXp: number;
}

export interface BattleState {
  roomId: string;
  player1: BattlePlayerState;
  player2: BattlePlayerState;
  state: "waiting" | "active" | "finished";
  winner?: string;
  loser?: string;
  xpAwarded?: number;
  effects?: {
    player1?: Record<string, { turnsLeft: number }>;
    player2?: Record<string, { turnsLeft: number }>;
  };
}

export interface BattlePlayerState {
  walletAddress: string;
  mintAddress: string;
  wizardName: string;
  wizardType: string;
  level: number;
  stats: ComputedStats;
  selectedAttacks: Attack[];
  hpRemaining: number;
  mpRemaining: number;
  xpBefore: number;
}

export interface TurnResult {
  newState: BattleState;
  turnLogs: BattleLogEntry[];
}

export interface BattleLogEntry {
  actingPlayer: "player1" | "player2" | "environment";
  actionType: "attack" | "skill" | "potion" | "skip" | "fallback" | "effect";
  attackName?: string;
  damageDealt?: number;
  mpUsed?: number;
  isCritical?: boolean;
  message: string;
}

export interface RecentBattle {
  _id: string;
  opponentName: string;
  outcome: "WON" | "LOST" | "DRAW";
  xpGained: number;
  date: string;
}
