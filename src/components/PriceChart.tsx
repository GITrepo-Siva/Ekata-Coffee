import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { PriceData } from '../types';
import { LoadingState } from '../types';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

interface PriceChartProps {
  data: PriceData[];
  loadingState: LoadingState;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, loadingState }) => {
  const renderContent = () => {
    switch (loadingState) {
      case LoadingState.LOADING:
        return <div className="h-96 flex justify-center items-center"><Spinner /> <span className="ml-4 text-lg">Loading Market Data...</span></div>;
      case LoadingState.ERROR:
        return <div className="h-96 flex justify-center items-center text-red-500">Failed to load price data. Please try refreshing.</div>;
      case LoadingState.SUCCESS:
        if (data.length === 0) {
          return <div className="h-96 flex justify-center items-center text-gray-500">No price data available.</div>;
        }
        const forecastStartIndex = data.findIndex(d => d.arabica_forecast !== undefined && d.arabica_price === null);
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} label={{ value: 'Price (USD/lb)', angle: -90, position: 'insideLeft', offset: -5 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #ccc',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="arabica_price" name="Arabica" stroke="#8B4513" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="robusta_price" name="Robusta" stroke="#3A2414" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="arabica_forecast" name="Arabica Forecast" stroke="#8B4513" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="robusta_forecast" name="Robusta Forecast" stroke="#3A2414" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              {forecastStartIndex > -1 && <ReferenceLine x={data[forecastStartIndex]?.date} stroke="red" label="Forecast Start" />}
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-brand-dark">Coffee Price Trends & 30-Day Forecast</h2>
      <p className="text-sm text-gray-500 mb-4">Historical prices and AI-powered forecast for Arabica and Robusta futures.</p>
      {renderContent()}
    </Card>
  );
};

export default PriceChart;