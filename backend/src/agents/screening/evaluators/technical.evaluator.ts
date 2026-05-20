export class TechnicalEvaluator {
  evaluate(skills: string[]): number {
    if (skills.includes('TypeScript') || skills.includes('React')) return 90;
    return 60;
  }
}
