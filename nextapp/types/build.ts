export interface BuildInput {
  level: number;
  stats: {
    melee: number;
    defense: number;
    fruit: number;
    sword: number;
    gun: number;
  };
  mastery?: {
    melee?: number; // 0-600
    fruit?: number;
    sword?: number;
    gun?: number;
  };
  equipped: {
    fruit: string;
    sword: string;
    fightingStyle: string;
    accessories: string[];
  };
  buffs?: {
    awakening?: boolean; // Fruit awakening
    raceMultiplier?: number; // e.g., 1.3 for Race V4 transformation
    aura?: boolean; // Aura active (+3.4%)
  };
}

export interface DPSBreakdown {
  meleeDps: number;
  swordDps: number;
  fruitDps: number;
  gunDps: number;
  totalDps: number;
  totalStats: {
    melee: number;
    sword: number;
    fruit: number;
    gun: number;
  };
  multipliers: {
    melee: number;
    sword: number;
    fruit: number;
    gun: number;
  };
}
