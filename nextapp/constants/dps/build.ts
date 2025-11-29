import { BuildInput } from '../../types/build';

export const defaultBuildValues: BuildInput = {
  level: 1000,
  stats: {
    melee: 25,
    defense: 25,
    fruit: 25,
    sword: 25,
    gun: 0,
  },
  equipped: {
    fruit: 'None',
    sword: 'None',
    fightingStyle: 'None',
    accessories: [],
  },
};