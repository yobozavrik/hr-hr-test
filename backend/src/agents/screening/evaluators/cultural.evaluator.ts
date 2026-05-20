export class CulturalEvaluator {
  evaluate(experienceYears: number): number {
    if (experienceYears >= 3) return 85;
    return 70;
  }
}
