import { BuildInput } from '../../types/build';
import InputField from '../ui/InputField';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface MasterySectionProps {
  register: UseFormRegister<BuildInput>;
  errors: FieldErrors<BuildInput>;
}

export default function MasterySection({ register, errors }: MasterySectionProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-gray-700 mb-3">Mastery Levels</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <InputField
          label="Melee Mastery"
          name="mastery.melee"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={600}
          placeholder="0-600"
        />

        <InputField
          label="Fruit Mastery"
          name="mastery.fruit"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={600}
          placeholder="0-600"
        />

        <InputField
          label="Sword Mastery"
          name="mastery.sword"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={600}
          placeholder="0-600"
        />

        <InputField
          label="Gun Mastery"
          name="mastery.gun"
          register={register}
          errors={errors}
          type="number"
          min={0}
          max={600}
          placeholder="0-600"
        />
      </div>
    </div>
  );
}