# Titanic Data Analysis Correlation

Este repositorio ahora incluye una solución full-stack para explorar métricas agregadas del dataset Titanic.

## Estructura

- `backend/`: API en FastAPI con endpoints agregados y filtros.
- `frontend/`: Aplicación Next.js + TypeScript responsive con navegación por secciones y tema claro/oscuro.

## Backend (FastAPI)

### Instalación

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Ejecución

```bash
uvicorn main:app --reload --port 8000
```

### Contrato API

Todos los endpoints aceptan filtros opcionales según aplique (`pclass`, `sex`, `survived`, `min_age`, `max_age`).

- `GET /summary`
  - Retorna: `total_passengers`, `survival_rate`, `avg_age`, `avg_fare`.
- `GET /survival-by-class`
  - Retorna arreglo de objetos `{ group, passengers, survival_rate }` agrupado por clase.
- `GET /survival-by-sex`
  - Retorna arreglo de objetos `{ group, passengers, survival_rate }` agrupado por sexo.
- `GET /fare-distribution`
  - Retorna arreglo de objetos `{ fare_bin, passengers }` por rangos de tarifa.
- `GET /health`
  - Healthcheck básico.

## Frontend (Next.js + TypeScript)

### Instalación

```bash
cd frontend
npm install
```

### Variables de entorno

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Ejecución

```bash
npm run dev
```

## Integración frontend/backend

- El frontend usa `fetch` con caché/revalidación de 5 minutos.
- Se maneja estado de `loading` y `error` en cliente.
- La UI tiene navegación por anclas (`Resumen`, `Clase`, `Sexo`, `Tarifa`) y toggle de tema claro/oscuro persistido en `localStorage`.
