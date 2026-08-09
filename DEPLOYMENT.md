# Deployment

## Local
Backend:
`cd backend && pip install -r requirements.txt && uvicorn app:app --reload --host 0.0.0.0 --port 8000`

Frontend:
`cd frontend && npm install && npm run dev`

## Docker
`docker compose up --build`

Open:
`http://localhost:5173`

## Hosting
Deploy the backend as a Python service using:
`uvicorn app:app --host 0.0.0.0 --port $PORT`

Deploy the frontend as a Node/static application:
`npm install && npm run build`

Set:
`VITE_API_BASE=https://YOUR-BACKEND-DOMAIN`

Before public deployment, restrict CORS, add authentication, enable HTTPS, and use only provider-issued sandbox/test credentials.
