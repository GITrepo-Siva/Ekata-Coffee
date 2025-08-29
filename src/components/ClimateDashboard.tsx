import React, { useState, useEffect, useCallback } from 'react';
import { COFFEE_ESTATES } from '../constants';
import { fetchWeatherData } from '../services/weatherService';
import type { WeatherData, CoffeeEstate } from '../types';
import { LoadingState } from '../types';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

const WeatherIcon: React.FC<{ code: number }> = ({ code }) => {
    // A simplified mapping from WMO Weather interpretation codes
    let icon;
    if ([0, 1].includes(code)) icon = '☀️'; // Clear, Mainly clear
    else if ([2, 3].includes(code)) icon = '☁️'; // Partly cloudy, Overcast
    else if ([45, 48].includes(code)) icon = '🌫️'; // Fog
    else if ([51, 53, 55, 56, 57].includes(code)) icon = '💧'; // Drizzle
    else if ([61, 63, 65, 66, 67].includes(code)) icon = '🌧️'; // Rain
    else if ([71, 73, 75, 77].includes(code)) icon = '❄️'; // Snow
    else if ([80, 81, 82].includes(code)) icon = '🌦️'; // Rain showers
    else if ([85, 86].includes(code)) icon = '🌨️'; // Snow showers
    else if ([95, 96, 99].includes(code)) icon = '⛈️'; // Thunderstorm
    else icon = '🌍';
    return <span className="text-5xl">{icon}</span>;
};

const WeatherDisplay: React.FC<{ weather: WeatherData }> = ({ weather }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
        <div className="flex items-center space-x-6">
            <WeatherIcon code={weather.weatherCode} />
            <div>
                <p className="text-5xl font-bold text-brand-brown">{weather.temperature.toFixed(1)}°C</p>
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2 mt-4 sm:mt-0 text-sm">
            <div className="text-center">
                <p className="font-semibold">Humidity</p>
                <p className="text-lg">{weather.humidity}%</p>
            </div>
            <div className="text-center">
                <p className="font-semibold">Wind Speed</p>
                <p className="text-lg">{weather.windSpeed.toFixed(1)} km/h</p>
            </div>
        </div>
    </div>
);


const ClimateDashboard: React.FC = () => {
    const [selectedEstate, setSelectedEstate] = useState<CoffeeEstate>(COFFEE_ESTATES[0]);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

    const loadWeatherData = useCallback(async (estate: CoffeeEstate) => {
        setLoadingState(LoadingState.LOADING);
        try {
            const data = await fetchWeatherData(estate.coords[0], estate.coords[1]);
            setWeatherData(data);
            setLoadingState(LoadingState.SUCCESS);
        } catch (error) {
            console.error("Failed to load weather data:", error);
            setLoadingState(LoadingState.ERROR);
        }
    }, []);
    
    useEffect(() => {
        loadWeatherData(selectedEstate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEstate]);
    
    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-dark">Real-Time Estate Climate</h2>
            <div className="mb-4">
                <label htmlFor="estate-table" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Coffee Estate
                </label>
                <div id="estate-table" className="h-48 overflow-y-auto border rounded-lg bg-white">
                    <table className="w-full text-sm text-left">
                        <tbody>
                            {COFFEE_ESTATES.map(estate => (
                                <tr 
                                    key={estate.name}
                                    onClick={() => setSelectedEstate(estate)}
                                    className={`cursor-pointer transition-colors duration-150 ${
                                        selectedEstate.name === estate.name 
                                        ? 'bg-brand-cream border-l-4 border-brand-brown' 
                                        : 'hover:bg-brand-light-gray/50'
                                    }`}
                                >
                                    <td className={`py-2.5 px-4 font-medium ${selectedEstate.name === estate.name ? 'text-brand-dark' : 'text-gray-800'}`}>
                                        {estate.name}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="p-4 bg-brand-light-gray/50 rounded-lg min-h-[120px] flex items-center justify-center">
                {loadingState === LoadingState.LOADING && <Spinner />}
                {loadingState === LoadingState.ERROR && <p className="text-red-500">Could not fetch climate data.</p>}
                {loadingState === LoadingState.SUCCESS && weatherData && <WeatherDisplay weather={weatherData} />}
            </div>
        </Card>
    );
};

export default ClimateDashboard;