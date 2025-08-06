import { localSentimentAnalyzer } from "../ai/localSentiment";

interface DataSource {
  id: string;
  name: string;
  url: string;
  type: 'reddit' | 'news' | 'social';
  active: boolean;
}

interface HarvestedData {
  id: string;
  source: string;
  content: string;
  url?: string;
  timestamp: Date;
  cryptoSymbols: string[];
  relevanceScore: number;
}

export class DataHarvesterAgent {
  private dataSources: DataSource[] = [
    {
      id: 'reddit_crypto',
      name: 'Reddit Cryptocurrency',
      url: 'https://www.reddit.com/r/cryptocurrency/.json',
      type: 'reddit',
      active: true
    },
    {
      id: 'reddit_bitcoin',
      name: 'Reddit Bitcoin',
      url: 'https://www.reddit.com/r/bitcoin/.json',
      type: 'reddit',
      active: true
    },
    {
      id: 'coindesk_news',
      name: 'CoinDesk News',
      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
      type: 'news',
      active: true
    }
  ];

  private cryptoKeywords = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'cryptocurrency', 'crypto',
    'blockchain', 'defi', 'nft', 'altcoin', 'trading', 'hodl',
    'cardano', 'ada', 'solana', 'sol', 'polkadot', 'dot'
  ];

  async harvestData(cryptoSymbol?: string): Promise<HarvestedData[]> {
    const harvestedData: HarvestedData[] = [];
    
    // Simulate data harvesting with realistic sample data
    // In production, this would make actual API calls to Reddit, news sources, etc.
    const simulatedData = await this.simulateDataHarvesting(cryptoSymbol);
    
    // Filter and process the harvested data
    for (const data of simulatedData) {
      const relevanceScore = this.calculateRelevanceScore(data.content, cryptoSymbol);
      
      if (relevanceScore > 0.3) { // Only keep relevant data
        const entities = localSentimentAnalyzer.extractCryptoEntities(data.content);
        
        harvestedData.push({
          ...data,
          cryptoSymbols: entities.map(e => e.symbol),
          relevanceScore
        });
      }
    }
    
    return harvestedData.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async simulateDataHarvesting(cryptoSymbol?: string): Promise<Omit<HarvestedData, 'cryptoSymbols' | 'relevanceScore'>[]> {
    // Simulated realistic crypto-related content
    const sampleData = [
      {
        id: '1',
        source: 'reddit_crypto',
        content: 'BTC is showing strong support at $45k. This could be the perfect buying opportunity before the next bull run. Diamond hands! 💎',
        url: 'https://reddit.com/r/cryptocurrency/comments/sample1',
        timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
      },
      {
        id: '2', 
        source: 'reddit_bitcoin',
        content: 'Ethereum 2.0 upgrade is revolutionary. The proof of stake consensus will reduce energy consumption by 99%. Very bullish on ETH long term.',
        url: 'https://reddit.com/r/bitcoin/comments/sample2',
        timestamp: new Date(Date.now() - Math.random() * 3600000),
      },
      {
        id: '3',
        source: 'coindesk_news',
        content: 'Major institutional investors are showing increased interest in Solana. SOL has gained 15% this week amid growing DeFi adoption.',
        url: 'https://coindesk.com/markets/sample3',
        timestamp: new Date(Date.now() - Math.random() * 7200000),
      },
      {
        id: '4',
        source: 'reddit_crypto',
        content: 'Warning: Seeing a lot of whale movements in ADA. Could be a dump incoming. Be careful with your positions.',
        url: 'https://reddit.com/r/cryptocurrency/comments/sample4',
        timestamp: new Date(Date.now() - Math.random() * 1800000),
      },
      {
        id: '5',
        source: 'reddit_crypto',
        content: 'HODL strategy is paying off! My portfolio is up 200% this year. Never selling, only buying more on dips. To the moon! 🚀',
        url: 'https://reddit.com/r/cryptocurrency/comments/sample5', 
        timestamp: new Date(Date.now() - Math.random() * 5400000),
      },
      {
        id: '6',
        source: 'coindesk_news',
        content: 'Regulatory uncertainty continues to impact crypto markets. Several exchanges face investigations, creating bearish sentiment.',
        url: 'https://coindesk.com/policy/sample6',
        timestamp: new Date(Date.now() - Math.random() * 3600000),
      },
      {
        id: '7',
        source: 'reddit_bitcoin',
        content: 'Bitcoin adoption by corporations is accelerating. MicroStrategy, Tesla, and Square leading the way. This is just the beginning.',
        url: 'https://reddit.com/r/bitcoin/comments/sample7',
        timestamp: new Date(Date.now() - Math.random() * 7200000),
      },
      {
        id: '8',
        source: 'reddit_crypto',
        content: 'DOT ecosystem is exploding with new parachain auctions. Polkadot fundamentals looking very strong for 2024.',
        url: 'https://reddit.com/r/cryptocurrency/comments/sample8',
        timestamp: new Date(Date.now() - Math.random() * 1800000),
      }
    ];

    // Filter by crypto symbol if specified
    if (cryptoSymbol) {
      return sampleData.filter(data => 
        data.content.toUpperCase().includes(cryptoSymbol.toUpperCase()) ||
        data.content.toLowerCase().includes(this.getFullName(cryptoSymbol)?.toLowerCase() || '')
      );
    }

    return sampleData;
  }

  private calculateRelevanceScore(content: string, targetSymbol?: string): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    
    // Base crypto relevance
    for (const keyword of this.cryptoKeywords) {
      if (lowerContent.includes(keyword)) {
        score += 0.2;
      }
    }
    
    // Specific symbol relevance
    if (targetSymbol) {
      if (lowerContent.includes(targetSymbol.toLowerCase())) {
        score += 0.5;
      }
      const fullName = this.getFullName(targetSymbol);
      if (fullName && lowerContent.includes(fullName.toLowerCase())) {
        score += 0.4;
      }
    }
    
    // Content quality indicators
    if (content.length > 50 && content.length < 500) score += 0.1; // Good length
    if (content.includes('http')) score += 0.1; // Has links/sources
    if (/\d+%/.test(content)) score += 0.1; // Has percentages (price data)
    if (/\$\d+/.test(content)) score += 0.1; // Has price mentions
    
    return Math.min(1, score);
  }

  private getFullName(symbol: string): string | undefined {
    const cryptoNames: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum', 
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'AVAX': 'Avalanche',
      'LINK': 'Chainlink'
    };
    return cryptoNames[symbol.toUpperCase()];
  }

  async getDataSources(): Promise<DataSource[]> {
    return this.dataSources.filter(source => source.active);
  }

  async updateDataSource(sourceId: string, updates: Partial<DataSource>): Promise<void> {
    const index = this.dataSources.findIndex(source => source.id === sourceId);
    if (index !== -1) {
      this.dataSources[index] = { ...this.dataSources[index], ...updates };
    }
  }

  // Health check for data sources
  async checkSourceHealth(): Promise<{ [key: string]: boolean }> {
    const healthStatus: { [key: string]: boolean } = {};
    
    for (const source of this.dataSources) {
      // In production, this would actually ping the APIs
      // For now, simulate random availability
      healthStatus[source.id] = Math.random() > 0.1; // 90% uptime simulation
    }
    
    return healthStatus;
  }
}

export const dataHarvesterAgent = new DataHarvesterAgent();