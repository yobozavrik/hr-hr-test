export class MarketAnalyzer {
  getDemandIndex(role: string): 'low' | 'medium' | 'high' {
    console.log(`Analyzing market demand index for: ${role}`);
    return 'high';
  }
}
