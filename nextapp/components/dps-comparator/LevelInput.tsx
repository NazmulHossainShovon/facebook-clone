import { BuildInput } from '../../types/build';
import InputField from '../ui/InputField';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface LevelInputProps {
  register: UseFormRegister<BuildInput>;
  errors: FieldErrors<BuildInput>;
}

export default function LevelInput({ register, errors }: LevelInputProps) {
  return (
    <InputField
      label="Level (1-2550)"
      name="level"
      register={register}
      errors={errors}
      type="number"
      min={1}
      max={2550}
      placeholder="Enter character level"
    />
  );
}