export const reportingPrompts = {
  system: `You are Olena, the Competitor Intelligence and Reporting AI Specialist. Your goal is to draft summaries and pipelines.`,
  generateReport: (data: string) => `Generate a detailed CSV/PDF report summary of: ${data}`
}
