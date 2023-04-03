import { AxiosInstance } from 'axios';

export enum GoalCellType {
  SPACE = 'SPACE',
  POLYANET = 'POLYANET',
  SOLOONS = 'SOLOON',
  COMETHS = 'COMETH',
}

export enum AstralObjectType {
  POLYANET = 'polyanets',
  SOLOONS = 'soloons',
  COMETHS = 'comeths',
}

interface AstralObjectParams {
  row: number;
  column: number;
  type: GoalCellType;
  value: string;
}

export interface AstralObject {
  getRow(): number;
  getColumn(): number;
  getType(): AstralObjectType;
  getValue(): string;
  doCrossRequest(axios: AxiosInstance, candidateId: string): Promise<void>;
  verify(value: { type: number; color?: string; direction?: string } | null): boolean;
}

class AstralStrategy {
  protected row: number;
  protected column: number;
  protected type: AstralObjectType;
  protected value: string;

  constructor({ row, column, type, value }: AstralObjectParams) {
    this.row = row;
    this.column = column;
    this.type = (type.toLowerCase() + 's') as AstralObjectType;
    this.value = value;
  }

  getRow(): number {
    return this.row;
  }

  getColumn(): number {
    return this.column;
  }

  getType(): AstralObjectType {
    return this.type;
  }

  getValue(): string {
    return this.value;
  }
}

export class Polyanet extends AstralStrategy implements AstralObject {
  constructor(params: AstralObjectParams) {
    super(params);
  }

  doCrossRequest(axios, candidateId): Promise<void> {
    const postParams = {
      candidateId,
      row: this.row,
      column: this.column,
    };
    return axios.post(`/${this.type}`, postParams);
  }

  verify(value: { type: number } | null): boolean {
    return value?.type === 0;
  }
}

export class Soloons extends AstralStrategy implements AstralObject {
  constructor(params: AstralObjectParams) {
    super(params);
  }

  doCrossRequest(axios, candidateId): Promise<void> {
    const postParams = {
      candidateId,
      row: this.row,
      column: this.column,
      color: this.value,
    };
    return axios.post(`/${this.type}`, postParams);
  }

  verify(value: { type: number; color: string } | null): boolean {
    return value?.type === 1 && value?.color === this.value;
  }
}

export class Comeths extends AstralStrategy implements AstralObject {
  constructor(params: AstralObjectParams) {
    super(params);
  }

  doCrossRequest(axios, candidateId): Promise<void> {
    const postParams = {
      candidateId,
      row: this.row,
      column: this.column,
      direction: this.value,
    };
    return axios.post(`/${this.type}`, postParams);
  }

  verify(value: { type: number; direction: string } | null): boolean {
    return value?.type === 2 && value?.direction === this.value;
  }
}

export class AstralFactory {
  static create(params: AstralObjectParams): AstralObject {
    switch (params.type) {
      case GoalCellType.POLYANET:
        return new Polyanet(params);
      case GoalCellType.SOLOONS:
        return new Soloons(params);
      case GoalCellType.COMETHS:
        return new Comeths(params);
      default:
        throw new Error('Invalid astral object type');
    }
  }
}
