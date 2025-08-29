
import { Type } from "@google/genai";
import type { PriceData, Competitor, AIInsightsData } from '../types';

const generateContentWithRetry = async (prompt: string, schema: any | null, useGoogleSearch: boolean = false): Promise<any> => {
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, schema, useGoogleSearch }),
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
  const today = new Date();
  const referenceDate = today.toISOString().split('T')[0];
  const currentYear = today.getFullYear();

  const prompt = `
    **ROLE:** You are an automated data retrieval agent.
    **TASK:** Get historical coffee futures prices using your search tool.
    **CRITICAL:** YOU MUST NOT use your internal knowledge. All data must come from a real-time search. Failure to use search will result in an incorrect response.

    **PROCEDURE:**
    1.  **SEARCH:** Execute a Google Search for "daily prices Coffee C futures KC and Robusta coffee futures RC past 30 days". Use data from reputable financial sources (e.g., MarketWatch, Investing.com, Barchart).
    2.  **EXTRACT:** For the last 30 calendar days ending yesterday (relative to ${referenceDate}), extract the closing prices.
    3.  **VALIDATE:** Before formatting the output, verify that ALL dates belong to the current year, ${currentYear}. This is a mandatory check. Discard any data from previous years.
    4.  **FORMAT:**
        *   The entire output MUST be a single, raw JSON array.
        *   Do not add any explanatory text or markdown like \`\`\`json.
        *   Each object must follow this exact format: \`{ "date": "YYYY-MM-DD", "arabica_price": <price_in_usd_per_lb | null>, "robusta_price": <price_in_usd_per_lb | null> }\`.
        *   For non-trading days (weekends, holidays), price values MUST be \`null\`.
  `;
  
  const result = await generateContentWithRetry(prompt, null, true);
  if (!Array.isArray(result)) {
    console.error("Expected an array for price history, but got:", result);
    return [];
  }
  return result as PriceData[];
};

export const fetchPriceForecast = async (historicalData: PriceData[]): Promise<PriceData[]> => {
  const prompt = `
    Given the following verified historical daily price data for Arabica and Robusta coffee for the last 30 days:
    ${JSON.stringify(historicalData)}

    Perform a time-series forecast for the next 30 days for both Arabica and Robusta coffee prices.
    The forecast should be a plausible continuation based on recent trends and volatility.
    Return a JSON array for the next 30 days, starting from the day after the last historical data point.
    The date should be in 'YYYY-MM-DD' format. Prices should be in USD per pound.
    The JSON keys must be "date", "arabica_forecast", "robusta_forecast".
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

  const result = await generateContentWithRetry(prompt, schema, false);
  return result as PriceData[];
};

export const fetchCompetitorPrices = async (): Promise<Competitor[]> => {
  const today = new Date();
  const referenceDate = today.toISOString().split('T')[0];

  const prompt = `
    **ROLE:** You are an automated market research agent.
    **TASK:** Get current coffee prices from Indian e-commerce sites using your search tool.
    **CRITICAL:** YOU MUST NOT use your internal knowledge. All data must come from a real-time search. Failure to use search will result in an incorrect response. Accuracy is more important than completeness.

    **PROCEDURE:**
    1.  **SEARCH:** As of ${referenceDate}, search the official e-commerce websites of the following Indian companies for the price of a standard 250g pack of whole bean coffee:
        *   Blue Tokai Coffee Roasters
        *   Araku Coffee
        *   Savorworks Roasters
        *   Naivo Cafe & Roasters
        *   Curious Life Coffee Roasters
    2.  **VALIDATE & EXTRACT:** For each company, if you find a verifiable price on their official site, extract it.
    3.  **MANDATORY RULE:** If you cannot find a price for a company, or are not sure, YOU MUST OMIT that company from the results. DO NOT GUESS or use old data.
    4.  **FORMAT:**
        *   The entire output MUST be a single, raw JSON array.
        *   Do not add any explanatory text or markdown like \`\`\`json.
        *   Each object must follow this exact format: \`{ "company": "Company Name", "product": "Specific Product Name", "price": <price_in_inr>, "currency": "INR" }\`.
  `;
  
  const result = await generateContentWithRetry(prompt, null, true);
  if (!Array.isArray(result)) {
    console.error("Expected an array for competitor prices, but got:", result);
    return [];
  }
  return result as Competitor[];
};

export const fetchAIInsights = async (
  priceData: PriceData[],
  competitorData: Competitor[]
): Promise<AIInsightsData> => {
  const prompt = `
    As a senior commodities analyst, analyze the following verified, real-time data and provide actionable, explainable insights.

    **Market Data (Last 30 Days History & 30 Days Forecast):**
    ${JSON.stringify(priceData)}

    **Indian Competitor Pricing Data (250g packs):**
    ${JSON.stringify(competitorData)}

    Based ONLY on this data, provide a concise summary for each of the following areas. Your reasoning must be clear and directly tied to the data provided.

    1.  **Sourcing Strategy:** Should we adjust our sourcing between Arabica and Robusta? Are there any price trends that suggest buying more now vs. later?
    2.  **Inventory Management:** Based on price forecasts, should we increase or decrease our current stock of green beans?
    3.  **Pricing Strategy:** How do our potential price points compare to the Indian market? Given the forecast, should we consider adjusting the price of our consumer products?

    Return the insights as a JSON object with keys "sourcing", "inventory", and "pricing".
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

  const result = await generateContentWithRetry(prompt, schema, false);
  return result as AIInsightsData;
};
