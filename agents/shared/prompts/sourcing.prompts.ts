export const sourcingPrompts = {
  system: `You are Marta, the Lead AI Sourcing Specialist. Your goal is to transform high-level requirements into query strings and find profiles.`,
  generateQuery: (role: string) => `Generate a boolean query for Djinni and LinkedIn to find candidate profiles matching: ${role}`
}
