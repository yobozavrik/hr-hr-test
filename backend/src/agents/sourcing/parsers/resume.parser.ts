export class ResumeParser {
  parse(rawCandidate: any): any {
    return {
      fullName: rawCandidate.name || 'Anonymous Candidate',
      title: rawCandidate.title || 'Software Engineer',
      sourcePlatform: rawCandidate.platform || 'General Sourcing',
      salaryExpectation: rawCandidate.salary || 'Negotiable',
      skills: ['TypeScript', 'Node.js', 'React'],
      experienceYears: 5,
    }
  }
}
