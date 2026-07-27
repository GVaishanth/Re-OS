export interface ILevenshteinDistance {
  calculate(a: string, b: string): number;
  findClosestMatch(input: string, candidates: string[], maxDistance?: number): string | null;
}

export class LevenshteinUtil implements ILevenshteinDistance {
  public calculate(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  public findClosestMatch(input: string, candidates: string[], maxDistance = 2): string | null {
    let closest: string | null = null;
    let minDistance = maxDistance + 1;
    for (const candidate of candidates) {
      const dist = this.calculate(input.toLowerCase(), candidate.toLowerCase());
      if (dist < minDistance) {
        minDistance = dist;
        closest = candidate;
      }
    }
    return minDistance <= maxDistance ? closest : null;
  }
}
