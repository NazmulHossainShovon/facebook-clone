import { BuildInput } from '../../types/build';
import InputField from '../ui/InputField';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';

interface StatsAllocationProps {
  register: UseFormRegister<BuildInput>;
  errors: FieldErrors<BuildInput>;
  watch: UseFormWatch<BuildInput>;
}

export default function StatsAllocation({ register, errors, watch }: StatsAllocationProps) {
  // Watch the stats values to calculate total
  const stats = watch('stats');
  const statsTotal = stats?.melee + stats?.defense + stats?.fruit + stats?.sword + stats?.gun || 0;

  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-gray-700 mb-3">Stats Allocation (must sum to 100%)</h3>

      {/* Stats Total Indicator */}
      <div className={`mb-2 text-sm ${statsTotal === 100 ? 'text-green-600' : 'text-red-600'}`}>
        Total: {statsTotal}%
        {statsTotal !== 100 && <span> (must be 100%)</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <InputField
          label="Melee"
          name="stats.melee"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          registerOptions={{ valueAsNumber: true }}
        />

        <InputField
          label="Defense"
          name="stats.defense"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          registerOptions={{ valueAsNumber: true }}
        />

        <InputField
          label="Fruit"
          name="stats.fruit"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          registerOptions={{ valueAsNumber: true }}
        />

        <InputField
          label="Sword"
          name="stats.sword"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          registerOptions={{ valueAsNumber: true }}
        />

        <InputField
          label="Gun"
          name="stats.gun"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          registerOptions={{ valueAsNumber: true }}
        />
      </div>

      {(errors.stats as any)?.sum && (
        <p className="mt-1 text-sm text-red-600">
          {(errors.stats as any).sum.message}
        </p>
      )}
    </div>
  );
}