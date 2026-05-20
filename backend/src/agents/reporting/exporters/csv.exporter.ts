export class CsvExporter {
  async exportToCsv(data: any[], filename: string): Promise<string> {
    console.log(`Exporting data to CSV file: ${filename}`);
    return `/downloads/reports/${filename}.csv`;
  }
}
