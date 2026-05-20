export class LocationScorer {
  score(candidateLoc: string, vacancyLoc: string): number {
    if (vacancyLoc.toLowerCase() === 'remote' || candidateLoc.toLowerCase() === 'remote') return 100;
    if (candidateLoc.toLowerCase() === vacancyLoc.toLowerCase()) return 100;
    return 40; // Partial hybrid overlap
  }
}
