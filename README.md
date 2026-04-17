# Investment Advisory Platform

Full-stack scaffold — React (Vite) + TailwindCSS frontend, Node.js / Express backend.

---

## Project Structure

```
InvestmentAdvisoryApp/
├── client/                   # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   └── ServerStatusCard.jsx
│   │   ├── pages/
│   │   │   └── HomePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js        # Dev proxy → backend :5000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                   # Node.js + Express
│   ├── routes/
│   │   └── health.js         # GET /api/health
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## Local Setup

### 1 — Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2 — Run in development (two terminals)

**Terminal 1 — backend**

```bash
cd server
npm run dev          # nodemon, port 5000
```

**Terminal 2 — frontend**

```bash
cd client
npm run dev          # Vite, port 5173
```

Open **http://localhost:5173** in your browser.  
The frontend fetches `GET /api/health` via the Vite dev proxy and displays the response.

---

## API Endpoints

| Method | Path         | Description           |
|--------|--------------|-----------------------|
| GET    | /api/health  | Returns server status |

Sample response:

```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2026-04-17T10:00:00.000Z"
}
```
