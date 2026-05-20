export class SkillsScorer {
  score(candidateSkills: string[], requiredSkills: string[]): number {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    const matches = candidateSkills.filter(s => requiredSkills.includes(s));
    return Math.round((matches.length / requiredSkills.length) * 100);
  }
}
