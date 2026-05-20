export class WorkUaScraper {
  async search(query: string, location?: string): Promise<any[]> {
    console.log(`WorkUaScraper searching for: ${query} in ${location || 'Anywhere'}`);
    return [
      { name: 'Oleksandr Kovalenko', title: `Lead ${query}`, platform: 'Work.ua', salary: '150000 UAH' },
    ];
  }
}
