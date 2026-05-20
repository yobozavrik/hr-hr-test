export class AvailabilityEvaluator {
  evaluate(noticePeriod?: string): number {
    if (!noticePeriod || noticePeriod.toLowerCase().includes('immediate')) return 100;
    return 80;
  }
}
