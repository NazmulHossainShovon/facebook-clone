import { z } from 'zod';
import { fruits, swords, accessories, fightingStyles } from '../../lib/data';

// Define the validation schema using Zod
export const buildSchema = z
  .object({
    level: z
      .number()
      .min(1, { message: 'Level must be at least 1' })
      .max(2550, { message: 'Level cannot exceed 2550' }),
    stats: z
      .object({
        melee: z
          .number()
          .min(0)
          .max(100, { message: 'Melee must be between 0 and 100' }),
        defense: z
          .number()
          .min(0)
          .max(100, { message: 'Defense must be between 0 and 100' }),
        fruit: z
          .number()
          .min(0)
          .max(100, { message: 'Fruit must be between 0 and 100' }),
        sword: z
          .number()
          .min(0)
          .max(100, { message: 'Sword must be between 0 and 100' }),
        gun: z
          .number()
          .min(0)
          .max(100, { message: 'Gun must be between 0 and 100' }),
      })
      .refine(
        data => {
          const total =
            data.melee + data.defense + data.fruit + data.sword + data.gun;
          return total === 100;
        },
        {
          message: 'Stats must sum to 100%',
          path: ['sum'], // path of error
        }
      ),
    mastery: z
      .object({
        melee: z
          .number()
          .min(0)
          .max(600, { message: 'Melee mastery must be between 0 and 600' })
          .optional(),
        fruit: z
          .number()
          .min(0)
          .max(600, { message: 'Fruit mastery must be between 0 and 600' })
          .optional(),
        sword: z
          .number()
          .min(0)
          .max(600, { message: 'Sword mastery must be between 0 and 600' })
          .optional(),
        gun: z
          .number()
          .min(0)
          .max(600, { message: 'Gun mastery must be between 0 and 600' })
          .optional(),
      })
      .optional(),
    equipped: z.object({
      fruit: z.enum([...fruits] as [string, ...string[]]),
      sword: z.enum([...swords] as [string, ...string[]]),
      fightingStyle: z.enum([...fightingStyles] as [string, ...string[]]),
      accessories: z
        .array(z.enum([...accessories] as [string, ...string[]]))
        .default([]),
    }),
    buffs: z
      .object({
        awakening: z.boolean().optional(),
        raceMultiplier: z.number().min(1).max(3).optional(),
        aura: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

export type BuildSchemaType = z.infer<typeof buildSchema>;