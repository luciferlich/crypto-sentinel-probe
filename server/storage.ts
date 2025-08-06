import { 
  users, type User, type InsertUser,
  cryptocurrencies, type Cryptocurrency, type InsertCryptocurrency,
  sentimentAnalysis, type SentimentAnalysis, type InsertSentimentAnalysis,
  marketData, type MarketData, type InsertMarketData,
  agentWorkflows, type AgentWorkflow, type InsertAgentWorkflow
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cryptocurrency operations
  getCryptocurrency(id: number): Promise<Cryptocurrency | undefined>;
  getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined>;
  createCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency>;
  getAllCryptocurrencies(): Promise<Cryptocurrency[]>;
  
  // Sentiment analysis operations
  createSentimentAnalysis(sentiment: InsertSentimentAnalysis): Promise<SentimentAnalysis>;
  getSentimentAnalysisByCrypto(cryptoId: number, limit?: number): Promise<SentimentAnalysis[]>;
  getRecentSentimentAnalysis(hours?: number): Promise<SentimentAnalysis[]>;
  
  // Market data operations
  createMarketData(market: InsertMarketData): Promise<MarketData>;
  getLatestMarketData(cryptoId: number): Promise<MarketData | undefined>;
  getMarketDataHistory(cryptoId: number, limit?: number): Promise<MarketData[]>;
  
  // Workflow operations
  createWorkflow(workflow: InsertAgentWorkflow): Promise<AgentWorkflow>;
  updateWorkflow(workflowId: string, updates: Partial<AgentWorkflow>): Promise<AgentWorkflow | undefined>;
  getWorkflow(workflowId: string): Promise<AgentWorkflow | undefined>;
  getActiveWorkflows(): Promise<AgentWorkflow[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private cryptocurrencies: Map<number, Cryptocurrency> = new Map();
  private sentimentAnalyses: Map<number, SentimentAnalysis> = new Map();
  private marketDataList: Map<number, MarketData> = new Map();
  private workflows: Map<string, AgentWorkflow> = new Map();
  
  private currentUserId = 1;
  private currentCryptoId = 1;
  private currentSentimentId = 1;
  private currentMarketId = 1;

  constructor() {
    // Initialize with some default cryptocurrencies
    this.initializeDefaultCryptos();
  }

  private async initializeDefaultCryptos() {
    const defaultCryptos = [
      { symbol: 'BTC', name: 'Bitcoin', isActive: true },
      { symbol: 'ETH', name: 'Ethereum', isActive: true },
      { symbol: 'ADA', name: 'Cardano', isActive: true },
      { symbol: 'SOL', name: 'Solana', isActive: true },
      { symbol: 'DOT', name: 'Polkadot', isActive: true }
    ];

    for (const crypto of defaultCryptos) {
      await this.createCryptocurrency(crypto);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Cryptocurrency operations
  async getCryptocurrency(id: number): Promise<Cryptocurrency | undefined> {
    return this.cryptocurrencies.get(id);
  }

  async getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined> {
    return Array.from(this.cryptocurrencies.values()).find(crypto => crypto.symbol === symbol);
  }

  async createCryptocurrency(crypto: InsertCryptocurrency): Promise<Cryptocurrency> {
    const id = this.currentCryptoId++;
    const cryptocurrency: Cryptocurrency = { 
      ...crypto, 
      id,
      isActive: crypto.isActive ?? true
    };
    this.cryptocurrencies.set(id, cryptocurrency);
    return cryptocurrency;
  }

  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return Array.from(this.cryptocurrencies.values()).filter(crypto => crypto.isActive);
  }

  // Sentiment analysis operations
  async createSentimentAnalysis(sentiment: InsertSentimentAnalysis): Promise<SentimentAnalysis> {
    const id = this.currentSentimentId++;
    const analysis: SentimentAnalysis = {
      ...sentiment,
      id,
      timestamp: new Date(),
      url: sentiment.url ?? null
    };
    this.sentimentAnalyses.set(id, analysis);
    return analysis;
  }

  async getSentimentAnalysisByCrypto(cryptoId: number, limit = 50): Promise<SentimentAnalysis[]> {
    return Array.from(this.sentimentAnalyses.values())
      .filter(analysis => analysis.cryptoId === cryptoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getRecentSentimentAnalysis(hours = 24): Promise<SentimentAnalysis[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.sentimentAnalyses.values())
      .filter(analysis => analysis.timestamp >= cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Market data operations
  async createMarketData(market: InsertMarketData): Promise<MarketData> {
    const id = this.currentMarketId++;
    const marketData: MarketData = {
      ...market,
      id,
      timestamp: new Date(),
      volume24h: market.volume24h ?? null,
      marketCap: market.marketCap ?? null,
      percentChange24h: market.percentChange24h ?? null
    };
    this.marketDataList.set(id, marketData);
    return marketData;
  }

  async getLatestMarketData(cryptoId: number): Promise<MarketData | undefined> {
    return Array.from(this.marketDataList.values())
      .filter(data => data.cryptoId === cryptoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async getMarketDataHistory(cryptoId: number, limit = 100): Promise<MarketData[]> {
    return Array.from(this.marketDataList.values())
      .filter(data => data.cryptoId === cryptoId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Workflow operations
  async createWorkflow(workflow: InsertAgentWorkflow): Promise<AgentWorkflow> {
    const agentWorkflow: AgentWorkflow = {
      ...workflow,
      id: this.workflows.size + 1,
      startTime: new Date(),
      currentAgent: workflow.currentAgent ?? null,
      state: workflow.state ?? null,
      endTime: workflow.endTime ?? null
    };
    this.workflows.set(workflow.workflowId, agentWorkflow);
    return agentWorkflow;
  }

  async updateWorkflow(workflowId: string, updates: Partial<AgentWorkflow>): Promise<AgentWorkflow | undefined> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      const updated = { ...workflow, ...updates };
      this.workflows.set(workflowId, updated);
      return updated;
    }
    return undefined;
  }

  async getWorkflow(workflowId: string): Promise<AgentWorkflow | undefined> {
    return this.workflows.get(workflowId);
  }

  async getActiveWorkflows(): Promise<AgentWorkflow[]> {
    return Array.from(this.workflows.values())
      .filter(workflow => workflow.status === 'running' || workflow.status === 'pending');
  }
}

export const storage = new MemStorage();
