import dotenv from 'dotenv';
dotenv.config();

console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);

import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import uploadRouter from './routes/upload.js';
import portfolioAnalysisRouter from './routes/portfolioAnalysis.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', uploadRouter);
app.use('/api', portfolioAnalysisRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
