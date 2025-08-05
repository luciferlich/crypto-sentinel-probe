import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, MessageSquare, Bot, Clock, Shield, Info } from 'lucide-react';

interface SentimentMetrics {
  redditSentiment: {
    score: number;
    totalPosts: number;
    positiveRatio: number;
    negativeRatio: number;
    botDetected: number;
    sarcasmDetected: number;
    memeContent: number;
  };
  newsAnalysis: {
    sentiment: number;
    credibility: number;
    recency: number;
    volume: number;
  };
  socialEngagement: {
    mentions: number;
    interactions: number;
    influencerSentiment: number;
    viralityScore: number;
  };
  riskFactors: {
    volume: number;
    liquidityRisk: number;
    manipulationScore: number;
    volatilityRisk: number;
  };
}

interface SentimentDashboardProps {
  coinSymbol: string;
  metrics: SentimentMetrics;
  priceHistory: Array<{ time: string; price: number; sentiment: number }>;
}

export const SentimentDashboard = ({ coinSymbol, metrics, priceHistory }: SentimentDashboardProps) => {
  const overallRisk = (
    metrics.riskFactors.volume + 
    metrics.riskFactors.liquidityRisk + 
    metrics.riskFactors.manipulationScore + 
    metrics.riskFactors.volatilityRisk
  ) / 4;

  const getRiskLevel = (score: number) => {
    if (score < 25) return { label: 'LOW', color: 'bg-success', textColor: 'text-success' };
    if (score < 50) return { label: 'MEDIUM', color: 'bg-warning', textColor: 'text-warning' };
    if (score < 75) return { label: 'HIGH', color: 'bg-destructive', textColor: 'text-destructive' };
    return { label: 'CRITICAL', color: 'bg-destructive', textColor: 'text-destructive' };
  };

  const riskLevel = getRiskLevel(overallRisk);

  const radarData = [
    { subject: 'Reddit Sentiment', value: metrics.redditSentiment.score, fullMark: 100 },
    { subject: 'News Analysis', value: metrics.newsAnalysis.sentiment, fullMark: 100 },
    { subject: 'Social Engagement', value: metrics.socialEngagement.viralityScore, fullMark: 100 },
    { subject: 'Liquidity', value: 100 - metrics.riskFactors.liquidityRisk, fullMark: 100 },
    { subject: 'Credibility', value: metrics.newsAnalysis.credibility, fullMark: 100 },
    { subject: 'Volume Health', value: 100 - metrics.riskFactors.volume, fullMark: 100 }
  ];

  const engagementData = priceHistory.map((item, index) => ({
    time: item.time,
    price: item.price,
    sentiment: item.sentiment,
    volume: Math.random() * 1000000 + 500000
  }));

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Overall Risk Assessment */}
        <Card className="p-6 border-border lg:col-span-2 xl:col-span-1 module-card sentiment-module">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Risk Assessment
            </h3>
            <Badge className={`${riskLevel.color} text-white`}>
              {riskLevel.label}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${riskLevel.textColor} mb-2`}>
                {overallRisk.toFixed(0)}/100
              </div>
              <p className="text-sm text-muted-foreground">Overall Risk Score</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Volume Risk</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.riskFactors.volume} className="w-16 h-2" />
                  <span className="text-xs w-8">{metrics.riskFactors.volume}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Liquidity Risk</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.riskFactors.liquidityRisk} className="w-16 h-2" />
                  <span className="text-xs w-8">{metrics.riskFactors.liquidityRisk}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Manipulation Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.riskFactors.manipulationScore} className="w-16 h-2" />
                  <span className="text-xs w-8">{metrics.riskFactors.manipulationScore}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Volatility Risk</span>
                <div className="flex items-center gap-2">
                  <Progress value={metrics.riskFactors.volatilityRisk} className="w-16 h-2" />
                  <span className="text-xs w-8">{metrics.riskFactors.volatilityRisk}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Reddit Sentiment Analysis */}
        <Card className="p-6 border-border module-card sentiment-module">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-accent" />
            Reddit Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {metrics.redditSentiment.score.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Sentiment Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {metrics.redditSentiment.totalPosts}
                </div>
                <p className="text-xs text-muted-foreground">Posts Analyzed</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1 text-success" />
                  Positive
                </span>
                <span className="text-sm font-medium">{metrics.redditSentiment.positiveRatio}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1 text-destructive" />
                  Negative
                </span>
                <span className="text-sm font-medium">{metrics.redditSentiment.negativeRatio}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm flex items-center cursor-help">
                      <Bot className="w-3 h-3 mr-1 text-warning" />
                      Bot Activity
                      <Info className="w-3 h-3 ml-1 opacity-50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detected automated posts and comments</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm font-medium">{metrics.redditSentiment.botDetected}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Meme Content</span>
                <span className="text-sm font-medium">{metrics.redditSentiment.memeContent}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* News & Social Media */}
        <Card className="p-6 border-border module-card sentiment-module">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Social Metrics
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {(metrics.socialEngagement.mentions / 1000).toPrecision(3)}K
                </div>
                <p className="text-xs text-muted-foreground">Mentions (24h)</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {metrics.socialEngagement.viralityScore.toPrecision(3)}
                </div>
                <p className="text-xs text-muted-foreground">Virality Score</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">News Sentiment</span>
                <span className="text-sm font-medium">{Number(metrics.newsAnalysis.sentiment).toPrecision(3)}/100</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">News Credibility</span>
                <span className="text-sm font-medium">{Number(metrics.newsAnalysis.credibility).toPrecision(3)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm flex items-center cursor-help">
                      <Clock className="w-3 h-3 mr-1" />
                      Data Freshness
                      <Info className="w-3 h-3 ml-1 opacity-50" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How recent the analyzed data is</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm font-medium">{Number(metrics.newsAnalysis.recency).toPrecision(3)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Influencer Sentiment</span>
                <span className="text-sm font-medium">{Number(metrics.socialEngagement.influencerSentiment).toPrecision(3)}/100</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Sentiment vs Price Correlation */}
        <Card className="p-6 border-border lg:col-span-2 module-card sentiment-module">
          <h3 className="text-lg font-semibold mb-4">Sentiment vs Price Correlation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="price"
                  orientation="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="sentiment"
                  orientation="right"
                  stroke="hsl(var(--accent))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Area 
                  yAxisId="price"
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area 
                  yAxisId="sentiment"
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke={priceHistory.length > 0 && priceHistory[priceHistory.length - 1].sentiment > 50 ? "#22c55e" : "#ef4444"}
                  fill={priceHistory.length > 0 && priceHistory[priceHistory.length - 1].sentiment > 50 ? "#22c55e" : "#ef4444"}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Comprehensive Analysis Radar */}
        <Card className="p-6 border-border module-card sentiment-module">
          <h3 className="text-lg font-semibold mb-4">Multi-Factor Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis 
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar 
                  name={coinSymbol}
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};