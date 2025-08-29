import { WeatherData } from '../types';

const API_URL = "https://api.open-meteo.com/v1/forecast";

export const fetchWeatherData = async (latitude: number, longitude: number): Promise<WeatherData> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        timezone: "auto"
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        const current = data.current;

        return {
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            weatherCode: current.weather_code
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
    }
};