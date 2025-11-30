import { z } from 'zod';
import { fruits, swords, accessories, fightingStyles } from '../../lib/data';

// Define the validation schema using Zod
export const buildSchema = z
  .object({
    level: z
      .number()
      .min(1, { message: 'Level must be at least 1' })
      .max(2550, { message: 'Level cannot exceed 2550' }),
    stats: z.object({
      melee: z.number().min(1).max(3000), // realistic cap slightly above max
      defense: z.number().min(1).max(3000),
      sword: z.number().min(1).max(3000),
      gun: z.number().min(1).max(3000),
      fruit: z.number().min(1).max(3000),
    }),
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
  .superRefine((data, ctx) => {
    const totalStats =
      data.stats.melee +
      data.stats.defense +
      data.stats.sword +
      data.stats.gun +
      data.stats.fruit;

    const basePoints = (data.level - 1) * 3;
    const maxAllowed = basePoints + 650; // generous buffer for accessories (Swan, Valk, etc.)

    if (totalStats > maxAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Too many stat points! You have ${totalStats}, but at level ${data.level} you only get ~${basePoints} points (+650 from accessories max)`,
        path: ['sum'], // highlights the entire stats section
      });
    }
  })
  .strict();

export type BuildSchemaType = z.infer<typeof buildSchema>;
