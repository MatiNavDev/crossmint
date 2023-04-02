import { AxiosInstance } from "axios";

export enum GoalCellType {
  SPACE = "SPACE",
  POLYANET = "POLYANET",
  SOLOONS = "SOLOON",
  COMETHS = "COMETH",
}

export enum AstralObjectType {
  POLYANET = "polyanets",
  SOLOONS = "soloons",
  COMETHS = "comeths",
}

interface AstralObjectParams {
  row: number;
  column: number;
  type: GoalCellType;
  value: string;
}

export interface AstralObject {
  row: number;
  column: number;
  type: AstralObjectType;
  value: string;

  doCrossRequest(axios: AxiosInstance, candidateId: string): Promise<void>;
  verify(
    value: { type: number; color?: string; direction?: string } | null
  ): Boolean;
}

class AstralStrategy {
  row: number;
  column: number;
  type: AstralObjectType;
  value: string;

  constructor({ row, column, type, value }: AstralObjectParams) {
    this.row = row;
    this.column = column;
    this.type = (type.toLowerCase() + "s") as AstralObjectType;
    this.value = value;
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

  verify(value: { type: number } | null): Boolean {
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

  verify(value: { type: number; color: string } | null): Boolean {
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

  verify(value: { type: number; direction: string } | null): Boolean {
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
        throw new Error("Invalid astral object type");
    }
  }
}
