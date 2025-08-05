# CryptoSentinel - Advanced Cryptocurrency Sentiment Analysis Platform

![CryptoSentinel Logo](./attached_assets/Sentinel_1754389520539.png)

## Overview

CryptoSentinel is a comprehensive cryptocurrency sentiment analysis platform designed to help investors make informed decisions by analyzing social media sentiment, detecting potential scams, and providing real-time market insights. The platform combines advanced sentiment analysis algorithms with fraud detection capabilities to protect investors from cryptocurrency scams and market manipulation.

## 🚀 Features

### Core Analytics
- **Real-time Sentiment Analysis**: Advanced sentiment scoring from multiple social media sources
- **Reddit Integration**: Direct analysis of cryptocurrency discussions with bot detection
- **Scam Detection**: AI-powered fraud detection with suspicious keyword identification
- **Price Correlation**: Visual correlation between sentiment trends and price movements
- **Multi-Factor Risk Assessment**: Comprehensive risk scoring based on multiple indicators

### Dashboard Components
- **Interactive Price Charts**: 7-day price history with accurate timestamps
- **Sentiment Breakdown**: Visual pie charts with gradient styling and professional animations
- **Social Metrics**: Engagement metrics with 3-significant-figure precision
- **News Analysis**: Real-time news sentiment with source credibility scoring
- **Risk Indicators**: Volume anomaly detection and manipulation warnings

### User Experience
- **Professional Design**: Dark theme with cyberpunk aesthetic and green accent colors
- **Responsive Layout**: Optimized for desktop and mobile viewing
- **Hover Animations**: Interactive module cards with smooth transitions
- **Centered Layout**: Content perfectly centered for optimal viewing experience
- **Real-time Updates**: Live data with second-accurate timestamps

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom dark theme
- **Shadcn/ui** component library
- **Recharts** for data visualization
- **TanStack Query** for state management
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** via Neon Database
- **RESTful API** architecture

### Data Sources
- **CoinGecko API**: Real-time cryptocurrency price data
- **Reddit API**: Social media sentiment analysis
- **News APIs**: Multiple news sources for sentiment aggregation

## 📊 Sentiment Analysis Features

### Reddit Analysis
- **Bullish/Bearish Classification**: Clear sentiment labeling without confidence scores
- **Bot Detection**: Advanced algorithms to filter out automated posts
- **Sarcasm Detection**: Context-aware sarcasm identification
- **Engagement Metrics**: Upvotes, comments, and community engagement analysis
- **Direct Reddit Links**: Accurate URLs to original Reddit posts

### Risk Assessment
- **Volume Anomaly Detection**: Identifies unusual trading volume patterns
- **Manipulation Indicators**: Detects potential pump-and-dump schemes
- **Keyword Analysis**: Monitors for suspicious promotional language
- **Social Sentiment Scoring**: Aggregated sentiment from multiple platforms

### Visual Analytics
- **Enhanced Pie Charts**: Gradient colors with glow effects
  - Green gradients for bullish sentiment
  - Red gradients for bearish sentiment  
  - Gray gradients for neutral sentiment
- **Correlation Charts**: Sentiment vs price movement visualization
- **Multi-factor Radar**: Comprehensive risk assessment display

## 🎨 Design System

### Color Palette
- **Primary Green**: `hsl(120 100% 50%)` - Success and positive indicators
- **Destructive Red**: `hsl(0 84% 60%)` - Warnings and negative indicators
- **Background Dark**: `hsl(0 0% 8%)` - Main background
- **Card Background**: `hsl(0 0% 12%)` - Component backgrounds
- **Border Accent**: Green-tinted borders with opacity variants

### Typography
- **Font System**: System fonts optimized for readability
- **Glow Effects**: Text shadows for important metrics
- **Responsive Sizing**: Scalable typography across devices

### Animations
- **Hover Transitions**: Smooth card elevation on interaction
- **Loading States**: Professional skeleton loading animations
- **Chart Animations**: Smooth data transitions and updates

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon Database account)
- API keys for external services

### Environment Variables
```env
DATABASE_URL=your_postgresql_connection_string
VITE_COINGECKO_API_KEY=your_coingecko_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
NEWS_API_KEY=your_news_api_key
```

### Installation Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── assets/        # Static assets and images
├── server/                # Backend Express application  
│   ├── routes/           # API route definitions
│   └── storage/          # Database and storage logic
├── shared/               # Shared types and schemas
├── attached_assets/      # User-provided assets
└── README.md            # This documentation
```

### Key Components
- **CryptoSentimentAnalyzer**: Main analysis dashboard
- **RedditSentimentWidget**: Reddit integration and analysis
- **SentimentDashboard**: Comprehensive analytics overview
- **Price Charts**: Interactive price visualization components

## 🔍 API Integration

### CoinGecko Integration
- Real-time price data with 6-decimal precision
- 7-day historical price charts
- Market cap and volume metrics
- Accurate timestamp formatting (UTC)

### Reddit API
- Subreddit monitoring for cryptocurrency discussions
- Post sentiment classification (Bullish/Bearish/Neutral)
- Bot detection and filtering
- Direct linking to original Reddit threads

### News Analysis
- Multiple news source aggregation
- Sentiment scoring with confidence metrics
- Source credibility evaluation
- Time-range filtering (1-30 days)

## 📈 Analytics Capabilities

### Sentiment Metrics
- **Overall Score**: Aggregated sentiment from all sources (0-100%)
- **Confidence Level**: Algorithm confidence in sentiment analysis
- **Risk Assessment**: Multi-factor risk evaluation
- **Social Metrics**: Engagement and discussion volume analysis

### Chart Visualizations
- **7-Day Price Chart**: Line charts with current month data (August 2024)
- **Sentiment Correlation**: Dual-axis charts showing price vs sentiment
- **Pie Chart Breakdown**: Enhanced gradients with percentage labels
- **Radar Charts**: Multi-dimensional risk assessment

## 🛡 Security Features

### Scam Detection
- **Keyword Monitoring**: Detection of promotional and suspicious language
- **Volume Analysis**: Identification of artificial volume spikes
- **Pattern Recognition**: Machine learning-based scam pattern detection
- **Community Warnings**: User-generated scam reports and verification

### Data Integrity
- **Real-time Validation**: Continuous data verification from multiple sources
- **Error Handling**: Comprehensive error states and user notifications
- **Rate Limiting**: API request optimization and protection
- **Secure Storage**: Encrypted sensitive data handling

## 🎯 User Interface Features

### Dashboard Layout
- **Centered Content**: Optimal viewing experience with centered page layout
- **Module Cards**: Interactive components with hover animations
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Professional Styling**: Dark theme with cyberpunk-inspired design

### Interactive Elements
- **Hover Effects**: Smooth transitions and elevation changes
- **Click Interactions**: Direct navigation to external sources
- **Filter Controls**: User-configurable data filtering options
- **Real-time Updates**: Live data refresh with minimal latency

## 📱 Responsive Design

### Mobile Optimization
- **Touch-friendly Interface**: Optimized for mobile interaction
- **Responsive Charts**: Scalable visualizations for small screens
- **Adaptive Navigation**: Mobile-first navigation patterns
- **Performance Optimization**: Fast loading on mobile networks

### Cross-browser Compatibility
- **Modern Browser Support**: Chrome, Firefox, Safari, Edge
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Accessibility**: WCAG compliance for screen readers and keyboard navigation

## 🚀 Deployment

### Production Setup
- **Replit Deployment**: Optimized for Replit hosting platform
- **Environment Configuration**: Production-ready environment variables
- **Database Migration**: Automated schema deployment
- **Asset Optimization**: Compressed images and optimized builds

### Performance Monitoring
- **Real-time Analytics**: Application performance tracking
- **Error Logging**: Comprehensive error monitoring and reporting
- **User Analytics**: Usage patterns and feature adoption metrics

## 🤝 Contributing

### Development Guidelines
- **Code Style**: TypeScript with strict type checking
- **Component Architecture**: Reusable, composable components
- **Testing**: Comprehensive test coverage for critical functions
- **Documentation**: Inline code documentation and README updates

### Feature Requests
- **Sentiment Analysis**: Enhanced algorithm improvements
- **Additional Data Sources**: New social media platform integrations
- **Visualization**: Advanced chart types and interactive features
- **Security**: Enhanced scam detection capabilities

## 📄 License

This project is proprietary software developed for cryptocurrency sentiment analysis and fraud detection. All rights reserved.

## 📞 Support

For technical support or feature requests, please contact the development team through the official channels.

---

**CryptoSentinel** - Protecting investors through advanced sentiment analysis and fraud detection.