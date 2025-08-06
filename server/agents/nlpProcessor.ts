import { localSentimentAnalyzer } from "../ai/localSentiment";

interface ProcessedData {
  id: string;
  originalContent: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
  entities: CryptoEntity[];
  topics: string[];
  emotionalTone: string;
  riskFactors: string[];
}

interface CryptoEntity {
  symbol: string;
  mentions: number;
  context: string[];
}

interface AnalysisMetrics {
  totalProcessed: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  averageConfidence: number;
  topEntities: string[];
}

export class NLPProcessorAgent {
  private riskKeywords = [
    'scam', 'rug pull', 'ponzi', 'pump and dump', 'insider trading',
    'manipulation', 'whale movement', 'liquidation', 'margin call',
    'regulatory risk', 'investigation', 'ban', 'crackdown'
  ];

  private topicKeywords = {
    'regulation': ['sec', 'regulation', 'regulatory', 'compliance', 'legal'],
    'adoption': ['adoption', 'institutional', 'mainstream', 'corporate', 'enterprise'],
    'technology': ['upgrade', 'protocol', 'blockchain', 'smart contract', 'consensus'],
    'trading': ['price', 'volume', 'trading', 'market', 'exchange'],
    'defi': ['defi', 'yield farming', 'liquidity', 'staking', 'lending'],
    'nft': ['nft', 'collectible', 'art', 'gaming', 'metaverse']
  };

  async processContent(content: string, sourceId: string): Promise<ProcessedData> {
    // Core sentiment analysis using local analyzer
    const sentimentResult = localSentimentAnalyzer.analyzeSentiment(content);
    
    // Extract crypto entities
    const entities = localSentimentAnalyzer.extractCryptoEntities(content);
    
    // Analyze topics
    const topics = this.extractTopics(content);
    
    // Determine emotional tone
    const emotionalTone = this.analyzeEmotionalTone(content);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(content);
    
    return {
      id: `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalContent: content,
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      score: sentimentResult.score,
      entities,
      topics,
      emotionalTone,
      riskFactors
    };
  }

  async batchProcess(contents: { id: string; content: string; source: string }[]): Promise<ProcessedData[]> {
    const processedResults: ProcessedData[] = [];
    
    for (const item of contents) {
      try {
        const processed = await this.processContent(item.content, item.source);
        processed.id = `${item.id}_processed`;
        processedResults.push(processed);
      } catch (error) {
        console.error(`Error processing content ${item.id}:`, error);
        // Continue with other items instead of failing the entire batch
      }
    }
    
    return processedResults;
  }

  private extractTopics(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const detectedTopics: string[] = [];
    
    for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
      const hasKeyword = keywords.some(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        detectedTopics.push(topic);
      }
    }
    
    return detectedTopics;
  }

  private analyzeEmotionalTone(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Fear indicators
    const fearWords = ['fear', 'scared', 'worried', 'panic', 'anxious', 'crash', 'dump'];
    const fearCount = fearWords.filter(word => lowerContent.includes(word)).length;
    
    // Greed indicators
    const greedWords = ['moon', 'lambo', 'gains', 'pump', 'profit', 'rich', 'millionaire'];
    const greedCount = greedWords.filter(word => lowerContent.includes(word)).length;
    
    // Excitement indicators
    const excitementWords = ['excited', 'amazing', 'incredible', 'revolutionary', 'breakthrough'];
    const excitementCount = excitementWords.filter(word => lowerContent.includes(word)).length;
    
    // Uncertainty indicators
    const uncertaintyWords = ['maybe', 'might', 'possibly', 'uncertain', 'confused', 'unsure'];
    const uncertaintyCount = uncertaintyWords.filter(word => lowerContent.includes(word)).length;
    
    // Determine dominant tone
    const maxCount = Math.max(fearCount, greedCount, excitementCount, uncertaintyCount);
    
    if (maxCount === 0) return 'neutral';
    if (fearCount === maxCount) return 'fear';
    if (greedCount === maxCount) return 'greed';
    if (excitementCount === maxCount) return 'excitement';
    if (uncertaintyCount === maxCount) return 'uncertainty';
    
    return 'neutral';
  }

  private identifyRiskFactors(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const identifiedRisks: string[] = [];
    
    for (const riskKeyword of this.riskKeywords) {
      if (lowerContent.includes(riskKeyword.toLowerCase())) {
        identifiedRisks.push(riskKeyword);
      }
    }
    
    // Additional pattern-based risk detection
    if (/guaranteed.*profit/i.test(content)) {
      identifiedRisks.push('unrealistic promises');
    }
    
    if (/get.*rich.*quick/i.test(content)) {
      identifiedRisks.push('get rich quick scheme');
    }
    
    if (/only.*going.*up/i.test(content)) {
      identifiedRisks.push('overly optimistic claims');
    }
    
    return identifiedRisks;
  }

  // Aggregate analysis across multiple processed contents
  generateAnalysisMetrics(processedContents: ProcessedData[]): AnalysisMetrics {
    const totalProcessed = processedContents.length;
    
    // Sentiment distribution
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    let totalConfidence = 0;
    const entityCounts: { [symbol: string]: number } = {};
    
    for (const content of processedContents) {
      sentimentCounts[content.sentiment]++;
      totalConfidence += content.confidence;
      
      for (const entity of content.entities) {
        entityCounts[entity.symbol] = (entityCounts[entity.symbol] || 0) + entity.mentions;
      }
    }
    
    // Calculate percentages
    const sentimentDistribution = {
      positive: Math.round((sentimentCounts.positive / totalProcessed) * 100),
      negative: Math.round((sentimentCounts.negative / totalProcessed) * 100),
      neutral: Math.round((sentimentCounts.neutral / totalProcessed) * 100)
    };
    
    const averageConfidence = Math.round((totalConfidence / totalProcessed) * 100) / 100;
    
    // Top entities by mention count
    const topEntities = Object.entries(entityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([symbol]) => symbol);
    
    return {
      totalProcessed,
      sentimentDistribution,
      averageConfidence,
      topEntities
    };
  }

  // Filter content by confidence threshold
  filterByConfidence(processedContents: ProcessedData[], minConfidence: number = 0.5): ProcessedData[] {
    return processedContents.filter(content => content.confidence >= minConfidence);
  }

  // Get sentiment for specific crypto
  getCryptoSentiment(processedContents: ProcessedData[], cryptoSymbol: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    mentionCount: number;
  } {
    const relevantContents = processedContents.filter(content =>
      content.entities.some(entity => entity.symbol === cryptoSymbol)
    );
    
    if (relevantContents.length === 0) {
      return { sentiment: 'neutral', confidence: 0, mentionCount: 0 };
    }
    
    // Calculate weighted sentiment
    let weightedScore = 0;
    let totalWeight = 0;
    let totalMentions = 0;
    
    for (const content of relevantContents) {
      const weight = content.confidence;
      weightedScore += content.score * weight;
      totalWeight += weight;
      
      const entityMentions = content.entities
        .filter(e => e.symbol === cryptoSymbol)
        .reduce((sum, e) => sum + e.mentions, 0);
      totalMentions += entityMentions;
    }
    
    const avgScore = weightedScore / totalWeight;
    const avgConfidence = totalWeight / relevantContents.length;
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (avgScore > 0.3) {
      sentiment = 'positive';
    } else if (avgScore < -0.3) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
    
    return {
      sentiment,
      confidence: Math.round(avgConfidence * 100) / 100,
      mentionCount: totalMentions
    };
  }
}

export const nlpProcessorAgent = new NLPProcessorAgent();