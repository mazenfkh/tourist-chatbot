import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatbotRoutes from './routes/chatbot.js';

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.MONGO_URI && process.env.USE_MONGODB !== 'false') {
  import('mongoose').then((mongoose) => {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('MongoDB connected...'))
      .catch((err) => console.error('MongoDB connection error:', err));
  }).catch(err => {
    console.log('MongoDB integration not being used');
  });
} else {
  console.log('MongoDB integration disabled');
}

app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});