import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Crypto data tables
export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
});

export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  cryptoId: integer("crypto_id").notNull(),
  source: text("source").notNull(), // reddit, twitter, news
  sentiment: text("sentiment").notNull(), // positive, negative, neutral
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  content: text("content").notNull(),
  url: text("url"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  processedBy: text("processed_by").notNull(), // which agent processed it
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  cryptoId: integer("crypto_id").notNull(),
  price: decimal("price", { precision: 18, scale: 8 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 18, scale: 2 }),
  marketCap: decimal("market_cap", { precision: 18, scale: 2 }),
  percentChange24h: decimal("percent_change_24h", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const agentWorkflows = pgTable("agent_workflows", {
  id: serial("id").primaryKey(),
  workflowId: text("workflow_id").notNull().unique(),
  status: text("status").notNull(), // pending, running, completed, failed
  currentAgent: text("current_agent"), // data_harvester, nlp_processor, market_correlator
  state: jsonb("state"), // workflow state data
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCryptoSchema = createInsertSchema(cryptocurrencies).omit({
  id: true,
});

export const insertSentimentSchema = createInsertSchema(sentimentAnalysis).omit({
  id: true,
  timestamp: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

export const insertWorkflowSchema = createInsertSchema(agentWorkflows).omit({
  id: true,
  startTime: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type InsertCryptocurrency = z.infer<typeof insertCryptoSchema>;
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;
export type InsertSentimentAnalysis = z.infer<typeof insertSentimentSchema>;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type AgentWorkflow = typeof agentWorkflows.$inferSelect;
export type InsertAgentWorkflow = z.infer<typeof insertWorkflowSchema>;
