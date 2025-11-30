'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BuildInput } from '../types/build';
import { defaultBuildValues } from '../constants/dps/build';
import { buildSchema, BuildSchemaType } from '../types/dps-comparator';

// Import the new sub-components
import LevelInput from './dps-comparator/LevelInput';
import StatsAllocation from './dps-comparator/StatsAllocation';
import EquippedItems from './dps-comparator/EquippedItems';
import MasterySection from './dps-comparator/MasterySection';
import BuffsSection from './dps-comparator/BuffsSection';
import FormActions from './dps-comparator/FormActions';

// Type for the form values (zod inferred) - cast to BuildInput to match our interface
type FormValues = BuildSchemaType;

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
