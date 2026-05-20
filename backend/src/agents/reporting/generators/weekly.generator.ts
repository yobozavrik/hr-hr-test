export class WeeklyGenerator {
  generate(metrics: any): string {
    return `=== ТИЖНЕВИЙ ЗВІТ ===\nОброблено резюме: ${metrics.processedCount || 0}\nЗнайдено кандидатів: ${metrics.foundCount || 0}`;
  }
}
