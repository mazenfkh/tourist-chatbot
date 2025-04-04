import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatbotRoutes from './routes/chatbot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// If behind a proxy (like on Heroku), this may help
app.set('trust proxy', true);

// (Optional) Middleware to normalize absolute URLs if needed
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

// Serve static files from the built client directory.
// Ensure that your built files are located in the "client/dist" folder.
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// API routes
app.use('/api/chatbot', chatbotRoutes);

// For all other routes, serve the index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
