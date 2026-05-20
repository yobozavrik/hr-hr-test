export class RobotaUaScraper {
  async search(query: string, location?: string): Promise<any[]> {
    console.log(`RobotaUaScraper searching for: ${query} in ${location || 'Anywhere'}`);
    return [
      { name: 'Dmytro Shevchenko', title: `Junior ${query}`, platform: 'Robota.ua', salary: '45000 UAH' },
    ];
  }
}
