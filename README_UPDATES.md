# Titanic Data Analysis - Full Stack Upgrade

## What's New

This Pull Request transforms the Titanic Data Analysis project from a static Jupyter notebook-based exploration into a modern, production-ready full-stack analytics platform.

### ✨ Key Additions

#### 1. **Backend: FastAPI Metrics API**
   - High-performance REST API built with FastAPI
   - Async-ready endpoints for optimal scalability
   - Dynamic filtering capabilities (pclass, sex, survived, age range, etc.)
   - Automatic API documentation via Swagger UI
   - Health check endpoint for deployment monitoring

#### 2. **Frontend: Next.js Analytics Dashboard**
   - Modern, responsive web interface built with Next.js + TypeScript
   - Interactive charts using Recharts library
   - Real-time data visualization from backend API
   - Smart caching: 5-minute ISR strategy to minimize backend calls
   - Native dark/light theme support with system preference detection
   - Resilient error handling and loading states
   - Seamless anchor-based navigation across dashboard sections

#### 3. **Data Visualizations**
   - Summary metrics cards (total passengers, survival rate, avg age, avg fare)
   - Bar charts: Survival rates by passenger class
   - Bar charts: Survival rates by gender
   - Bar charts: Fare distribution across price ranges
   - Pie chart: Passenger distribution by class

### 📊 API Endpoints

```
GET /health                    - Service health status
GET /summary                   - Core metrics (configurable filters)
GET /survival-by-class        - Survival grouped by passenger class
GET /survival-by-sex          - Survival grouped by gender
GET /fare-distribution        - Passenger counts by fare range
```

All endpoints accept optional query parameters:
- `pclass` (int): Passenger class (1, 2, 3)
- `sex` (str): Gender (male, female)
- `survived` (int): Survival status (0, 1)
- `min_age` (float): Minimum age
- `max_age` (float): Maximum age

### 🚀 Getting Started

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```
API runs on `http://localhost:8000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Dashboard runs on `http://localhost:3000`

See `DEPLOYMENT.md` for detailed setup and production deployment instructions.

### 💪 Why This Matters

- **Scalability**: FastAPI enables high-concurrency, low-latency API serving
- **UX**: Interactive dashboard vs static notebooks
- **Maintainability**: Separation of concerns (backend/frontend)
- **Extensibility**: Easy to add new endpoints, visualizations, and features
- **Production-Ready**: Includes health checks, error handling, caching, and dark mode

### 📝 Note

The original Jupyter notebook analysis (`titanic_analysis.ipynb`) remains in the repository for reference and exploratory work.
