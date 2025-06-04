import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_PATH = path.resolve(__dirname, '../searchHistory.json');

class City {
  id: string;
  name: string;
  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }
}

class HistoryService {
  private async read(): Promise<City[]> {
    try {
      const data = await fs.promises.readFile(HISTORY_PATH, 'utf-8');
      if (!data) return [];
      return JSON.parse(data);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        await fs.promises.writeFile(HISTORY_PATH, '[]');
        return [];
      }
      throw err;
    }
  }
  private async write(cities: City[]): Promise<void> {
    await fs.promises.writeFile(HISTORY_PATH, JSON.stringify(cities, null, 2));
  }
  async getCities(): Promise<City[]> {
    return this.read();
  }
  async addCity(city: string): Promise<City> {
    const cities = await this.read();
    // Prevent duplicate city names (case-insensitive)
    if (cities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
      return cities.find((c) => c.name.toLowerCase() === city.toLowerCase())!;
    }
    const newCity = new City(city);
    cities.push(newCity);
    await this.write(cities);
    return newCity;
  }
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const filtered = cities.filter((c: City) => c.id !== id);
    await this.write(filtered);
  }
}

export default new HistoryService();
