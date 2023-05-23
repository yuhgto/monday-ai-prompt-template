import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

export type MondayApiResponseSuccess = {
  data: Record<string, any>;
  account_id: number;
  is_success: true;
}

export type MondayApiResponseFailure = {
  is_success: false;
  errors?: Record<string, any>[];
  error_message?: string
  status_code?: number;
  error_code?: string;
}

export type MondayApiResponse = MondayApiResponseFailure | MondayApiResponseSuccess;

export function executeMondayApiCall(query: string, options: Record<string, any>): Promise<MondayApiResponse> {
  return monday.api(query, options)
    .then((res: Record<string, any>) => {
      if (res.hasOwnProperty('error_message') || res.hasOwnProperty('error_code') || res.hasOwnProperty('errors')) {
        const apiError = res.error_message ?? res.error_code ?? res.errors
        return {is_success:false, ...res} as MondayApiResponseFailure;
      }
      else return {is_success:true, ...res} as MondayApiResponseSuccess;
    })
    .catch((err) => {
      console.error(err);
      return {is_success: false, ...err} as MondayApiResponseFailure;
    });
}