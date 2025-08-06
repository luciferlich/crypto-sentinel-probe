# Crypto Sentiment Analyzer

## Overview

This is a full-stack web application for analyzing cryptocurrency sentiment using social media data, news analysis, and market indicators. The application combines React frontend with Express backend to provide real-time sentiment analysis for cryptocurrencies with risk assessment and fraud detection capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design Preference: Dark theme with green accents, PLUR-style interface with hero sections and statistics grid layout.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Charts**: Recharts for data visualization (price charts, sentiment metrics)
- **Design System**: Custom dark theme with cyber/neon aesthetic using HSL color variables

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **API Design**: RESTful API with `/api` prefix for all endpoints
- **Development**: Hot reloading with Vite integration and custom logging middleware
- **Build Process**: ESBuild for production bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **Schema Management**: Drizzle migrations in `./migrations` directory
- **Current Schema**: Users table with basic authentication structure
- **Fallback Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: PostgreSQL session store using `connect-pg-simple`
- **User Model**: Basic username/password authentication with Zod validation
- **Schema Validation**: Drizzle-Zod integration for type-safe database operations

### External Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **Cryptocurrency Data**: Integration points for CoinGecko API (price data, market metrics)
- **Social Media**: Reddit API integration for sentiment analysis
- **News Sources**: Multiple news API endpoints for sentiment aggregation
- **UI Components**: Extensive Radix UI component library for accessible interface elements
- **Charts and Visualization**: Recharts library for all data visualization needs

### Core Features Architecture
1. **Multi-Agent AI Orchestration**: Coordinated workflow management between specialized AI agents
   - Data Harvester Agent: Intelligent data collection from Reddit, news sources, and social media
   - NLP Processor Agent: Local sentiment analysis using rule-based crypto-specific algorithms
   - Market Correlator Agent: Sentiment-market data correlation with risk assessment
2. **Local Sentiment Analysis Engine**: Free, crypto-optimized sentiment analysis without external API dependencies
3. **Workflow State Management**: Stateful agent coordination with real-time progress tracking
4. **Risk Assessment**: Scam detection, volume anomaly detection, and divergence alerts
5. **Real-time Agent Health Monitoring**: Live status tracking of all AI agents
6. **Comprehensive Data Storage**: PostgreSQL schema for cryptocurrencies, sentiment analysis, market data, and workflows