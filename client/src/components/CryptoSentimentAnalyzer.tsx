import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Clock, ExternalLink, CalendarDays, Globe, Users, Activity, Shield, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SentimentDashboard } from '@/components/SentimentDashboard';
import { RedditSentimentWidget } from '@/components/RedditSentimentWidget';
import sentinelLogoPath from "@assets/Sentinel_1754389520539.png";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance_score: number;
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
  const [redditSentiment, setRedditSentiment] = useState<any>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [newsTimeRange, setNewsTimeRange] = useState([7]); // Days ago
  const [loadingNews, setLoadingNews] = useState(false);
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
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin.toLowerCase()}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h`
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
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h`
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
      
      // Fetch news data
      await fetchNewsData(coin);

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

  const fetchNewsData = async (coinName: string) => {
    setLoadingNews(true);
    try {
      // Simulate news data - in real implementation, use CoinGecko's news API or other news sources
      const mockNews: NewsItem[] = [
        {
          title: `${coinName.toUpperCase()} sees major institutional adoption`,
          summary: 'Large financial institutions are increasingly showing interest in this cryptocurrency...',
          url: 'https://cryptonews.com/news/institutional-adoption',
          source: 'CryptoNews',
          published_at: new Date(Date.now() - Math.random() * newsTimeRange[0] * 24 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance_score: 0.9
        },
        {
          title: `Market volatility affects ${coinName.toUpperCase()} trading`,
          summary: 'Recent market conditions have led to increased volatility in trading patterns...',
          url: 'https://coindesk.com/markets/analysis',
          source: 'CoinDesk',
          published_at: new Date(Date.now() - Math.random() * newsTimeRange[0] * 24 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          relevance_score: 0.7
        },
        {
          title: `Regulatory concerns impact ${coinName.toUpperCase()} development`,
          summary: 'New regulatory discussions may affect the future development and adoption...',
          url: 'https://bloomberg.com/crypto/regulatory-update',
          source: 'Bloomberg Crypto',
          published_at: new Date(Date.now() - Math.random() * newsTimeRange[0] * 24 * 60 * 60 * 1000).toISOString(),
          sentiment: 'negative',
          relevance_score: 0.8
        },
        {
          title: `${coinName.toUpperCase()} technical analysis shows bullish patterns`,
          summary: 'Chart analysis reveals potential upward momentum in the coming weeks...',
          url: 'https://cointelegraph.com/news/technical-analysis',
          source: 'CoinTelegraph',
          published_at: new Date(Date.now() - Math.random() * newsTimeRange[0] * 24 * 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          relevance_score: 0.6
        }
      ];

      // Filter news by time range
      const cutoffDate = new Date(Date.now() - newsTimeRange[0] * 24 * 60 * 60 * 1000);
      const filteredNews = mockNews.filter(news => new Date(news.published_at) >= cutoffDate);
      
      setNewsData(filteredNews);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleNewsTimeRangeChange = async (value: number[]) => {
    setNewsTimeRange(value);
    if (cryptoData) {
      await fetchNewsData(cryptoData.name);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/20 text-success border-success/30';
      case 'negative': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-success';
      case 'MEDIUM': return 'bg-warning';
      case 'HIGH': return 'bg-destructive';
      case 'CRITICAL': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const chartData = cryptoData?.sparkline_in_7d?.price?.map((price, index) => ({
    time: index,
    price: price
  })) || [];

  const pieData = sentimentData ? [
    { name: 'Positive', value: sentimentData.scam_indicators.social_sentiment, color: '#22c55e' },
    { name: 'Neutral', value: 50, color: '#64748b' },
    { name: 'Negative', value: 100 - sentimentData.scam_indicators.social_sentiment, color: '#ef4444' }
  ] : [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background World Map */}
      <div className="absolute inset-0 world-map-bg opacity-20"></div>
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <img 
              src={sentinelLogoPath} 
              alt="Sentinel Logo" 
              className="w-14 h-14 rounded-xl"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.4))'
              }}
            />
            <span className="text-2xl font-bold text-white">CryptoSentinel</span>
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
                the potential to detect scams
              </span>
              <span className="block">
                and protect investors from fraud
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

        {/* Reddit Sentiment Widget */}
        {cryptoData && (
          <div className="mb-8">
            <RedditSentimentWidget 
              coinSymbol={cryptoData.symbol.toUpperCase()}
              onSentimentUpdate={setRedditSentiment}
            />
          </div>
        )}

        {/* Analysis Results */}
        {cryptoData && sentimentData && (
          <>
            {/* Enhanced Dashboard */}
            {redditSentiment && (
              <div className="mb-8">
                <SentimentDashboard
                  coinSymbol={cryptoData.symbol.toUpperCase()}
                  metrics={{
                    redditSentiment,
                    newsAnalysis: {
                      sentiment: sentimentData.scam_indicators.news_sentiment,
                      credibility: 75 + Math.random() * 20,
                      recency: 85 + Math.random() * 15,
                      volume: 60 + Math.random() * 30
                    },
                    socialEngagement: {
                      mentions: Math.floor(Math.random() * 50000) + 10000,
                      interactions: Math.floor(Math.random() * 200000) + 50000,
                      influencerSentiment: sentimentData.scam_indicators.social_sentiment,
                      viralityScore: Math.floor(Math.random() * 100)
                    },
                    riskFactors: {
                      volume: sentimentData.scam_indicators.volume_anomaly ? 75 : 25,
                      liquidityRisk: Math.floor(Math.random() * 60) + 20,
                      manipulationScore: sentimentData.scam_indicators.suspicious_keywords.length * 20,
                      rugPullRisk: sentimentData.risk_level === 'CRITICAL' ? 85 : sentimentData.risk_level === 'HIGH' ? 65 : sentimentData.risk_level === 'MEDIUM' ? 35 : 15
                    }
                  }}
                  priceHistory={chartData.map((item, index) => ({
                    time: `Day ${index + 1}`,
                    price: item.price,
                    sentiment: 30 + Math.random() * 40
                  }))}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Crypto Info */}
              <Card className="stat-card">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-white">
                  <img 
                    src={`https://assets.coingecko.com/coins/images/1/large/bitcoin.png`} 
                    alt="Crypto icon"
                    className="w-6 h-6 mr-2"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                  {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Price</span>
                    <span className="text-xl font-bold green-glow" data-testid="text-current-price">
                      ${cryptoData.current_price.toFixed(4)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">24h Change</span>
                    <div className="flex items-center">
                      {cryptoData.price_change_percentage_24h > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                      )}
                      <span className={cryptoData.price_change_percentage_24h > 0 ? 'text-success' : 'text-destructive'} data-testid="text-price-change">
                        {cryptoData.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Market Cap</span>
                    <span className="green-glow" data-testid="text-market-cap">
                      ${(cryptoData.market_cap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volume (24h)</span>
                    <span className="green-glow" data-testid="text-volume">
                      ${(cryptoData.total_volume / 1e6).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </Card>

              {/* Sentiment Analysis */}
              <Card className="stat-card">
                <h3 className="text-xl font-semibold mb-4 text-white">Sentiment Analysis</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Overall Score</span>
                    <div className="flex items-center">
                      <span className={`text-xl font-bold mr-2 ${getSentimentColor(sentimentData.overall_score)}`} data-testid="text-sentiment-score">
                        {sentimentData.overall_score.toFixed(0)}%
                      </span>
                      <Badge 
                        className={getSentimentBadgeColor(sentimentData.overall_score > 60 ? 'positive' : sentimentData.overall_score > 30 ? 'neutral' : 'negative')}
                        data-testid="badge-sentiment"
                      >
                        {sentimentData.overall_score > 60 ? 'Positive' : sentimentData.overall_score > 30 ? 'Neutral' : 'Negative'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Confidence</span>
                    <span className="green-glow" data-testid="text-confidence">
                      {(sentimentData.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Level</span>
                    <Badge 
                      className={`${getRiskColor(sentimentData.risk_level)} text-white`}
                      data-testid="badge-risk-level"
                    >
                      {sentimentData.risk_level}
                    </Badge>
                  </div>
                  
                  {sentimentData.scam_indicators.volume_anomaly && (
                    <div className="flex items-center text-warning">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm" data-testid="text-volume-anomaly">Volume anomaly detected</span>
                    </div>
                  )}
                  
                  {sentimentData.scam_indicators.suspicious_keywords.length > 0 && (
                    <div className="flex items-center text-destructive">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm" data-testid="text-suspicious-keywords">
                        Suspicious keywords: {sentimentData.scam_indicators.suspicious_keywords.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Price Chart */}
            <Card className="stat-card mb-8">
              <h3 className="text-xl font-semibold mb-4 text-white">7-Day Price Chart</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                      labelFormatter={(value) => `Day ${value}`}
                      formatter={(value: any) => [`$${value.toFixed(4)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* News Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="stat-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Recent News</h3>
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last {newsTimeRange[0]} days</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <Slider
                    value={newsTimeRange}
                    onValueChange={handleNewsTimeRangeChange}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 day</span>
                    <span>30 days</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loadingNews ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : newsData.length > 0 ? (
                    newsData.map((news, index) => (
                      <div key={index} className="border-b border-border pb-3 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-foreground leading-tight flex-1 mr-2">
                            {news.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(news.sentiment)}
                            <Badge 
                              className={`text-xs ${getSentimentBadgeColor(news.sentiment)}`}
                              data-testid={`badge-news-sentiment-${index}`}
                            >
                              {news.sentiment}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {news.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{new Date(news.published_at).toLocaleDateString()}</span>
                          </div>
                          <a 
                            href={news.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            data-testid={`link-news-${index}`}
                          >
                            <Button variant="ghost" size="sm" className="text-xs h-6">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Read
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No news found for the selected time range
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Sentiment Breakdown */}
              <Card className="stat-card">
                <h3 className="text-xl font-semibold mb-4 text-white">Sentiment Breakdown</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center" data-testid={`legend-${entry.name.toLowerCase()}`}>
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Data Freshness */}
            <Card className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-primary" />
                  <span className="text-sm text-gray-400" data-testid="text-data-freshness">
                    Data last updated: {new Date(sentimentData.data_freshness).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Live Data
                </Badge>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};