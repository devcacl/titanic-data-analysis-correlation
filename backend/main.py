from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import Optional, List
from pydantic import BaseModel
import os

# Initialize FastAPI app
app = FastAPI(
    title="Titanic Analytics API",
    description="High-performance API for Titanic dataset analysis and metrics aggregation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Titanic dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/titanic.csv")
df = pd.read_csv(DATA_PATH)

# Data Models
class SummaryMetrics(BaseModel):
    total_passengers: int
    survival_rate: float
    avg_age: float
    avg_fare: float

class GroupMetrics(BaseModel):
    group: str
    passengers: int
    survival_rate: float

class FareDistribution(BaseModel):
    fare_bin: str
    passengers: int

# Helper function to apply filters
def apply_filters(
    data: pd.DataFrame,
    pclass: Optional[int] = None,
    sex: Optional[str] = None,
    survived: Optional[int] = None,
    min_age: Optional[float] = None,
    max_age: Optional[float] = None
) -> pd.DataFrame:
    """Apply optional filters to the dataset."""
    filtered = data.copy()
    
    if pclass is not None:
        filtered = filtered[filtered['Pclass'] == pclass]
    if sex is not None:
        filtered = filtered[filtered['Sex'] == sex.lower()]
    if survived is not None:
        filtered = filtered[filtered['Survived'] == survived]
    if min_age is not None:
        filtered = filtered[filtered['Age'] >= min_age]
    if max_age is not None:
        filtered = filtered[filtered['Age'] <= max_age]
    
    return filtered

# Endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Standard healthcheck endpoint for orchestration and deployment monitoring."""
    return {"status": "healthy", "service": "Titanic Analytics API"}

@app.get("/summary", response_model=SummaryMetrics, tags=["Analytics"])
async def get_summary(
    pclass: Optional[int] = Query(None, description="Passenger class (1, 2, or 3)"),
    sex: Optional[str] = Query(None, description="Passenger gender (male or female)"),
    survived: Optional[int] = Query(None, description="Survival status (0 or 1)"),
    min_age: Optional[float] = Query(None, description="Minimum age filter"),
    max_age: Optional[float] = Query(None, description="Maximum age filter")
):
    """Returns core dataset metrics (total_passengers, survival_rate, avg_age, avg_fare)."""
    filtered = apply_filters(df, pclass, sex, survived, min_age, max_age)
    
    return SummaryMetrics(
        total_passengers=len(filtered),
        survival_rate=round(filtered['Survived'].mean(), 4) if len(filtered) > 0 else 0,
        avg_age=round(filtered['Age'].mean(), 2) if len(filtered) > 0 else 0,
        avg_fare=round(filtered['Fare'].mean(), 2) if len(filtered) > 0 else 0
    )

@app.get("/survival-by-class", response_model=List[GroupMetrics], tags=["Analytics"])
async def get_survival_by_class(
    sex: Optional[str] = Query(None, description="Passenger gender filter"),
    survived: Optional[int] = Query(None, description="Survival status filter"),
    min_age: Optional[float] = Query(None, description="Minimum age filter"),
    max_age: Optional[float] = Query(None, description="Maximum age filter")
):
    """Aggregates data returning survival metrics grouped by passenger class."""
    filtered = apply_filters(df, None, sex, survived, min_age, max_age)
    
    results = []
    for pclass in sorted(filtered['Pclass'].unique()):
        class_data = filtered[filtered['Pclass'] == pclass]
        results.append(GroupMetrics(
            group=f"Class {int(pclass)}",
            passengers=len(class_data),
            survival_rate=round(class_data['Survived'].mean(), 4)
        ))
    
    return results

@app.get("/survival-by-sex", response_model=List[GroupMetrics], tags=["Analytics"])
async def get_survival_by_sex(
    pclass: Optional[int] = Query(None, description="Passenger class filter"),
    survived: Optional[int] = Query(None, description="Survival status filter"),
    min_age: Optional[float] = Query(None, description="Minimum age filter"),
    max_age: Optional[float] = Query(None, description="Maximum age filter")
):
    """Aggregates data returning survival metrics grouped by gender."""
    filtered = apply_filters(df, pclass, None, survived, min_age, max_age)
    
    results = []
    for sex in sorted(filtered['Sex'].unique()):
        sex_data = filtered[filtered['Sex'] == sex]
        results.append(GroupMetrics(
            group=sex.capitalize(),
            passengers=len(sex_data),
            survival_rate=round(sex_data['Survived'].mean(), 4)
        ))
    
    return results

@app.get("/fare-distribution", response_model=List[FareDistribution], tags=["Analytics"])
async def get_fare_distribution(
    pclass: Optional[int] = Query(None, description="Passenger class filter"),
    sex: Optional[str] = Query(None, description="Passenger gender filter"),
    survived: Optional[int] = Query(None, description="Survival status filter"),
    min_age: Optional[float] = Query(None, description="Minimum age filter"),
    max_age: Optional[float] = Query(None, description="Maximum age filter")
):
    """Returns passenger counts binned by fare ranges."""
    filtered = apply_filters(df, pclass, sex, survived, min_age, max_age)
    filtered = filtered.dropna(subset=['Fare'])
    
    # Create fare bins
    bins = [0, 50, 100, 150, 200, 300, 600]
    labels = ['$0-50', '$50-100', '$100-150', '$150-200', '$200-300', '$300+']
    filtered['FareBin'] = pd.cut(filtered['Fare'], bins=bins, labels=labels)
    
    results = []
    for label in labels:
        bin_data = filtered[filtered['FareBin'] == label]
        if len(bin_data) > 0:
            results.append(FareDistribution(
                fare_bin=label,
                passengers=len(bin_data)
            ))
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
