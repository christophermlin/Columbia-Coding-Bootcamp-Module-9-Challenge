import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data and save city
router.post('/', async (req: Request, res: Response) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    // Save city to search history
    const savedCity = await HistoryService.addCity(city);
    // Get weather data
    const weather = await WeatherService.getWeatherForCity(city);
    res.json({ ...weather, id: savedCity.id });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (_req: Request, res: Response) => {
  try {
    await HistoryService.removeCity(_req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
