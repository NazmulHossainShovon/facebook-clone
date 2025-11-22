'use client';

import React, { useContext } from 'react';
import { Store } from '../../lib/store';
import ProtectedRoute from 'components/ProtectedRoute';

const AccountPage = () => {
  const {
    state: { userInfo },
  } = useContext(Store);

  // Using actual user data
  const remainingchartsLimit = userInfo?.remainingChartsLimit || 0;
  const remainingCharts = remainingchartsLimit;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Account Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {userInfo?.name}! Here's your chart generation
                overview.
              </p>
            </div>

            {/* Remaining Charts Display */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {remainingCharts === -1 ? 'Chart Limit' : 'Remaining Charts'}
                  </h3>
                  <p className="text-4xl font-bold text-green-600">
                    {remainingCharts === -1 ? 'Unlimited' : remainingCharts}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AccountPage;
