import express from 'express';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port = 3000;

// Configure rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Apply rate limiter to all requests
app.use(limiter);

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    res.json(response.data);
  } catch (error: any) {
    // Check if it's an API error response
    if (error.response && error.response.data) {
      res.status(error.response.status).json({
        error: 'I am tired, boss.',
        details: error.response.data.message
      });
    } else {
      // For other types of errors
      res.status(500).json({
        error: 'I am tired, boss.',
        details: 'Internal server error'
      });
    }
  }
});

export default app;

// Move this to a separate file like src/index.ts
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
} 