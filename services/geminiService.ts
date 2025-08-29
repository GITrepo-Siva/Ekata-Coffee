
import { GoogleGenAI, Type } from "@google/genai";
import type { PriceData, Competitor, AIInsightsData } from '../types';

const generateContentWithRetry = async (prompt: string, schema: any): Promise<any> => {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, schema }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Proxy API call failed, retrying...", error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds before retry
    }
  }
  throw new Error("API call failed after multiple retries.");
};

export const fetchCoffeePrices = async (): Promise<PriceData[]> => {
  const prompt = `
    Provide the daily historical prices for Arabica and Robusta coffee futures for the last 30 days.
    The date should be in 'YYYY-MM-DD' format. Prices should be in USD per pound.
    If a price for a specific day is unavailable (e.g., weekend), set it to null.
    The output must be a JSON array.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
        arabica_price: { type: Type.NUMBER, description: "Price of Arabica coffee in USD per pound. Null if unavailable.", nullable: true },
        robusta_price: { type: Type.NUMBER, description: "Price of Robusta coffee in USD per pound. Null if unavailable.", nullable: true },
      },
      required: ["date", "arabica_price", "robusta_price"],
    },
  };
  
  const result = await generateContentWithRetry(prompt, schema);
  return result as PriceData[];
};

export const fetchPriceForecast = async (historicalData: PriceData[]): Promise<PriceData[]> => {
  const prompt = `
    Given the following historical daily price data for Arabica and Robusta coffee for the last 30 days:
    ${JSON.stringify(historicalData)}

    Perform a time-series forecast for the next 30 days for both Arabica and Robusta coffee prices.
    Use a methodology that mimics a sophisticated forecasting model like XGBoost, considering trends, and volatility.
    Return a JSON array for the next 30 days, starting from the day after the last historical data point.
    The date should be in 'YYYY-MM-DD' format. Prices should be in USD per pound.
  `;
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Forecasted date in YYYY-MM-DD format" },
        arabica_forecast: { type: Type.NUMBER, description: "Forecasted price of Arabica coffee in USD per pound" },
        robusta_forecast: { type: Type.NUMBER, description: "Forecasted price of Robusta coffee in USD per pound" },
      },
      required: ["date", "arabica_forecast", "robusta_forecast"],
    },
  };

  const result = await generateContentWithRetry(prompt, schema);
  return result as PriceData[];
};

export const fetchCompetitorPrices = async (): Promise<Competitor[]> => {
  const prompt = `
    Provide the current prices for a standard 250g pack of a popular or signature blend of whole bean coffee from the following Indian coffee companies:
    - Blue Tokai Coffee Roasters
    - Araku Coffee
    - Savorworks Roasters
    - Naivo Cafe & Roasters
    - Curious Life Coffee Roasters
    
    The output must be a JSON array. If a price is not found, omit the company from the list.
    Provide the product name you are quoting the price for.
  `;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        company: { type: Type.STRING, description: "Name of the coffee company" },
        product: { type: Type.STRING, description: "Name of the coffee product (e.g., Signature Blend)" },
        price: { type: Type.NUMBER, description: "Price in INR" },
        currency: { type: Type.STRING, description: "Currency, should be 'INR'" },
      },
      required: ["company", "product", "price", "currency"],
    },
  };
  
  const result = await generateContentWithRetry(prompt, schema);
  return result as Competitor[];
};

export const fetchAIInsights = async (
  priceData: PriceData[],
  competitorData: Competitor[]
): Promise<AIInsightsData> => {
  const prompt = `
    As a senior commodities analyst for a major coffee company, analyze the following data and provide actionable, explainable insights.

    **Market Data (Last 30 Days History & 30 Days Forecast):**
    ${JSON.stringify(priceData)}

    **Indian Competitor Pricing Data (250g packs):**
    ${JSON.stringify(competitorData)}

    Based on this data, provide a concise summary for each of the following areas. Your reasoning must be clear and directly tied to the data provided.

    1.  **Sourcing Strategy:** Should we adjust our sourcing between Arabica and Robusta? Are there any price trends that suggest buying more now vs. later?
    2.  **Inventory Management:** Based on price forecasts, should we increase or decrease our current stock of green beans?
    3.  **Pricing Strategy:** How do our potential price points compare to the Indian market? Given the forecast, should we consider adjusting the price of our consumer products?

    Return the insights as a JSON object.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      sourcing: {
        type: Type.STRING,
        description: "Actionable insight on sourcing strategy, with explanation."
      },
      inventory: {
        type: Type.STRING,
        description: "Actionable insight on inventory management, with explanation."
      },
      pricing: {
        type: Type.STRING,
        description: "Actionable insight on pricing strategy, with explanation."
      },
    },
    required: ["sourcing", "inventory", "pricing"],
  };

  const result = await generateContentWithRetry(prompt, schema);
  return result as AIInsightsData;
};
