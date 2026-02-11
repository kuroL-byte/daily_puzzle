export function generateMathPuzzle(seed: number) {
  const a = seed % 10 + 3;
  const b = (seed * 2) % 10 + 2;

  return {
    question: `${a} + ${b}`,
    solution: a + b,
  };
}

export function validateMathPuzzle(
  input: number,
  solution: number
) {
  return input === solution;
}
