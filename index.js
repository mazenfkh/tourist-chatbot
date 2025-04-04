import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatbotRoutes from './routes/chatbot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust the proxy to handle absolute URLs correctly.
app.set('trust proxy', true);

// Middleware to normalize absolute URLs to relative paths.
app.use((req, res, next) => {
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    try {
      const { pathname, search } = new URL(req.url);
      req.url = pathname + search;
    } catch (error) {
      console.error('URL normalization error:', error);
    }
  }
  next();
});

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/api/chatbot', chatbotRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
