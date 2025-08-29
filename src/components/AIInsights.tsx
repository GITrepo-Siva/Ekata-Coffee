
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAIInsights } from '../services/geminiService';
import type { PriceData, Competitor, AIInsightsData } from '../types';
import { LoadingState } from '../types';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

const SourcingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l1.414-1.414a1 1 0 011.414 0l1.414 1.414M10 11V3a1 1 0 011-1h2a1 1 0 011 1v8m-1 4h.01M15 15h.01M18 15h.01M6 15h.01M9 15h.01" />
  </svg>
);
const InventoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const PricingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1m-7 6v1h7v-1m-7 3v1h7v-1m0-11V4a1 1 0 00-1-1h-1a1 1 0 00-1 1v1m-1 11a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

interface AIInsightsProps {
    priceData: PriceData[];
    competitorData: Competitor[];
    isDataReady: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ priceData, competitorData, isDataReady }) => {
    const [insights, setInsights] = useState<AIInsightsData | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
    
    const loadInsights = useCallback(async () => {
        if (!isDataReady || priceData.length === 0 || competitorData.length === 0) {
            return;
        }
        setLoadingState(LoadingState.LOADING);
        try {
            const data = await fetchAIInsights(priceData, competitorData);
            setInsights(data);
            setLoadingState(LoadingState.SUCCESS);
        } catch (error) {
            console.error("Failed to load AI insights:", error);
            setLoadingState(LoadingState.ERROR);
        }
    }, [isDataReady, priceData, competitorData]);

    useEffect(() => {
        loadInsights();
    }, [loadInsights]);

    const renderContent = () => {
        if (!isDataReady) {
            return <div className="h-48 flex justify-center items-center text-gray-500">Waiting for market data to generate insights...</div>;
        }
        switch (loadingState) {
            case LoadingState.LOADING:
                return <div className="h-48 flex justify-center items-center"><Spinner /><span className="ml-4 text-lg">Generating Strategic Insights...</span></div>;
            case LoadingState.ERROR:
                return <div className="h-48 flex justify-center items-center text-red-500">Failed to generate insights.</div>;
            case LoadingState.SUCCESS:
                if (!insights) return <div className="h-48 flex justify-center items-center text-gray-500">No insights could be generated.</div>;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-brand-light-gray/50 rounded-lg">
                            <div className="flex items-center mb-2">
                                <SourcingIcon />
                                <h3 className="text-lg font-semibold ml-2 text-brand-dark">Sourcing Strategy</h3>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{insights.sourcing}</p>
                        </div>
                        <div className="p-4 bg-brand-light-gray/50 rounded-lg">
                            <div className="flex items-center mb-2">
                                <InventoryIcon />
                                <h3 className="text-lg font-semibold ml-2 text-brand-dark">Inventory Management</h3>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{insights.inventory}</p>
                        </div>
                        <div className="p-4 bg-brand-light-gray/50 rounded-lg">
                            <div className="flex items-center mb-2">
                                <PricingIcon />
                                <h3 className="text-lg font-semibold ml-2 text-brand-dark">Pricing Strategy</h3>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{insights.pricing}</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-dark">AI-Powered Strategic Insights</h2>
            {renderContent()}
        </Card>
    );
};

export default AIInsights;
