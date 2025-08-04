import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Filter } from 'lucide-react';

interface RedditPost {
  id: string;
  title: string;
  content: string;
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  isBot: boolean;
  isSarcasm: boolean;
  isMeme: boolean;
  timestamp: string;
  author: string;
  subreddit: string;
  comments: number;
}

interface RedditSentimentWidgetProps {
  coinSymbol: string;
  onSentimentUpdate: (sentiment: any) => void;
}

export const RedditSentimentWidget = ({ coinSymbol, onSentimentUpdate }: RedditSentimentWidgetProps) => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'human' | 'high-confidence'>('all');

  // Simulate Reddit data fetching
  const fetchRedditData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call Reddit API
      const mockPosts: RedditPost[] = Array.from({ length: 20 }, (_, i) => ({
        id: `post_${i}`,
        title: `Discussion about ${coinSymbol} - ${['Moon potential?', 'Price prediction', 'Technical analysis', 'Bullish news', 'Bearish outlook'][Math.floor(Math.random() * 5)]}`,
        content: `Sample content about ${coinSymbol}...`,
        score: Math.floor(Math.random() * 1000),
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
        confidence: 0.6 + Math.random() * 0.4,
        isBot: Math.random() > 0.8,
        isSarcasm: Math.random() > 0.9,
        isMeme: Math.random() > 0.7,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        author: `user_${Math.floor(Math.random() * 1000)}`,
        subreddit: ['cryptocurrency', 'CryptoMarkets', 'Bitcoin', 'ethtrader'][Math.floor(Math.random() * 4)],
        comments: Math.floor(Math.random() * 100)
      }));

      setPosts(mockPosts);

      // Calculate sentiment metrics
      const totalPosts = mockPosts.length;
      const humanPosts = mockPosts.filter(p => !p.isBot);
      const positivePosts = humanPosts.filter(p => p.sentiment === 'positive').length;
      const negativePosts = humanPosts.filter(p => p.sentiment === 'negative').length;
      const botPosts = mockPosts.filter(p => p.isBot).length;
      const memePosts = mockPosts.filter(p => p.isMeme).length;
      const sarcasmPosts = mockPosts.filter(p => p.isSarcasm).length;

      const sentimentScore = ((positivePosts - negativePosts) / humanPosts.length) * 50 + 50;

      onSentimentUpdate({
        score: sentimentScore,
        totalPosts,
        positiveRatio: Math.round((positivePosts / humanPosts.length) * 100),
        negativeRatio: Math.round((negativePosts / humanPosts.length) * 100),
        botDetected: Math.round((botPosts / totalPosts) * 100),
        sarcasmDetected: Math.round((sarcasmPosts / totalPosts) * 100),
        memeContent: Math.round((memePosts / totalPosts) * 100)
      });

    } catch (error) {
      console.error('Error fetching Reddit data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedditData();
  }, [coinSymbol]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'human') return !post.isBot;
    if (filter === 'high-confidence') return post.confidence > 0.8;
    return true;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
  };

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-accent" />
          Reddit Sentiment Feed
        </h3>
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-secondary border border-border rounded px-2 py-1 text-sm"
          >
            <option value="all">All Posts</option>
            <option value="human">Human Only</option>
            <option value="high-confidence">High Confidence</option>
          </select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRedditData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPosts.map((post) => (
          <div key={post.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className={`flex items-center ${getSentimentColor(post.sentiment)}`}>
                  {getSentimentIcon(post.sentiment)}
                </div>
                <h4 className="text-sm font-medium line-clamp-1">{post.title}</h4>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {post.isBot && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    <Bot className="w-3 h-3" />
                  </Badge>
                )}
                {post.isMeme && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Meme
                  </Badge>
                )}
                {post.isSarcasm && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Sarcasm
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>r/{post.subreddit}</span>
                <span>u/{post.author}</span>
                <span>{post.score} upvotes</span>
                <span>{post.comments} comments</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Confidence: {Math.round(post.confidence * 100)}%</span>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2">
              <Progress 
                value={post.confidence * 100} 
                className="h-1"
              />
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No posts found matching current filter</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p>Analyzing Reddit sentiment...</p>
        </div>
      )}
    </Card>
  );
};