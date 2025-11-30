import { BuildInput } from '../../types/build';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useState, useEffect } from 'react';

interface FormActionsProps {
  buildNumber: 1 | 2;
  handleSubmit: (e?: React.BaseSyntheticEvent) => void;
  isSaved: boolean;
  setValue: UseFormSetValue<BuildInput>;
  watch: UseFormWatch<BuildInput>;
}

export default function FormActions({
  buildNumber,
  handleSubmit,
  isSaved,
  setValue,
  watch,
}: FormActionsProps) {
  // Watch all form fields to detect changes
  const watchedFields = watch();

  const handleSaveClick = (e: React.BaseSyntheticEvent) => {
    // handleSubmit will call onSubmitHandler which updates the saved state
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        type="submit"
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSaved
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        onClick={handleSaveClick}
      >
        {isSaved
          ? `Save Build ${buildNumber} (Saved)`
          : `Save Build ${buildNumber}`}
      </button>

      <button
        type="button"
        className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => {
          // Pre-fill with sample data
          setValue('level', buildNumber === 1 ? 2000 : 1800);
          setValue('stats.melee', buildNumber === 1 ? 30 : 25);
          setValue('stats.defense', buildNumber === 1 ? 20 : 25);
          setValue('stats.fruit', buildNumber === 1 ? 25 : 30);
          setValue('stats.sword', buildNumber === 1 ? 20 : 15);
          setValue('stats.gun', buildNumber === 1 ? 5 : 5);
          setValue('equipped.fruit', buildNumber === 1 ? 'Dragon' : 'Phoenix');
          setValue('equipped.sword', buildNumber === 1 ? 'Yama' : 'Enma');
          setValue(
            'equipped.fightingStyle',
            buildNumber === 1 ? 'Dragon Talon' : 'Cat Feet'
          );
          setValue(
            'equipped.accessories',
            buildNumber === 1
              ? ['Hunter Cape', 'Swan Glasses']
              : ['Leather Cap', 'Buster Call']
          );
          setValue('mastery.melee', buildNumber === 1 ? 300 : 250);
          setValue('mastery.fruit', buildNumber === 1 ? 400 : 350);
          setValue('mastery.sword', buildNumber === 1 ? 500 : 450);
          setValue('mastery.gun', buildNumber === 1 ? 200 : 150);
          setValue('buffs.awakening', buildNumber === 1 ? true : false);
          setValue('buffs.raceMultiplier', buildNumber === 1 ? 1.3 : 1.0);
          setValue('buffs.aura', buildNumber === 1 ? true : false);
        }}
      >
        Load Sample Build {buildNumber}
      </button>
    </div>
  );
}
