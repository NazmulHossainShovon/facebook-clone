'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fruits, swords, accessories, fightingStyles } from '../lib/data';
import { BuildInput } from '../types/build';
import { defaultBuildValues } from '../constants/dps/build';

// Import the new sub-components
import LevelInput from './dps-comparator/LevelInput';
import StatsAllocation from './dps-comparator/StatsAllocation';
import EquippedItems from './dps-comparator/EquippedItems';
import MasterySection from './dps-comparator/MasterySection';
import BuffsSection from './dps-comparator/BuffsSection';
import FormActions from './dps-comparator/FormActions';

// Define the validation schema using Zod
const buildSchema = z
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

// Type for the form values (zod inferred) - cast to BuildInput to match our interface
type FormValues = z.infer<typeof buildSchema>;

interface BuildFormProps {
  buildNumber: 1 | 2;
  onSubmit: (data: BuildInput) => void;
  initialData?: BuildInput;
}

export default function BuildForm({
  buildNumber,
  onSubmit,
  initialData,
}: BuildFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BuildInput>({
    // Use type assertion to bypass the type mismatch
    resolver: zodResolver(buildSchema) as any,
    defaultValues: initialData || defaultBuildValues,
  });

  const onSubmitHandler: SubmitHandler<BuildInput> = data => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="space-y-4 p-4 border rounded-lg bg-white shadow-sm"
    >
      <h2 className="text-xl font-bold text-center mb-4">
        Build {buildNumber}
      </h2>

      {/* Level Input */}
      <LevelInput register={register} errors={errors} />

      {/* Stats Section */}
      <StatsAllocation register={register} errors={errors} watch={watch} />

      {/* Equipped Items */}
      <EquippedItems
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
      />

      {/* Mastery Section */}
      <MasterySection register={register} errors={errors} />

      {/* Buffs Section */}
      <BuffsSection register={register} />

      {/* Form Actions */}
      <FormActions
        buildNumber={buildNumber}
        handleSubmit={handleSubmit(onSubmitHandler)}
        setValue={setValue}
      />
    </form>
  );
}
