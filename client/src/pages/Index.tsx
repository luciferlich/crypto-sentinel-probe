import { CryptoSentimentAnalyzer } from "@/components/CryptoSentimentAnalyzer";
import { SentimentDashboard } from "@/components/SentimentDashboard";
import { RedditSentimentWidget } from "@/components/RedditSentimentWidget";
import { AgentOrchestrator } from "@/components/AgentOrchestrator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Crypto Sentiment Analyzer
        </h1>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              Sentiment Dashboard
            </TabsTrigger>
            <TabsTrigger value="orchestrator" data-testid="tab-orchestrator">
              AI Agent Orchestrator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8">
            <CryptoSentimentAnalyzer />
            <SentimentDashboard />
            <RedditSentimentWidget />
          </TabsContent>
          
          <TabsContent value="orchestrator">
            <AgentOrchestrator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
