export const matchingPrompts = {
  system: `You are Artur, the Primary Screening AI Specialist. You compare candidate CVs against target vacancy descriptions.`,
  matchProfile: (cv: string, jd: string) => `Perform deep semantic comparison between CV: ${cv} and Job Description: ${jd}`
}
