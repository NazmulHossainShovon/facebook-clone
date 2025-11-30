'use client';

import ProtectedRoute from 'components/ProtectedRoute';
import BuildForm from 'components/BuildForm';
import ComparisonTable from 'components/ComparisonTable';
import { calculateDPS } from 'lib/calculations';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { Store } from 'app/lib/store';
import { useToast } from 'app/hooks/use-toast';
import { checkDpsLimit, useDpsLimit } from 'utils/dps/dpsLimitUtils';
import { BuildInput } from 'types/build';

export default function BloxFruitsComparatorPage() {
  const [build1, setBuild1] = useState<BuildInput | null>(null);
  const [build2, setBuild2] = useState<BuildInput | null>(null);
  const [comparison, setComparison] = useState<{
    dps1: number;
    dps2: number;
    diff: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const {
    state: { userInfo },
    dispatch,
  } = useContext(Store);

  const handleCompare = async () => {
    if (build1 && build2) {
      try {
        setLoading(true);

        // Check if user has remaining DPS calculation limit
        const limitCheck = await checkDpsLimit();

        if (!limitCheck.canCalculate) {
          toast({
            title: 'Error',
            description: limitCheck.message || 'You have reached your DPS calculation limit. Please upgrade your account to continue.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Calculate DPS for both builds
        const dps1 = calculateDPS(build1);
        const dps2 = calculateDPS(build2);

        // Calculate percentage difference
        const diff = dps2 !== 0 ? ((dps1 - dps2) / dps2) * 100 : 0;

        // Use up one DPS calculation from the user's limit
        await useDpsLimit(dispatch, userInfo);

        setComparison({ dps1, dps2, diff });

        toast({
          title: 'Success',
          description: 'DPS comparison completed successfully!',
        });
      } catch (err: any) {
        console.error('Error comparing builds:', err);
        toast({
          title: 'Error',
          description: err.message || 'An error occurred while calculating DPS. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setBuild1(null);
    setBuild2(null);
    setComparison(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-center mb-2">
            Blox Fruits Build DPS Comparator
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Compare the damage output of different Blox Fruits builds
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <BuildForm
              buildNumber={1}
              onSubmit={setBuild1}
              initialData={build1 || undefined}
            />
            <BuildForm
              buildNumber={2}
              onSubmit={setBuild2}
              initialData={build2 || undefined}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              className={`px-6 py-3 rounded-lg font-medium ${
                build1 && build2
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleCompare}
              disabled={!build1 || !build2 || loading}
            >
              {loading ? 'Calculating DPS...' : 'Calculate DPS Comparison'}
            </button>

            <button
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 shadow-md"
              onClick={handleReset}
            >
              Reset All
            </button>
          </div>

          {comparison && (
            <div className="mt-8 animate-fadeIn">
              <ComparisonTable data={comparison} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
