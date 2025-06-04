import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

interface Weather {
  date: string;
  icon: string;
  description: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

class WeatherService {
  baseURL = 'https://api.openweathermap.org/data/2.5/forecast';
  geoURL = 'https://api.openweathermap.org/geo/1.0/direct';
  apiKey = process.env.OPENWEATHER_API_KEY;

  private async fetchLocationData(city: string): Promise<Coordinates> {
    const res = await axios.get(this.geoURL, {
      params: { q: city, limit: 1, appid: this.apiKey },
    });
    if (!res.data[0]) throw new Error('City not found');
    return { lat: res.data[0].lat, lon: res.data[0].lon };
  }

  private async fetchWeatherData(coords: Coordinates) {
    const res = await axios.get(this.baseURL, {
      params: { lat: coords.lat, lon: coords.lon, appid: this.apiKey, units: 'imperial' },
    });
    return res.data;
  }

  private parseCurrentWeather(data: any): Weather {
    const current = data.list[0];
    return {
      date: current.dt_txt,
      icon: current.weather[0].icon,
      description: current.weather[0].description,
      temperature: current.main.temp,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
    };
  }

  private buildForecastArray(data: any): Weather[] {
    // Get one forecast per day (at noon)
    const forecasts = data.list.filter((item: any) => item.dt_txt.includes('12:00:00'));
    return forecasts.slice(0, 5).map((item: any) => ({
      date: item.dt_txt,
      icon: item.weather[0].icon,
      description: item.weather[0].description,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
    }));
  }

  async getWeatherForCity(city: string) {
    const coords = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coords);
    return {
      city: weatherData.city.name,
      current: this.parseCurrentWeather(weatherData),
      forecast: this.buildForecastArray(weatherData),
    };
  }
}

export default new WeatherService();
