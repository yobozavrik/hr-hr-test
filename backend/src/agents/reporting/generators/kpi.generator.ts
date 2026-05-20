export class KpiGenerator {
  generate(kpi: any): string {
    return `=== KPI ЗВІТ ===\nШвидкість відповіді: ${kpi.replyTimeHours || 24} год\nЗадоволеність: ${kpi.satisfactionScore || 95}%`;
  }
}
