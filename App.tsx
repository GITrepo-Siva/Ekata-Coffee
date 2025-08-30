
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PriceChart from './components/PriceChart';
import ClimateDashboard from './components/ClimateDashboard';
import CompetitorPrices from './components/CompetitorPrices';
import AIInsights from './components/AIInsights';
import { fetchCoffeePrices, fetchPriceForecast, fetchCompetitorPrices } from './services/geminiService';
import type { PriceData, Competitor } from './types';
import { LoadingState } from './types';

const App: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [competitorData, setCompetitorData] = useState<Competitor[]>([]);
  const [priceLoadingState, setPriceLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [competitorLoadingState, setCompetitorLoadingState] = useState<LoadingState>(LoadingState.IDLE);

  const processAndCombineData = (history: PriceData[], forecast: PriceData[]): PriceData[] => {
    const combinedData = [...history];
    const lastHistoryDate = history[history.length - 1]?.date;

    forecast.forEach(f => {
        const forecastEntry: PriceData = {
            date: f.date,
            arabica_price: null,
            robusta_price: null,
            arabica_forecast: f.arabica_forecast,
            robusta_forecast: f.robusta_forecast
        };
        combinedData.push(forecastEntry);
    });

    if (lastHistoryDate && forecast.length > 0) {
      const bridgeEntry = combinedData.find(d => d.date === lastHistoryDate);
      if (bridgeEntry) {
        bridgeEntry.arabica_forecast = bridgeEntry.arabica_price;
        bridgeEntry.robusta_forecast = bridgeEntry.robusta_price;
      }
    }

    return combinedData;
  };

  const loadData = useCallback(async () => {
    setPriceLoadingState(LoadingState.LOADING);
    setCompetitorLoadingState(LoadingState.LOADING);
    
    try {
      const [historicalData, competitorPrices] = await Promise.all([
        fetchCoffeePrices(),
        fetchCompetitorPrices()
      ]);

      setCompetitorData(competitorPrices);
      setCompetitorLoadingState(LoadingState.SUCCESS);

      const cleanedHistoricalData = historicalData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((d, i, arr) => {
            if (i > 0) {
                if (d.arabica_price === null) d.arabica_price = arr[i - 1].arabica_price;
                if (d.robusta_price === null) d.robusta_price = arr[i - 1].robusta_price;
            }
            return d;
        });

      if (cleanedHistoricalData.length > 0) {
        const forecastData = await fetchPriceForecast(cleanedHistoricalData);
        const combined = processAndCombineData(cleanedHistoricalData, forecastData);
        setPriceData(combined);
      } else {
        setPriceData([]);
      }
      setPriceLoadingState(LoadingState.SUCCESS);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setPriceLoadingState(LoadingState.ERROR);
      setCompetitorLoadingState(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="min-h-screen bg-brand-light-gray text-brand-dark font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <div className="lg:col-span-3">
            <PriceChart data={priceData} loadingState={priceLoadingState} />
          </div>
          
          <div className="lg:col-span-3">
            <AIInsights 
              priceData={priceData} 
              competitorData={competitorData}
              isDataReady={priceLoadingState === LoadingState.SUCCESS && competitorLoadingState === LoadingState.SUCCESS}
            />
          </div>

          <div className="lg:col-span-2">
            <ClimateDashboard />
          </div>

          <div className="lg:col-span-1">
            <CompetitorPrices data={competitorData} loadingState={competitorLoadingState} />
          </div>

        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        <p>Ekata Earth Dynamic Pricing Engine made by <b> Group-7 (Section A) </b> Students of IIM Jammu for <b> Digital Transformation course </b> </p>
      </footer>
    </div>
  );
};

export default App;
