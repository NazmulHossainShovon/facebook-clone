const jstat = require("jstat").jStat;

type VariantStats = {
  key: string;
  impressions: number;
  conversions: number;
};

export function calculateThompsonWeights(
  variants: VariantStats[],
  samples: number = 10000
): Record<string, number> {
  const wins: Record<string, number> = {};
  for (const variant of variants) {
    wins[variant.key] = 0;
  }

  for (let i = 0; i < samples; i += 1) {
    let maxSample = -1;
    let winningKey: string | null = null;

    for (const variant of variants) {
      const alpha = Math.max(1, variant.conversions + 1);
      const betaParam = Math.max(1, variant.impressions - variant.conversions + 1);
      const sample = jstat.beta.sample(alpha, betaParam) as number;

      if (sample > maxSample) {
        maxSample = sample;
        winningKey = variant.key;
      }
    }

    if (winningKey) {
      wins[winningKey] += 1;
    }
  }

  const weights: Record<string, number> = {};
  for (const variant of variants) {
    const rawWeight = wins[variant.key] / samples;
    weights[variant.key] = Math.max(0.05, rawWeight);
  }

  const sumWeights = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  for (const key of Object.keys(weights)) {
    weights[key] = parseFloat((weights[key] / sumWeights).toFixed(4));
  }

  return weights;
}
