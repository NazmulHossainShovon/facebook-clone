import { BuildInput } from '../../types/build';
import { UseFormRegister } from 'react-hook-form';

interface BuffsSectionProps {
  register: UseFormRegister<BuildInput>;
}

export default function BuffsSection({ register }: BuffsSectionProps) {
  return (
    <div className="border rounded-md p-4">
      <h3 className="font-medium text-gray-700 mb-3">Buffs</h3>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('buffs.awakening')}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Awakening (Fruit)</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Race Multiplier
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="3"
            {...register('buffs.raceMultiplier', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">e.g., 1.3 for Race V4 transformation</p>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('buffs.aura')}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Aura (+3.4%)</span>
        </label>
      </div>
    </div>
  );
}