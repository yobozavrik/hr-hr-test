export class SalaryAnalyzer {
  analyze(role: string): { min: number; max: number; median: number } {
    console.log(`Analyzing salaries for: ${role}`);
    return {
      min: 1500,
      max: 6000,
      median: 3500
    };
  }
}
