import { AbstractAgent } from '../base/agent.abstract'
import type { AgentInput } from '../base/agent.interface'
import type { ReportingResult } from '../base/agent.types'
import { WeeklyGenerator } from './generators/weekly.generator'
import { KpiGenerator } from './generators/kpi.generator'
import { PipelineGenerator } from './generators/pipeline.generator'
import { SalaryGenerator } from './generators/salary.generator'
import { PdfExporter } from './exporters/pdf.exporter'
import { CsvExporter } from './exporters/csv.exporter'

export class ReportingAgent extends AbstractAgent {
  readonly id = 'reporting'
  readonly name = 'Олена'
  readonly description = 'Підготовка звітів та аналітики ефективності рекрутингу'
  readonly capabilities = ['report_generation', 'pdf_export', 'csv_export', 'kpi_tracking']

  private weeklyGenerator!: WeeklyGenerator
  private kpiGenerator!: KpiGenerator
  private pipelineGenerator!: PipelineGenerator
  private salaryGenerator!: SalaryGenerator
  private pdfExporter!: PdfExporter
  private csvExporter!: CsvExporter

  protected async onInitialize(): Promise<void> {
    this.weeklyGenerator = new WeeklyGenerator()
    this.kpiGenerator = new KpiGenerator()
    this.pipelineGenerator = new PipelineGenerator()
    this.salaryGenerator = new SalaryGenerator()
    this.pdfExporter = new PdfExporter()
    this.csvExporter = new CsvExporter()
  }

  protected async onExecute(input: AgentInput): Promise<ReportingResult> {
    const reportType = input.payload.reportType || 'weekly'
    const reportData = input.payload.data || {}
    const exportFormat = input.payload.format || 'pdf'

    let summaryText = ''

    switch (reportType) {
      case 'kpi':
        summaryText = this.kpiGenerator.generate(reportData)
        break
      case 'pipeline':
        summaryText = this.pipelineGenerator.generate(reportData)
        break
      case 'salary':
        summaryText = this.salaryGenerator.generate(reportData)
        break
      case 'weekly':
      default:
        summaryText = this.weeklyGenerator.generate(reportData)
        break
    }

    const filename = `report_${reportType}_${Date.now()}`
    let exportedPath = ''

    if (exportFormat === 'csv') {
      exportedPath = await this.csvExporter.exportToCsv([reportData], filename)
    } else {
      exportedPath = await this.pdfExporter.exportToPdf(summaryText, filename)
    }

    return {
      exportedPath,
      summary: summaryText,
      details: {
        reportType,
        exportFormat,
        generatedAt: new Date().toISOString()
      }
    }
  }
}
