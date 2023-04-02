import axios, { AxiosError, AxiosInstance } from "axios";

const MAX_RETRY_BACKOFF = 3000;
const MAX_REQUESTS = 3;

/**
 * There could be more (SOLOONS, COMETHS)
 */
enum GoalCellType {
  SPACE = "SPACE",
  POLYANET = "POLYANET",
}

export enum CrossType {
  POLYANET = "polyanets",
  SOLOONS = "soloons",
  COMETHS = "comeths",
}

export interface Cross {
  type: CrossType;
  candidateId: string;
}

interface GoalResponse {
  goal: string[][];
}

interface Crosser {
  initCrossGoal(): Promise<void>;
  doCross(): Promise<void>;
}

/**
 *  This function is used to delay the execution of the code.
 * @param retry_backoff
 * @returns {Promise<void>} A promise that will be resolved after the specified time.
 */
const delay = (retry_backoff: number) =>
  new Promise((resolve) => setTimeout(resolve, retry_backoff));

interface Coordinates {
  row: number;
  column: number;
}

export class CrosserFactory implements Crosser {
  private cross: Cross;
  private goal: string[][];
  private axios: AxiosInstance;

  constructor(cross: Cross) {
    this.cross = cross;
    this.axios = axios.create({
      baseURL: "https://challenge.crossmint.io/api",
    });
  }

  /**
   * This function initializes the goal by calling the cross API.
   * @returns {Promise<void>} A promise that will be resolved when the goal is initialized.
   */
  async initCrossGoal(): Promise<void> {
    if (!this.cross) return Promise.reject("Cross is not defined");
    const {
      data: { goal },
    } = await this.axios.get(`/map/${this.cross.candidateId}/goal`);
    this.goal = goal;
  }

  /**
   * This function iterates over the goal and calls the cross API for each cell that is not a space.
   * @returns {Promise<void[]>} An array of promises that will be resolved when all the requests are done.
   */
  doCross(): Promise<void> {
    const coordinatesToConsume: Coordinates[] = [];
    this.goal.forEach((row, rowIndex) => {
      row.forEach((column: GoalCellType, columnIndex) => {
        if (column === "SPACE") return;
        if (column !== "POLYANET") throw new Error("Unknown goal cell type");

        coordinatesToConsume.push({ row: rowIndex, column: columnIndex });
      });
    });

    return this.handleDoingCross(coordinatesToConsume);
  }

  /**
   * This function consumes the cross API and handles all possible errors that may occur.
   * As for now, it only support a backoff strategy. However we could extend it to be
   * more robust, handling different status codes, etc.
   *
   * @param row
   * @param column
   * @param retryCount
   * @returns {Promise<void>} A promise that will be resolved when the cross cell is configured.
   */
  private async handleDoingCross(coordinates: Coordinates[]): Promise<void> {
    let index = 0;
    let retry_backoff = 200;

    while (index < coordinates.length && retry_backoff < MAX_RETRY_BACKOFF) {
      const postPromises: Promise<any>[] = [];

      new Array(MAX_REQUESTS).forEach((sum) => {
        if (index + sum >= coordinates.length) return;
        const { row, column } = coordinates[index + sum];
        const postParams = {
          candidateId: this.cross.candidateId,
          row,
          column,
        };
        const postPromise = this.axios.post(`/${this.cross.type}`, postParams);
        postPromises.push(postPromise);
      });

      try {
        await Promise.all(postPromises);
        index += MAX_REQUESTS;
      } catch (error) {
        await this.handleBackoffError(error, retry_backoff);
        retry_backoff += 200;
      }
    }
  }

  /**
   * This function handles the backoff strategy.
   * @param error
   * @param retry_backoff
   * @returns {Promise<void>} A promise that will be resolved when the backoff is done.
   * @throws {Error} If the error is not a 429 error.
   */
  private async handleBackoffError(error: AxiosError, retry_backoff: number) {
    if (error.response.status === 429 && retry_backoff < MAX_RETRY_BACKOFF) {
      await delay(retry_backoff);
    } else {
      throw new Error(error.message);
    }
  }
}
