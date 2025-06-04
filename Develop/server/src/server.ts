import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
dotenv.config();

// Remove unused __filename variable

console.log('Loaded OpenWeather API Key:', process.env.OPENWEATHER_API_KEY ? '[HIDDEN]' : '[NOT FOUND]');

// Import the routes
import HistoryService from './service/historyService.js';
import WeatherService from './service/weatherService.js';
import { Router, type Request, type Response } from 'express';
const apiRouter = Router();

apiRouter.post('/weather', async (req: Request, res: Response) => {
  const { city } = req.body || {};
  // Defensive: treat empty string, null, undefined, or whitespace as missing
  if (!city || typeof city !== 'string' || !city.trim()) {
    // Instead of returning a 200 with error, return a 400 with error (so frontend can distinguish)
    return res.status(400).json({
      city: null,
      current: null,
      forecast: [],
      id: null,
      error: 'City is required'
    });
  }
  try {
    const savedCity = await HistoryService.addCity(city);
    const weather = await WeatherService.getWeatherForCity(city);
    // Defensive: if weather or weather.current is missing, return a 404 with error
    if (!weather || !weather.current) {
      return res.status(404).json({
        city: null,
        current: null,
        forecast: [],
        id: savedCity.id,
        error: 'Weather data not found for this city.'
      });
    }
    return res.json({ ...weather, id: savedCity.id });
  } catch (err: any) {
    return res.status(500).json({
      city: null,
      current: null,
      forecast: [],
      id: null,
      error: err.message || 'An error occurred'
    });
  }
});

// Also handle POST /weather/ (trailing slash) for frontend compatibility
apiRouter.post('/weather/', async (req: Request, res: Response) => {
  const { city } = req.body || {};
  // Defensive: treat empty string, null, undefined, or whitespace as missing
  if (!city || typeof city !== 'string' || !city.trim()) {
    // Instead of returning a 200 with error, return a 400 with error (so frontend can distinguish)
    return res.status(400).json({
      city: null,
      current: null,
      forecast: [],
      id: null,
      error: 'City is required'
    });
  }
  try {
    const savedCity = await HistoryService.addCity(city);
    const weather = await WeatherService.getWeatherForCity(city);
    // Defensive: if weather or weather.current is missing, return a 404 with error
    if (!weather || !weather.current) {
      return res.status(404).json({
        city: null,
        current: null,
        forecast: [],
        id: savedCity.id,
        error: 'Weather data not found for this city.'
      });
    }
    return res.json({ ...weather, id: savedCity.id });
  } catch (err: any) {
    return res.status(500).json({
      city: null,
      current: null,
      forecast: [],
      id: null,
      error: err.message || 'An error occurred'
    });
  }
});

apiRouter.get('/weather/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/weather/history/:id', async (req: Request, res: Response) => {
  try {
    await HistoryService.removeCity(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the built client (dist) directory using correct path from project root
app.use(express.static(path.resolve(process.cwd(), '../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRouter);

// Serve index.html for all non-API routes (for client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(process.cwd(), '../client/dist/index.html'));
});

app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
