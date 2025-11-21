import apiClient from 'app/lib/api-client';
import { User } from 'app/lib/types';

export interface ChartLimitResponse {
  canGenerate: boolean;
  remainingChartsLimit: number;
  message?: string;
}

export const checkChartLimit = async (): Promise<ChartLimitResponse> => {
  try {
    const response = await apiClient.get('api/charts/check-limit');
    return response.data;
  } catch (err: any) {
    console.error('Error checking chart limit:', err);
    throw (
      err.response?.data?.message ||
      'Error checking chart limit. Please try again later.'
    );
  }
};

export interface UseChartLimitResponse {
  success: boolean;
  remainingChartsLimit: number;
}

export const useChartLimit = async (dispatch?: React.Dispatch<any>, userInfo?: User): Promise<UseChartLimitResponse> => {
  try {
    const response = await apiClient.post('api/charts/use-limit');
    const { remainingChartsLimit } = response.data;

    // If dispatch is provided, update the user info in the store with the new chart limit
    if (dispatch) {
      // Use the provided userInfo from the store and update the remainingChartsLimit
      if (userInfo) {
        const updatedUserInfo = {
          ...userInfo,
          remainingChartsLimit: remainingChartsLimit
        };

        dispatch({ type: 'sign-in', payload: updatedUserInfo });
      }
    }

    return response.data;
  } catch (err: any) {
    console.error('Error using chart limit:', err);
    throw (
      err.response?.data?.message ||
      'Error updating chart limit. Please try again later.'
    );
  }
};
