import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { workflowManager } from "./orchestrator/workflowManager";
import { dataHarvesterAgent } from "./agents/dataHarvester";
import { nlpProcessorAgent } from "./agents/nlpProcessor";
import { marketCorrelatorAgent } from "./agents/marketCorrelator";
import { insertCryptoSchema, insertSentimentSchema, insertMarketDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Cryptocurrency endpoints
  app.get("/api/cryptocurrencies", async (req, res) => {
    try {
      const cryptos = await storage.getAllCryptocurrencies();
      res.json(cryptos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cryptocurrencies" });
    }
  });

  app.get("/api/cryptocurrencies/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const crypto = await storage.getCryptocurrencyBySymbol(symbol.toUpperCase());
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }
      res.json(crypto);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cryptocurrency" });
    }
  });

  app.post("/api/cryptocurrencies", async (req, res) => {
    try {
      const validatedData = insertCryptoSchema.parse(req.body);
      const crypto = await storage.createCryptocurrency(validatedData);
      res.status(201).json(crypto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create cryptocurrency" });
    }
  });

  // Sentiment analysis endpoints
  app.get("/api/sentiment/:cryptoSymbol", async (req, res) => {
    try {
      const { cryptoSymbol } = req.params;
      const crypto = await storage.getCryptocurrencyBySymbol(cryptoSymbol.toUpperCase());
      
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const sentiments = await storage.getSentimentAnalysisByCrypto(crypto.id, limit);
      res.json(sentiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sentiment analysis" });
    }
  });

  app.get("/api/sentiment", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const sentiments = await storage.getRecentSentimentAnalysis(hours);
      res.json(sentiments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent sentiment analysis" });
    }
  });

  // Market data endpoints
  app.get("/api/market/:cryptoSymbol", async (req, res) => {
    try {
      const { cryptoSymbol } = req.params;
      const crypto = await storage.getCryptocurrencyBySymbol(cryptoSymbol.toUpperCase());
      
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }

      const marketData = await storage.getLatestMarketData(crypto.id);
      if (!marketData) {
        return res.status(404).json({ error: "No market data found" });
      }

      res.json(marketData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/market/:cryptoSymbol/history", async (req, res) => {
    try {
      const { cryptoSymbol } = req.params;
      const crypto = await storage.getCryptocurrencyBySymbol(cryptoSymbol.toUpperCase());
      
      if (!crypto) {
        return res.status(404).json({ error: "Cryptocurrency not found" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const history = await storage.getMarketDataHistory(crypto.id, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market data history" });
    }
  });

  // Workflow management endpoints
  app.post("/api/workflows/sentiment-analysis", async (req, res) => {
    try {
      const { cryptoSymbol } = req.body;
      const workflowId = await workflowManager.startSentimentAnalysisWorkflow(cryptoSymbol);
      res.status(201).json({ workflowId, status: "started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start sentiment analysis workflow" });
    }
  });

  app.get("/api/workflows/:workflowId", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const workflow = workflowManager.getWorkflowStatus(workflowId);
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow status" });
    }
  });

  app.get("/api/workflows", async (req, res) => {
    try {
      const active = workflowManager.getAllActiveWorkflows();
      const completed = workflowManager.getCompletedWorkflows();
      const metrics = workflowManager.getWorkflowMetrics();
      
      res.json({
        active,
        completed,
        metrics
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflows" });
    }
  });

  app.delete("/api/workflows/:workflowId", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const cancelled = workflowManager.cancelWorkflow(workflowId);
      
      if (!cancelled) {
        return res.status(404).json({ error: "Workflow not found or not cancellable" });
      }

      res.json({ message: "Workflow cancelled successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel workflow" });
    }
  });

  // Agent health endpoints
  app.get("/api/agents/health", async (req, res) => {
    try {
      const dataSourceHealth = await dataHarvesterAgent.checkSourceHealth();
      const marketSummary = marketCorrelatorAgent.getMarketSummary();
      
      res.json({
        dataHarvester: {
          status: "online",
          sources: dataSourceHealth
        },
        nlpProcessor: {
          status: "online"
        },
        marketCorrelator: {
          status: "online",
          summary: marketSummary
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check agent health" });
    }
  });

  // Data source management
  app.get("/api/data-sources", async (req, res) => {
    try {
      const sources = await dataHarvesterAgent.getDataSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data sources" });
    }
  });

  // Manual data processing endpoints (for testing)
  app.post("/api/process/harvest", async (req, res) => {
    try {
      const { cryptoSymbol } = req.body;
      const data = await dataHarvesterAgent.harvestData(cryptoSymbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to harvest data" });
    }
  });

  app.post("/api/process/sentiment", async (req, res) => {
    try {
      const { content, source } = req.body;
      const result = await nlpProcessorAgent.processContent(content, source);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to process sentiment" });
    }
  });

  // Market correlation endpoint
  app.post("/api/process/correlate", async (req, res) => {
    try {
      const { sentimentData } = req.body;
      const correlations = await marketCorrelatorAgent.correlateWithSentiment(sentimentData);
      const alerts = await marketCorrelatorAgent.generateMarketAlerts(correlations);
      
      res.json({
        correlations,
        alerts
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to correlate market data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
