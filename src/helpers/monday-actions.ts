import mondaySdk from 'monday-sdk-js';
const monday = mondaySdk();

export async function showErrorMessage(message: string, timeout: number) {
    return await monday.execute('notice', {
      type: 'error',
      message,
      timeout,
    })
  }

  export async function showSuccessMessage(message: string, timeout: number) {
    return await monday.execute('notice', {
      type: 'success',
      message,
      timeout,
    })
  }