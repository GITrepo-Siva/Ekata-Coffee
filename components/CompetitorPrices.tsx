
import React from 'react';
import type { Competitor } from '../types';
import { LoadingState } from '../types';
import Card from './ui/Card';
import Spinner from './ui/Spinner';

interface CompetitorPricesProps {
    data: Competitor[];
    loadingState: LoadingState;
}

const CompetitorPrices: React.FC<CompetitorPricesProps> = ({ data, loadingState }) => {
    const renderContent = () => {
        switch (loadingState) {
            case LoadingState.LOADING:
                return <div className="h-full flex justify-center items-center"><Spinner /></div>;
            case LoadingState.ERROR:
                return <div className="h-full flex justify-center items-center text-red-500 text-center">Failed to load competitor prices. Please try refreshing.</div>;
            case LoadingState.SUCCESS:
                if (data.length === 0) {
                    return <div className="h-full flex justify-center items-center text-gray-500 text-center">No competitor data available.</div>;
                }
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3 px-4">Company</th>
                                    <th scope="col" className="py-3 px-4">Price (250g)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((p, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900 whitespace-nowrap">
                                            {p.company}
                                            <span className="block text-xs text-gray-400 font-normal">{p.product}</span>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-brand-dark">
                                            ₹{p.price.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-brand-dark">Indian Competitor Watch</h2>
            <p className="text-sm text-gray-500 mb-4">AI-retrieved prices for popular 250g coffee packs.</p>
            <div className="min-h-[295px] flex flex-col">
                {renderContent()}
            </div>
        </Card>
    );
};

export default CompetitorPrices;
