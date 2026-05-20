export class DataEnricher {
  async enrich(profile: any): Promise<any> {
    return {
      ...profile,
      email: `${profile.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      githubUrl: `github.com/${profile.fullName.toLowerCase().replace(/\s+/g, '')}`,
      isEnriched: true,
    }
  }
}
