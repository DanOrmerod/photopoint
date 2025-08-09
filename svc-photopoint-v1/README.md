# PhotoPoint API Service v1

A TypeScript-based REST API service for the PhotoPoint application.

## Features

- ✅ TypeScript
- ✅ Express.js framework
- ✅ CORS enabled
- ✅ Security headers with Helmet
- ✅ Request logging with Morgan
- ✅ Environment configuration
- ✅ Health check endpoint
- ✅ Hot reload in development

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment configuration:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Returns service health status

### API Info
- **GET** `/api/v1` - Returns API information and available endpoints

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove dist folder
- `npm test` - Run tests (placeholder)

## Project Structure

```
src/
├── server.ts          # Main application entry point
├── routes/            # API route handlers (to be added)
├── middleware/        # Custom middleware (to be added)
├── models/            # Data models (to be added)
├── services/          # Business logic (to be added)
└── utils/             # Utility functions (to be added)
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

ISC
