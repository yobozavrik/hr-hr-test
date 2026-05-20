export class SalaryScorer {
  score(expected: string | number, budgetMax: number): number {
    const numExpected = typeof expected === 'number' ? expected : parseInt(String(expected).replace(/[^0-9]/g, '')) || 0;
    if (numExpected === 0 || budgetMax === 0) return 100;
    if (numExpected <= budgetMax) return 100;
    const diff = numExpected - budgetMax;
    const penalty = Math.min(100, Math.round((diff / budgetMax) * 100));
    return 100 - penalty;
  }
}
