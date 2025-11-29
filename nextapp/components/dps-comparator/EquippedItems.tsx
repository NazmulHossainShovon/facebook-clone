import { BuildInput } from '../../types/build';
import SelectField from '../ui/SelectField';
import MultiSelect from '../ui/MultiSelect';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { fruits, swords, accessories, fightingStyles } from '../../lib/data';

interface EquippedItemsProps {
  register: UseFormRegister<BuildInput>;
  errors: FieldErrors<BuildInput>;
  watch: UseFormWatch<BuildInput>;
  setValue: UseFormSetValue<BuildInput>;
}

export default function EquippedItems({ register, errors, watch, setValue }: EquippedItemsProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-gray-700 mb-3">Equipped Items</h3>

      <SelectField
        label="Fruit"
        name="equipped.fruit"
        register={register}
        errors={errors}
        options={Array.from(fruits)}
        placeholder="Select a fruit"
      />

      <SelectField
        label="Sword"
        name="equipped.sword"
        register={register}
        errors={errors}
        options={Array.from(swords)}
        placeholder="Select a sword"
      />

      <SelectField
        label="Fighting Style"
        name="equipped.fightingStyle"
        register={register}
        errors={errors}
        options={Array.from(fightingStyles)}
        placeholder="Select a fighting style"
      />

      <MultiSelect
        label="Accessories"
        name="equipped.accessories"
        register={register}
        errors={errors}
        options={Array.from(accessories)}
        value={watch('equipped.accessories') || []}
        onChange={(value) => setValue('equipped.accessories', value, { shouldValidate: true })}
      />
    </div>
  );
}