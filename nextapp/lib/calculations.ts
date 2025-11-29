import { BuildInput, DPSBreakdown } from '../types/build';

const SCALING_FACTOR = 0.0346759259;
const BASE_DAMAGE = 35; // Calibrated base for M1/ability approximation
const WEIGHTS = {
  melee: 0.5,
  sword: 0.3,
  fruit: 0.2,
  gun: 0.1,
} as const;

export function calculateDPS(build: BuildInput): number {
  const result = calculateDetailedDPS(build);
  return Math.round(result.totalDps);
}

export function calculateDetailedDPS(build: BuildInput): DPSBreakdown {
  const totalMelee = getTotalStat(
    build.stats.melee,
    build.mastery?.melee ?? 0,
    build.level
  );
  const totalSword = getTotalStat(
    build.stats.sword,
    build.mastery?.sword ?? 0,
    build.level
  );
  const totalFruit = getTotalStat(
    build.stats.fruit,
    build.mastery?.fruit ?? 0,
    build.level
  );
  const totalGun = getTotalStat(
    build.stats.gun,
    build.mastery?.gun ?? 0,
    build.level
  );

  const meleePotential = calculatePotential(totalMelee);
  const swordPotential = calculatePotential(totalSword);
  const fruitPotential = calculatePotential(totalFruit);
  const gunPotential = calculatePotential(totalGun);

  const mults = getMultipliers(build);

  const buffsMult =
    (build.buffs?.raceMultiplier ?? 1.0) * (build.buffs?.aura ? 1.034 : 1.0);

  const meleeMult = mults.melee * buffsMult;
  const swordMult = mults.sword * buffsMult;
  const fruitMult =
    mults.fruit * (build.buffs?.awakening ? 1.2 : 1.0) * buffsMult;
  const gunMult = mults.gun * buffsMult;

  const meleeDps = meleePotential * meleeMult * WEIGHTS.melee;
  const swordDps = swordPotential * swordMult * WEIGHTS.sword;
  const fruitDps = fruitPotential * fruitMult * WEIGHTS.fruit;
  const gunDps = gunPotential * gunMult * WEIGHTS.gun;

  const totalDps = meleeDps + swordDps + fruitDps + gunDps;

  return {
    meleeDps,
    swordDps,
    fruitDps,
    gunDps,
    totalDps,
    totalStats: {
      melee: totalMelee,
      sword: totalSword,
      fruit: totalFruit,
      gun: totalGun,
    },
    multipliers: {
      melee: meleeMult,
      sword: swordMult,
      fruit: fruitMult,
      gun: gunMult,
    },
  };
}

function getTotalStat(
  allocated: number,
  mastery: number,
  level: number
): number {
  const bonus = mastery / 4 + level * (mastery / 600) * 0.1;
  return Math.floor(allocated + bonus);
}

function calculatePotential(totalStat: number): number {
  const multiplier = totalStat * SCALING_FACTOR + 1;
  const flat = totalStat * 0.5;
  return flat + BASE_DAMAGE * multiplier;
}

function getMultipliers(build: BuildInput): {
  melee: number;
  sword: number;
  fruit: number;
  gun: number;
} {
  const fruitMult = getFruitMultiplier(build.equipped.fruit);
  const swordMult = getSwordMultiplier(build.equipped.sword);
  const fightingStyleMult = getFightingStyleMultiplier(
    build.equipped.fightingStyle
  );
  const accMelee = getAccessoryBoost('melee', build.equipped.accessories);
  const accSword = getAccessoryBoost('sword', build.equipped.accessories);
  const accFruit = getAccessoryBoost('fruit', build.equipped.accessories);
  const accGun = getAccessoryBoost('gun', build.equipped.accessories);

  return {
    melee: fightingStyleMult * accMelee,
    sword: swordMult * accSword,
    fruit: fruitMult * accFruit,
    gun: accGun, // Guns have fewer specific mults
  };
}

function getFruitMultiplier(fruit: string): number {
  const multipliers: Record<string, number> = {
    Dragon: 1.5,
    Leopard: 1.3,
    Mammoth: 1.4,
    Kitsune: 1.35,
    Phoenix: 1.45,
    Ryu: 1.6,
    String: 1.2,
    Dark: 1.4,
    Light: 1.35,
    Venom: 1.25,
    Ice: 1.2,
    Fire: 1.25,
    Quake: 1.55,
    Hawk: 1.3,
    // Add more as needed
  };
  return multipliers[fruit] ?? 1.0;
}

function getSwordMultiplier(sword: string): number {
  const multipliers: Record<string, number> = {
    Tushita: 1.2,
    Yama: 1.35,
    Enma: 1.4,
    'Shark Anchor': 1.25,
    Girahaku: 1.15, // Assuming
    Ashura: 1.3,
    'Ame no Habakiri': 1.25,
    Kabutowari: 1.2,
    Nodachi: 1.15,
    Katana: 1.1,
    // Add high-end like Cursed Dual Katana: 1.45 etc.
  };
  return multipliers[sword] ?? 1.0;
}

function getFightingStyleMultiplier(style: string): number {
  const multipliers: Record<string, number> = {
    Godhuman: 1.3,
    'Sanguine Art': 1.25,
    'Electric Claw': 1.2,
    'Death Step': 1.2,
    'Dragon Talon': 1.15,
    'Sharkman Karate': 1.1,
    Superhuman: 1.05,
    // Add more
  };
  return multipliers[style] ?? 1.0;
}

function getAccessoryBoost(
  category: 'melee' | 'sword' | 'fruit' | 'gun',
  accessories: string[]
): number {
  const boosts: Record<
    string,
    Partial<Record<'melee' | 'sword' | 'fruit' | 'gun', number>>
  > = {
    'Dark Coat': { fruit: 0.15 },
    'Pale Scarf': { fruit: 0.15, sword: 0.15 },
    'Dojo Belt': { melee: 0.16 },
    'Hunter Cape': { melee: 0.1, sword: 0.1 }, // Approx
    'Swan Glasses': { fruit: 0.08 }, // Approx
    // Add more from wiki: e.g., 'Marine Coat': { fruit: 0.03 },
  };

  let totalBoost = 0;
  for (const acc of accessories) {
    const boost = boosts[acc];
    if (boost) {
      totalBoost += boost[category] ?? 0;
    }
  }
  return 1 + totalBoost;
}
