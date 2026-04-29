export type Summary = {
  total_passengers: number;
  survival_rate: number;
  avg_age: number | null;
  avg_fare: number | null;
};

export type SurvivalBucket = {
  group: string;
  passengers: number;
  survival_rate: number;
};

export type FareDistributionBucket = {
  fare_bin: string;
  passengers: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  summary: () => fetchApi<Summary>("/summary"),
  survivalByClass: () => fetchApi<SurvivalBucket[]>("/survival-by-class"),
  survivalBySex: () => fetchApi<SurvivalBucket[]>("/survival-by-sex"),
  fareDistribution: () => fetchApi<FareDistributionBucket[]>("/fare-distribution"),
};
