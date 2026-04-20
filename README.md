# 💼 Investment Advisory App

An AI-powered multi-stage investment advisory application that guides financial advisors through client analysis and portfolio recommendations.

---

## 🚀 Features

* 📊 Client Profile Analysis
* 🤖 AI-driven Portfolio Evaluation
* 🔄 Toggle between Mock and LLM modes
* 📈 Investment Recommendations
* 🧩 Multi-stage advisory workflow

---

## 🧠 Application Flow

1. Advisor enters client details
2. Client profile is processed
3. Portfolio data is analyzed
4. AI generates insights (Mock / LLM)
5. Recommendations are displayed

---

## 🔄 Analysis Mode (Mock vs LLM)

The application supports two execution modes:

### 🟢 Mock Mode (Development)

Uses predefined responses for faster testing.


set ANALYSIS_MODE=mock
npm run dev




### 🔵 LLM Mode (AI-powered)

Uses a Large Language Model for real analysis.


set ANALYSIS_MODE=llm
npm run dev




### ⚙️ How It Works

* Backend reads `ANALYSIS_MODE`
* `mock` → returns static data
* `llm` → calls AI model for analysis

---

## 🛠️ Tech Stack

### Frontend

* React.js

### Backend

* Node.js
* Express.js

### AI Integration

* LLM API (for portfolio analysis)

---

## 📁 Project Structure


client/
  ├── src/components/AgentPipeline.jsx
  ├── src/pages/ClientProfileStage.jsx

server/
  ├── index.js
  ├── routes/portfolioAnalysis.js


---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/rinusharma/portfolio-website.git
cd InvestmentAdvisoryApp


---

### 2. Install dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd ../server
npm install
```

---

### 3. Run the application

#### Start backend

```bash
npm run dev
```

#### Start frontend

```bash
cd ../client
npm start
```

---

## 🔑 Key Components

* **AgentPipeline.jsx** → Controls multi-stage AI workflow
* **ClientProfileStage.jsx** → Handles client input
* **portfolioAnalysis.js** → Backend logic for analysis

---

## 📌 Future Enhancements

* Authentication & user sessions
* Advanced portfolio optimization
* Better UI/UX
* Deployment (Vercel / AWS)



## Author

Rinu Sharma
