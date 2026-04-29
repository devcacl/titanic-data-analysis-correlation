# Full-Stack Titanic Analytics Platform - Deployment Guide

## Architecture Overview

This project consists of two main components:

### Backend: FastAPI
- **Framework**: FastAPI (async Python)
- **Purpose**: High-performance REST API for data aggregation and metric computation
- **Location**: `/backend`
- **Port**: 8000 (default)

### Frontend: Next.js
- **Framework**: Next.js with TypeScript
- **Purpose**: Interactive analytics dashboard with responsive UI
- **Location**: `/frontend`
- **Port**: 3000 (default)

## Local Development Setup

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Analytics Endpoints

All endpoints support optional query parameters for filtering:

#### Summary Metrics
```
GET /summary?pclass=1&sex=female&min_age=18&max_age=50
```
Returns: `{ total_passengers, survival_rate, avg_age, avg_fare }`

#### Survival by Passenger Class
```
GET /survival-by-class?sex=female&survived=1
```
Returns: Array of `{ group, passengers, survival_rate }`

#### Survival by Gender
```
GET /survival-by-sex?pclass=1
```
Returns: Array of `{ group, passengers, survival_rate }`

#### Fare Distribution
```
GET /fare-distribution?survived=1
```
Returns: Array of `{ fare_bin, passengers }`

## Frontend Configuration

Set the backend API URL via environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Production Deployment

### Backend (Docker)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend (Vercel/Docker)

```bash
# Build
npm run build

# Start
npm start
```

## Performance Optimizations

1. **Frontend Caching**: 5-minute ISR (Incremental Static Regeneration) cache
2. **API Optimization**: Async FastAPI endpoints with optional parameter filtering
3. **CORS Enabled**: Cross-origin requests from any domain (configurable)
4. **Dark Mode Support**: Native light/dark theme with system preference detection

## Monitoring

- Backend health: `GET /health`
- Frontend logs: Browser console and Next.js logs
- API docs: Swagger UI at `http://localhost:8000/docs`
