from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class SummaryResponse(BaseModel):
    total_passengers: int
    survival_rate: float
    avg_age: float | None
    avg_fare: float | None


class SurvivalBucket(BaseModel):
    group: str
    passengers: int
    survival_rate: float


class FareDistributionBucket(BaseModel):
    fare_bin: str
    passengers: int


app = FastAPI(title="Titanic Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_df() -> pd.DataFrame:
    data_path = Path(__file__).parent / "data" / "titanic.csv"
    if data_path.exists():
        return pd.read_csv(data_path)

    fallback_url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
    return pd.read_csv(fallback_url)


def filtered_df(
    pclass: int | None,
    sex: Literal["male", "female"] | None,
    survived: int | None,
    min_age: float | None,
    max_age: float | None,
) -> pd.DataFrame:
    df = load_df().copy()
    if pclass is not None:
        df = df[df["Pclass"] == pclass]
    if sex is not None:
        df = df[df["Sex"] == sex]
    if survived is not None:
        df = df[df["Survived"] == survived]
    if min_age is not None:
        df = df[df["Age"] >= min_age]
    if max_age is not None:
        df = df[df["Age"] <= max_age]
    return df


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/summary", response_model=SummaryResponse)
def summary(
    pclass: int | None = Query(default=None, ge=1, le=3),
    sex: Literal["male", "female"] | None = None,
    survived: int | None = Query(default=None, ge=0, le=1),
    min_age: float | None = Query(default=None, ge=0),
    max_age: float | None = Query(default=None, ge=0),
) -> SummaryResponse:
    df = filtered_df(pclass, sex, survived, min_age, max_age)
    if df.empty:
        return SummaryResponse(total_passengers=0, survival_rate=0, avg_age=None, avg_fare=None)

    return SummaryResponse(
        total_passengers=int(df.shape[0]),
        survival_rate=round(float(df["Survived"].mean()) * 100, 2),
        avg_age=round(float(df["Age"].dropna().mean()), 2) if df["Age"].notna().any() else None,
        avg_fare=round(float(df["Fare"].dropna().mean()), 2) if df["Fare"].notna().any() else None,
    )


@app.get("/survival-by-class", response_model=list[SurvivalBucket])
def survival_by_class(
    sex: Literal["male", "female"] | None = None,
    min_age: float | None = Query(default=None, ge=0),
    max_age: float | None = Query(default=None, ge=0),
) -> list[SurvivalBucket]:
    df = filtered_df(None, sex, None, min_age, max_age)
    if df.empty:
        return []
    grouped = (
        df.groupby("Pclass")
        .agg(passengers=("PassengerId", "count"), survival_rate=("Survived", "mean"))
        .reset_index()
        .sort_values("Pclass")
    )
    return [
        SurvivalBucket(
            group=f"Class {int(row.Pclass)}",
            passengers=int(row.passengers),
            survival_rate=round(float(row.survival_rate) * 100, 2),
        )
        for row in grouped.itertuples()
    ]


@app.get("/survival-by-sex", response_model=list[SurvivalBucket])
def survival_by_sex(
    pclass: int | None = Query(default=None, ge=1, le=3),
    min_age: float | None = Query(default=None, ge=0),
    max_age: float | None = Query(default=None, ge=0),
) -> list[SurvivalBucket]:
    df = filtered_df(pclass, None, None, min_age, max_age)
    if df.empty:
        return []
    grouped = (
        df.groupby("Sex")
        .agg(passengers=("PassengerId", "count"), survival_rate=("Survived", "mean"))
        .reset_index()
        .sort_values("Sex")
    )
    return [
        SurvivalBucket(
            group=str(row.Sex),
            passengers=int(row.passengers),
            survival_rate=round(float(row.survival_rate) * 100, 2),
        )
        for row in grouped.itertuples()
    ]


@app.get("/fare-distribution", response_model=list[FareDistributionBucket])
def fare_distribution(
    pclass: int | None = Query(default=None, ge=1, le=3),
    sex: Literal["male", "female"] | None = None,
    survived: int | None = Query(default=None, ge=0, le=1),
):
    df = filtered_df(pclass, sex, survived, None, None)
    if df.empty:
        return []

    bins = [0, 10, 25, 50, 100, 300, float("inf")]
    labels = ["0-10", "10-25", "25-50", "50-100", "100-300", "300+"]
    fare_bins = pd.cut(df["Fare"], bins=bins, labels=labels, right=False, include_lowest=True)
    grouped = fare_bins.value_counts(sort=False)

    return [
        FareDistributionBucket(fare_bin=str(label), passengers=int(grouped.get(label, 0)))
        for label in labels
    ]
