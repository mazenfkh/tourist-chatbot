import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import the chatbot router
import chatbotRoutes from './routes/chatbot.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional, if you're using a DB)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tourist-chatbot';
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/chatbot', chatbotRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
