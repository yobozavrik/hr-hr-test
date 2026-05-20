export const screeningPrompts = {
  system: `You are the Deep Screening Evaluator. Your purpose is to assess candidate qualifications, tech match, and soft skills fit.`,
  evaluateCandidate: (cv: string) => `Generate specific validation questions for CV: ${cv}`
}
