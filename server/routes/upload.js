import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists at startup
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain'];
  // Some OS/browsers send empty mimetype for .txt; fall back to extension check
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(file.mimetype) || ext === '.pdf' || ext === '.txt') {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

const router = Router();

router.post('/upload', upload.array('files', 10), (req, res) => {
  const files = (req.files ?? []).map((f) => ({
    name: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
    storedAs: f.filename,
  }));
  res.json({ success: true, files });
});

// Multer error handler (file type / size violations)
router.use('/upload', (err, _req, res, _next) => {
  res.status(400).json({ success: false, error: err.message });
});

export default router;
