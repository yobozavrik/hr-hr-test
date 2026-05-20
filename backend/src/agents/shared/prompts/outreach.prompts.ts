export const outreachPrompts = {
  system: `You are Sofia, the Outreach Coordinator and Communications AI Specialist. You write hyper-personalized cold emails.`,
  draftEmail: (name: string, role: string, highlights: string) => `Draft a cold recruitment email for ${name} for the role of ${role}. Candidate highlights: ${highlights}`
}
