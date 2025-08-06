// Local sentiment analysis using rule-based approach and word scoring
// This provides free sentiment analysis without external API dependencies

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number;
}

interface CryptoEntity {
  symbol: string;
  mentions: number;
  context: string[];
}

// Crypto-specific positive sentiment words
const cryptoPositiveWords = [
  'moon', 'bullish', 'hodl', 'diamond hands', 'pump', 'rally', 'surge', 
  'breakout', 'bull run', 'to the moon', 'lambo', 'gains', 'profit',
  'adoption', 'institutional', 'partnership', 'upgrade', 'innovation',
  'breakthrough', 'strong support', 'buying opportunity', 'undervalued',
  'bullish trend', 'positive momentum', 'accumulate', 'long term',
  'fundamentals', 'promising', 'revolutionary', 'game changer'
];

// Crypto-specific negative sentiment words  
const cryptoNegativeWords = [
  'bearish', 'dump', 'crash', 'rug pull', 'scam', 'ponzi', 'fud',
  'panic sell', 'bear trap', 'dead cat bounce', 'bagholders', 'rekt',
  'liquidated', 'correction', 'dip', 'falling knife', 'whale dump',
  'market manipulation', 'overvalued', 'bubble', 'risky', 'volatile',
  'uncertain', 'regulatory concerns', 'ban', 'crackdown', 'investigation'
];

// General positive words
const generalPositiveWords = [
  'good', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful',
  'positive', 'optimistic', 'confident', 'strong', 'solid', 'impressive',
  'successful', 'growth', 'increase', 'rise', 'up', 'high', 'best',
  'win', 'victory', 'succeed', 'opportunity', 'potential', 'bright'
];

// General negative words
const generalNegativeWords = [
  'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'negative',
  'pessimistic', 'weak', 'poor', 'decline', 'decrease', 'fall', 'drop',
  'down', 'low', 'worst', 'lose', 'loss', 'fail', 'failure', 'problem',
  'issue', 'concern', 'worry', 'fear', 'doubt', 'risk', 'danger'
];

// Common crypto symbols and names for entity extraction
const cryptoSymbols = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum', 
  'ADA': 'Cardano',
  'SOL': 'Solana',
  'DOT': 'Polkadot',
  'MATIC': 'Polygon',
  'AVAX': 'Avalanche',
  'LINK': 'Chainlink',
  'UNI': 'Uniswap',
  'DOGE': 'Dogecoin',
  'SHIB': 'Shiba Inu',
  'XRP': 'Ripple',
  'LTC': 'Litecoin',
  'BCH': 'Bitcoin Cash',
  'ETC': 'Ethereum Classic'
};

export class LocalSentimentAnalyzer {
  
  analyzeSentiment(text: string): SentimentResult {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/gi, '');
    const words = cleanText.split(/\s+/);
    
    let score = 0;
    let wordCount = 0;
    let contextBoost = 0;
    
    // Check for crypto-specific sentiment (weighted higher)
    for (const word of words) {
      if (cryptoPositiveWords.some(pos => word.includes(pos.toLowerCase()))) {
        score += 2; // Higher weight for crypto-specific positive
        wordCount++;
      }
      if (cryptoNegativeWords.some(neg => word.includes(neg.toLowerCase()))) {
        score -= 2; // Higher weight for crypto-specific negative
        wordCount++;
      }
    }
    
    // Check for general sentiment
    for (const word of words) {
      if (generalPositiveWords.includes(word)) {
        score += 1;
        wordCount++;
      }
      if (generalNegativeWords.includes(word)) {
        score -= 1;
        wordCount++;
      }
    }
    
    // Context-based boosting
    if (cleanText.includes('buy') && cleanText.includes('dip')) contextBoost += 1;
    if (cleanText.includes('hold') && cleanText.includes('long')) contextBoost += 1;
    if (cleanText.includes('sell') && cleanText.includes('crash')) contextBoost -= 1;
    
    score += contextBoost;
    
    // Calculate confidence based on sentiment word density
    const confidence = Math.min(0.95, Math.max(0.1, wordCount / words.length + 0.3));
    
    // Determine sentiment
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (score > 0.5) {
      sentiment = 'positive';
    } else if (score < -0.5) {
      sentiment = 'negative';  
    } else {
      sentiment = 'neutral';
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence * 100) / 100,
      score: Math.round(score * 100) / 100
    };
  }
  
  extractCryptoEntities(text: string): CryptoEntity[] {
    const upperText = text.toUpperCase();
    const lowerText = text.toLowerCase();
    const entities: Map<string, CryptoEntity> = new Map();
    
    // Extract by symbol
    for (const [symbol, name] of Object.entries(cryptoSymbols)) {
      const symbolRegex = new RegExp(`\\b${symbol}\\b`, 'gi');
      const nameRegex = new RegExp(`\\b${name.toLowerCase()}\\b`, 'gi');
      
      const symbolMatches = upperText.match(symbolRegex) || [];
      const nameMatches = lowerText.match(nameRegex) || [];
      
      const totalMentions = symbolMatches.length + nameMatches.length;
      
      if (totalMentions > 0) {
        entities.set(symbol, {
          symbol,
          mentions: totalMentions,
          context: this.extractContext(text, [symbol, name])
        });
      }
    }
    
    return Array.from(entities.values());
  }
  
  private extractContext(text: string, terms: string[]): string[] {
    const contexts: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      for (const term of terms) {
        if (sentence.toLowerCase().includes(term.toLowerCase())) {
          contexts.push(sentence.trim());
          break;
        }
      }
    }
    
    return contexts.slice(0, 3); // Limit to 3 contexts
  }
  
  // Batch analysis for multiple texts
  batchAnalyze(texts: string[]): Array<SentimentResult & { entities: CryptoEntity[] }> {
    return texts.map(text => ({
      ...this.analyzeSentiment(text),
      entities: this.extractCryptoEntities(text)
    }));
  }
  
  // Aggregate sentiment for a crypto symbol across multiple texts
  aggregateSentimentForCrypto(texts: string[], targetSymbol: string): SentimentResult {
    const relevantTexts = texts.filter(text => 
      text.toUpperCase().includes(targetSymbol) || 
      text.toLowerCase().includes(cryptoSymbols[targetSymbol as keyof typeof cryptoSymbols]?.toLowerCase() || '')
    );
    
    if (relevantTexts.length === 0) {
      return { sentiment: 'neutral', confidence: 0, score: 0 };
    }
    
    const results = relevantTexts.map(text => this.analyzeSentiment(text));
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
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
      score: Math.round(avgScore * 100) / 100
    };
  }
}

export const localSentimentAnalyzer = new LocalSentimentAnalyzer();