export interface Rankable {
  score: number
  candidate: any
}

export class Ranker {
  rank(list: Rankable[]): any[] {
    return list.sort((a, b) => b.score - a.score).map(x => ({
      ...x.candidate,
      matchingScore: x.score
    }));
  }
}
