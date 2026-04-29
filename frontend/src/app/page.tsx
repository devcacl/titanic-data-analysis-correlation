'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SummaryMetrics {
  total_passengers: number;
  survival_rate: number;
  avg_age: number;
  avg_fare: number;
}

interface GroupMetrics {
  group: string;
  passengers: number;
  survival_rate: number;
}

interface FareDistribution {
  fare_bin: string;
  passengers: number;
}

interface CachedData {
  data: any;
  timestamp: number;
}

const getCachedData = (key: string): any | null => {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp }: CachedData = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
};

const setCachedData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

const fetchWithCache = async (endpoint: string, key: string) => {
  const cached = getCachedData(key);
  if (cached) return cached;

  const response = await axios.get(`${API_BASE_URL}${endpoint}`);
  setCachedData(key, response.data);
  return response.data;
};

export default function Home() {
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [survivalByClass, setSurvivalByClass] = useState<GroupMetrics[]>([]);
  const [survivalBySex, setSurvivalBySex] = useState<GroupMetrics[]>([]);
  const [fareDistribution, setFareDistribution] = useState<FareDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryData, classData, sexData, fareData] = await Promise.all([
          fetchWithCache('/summary', 'summary'),
          fetchWithCache('/survival-by-class', 'survivalByClass'),
          fetchWithCache('/survival-by-sex', 'survivalBySex'),
          fetchWithCache('/fare-distribution', 'fareDistribution')
        ]);

        setSummary(summaryData);
        setSurvivalByClass(classData);
        setSurvivalBySex(sexData);
        setFareDistribution(fareData);
      } catch (err) {
        setError('Failed to load analytics data. Please ensure the backend API is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Titanic Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Interactive exploration of survival patterns and passenger demographics</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Metrics */}
            <div id="summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {summary && (
                <>
                  <div className="metric-card">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Passengers</div>
                    <div className="text-3xl font-bold mt-2">{summary.total_passengers}</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Survival Rate</div>
                    <div className="text-3xl font-bold mt-2">{(summary.survival_rate * 100).toFixed(1)}%</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Age</div>
                    <div className="text-3xl font-bold mt-2">{summary.avg_age.toFixed(1)}</div>
                  </div>
                  <div className="metric-card">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Fare</div>
                    <div className="text-3xl font-bold mt-2">${summary.avg_fare.toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Survival by Class */}
              <div id="survival-class" className="metric-card">
                <h2 className="text-xl font-bold mb-4">Survival by Passenger Class</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={survivalByClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toFixed(2)} />
                    <Bar dataKey="survival_rate" fill="#3b82f6" name="Survival Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Survival by Sex */}
              <div id="survival-sex" className="metric-card">
                <h2 className="text-xl font-bold mb-4">Survival by Gender</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={survivalBySex}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="group" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toFixed(2)} />
                    <Bar dataKey="survival_rate" fill="#ef4444" name="Survival Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Fare Distribution */}
              <div id="fare-distribution" className="metric-card">
                <h2 className="text-xl font-bold mb-4">Passenger Fare Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fareDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="fare_bin" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="passengers" fill="#10b981" name="Passengers" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Passenger Distribution Pie */}
              <div id="passenger-distribution" className="metric-card">
                <h2 className="text-xl font-bold mb-4">Passengers by Class</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={survivalByClass} dataKey="passengers" nameKey="group" cx="50%" cy="50%" outerRadius={100} label>
                      {survivalByClass.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#summary" className="hover:text-blue-500">
                  ↑ Summary
                </a>
                <a href="#survival-class" className="hover:text-blue-500">
                  ↑ Survival by Class
                </a>
                <a href="#survival-sex" className="hover:text-blue-500">
                  ↑ Survival by Gender
                </a>
                <a href="#fare-distribution" className="hover:text-blue-500">
                  ↑ Fare Distribution
                </a>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
