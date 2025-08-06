interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  marketCap: number;
  percentChange24h: number;
  timestamp: Date;
}

interface SentimentData {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
  mentionCount: number;
}

interface CorrelationResult {
  symbol: string;
  sentimentMarketCorrelation: number;
  priceDirection: 'up' | 'down' | 'sideways';
  sentimentDirection: 'positive' | 'negative' | 'neutral';
  alignment: 'aligned' | 'divergent' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
}

interface MarketAlert {
  type: 'sentiment_divergence' | 'volume_anomaly' | 'risk_warning' | 'opportunity';
  symbol: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export class MarketCorrelatorAgent {
  private priceHistory: Map<string, MarketData[]> = new Map();
  private sentimentHistory: Map<string, SentimentData[]> = new Map();

  async fetchMarketData(symbol: string): Promise<MarketData> {
    // Simulate market data fetching - in production, use CoinGecko API or similar
    const basePrice = this.getBasePrice(symbol);
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random change
    
    const marketData: MarketData = {
      symbol,
      price: basePrice * (1 + randomChange),
      volume24h: Math.random() * 1000000000, // Random volume
      marketCap: basePrice * Math.random() * 1000000000,
      percentChange24h: randomChange * 100,
      timestamp: new Date()
    };

    // Store in price history
    if (!this.priceHistory.has(symbol)) {
      this.priceHistory.set(symbol, []);
    }
    const history = this.priceHistory.get(symbol)!;
    history.push(marketData);
    
    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift();
    }

    return marketData;
  }

  async correlateWithSentiment(sentimentData: SentimentData[]): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    for (const sentiment of sentimentData) {
      try {
        const marketData = await this.fetchMarketData(sentiment.symbol);
        const correlation = await this.calculateCorrelation(sentiment, marketData);
        results.push(correlation);
      } catch (error) {
        console.error(`Error correlating ${sentiment.symbol}:`, error);
      }
    }

    return results;
  }

  private async calculateCorrelation(sentiment: SentimentData, market: MarketData): Promise<CorrelationResult> {
    // Store sentiment in history
    if (!this.sentimentHistory.has(sentiment.symbol)) {
      this.sentimentHistory.set(sentiment.symbol, []);
    }
    const sentimentHist = this.sentimentHistory.get(sentiment.symbol)!;
    sentimentHist.push(sentiment);
    
    if (sentimentHist.length > 100) {
      sentimentHist.shift();
    }

    // Calculate price direction
    const priceDirection = this.getPriceDirection(market.percentChange24h);
    
    // Determine sentiment direction
    const sentimentDirection = sentiment.sentiment;
    
    // Calculate alignment between sentiment and price
    const alignment = this.calculateAlignment(sentimentDirection, priceDirection);
    
    // Calculate correlation coefficient if we have enough data
    const correlationCoeff = this.calculateCorrelationCoefficient(sentiment.symbol);
    
    // Assess risk level
    const riskLevel = this.assessRiskLevel(sentiment, market, correlationCoeff);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(sentiment, market, alignment, riskLevel);

    return {
      symbol: sentiment.symbol,
      sentimentMarketCorrelation: correlationCoeff,
      priceDirection,
      sentimentDirection,
      alignment,
      riskLevel,
      recommendation,
      confidence: Math.min(sentiment.confidence, 0.9) // Cap confidence at 90%
    };
  }

  private getPriceDirection(percentChange: number): 'up' | 'down' | 'sideways' {
    if (percentChange > 2) return 'up';
    if (percentChange < -2) return 'down';
    return 'sideways';
  }

  private calculateAlignment(
    sentiment: 'positive' | 'negative' | 'neutral',
    price: 'up' | 'down' | 'sideways'
  ): 'aligned' | 'divergent' | 'neutral' {
    if (sentiment === 'neutral' || price === 'sideways') return 'neutral';
    
    if (
      (sentiment === 'positive' && price === 'up') ||
      (sentiment === 'negative' && price === 'down')
    ) {
      return 'aligned';
    }
    
    return 'divergent';
  }

  private calculateCorrelationCoefficient(symbol: string): number {
    const sentimentHist = this.sentimentHistory.get(symbol) || [];
    const priceHist = this.priceHistory.get(symbol) || [];
    
    if (sentimentHist.length < 10 || priceHist.length < 10) {
      return 0; // Not enough data
    }

    // Simple correlation calculation
    // In production, use proper statistical correlation
    const recentSentiments = sentimentHist.slice(-10);
    const recentPrices = priceHist.slice(-10);
    
    let correlation = 0;
    for (let i = 0; i < Math.min(recentSentiments.length, recentPrices.length); i++) {
      const sentScore = recentSentiments[i].score;
      const priceChange = recentPrices[i].percentChange24h / 100;
      correlation += sentScore * priceChange;
    }
    
    return Math.max(-1, Math.min(1, correlation / 10)); // Normalize to [-1, 1]
  }

  private assessRiskLevel(
    sentiment: SentimentData,
    market: MarketData,
    correlation: number
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;
    
    // High sentiment with low confidence = risk
    if (sentiment.sentiment !== 'neutral' && sentiment.confidence < 0.4) {
      riskScore += 2;
    }
    
    // High price volatility = risk
    if (Math.abs(market.percentChange24h) > 10) {
      riskScore += 2;
    }
    
    // Low correlation = unpredictability = risk
    if (Math.abs(correlation) < 0.2) {
      riskScore += 1;
    }
    
    // Divergent sentiment and price = risk
    const alignment = this.calculateAlignment(
      sentiment.sentiment,
      this.getPriceDirection(market.percentChange24h)
    );
    if (alignment === 'divergent') {
      riskScore += 2;
    }
    
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private generateRecommendation(
    sentiment: SentimentData,
    market: MarketData,
    alignment: 'aligned' | 'divergent' | 'neutral',
    riskLevel: 'low' | 'medium' | 'high'
  ): string {
    if (riskLevel === 'high') {
      return `High risk detected for ${sentiment.symbol}. Exercise extreme caution. Consider reducing position size.`;
    }
    
    if (alignment === 'aligned' && sentiment.confidence > 0.7) {
      if (sentiment.sentiment === 'positive') {
        return `Positive sentiment aligns with price movement. Consider buying opportunity with proper risk management.`;
      } else if (sentiment.sentiment === 'negative') {
        return `Negative sentiment aligns with price decline. Consider selling or shorting with stop losses.`;
      }
    }
    
    if (alignment === 'divergent') {
      return `Sentiment and price are diverging. Monitor closely for potential trend reversal.`;
    }
    
    if (riskLevel === 'medium') {
      return `Medium risk level. Wait for clearer signals before making significant moves.`;
    }
    
    return `Low risk, neutral sentiment. Good for DCA strategy or holding current positions.`;
  }

  async generateMarketAlerts(correlations: CorrelationResult[]): Promise<MarketAlert[]> {
    const alerts: MarketAlert[] = [];
    
    for (const correlation of correlations) {
      // Risk warnings
      if (correlation.riskLevel === 'high') {
        alerts.push({
          type: 'risk_warning',
          symbol: correlation.symbol,
          message: `High risk detected for ${correlation.symbol}: ${correlation.recommendation}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
      
      // Sentiment divergence alerts
      if (correlation.alignment === 'divergent' && correlation.confidence > 0.6) {
        alerts.push({
          type: 'sentiment_divergence',
          symbol: correlation.symbol,
          message: `Sentiment-price divergence detected for ${correlation.symbol}. Potential trend reversal.`,
          severity: 'medium',
          timestamp: new Date()
        });
      }
      
      // Opportunity alerts
      if (
        correlation.alignment === 'aligned' &&
        correlation.riskLevel === 'low' &&
        correlation.confidence > 0.7
      ) {
        alerts.push({
          type: 'opportunity',
          symbol: correlation.symbol,
          message: `Strong ${correlation.sentimentDirection} sentiment aligns with price for ${correlation.symbol}`,
          severity: 'low',
          timestamp: new Date()
        });
      }
    }
    
    return alerts;
  }

  private getBasePrice(symbol: string): number {
    // Simulated base prices for common cryptos
    const basePrices: { [key: string]: number } = {
      'BTC': 45000,
      'ETH': 2800,
      'ADA': 0.45,
      'SOL': 95,
      'DOT': 7.2,
      'MATIC': 0.85,
      'AVAX': 25,
      'LINK': 15
    };
    
    return basePrices[symbol] || 1; // Default to $1 for unknown symbols
  }

  // Get market summary for dashboard
  getMarketSummary(): {
    totalTracked: number;
    highRiskAssets: number;
    divergentSignals: number;
    lastUpdate: Date;
  } {
    const totalTracked = this.priceHistory.size;
    
    // This would be calculated from actual data in production
    return {
      totalTracked,
      highRiskAssets: Math.floor(totalTracked * 0.15), // Simulate 15% high risk
      divergentSignals: Math.floor(totalTracked * 0.25), // Simulate 25% divergent
      lastUpdate: new Date()
    };
  }
}

export const marketCorrelatorAgent = new MarketCorrelatorAgent();