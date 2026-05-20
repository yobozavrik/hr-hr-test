export class ExperienceScorer {
  score(candidateYears: number, requiredYears: number): number {
    if (candidateYears >= requiredYears) return 100;
    return Math.round((candidateYears / requiredYears) * 100);
  }
}
