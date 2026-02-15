export interface Puzzle {
  id: string;
  type: string;
  generate(seed: number): any;
  validate(input: any, solution: any): boolean;
}
