export class PdfExporter {
  async exportToPdf(content: string, filename: string): Promise<string> {
    console.log(`Exporting content to PDF file: ${filename}`);
    return `/downloads/reports/${filename}.pdf`;
  }
}
