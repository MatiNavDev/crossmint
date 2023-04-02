import axios, { AxiosInstance } from 'axios';
import { AstralFactory, AstralObject, AstralObjectType, GoalCellType } from './astralObject';
import { ErrorHandler, MAX_RETRY_REQUEST } from './errorHandler';

const MAX_RETRY_VERIFICATION = 3;
const MAX_DELAY_BACKOFF = 4000;
const INCREASE_DELAY_BACKOFF = 300;
const INIT_DELAY_BACKOFF = 1000;
const PARALLEL_REQUESTS = 2;

export interface Cross {
  type: AstralObjectType;
  candidateId: string;
}

interface Crosser {
  initCrossGoal(): Promise<void>;
  doCross(): Promise<void>;
}

export class AbstralCrosser implements Crosser {
  private candidateId: string;
  private goal: string[][];
  private axios: AxiosInstance;

  constructor(candidateId: string) {
    this.candidateId = candidateId;
    this.axios = axios.create({
      baseURL: 'https://challenge.crossmint.io/api',
    });
  }

  /**
   * This function initializes the goal by calling the cross API.
   * @returns {Promise<void>} A promise that will be resolved when the goal is initialized.
   */
  async initCrossGoal(): Promise<void> {
    const {
      data: { goal },
    } = await this.axios.get(`/map/${this.candidateId}/goal`);
    this.goal = goal;
  }

  /**
   * This function iterates over the goal and calls the cross API for each cell that is not a space.
   * @returns {Promise<void[]>} An array of promises that will be resolved when all the requests are done.
   */
  async doCross(): Promise<void> {
    const astralObjects: AstralObject[] = [];
    this.goal.forEach((row, rowIndex) => {
      row.forEach((column: GoalCellType, columnIndex) => {
        if (column === 'SPACE') return;
        const cellValues = column.split('_');

        const astralObj = AstralFactory.create({
          row: rowIndex,
          column: columnIndex,
          type: (cellValues[1] || cellValues[0]) as GoalCellType,
          value: cellValues[0].toLowerCase(),
        });

        astralObjects.push(astralObj);
      });
    });

    await this.handleCross(astralObjects);
  }

  private async handleCross(astralObjects: AstralObject[], retry = 0): Promise<void> {
    await this.handleDoingCross(astralObjects);
    await this.verifyCross(astralObjects, retry);
  }

  /**
   * This function consumes the cross API and handles all possible errors that may occur.
   * As for now, it only support a backoff strategy. However we could extend it to be
   * more robust, handling different status codes, etc.
   *
   * @returns {Promise<void>} A promise that will be resolved when the cross cell is configured.
   */
  private async handleDoingCross(astralObjects: AstralObject[]): Promise<void> {
    let retryAmount = 0;
    let index = 0;
    let retryBackoff = INIT_DELAY_BACKOFF;

    while (index < astralObjects.length && retryAmount < MAX_RETRY_REQUEST) {
      const postPromises: Promise<void>[] = [];

      new Array(PARALLEL_REQUESTS).fill(1).forEach((_, amountToSum) => {
        if (index + amountToSum >= astralObjects.length) return;
        const astralObj = astralObjects[index + amountToSum];
        postPromises.push(astralObj.doCrossRequest(this.axios, this.candidateId));
      });

      try {
        console.log(`Doing cross request for ${index} to ${index + PARALLEL_REQUESTS}`);
        await Promise.all(postPromises);
        console.log(`Success for ${index} to ${index + PARALLEL_REQUESTS}`);
        index += PARALLEL_REQUESTS;
        retryAmount = 0;
      } catch (error) {
        retryAmount++;
        await ErrorHandler.handleBackoffError(error, retryBackoff, retryAmount);
        if (retryBackoff < MAX_DELAY_BACKOFF) retryBackoff += INCREASE_DELAY_BACKOFF;
        console.log(`Error for ${index} to ${index + PARALLEL_REQUESTS}`);
      }
    }
    console.log(index, retryBackoff, retryAmount);
  }

  /**
   * This function verifies if the cross was done correctly. If not, calls the cross API again
   * for the abstral objects that were not saved.
   * @param astralObjects {AstralObject[]} The astral objects that were not saved.
   * @param retry {number} The current amount of retries.
   * @returns {Promise<void>} A promise that will be resolved when the cross is verified.
   */
  private async verifyCross(astralObjects: AstralObject[], retry: number): Promise<void> {
    const {
      data: {
        map: { content },
      },
    } = await this.axios.get(`/map/${this.candidateId}`);

    const astralObjNotSaved = astralObjects.filter(
      (astralObj) => !astralObj.verify(content[astralObj.row][astralObj.column])
    );

    if (astralObjNotSaved.length > 0 && retry < MAX_RETRY_VERIFICATION) {
      await this.handleCross(astralObjNotSaved, retry++);
    } else if (astralObjNotSaved.length > 0) {
      throw new Error(
        `There are some abstral objects that were not saved.\n Astral Objects: \n${astralObjNotSaved
          .map(
            (astralObj) =>
              `Row: ${astralObj.row}. Column: ${astralObj.column}. Type: ${astralObj.type}. Value: ${astralObj.value}.`
          )
          .join('\n')}`
      );
    } else {
      console.log('All astral objects were saved.');
    }
  }
}
