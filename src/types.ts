export interface PriceData {
  date: string;
  arabica_price: number | null;
  robusta_price: number | null;
  arabica_forecast?: number | null;
  robusta_forecast?: number | null;
}

export interface CoffeeEstate {
  name: string;
  coords: [number, number];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export interface Competitor {
  company: string;
  product: string;
  price: number;
  currency: string;
}

export enum LoadingState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export interface AIInsightsData {
  sourcing: string;
  inventory: string;
  pricing: string;
}