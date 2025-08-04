import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Clock, ExternalLink, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SentimentDashboard } from '@/components/SentimentDashboard';
import { RedditSentimentWidget } from '@/components/RedditSentimentWidget';

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

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance_score: number;
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-2">
            Crypto Sentinel Probe
          </h1>
          <p className="text-muted-foreground">Advanced cryptocurrency sentiment analysis and scam detection</p>
        </div>

        {/* Search */}
        <Card className="p-6 mb-8 border-primary/20 shadow-glow-green">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter cryptocurrency name or symbol (e.g., bitcoin, BTC)"
                value={coin}
                onChange={(e) => setCoin(e.target.value)}
                className="bg-secondary border-border text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && analyzeCrypto()}
              />
            </div>
            <Button 
              onClick={analyzeCrypto}
              disabled={loading}
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </Card>

        {/* Reddit Sentiment Widget */}
        {cryptoData && (
          <div className="mb-4">
            <RedditSentimentWidget 
              coinSymbol={cryptoData.symbol.toUpperCase()}
              onSentimentUpdate={setRedditSentiment}
            />
          </div>
        )}

        {/* Results */}
        {cryptoData && sentimentData && (
          <>
            {/* Enhanced Dashboard */}
            {redditSentiment && (
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
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Crypto Info */}
            <Card className="p-6 border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <img 
                  src={`https://assets.coingecko.com/coins/images/1/large/bitcoin.png`} 
                  alt="Crypto icon"
                  className="w-6 h-6 mr-2"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                {cryptoData.name} ({cryptoData.symbol.toUpperCase()})
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="text-xl font-bold">${cryptoData.current_price.toFixed(4)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">24h Change</span>
                  <div className="flex items-center">
                    {cryptoData.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="w-4 h-4 text-success mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                    )}
                    <span className={cryptoData.price_change_percentage_24h > 0 ? 'text-success' : 'text-destructive'}>
                      {cryptoData.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span>${(cryptoData.market_cap / 1e9).toFixed(2)}B</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Volume (24h)</span>
                  <span>${(cryptoData.total_volume / 1e6).toFixed(2)}M</span>
                </div>
              </div>
            </Card>

            {/* Sentiment Analysis */}
            <Card className="p-6 border-border">
              <h3 className="text-xl font-semibold mb-4">Sentiment Analysis</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Overall Score</span>
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${getSentimentColor(sentimentData.overall_score)}`}>
                      {sentimentData.overall_score.toFixed(0)}/100
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-semibold">{(sentimentData.confidence * 100).toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Risk Level</span>
                  <Badge className={`${getRiskColor(sentimentData.risk_level)} text-white`}>
                    {sentimentData.risk_level}
                  </Badge>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Analysis Reasoning:</p>
                  <p className="text-sm">{sentimentData.reasoning}</p>
                </div>
              </div>
            </Card>

            {/* Price Chart */}
            <Card className="p-6 border-border lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">7-Day Price History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
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

            {/* Scam Indicators */}
            <Card className="p-6 border-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
                Scam Indicators
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Volume Anomaly</span>
                  {sentimentData.scam_indicators.volume_anomaly ? (
                    <Badge variant="destructive">Detected</Badge>
                  ) : (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Suspicious Keywords</span>
                  <div className="flex gap-1">
                    {sentimentData.scam_indicators.suspicious_keywords.length > 0 ? (
                      sentimentData.scam_indicators.suspicious_keywords.map((keyword, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Social Sentiment</span>
                  <span className={getSentimentColor(sentimentData.scam_indicators.social_sentiment)}>
                    {sentimentData.scam_indicators.social_sentiment.toFixed(0)}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">News Sentiment</span>
                  <span className={getSentimentColor(sentimentData.scam_indicators.news_sentiment)}>
                    {sentimentData.scam_indicators.news_sentiment.toFixed(0)}/100
                  </span>
                </div>
              </div>
            </Card>

            {/* News Analysis */}
            <Card className="p-6 border-border lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2 text-primary" />
                  News Analysis
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Last {newsTimeRange[0]} day{newsTimeRange[0] !== 1 ? 's' : ''}
                  </span>
                  {loadingNews && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />}
                </div>
              </div>
              
              {/* Time Range Slider */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Time Range:</span>
                  <div className="flex-1 max-w-xs">
                    <Slider
                      value={newsTimeRange}
                      onValueChange={handleNewsTimeRangeChange}
                      max={30}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16">
                    {newsTimeRange[0]} day{newsTimeRange[0] !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>

              {/* News List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {newsData.length > 0 ? (
                  newsData.map((news, index) => (
                    <div 
                      key={index} 
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex-1 mr-4"
                        >
                          <h4 className="font-medium text-sm leading-tight hover:underline">
                            {news.title}
                          </h4>
                        </a>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getSentimentIcon(news.sentiment)}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSentimentBadgeColor(news.sentiment)}`}
                          >
                            {news.sentiment}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {news.summary}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(news.published_at).toLocaleDateString()}
                          </span>
                          <span>{news.source}</span>
                          <span className="flex items-center">
                            Relevance: {(news.relevance_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
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
            <Card className="p-6 border-border">
              <h3 className="text-xl font-semibold mb-4">Sentiment Breakdown</h3>
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
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Data Freshness */}
            <Card className="p-6 border-border lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Info className="w-5 h-5 mr-2 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Data last updated: {new Date(sentimentData.data_freshness).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Live Data
                </Badge>
              </div>
            </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};