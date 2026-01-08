import { GoogleGenAI } from "@google/genai";
import { FTADStats } from "../types";

// Declare process for TypeScript to avoid build errors
declare var process: {
  env: {
    API_KEY: string;
  };
};

/**
 * Generates strategic insights using Gemini based on FTAD metrics.
 */
export const getAIInsights = async (stats: FTADStats, topDivisions: any[], topCategories: any[]): Promise<string> => {
  // Use process.env.API_KEY directly as per @google/genai guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this Field Technical Assistance Division (FTAD) data. 
    Focus on operational efficiency, support coverage, and field office compliance.
    
    Current Stats:
    - Total TA Interventions: ${stats.totalTA}
    - Completion Rate: ${stats.completionRate.toFixed(1)}%
    - Active Monitoring: ${stats.activeMonitoring}
    - Pending Requests: ${stats.pendingRequests}
    
    Division Engagement:
    ${JSON.stringify(topDivisions)}
    
    Thematic Focus Areas:
    ${JSON.stringify(topCategories)}
    
    Provide 3-4 professional strategic insights. Avoid financial terminology. Focus on 'Support Quality', 'Responsiveness', and 'Gap Analysis'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a Senior Education and Technical Assistance Consultant. You provide strategic advice to the Field Technical Assistance Division (FTAD) on how to improve support to field offices based on their current performance metrics.",
        temperature: 0.7,
      },
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating TA strategic insights. Please check connectivity or API key configurations.";
  }
};