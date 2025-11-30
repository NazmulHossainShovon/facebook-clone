import apiClient from 'app/lib/api-client';
import { User } from 'app/lib/types';

export interface DpsLimitResponse {
  canCalculate: boolean;
  remainingDpsCalcLimit: number;
  message?: string;
}

export const checkDpsLimit = async (): Promise<DpsLimitResponse> => {
  try {
    const response = await apiClient.get('api/dps/check-limit');
    return response.data;
  } catch (err: any) {
    console.error('Error checking DPS calculation limit:', err);
    throw (
      err.response?.data?.message ||
      'Error checking DPS calculation limit. Please try again later.'
    );
  }
};

export interface UseDpsLimitResponse {
  success: boolean;
  remainingDpsCalcLimit: number;
}

export const useDpsLimit = async (dispatch?: React.Dispatch<any>, userInfo?: User): Promise<UseDpsLimitResponse> => {
  try {
    const response = await apiClient.post('api/dps/use-limit');
    const { remainingDpsCalcLimit } = response.data;

    // If dispatch is provided, update the user info in the store with the new DPS calc limit
    if (dispatch) {
      // Use the provided userInfo from the store and update the remainingDpsCalcLimit
      if (userInfo) {
        const updatedUserInfo = {
          ...userInfo,
          remainingDpsCalcLimit: remainingDpsCalcLimit
        };

        dispatch({ type: 'sign-in', payload: updatedUserInfo });
      }
    }

    return response.data;
  } catch (err: any) {
    console.error('Error using DPS calculation limit:', err);
    throw (
      err.response?.data?.message ||
      'Error updating DPS calculation limit. Please try again later.'
    );
  }
};