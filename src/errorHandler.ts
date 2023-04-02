import { AxiosError } from 'axios';

export const MAX_RETRY_REQUEST = 10;

/**
 * This function is used to delay the execution of the code.
 * @param time {number} The time in milliseconds to delay the execution.
 * @returns {Promise<void>} A promise that will be resolved after the specified time.
 */
function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export class ErrorHandler {
  /**
   * This function handles the backoff strategy.
   * @param error
   * @param retry_backoff {number} The time in milliseconds to delay the execution.
   * @param retry_amount {number} The current amount of retries.
   * @returns {Promise<void>} A promise that will be resolved when the backoff is done.
   * @throws {Error} If the error is not a 429 error.
   */
  static async handleBackoffError(error: AxiosError, retryBackoff: number, retryAmount: number) {
    if (error.response.status === 429 && retryAmount < MAX_RETRY_REQUEST) {
      await delay(retryBackoff);
    } else {
      console.log(error);
      throw new Error(error.message);
    }
  }
}
