import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Globe, Users, Activity, Shield, TrendingUp, BarChart3 } from 'lucide-react';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

interface SentimentData {
  overall_score: number;
  confidence: number;
  reasoning: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scam_indicators: {
    volume_anomaly: boolean;
    suspicious_keywords: string[];
    social_sentiment: number;
    news_sentiment: number;
  };
  data_freshness: string;
}

export const CryptoSentimentAnalyzer = () => {
  const [coin, setCoin] = useState('');
  const [loading, setLoading] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const { toast } = useToast();

  // Demo statistics that would come from real analytics
  const globalStats = {
    analysisCount: "2.4m",
    cryptosTracked: "191+",
    riskAlertsIssued: "21+",
    sentimentUpdates: "18",
    dataPoints: "23,000+",
    activeUsers: "11"
  };

  const analyzeCrypto = async () => {
    if (!coin.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a cryptocurrency name or symbol",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch crypto data from CoinGecko
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin.toLowerCase()}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto data');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        // Try searching by symbol
        const searchResponse = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${coin}`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.coins.length === 0) {
          throw new Error('Cryptocurrency not found');
        }
        
        const coinId = searchData.coins[0].id;
        const retryResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
        );
        const retryData = await retryResponse.json();
        setCryptoData(retryData[0]);
      } else {
        setCryptoData(data[0]);
      }

      // Simulate sentiment analysis (in real app, this would call various APIs)
      const mockSentiment: SentimentData = {
        overall_score: Math.random() * 100,
        confidence: 0.75 + Math.random() * 0.25,
        reasoning: "Analysis based on market volume, social sentiment, and news patterns",
        risk_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
        scam_indicators: {
          volume_anomaly: Math.random() > 0.7,
          suspicious_keywords: Math.random() > 0.5 ? ['pump', 'moon'] : [],
          social_sentiment: Math.random() * 100,
          news_sentiment: Math.random() * 100
        },
        data_freshness: new Date().toISOString()
      };

      setSentimentData(mockSentiment);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${coin.toUpperCase()}`,
      });

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze cryptocurrency",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background World Map */}
      <div className="absolute inset-0 world-map-bg opacity-20"></div>
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">+</span>
            <span className="text-2xl font-bold text-white">CS</span>
          </div>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-black"
            data-testid="button-donate"
          >
            Donate CRYPTO
          </Button>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Analyze crypto sentiment with 
              <span className="block">
                the potential to detect scams and
              </span>
              <span className="block">
                protect investors from fraud
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Join CryptoSentinel today — the project that is rapidly gaining momentum 
              due to the trend of transparency and security in the crypto space
            </p>
            
            {/* Search Section */}
            <div className="flex gap-4 mb-8">
              <Input
                placeholder="Enter cryptocurrency (e.g., bitcoin, BTC)"
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white flex-1"
                onKeyPress={(e) => e.key === 'Enter' && analyzeCrypto()}
                data-testid="input-crypto"
              />
              <Button 
                onClick={analyzeCrypto}
                disabled={loading}
                className="bg-primary hover:bg-primary/80 text-black px-8"
                data-testid="button-analyze"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Analyzing...' : 'Analyze Now'}
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-analysis-count">
                {globalStats.analysisCount}
              </div>
              <div className="text-gray-400">Analysis</div>
            </div>
            
            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-cryptos-tracked">
                {globalStats.cryptosTracked}
              </div>
              <div className="text-gray-400">Cryptocurrencies</div>
            </div>

            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-risk-alerts">
                {globalStats.riskAlertsIssued}
              </div>
              <div className="text-gray-400">Risk Alerts</div>
            </div>

            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-sentiment-updates">
                {globalStats.sentimentUpdates}
              </div>
              <div className="text-gray-400">Real-time Updates</div>
            </div>

            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-data-points">
                {globalStats.dataPoints}
              </div>
              <div className="text-gray-400">Data Points</div>
            </div>

            <div className="stat-card text-center">
              <div className="text-3xl font-bold green-glow mb-2" data-testid="text-active-users">
                {globalStats.activeUsers}
              </div>
              <div className="text-gray-400">Active Analysts</div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {cryptoData && sentimentData && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Analysis Results for {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Info */}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <Badge 
                    variant={cryptoData.price_change_percentage_24h > 0 ? "default" : "destructive"}
                    data-testid="badge-price-change"
                  >
                    {cryptoData.price_change_percentage_24h > 0 ? '+' : ''}{cryptoData.price_change_percentage_24h.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-2xl font-bold green-glow mb-2" data-testid="text-current-price">
                  ${cryptoData.current_price.toFixed(4)}
                </div>
                <div className="text-gray-400">Current Price</div>
              </div>

              {/* Market Cap */}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold green-glow mb-2" data-testid="text-market-cap">
                  ${(cryptoData.market_cap / 1e9).toFixed(2)}B
                </div>
                <div className="text-gray-400">Market Cap</div>
              </div>

              {/* Sentiment Score */}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-primary" />
                  <Badge 
                    variant={sentimentData.overall_score > 70 ? "default" : sentimentData.overall_score > 40 ? "secondary" : "destructive"}
                    data-testid="badge-sentiment"
                  >
                    {sentimentData.overall_score.toFixed(0)}/100
                  </Badge>
                </div>
                <div className="text-2xl font-bold green-glow mb-2" data-testid="text-sentiment-score">
                  {sentimentData.overall_score.toFixed(0)}%
                </div>
                <div className="text-gray-400">Sentiment Score</div>
              </div>

              {/* Risk Level */}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                  <Badge 
                    variant={sentimentData.risk_level === 'LOW' ? "default" : sentimentData.risk_level === 'MEDIUM' ? "secondary" : "destructive"}
                    data-testid="badge-risk-level"
                  >
                    {sentimentData.risk_level}
                  </Badge>
                </div>
                <div className="text-2xl font-bold green-glow mb-2" data-testid="text-risk-level">
                  {sentimentData.risk_level}
                </div>
                <div className="text-gray-400">Risk Assessment</div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="stat-card">
              <h3 className="text-xl font-bold text-white mb-4">Analysis Summary</h3>
              <p className="text-gray-300 mb-4" data-testid="text-analysis-reasoning">
                {sentimentData.reasoning}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Confidence: {(sentimentData.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400" data-testid="text-data-freshness">
                  Updated: {new Date(sentimentData.data_freshness).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};