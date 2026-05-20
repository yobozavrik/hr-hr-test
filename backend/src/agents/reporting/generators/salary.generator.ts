export class SalaryGenerator {
  generate(distribution: any): string {
    return `=== РОЗПОДІЛ ЗАРПЛАТ ===\nМедіана: ${distribution.median || 3500} USD`;
  }
}
