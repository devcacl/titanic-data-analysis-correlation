"use client";

import { useEffect, useState } from "react";
import { api, FareDistributionBucket, Summary, SurvivalBucket } from "../lib/api";
import { SectionCard } from "./SectionCard";

type Theme = "light" | "dark";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("theme", next);
  };

  return [theme, toggle];
}

export function Dashboard() {
  const [theme, toggleTheme] = useTheme();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byClass, setByClass] = useState<SurvivalBucket[]>([]);
  const [bySex, setBySex] = useState<SurvivalBucket[]>([]);
  const [fareDistribution, setFareDistribution] = useState<FareDistributionBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, classData, sexData, fareData] = await Promise.all([
          api.summary(),
          api.survivalByClass(),
          api.survivalBySex(),
          api.fareDistribution(),
        ]);
        if (!isMounted) return;
        setSummary(summaryData);
        setByClass(classData);
        setBySex(sexData);
        setFareDistribution(fareData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar los datos");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Titanic Insights Dashboard</h1>
          <p>Análisis agregado de supervivencia y tarifas.</p>
        </div>
        <button onClick={toggleTheme} className="themeBtn">
          {theme === "light" ? "🌙 Oscuro" : "☀️ Claro"}
        </button>
      </header>

      <nav className="nav">
        <a href="#summary">Resumen</a>
        <a href="#class">Supervivencia por clase</a>
        <a href="#sex">Supervivencia por sexo</a>
        <a href="#fare">Distribución de tarifa</a>
      </nav>

      {loading && <p className="state">Cargando datos…</p>}
      {error && <p className="state error">Error: {error}</p>}

      {!loading && !error && summary && (
        <>
          <SectionCard id="summary" title="Resumen general">
            <div className="grid">
              <Metric label="Pasajeros" value={String(summary.total_passengers)} />
              <Metric label="Tasa de supervivencia" value={`${summary.survival_rate}%`} />
              <Metric label="Edad promedio" value={summary.avg_age ? `${summary.avg_age}` : "N/A"} />
              <Metric label="Tarifa promedio" value={summary.avg_fare ? `$${summary.avg_fare}` : "N/A"} />
            </div>
          </SectionCard>

          <SectionCard id="class" title="Supervivencia por clase">
            <SimpleTable
              headers={["Clase", "Pasajeros", "% Supervivencia"]}
              rows={byClass.map((b) => [b.group, String(b.passengers), String(b.survival_rate)])}
            />
          </SectionCard>

          <SectionCard id="sex" title="Supervivencia por sexo">
            <SimpleTable
              headers={["Sexo", "Pasajeros", "% Supervivencia"]}
              rows={bySex.map((b) => [b.group, String(b.passengers), String(b.survival_rate)])}
            />
          </SectionCard>

          <SectionCard id="fare" title="Distribución de tarifa">
            <SimpleTable
              headers={["Rango tarifa", "Pasajeros"]}
              rows={fareDistribution.map((b) => [b.fare_bin, String(b.passengers)])}
            />
          </SectionCard>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={`${row[0]}-${idx}`}>
              {row.map((cell, cellIdx) => (
                <td key={`${idx}-${cellIdx}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
