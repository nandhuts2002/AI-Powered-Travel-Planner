import { GoogleGenerativeAI } from "@google/generative-ai";

const ITINERARY_SCHEMA = {
  type: "OBJECT",
  properties: {
    destination: { type: "STRING", description: "The name of the destination (e.g., Kyoto, Japan)" },
    coordinates: {
      type: "OBJECT",
      description: "Center coordinate of the destination for the map view",
      properties: {
        lat: { type: "NUMBER" },
        lng: { type: "NUMBER" }
      },
      required: ["lat", "lng"]
    },
    description: { type: "STRING", description: "A brief, compelling overview of what the traveler will experience" },
    currencySymbol: { type: "STRING", description: "The local currency symbol (e.g., $, ¥, €, £)" },
    days: {
      type: "ARRAY",
      description: "Day-by-day itinerary breakdown",
      items: {
        type: "OBJECT",
        properties: {
          dayNumber: { type: "INTEGER" },
          theme: { type: "STRING", description: "Brief focus or theme of this specific day" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                timeOfDay: { type: "STRING", description: "Morning, Afternoon, or Evening" },
                title: { type: "STRING", description: "Name of the attraction or activity" },
                description: { type: "STRING", description: "Brief description of the activity and what makes it special" },
                locationName: { type: "STRING", description: "Specific searchable location name" },
                coordinates: {
                  type: "OBJECT",
                  description: "Precise coordinates of this activity for map plotting",
                  properties: {
                    lat: { type: "NUMBER" },
                    lng: { type: "NUMBER" }
                  },
                  required: ["lat", "lng"]
                },
                costEstimate: { type: "STRING", description: "Estimated cost description (e.g., Free, $20, etc.)" }
              },
              required: ["timeOfDay", "title", "description", "locationName", "coordinates", "costEstimate"]
            }
          }
        },
        required: ["dayNumber", "theme", "activities"]
      }
    },
    accommodations: {
      type: "ARRAY",
      description: "Suggested accommodations matching the traveler's profile",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Name of hotel, hostel, or resort suggestion" },
          type: { type: "STRING", description: "Boutique, Budget, Luxury, Hostel, Resort, etc." },
          pricePerNight: { type: "STRING", description: "Average cost per night including currency symbol" },
          description: { type: "STRING", description: "Why this lodging is recommended" },
          coordinates: {
            type: "OBJECT",
            properties: {
              lat: { type: "NUMBER" },
              lng: { type: "NUMBER" }
            },
            required: ["lat", "lng"]
          }
        },
        required: ["name", "type", "pricePerNight", "description", "coordinates"]
      }
    },
    cuisines: {
      type: "ARRAY",
      description: "Local culinary items and beverages the traveler must try",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Name of food dish or beverage" },
          type: { type: "STRING", description: "Food or Drink" },
          description: { type: "STRING", description: "Brief culinary description" },
          whereToTry: { type: "STRING", description: "Best place, market, or street to find it" }
        },
        required: ["name", "type", "description", "whereToTry"]
      }
    },
    budgetBreakdown: {
      type: "OBJECT",
      description: "Estimated cost summary in local currency for the whole trip",
      properties: {
        transportation: { type: "INTEGER", description: "Total estimated transport cost (flights/trains/taxis)" },
        accommodation: { type: "INTEGER", description: "Total estimated accommodation cost" },
        dining: { type: "INTEGER", description: "Total estimated dining cost" },
        activities: { type: "INTEGER", description: "Total estimated attraction fees" }
      },
      required: ["transportation", "accommodation", "dining", "activities"]
    },
    practicalTips: {
      type: "ARRAY",
      description: "Important local context: cultural etiquettes, safety tips, packing advice",
      items: { type: "STRING" }
    }
  },
  required: ["destination", "coordinates", "description", "currencySymbol", "days", "accommodations", "cuisines", "budgetBreakdown", "practicalTips"]
};

/**
 * Generates travel itinerary using Gemini API with strict JSON schema compliance.
 * @param {Object} params Planning parameters
 * @param {string} params.destination User destination
 * @param {number} params.duration Trip duration (days)
 * @param {string} params.budget Budget level (Economy, Mid-range, Luxury)
 * @param {string} params.companion Companion type (Solo, Couple, Family, Friends)
 * @param {string[]} params.interests Selected categories (Adventure, Food, Culture, etc.)
 * @param {string} params.apiKey User Gemini API Key
 */
export async function generateItinerary({ destination, duration, budget, companion, interests, apiKey }) {
  if (!apiKey) {
    throw new Error("Gemini API key is required. Please set it in the configuration panel.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const prompt = `
    Generate a detailed, highly accurate, and customized ${duration}-day travel itinerary for a trip to "${destination}".
    
    Traveler Profile:
    - Budget Tier: ${budget}
    - Traveling Companion Style: ${companion}
    - Key Focus Areas/Interests: ${interests.join(", ")}
    
    Instructions:
    1. Ensure all attractions are realistic and correspond to real places in ${destination}.
    2. Provide accurate lat/lng coordinates for each location (attractions, center of city, hotel ideas) so they can be plotted on OpenStreetMap correctly.
    3. Customise the activities, timing (Morning, Afternoon, Evening), and pace depending on the companion style (${companion}) and interests (${interests.join(", ")}).
    4. Provide hotel/hostel recommendations that align with a "${budget}" budget tier (e.g., high-end luxury resorts for Luxury, hostels/guesthouses for Economy, mid-range boutique hotels for Mid-range).
    5. List 4 distinct local dishes or beverages to try with descriptions of where they can be found.
    6. Include a realistic breakdown of costs in the local currency, reflecting the selected budget tier.
    7. Provide 4 helpful practical tips (packing, safety, cultural etiquette) specific to ${destination}.
  `;

  // Try models in order of preference to safeguard against 503 high demand spikes
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generation with Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ITINERARY_SCHEMA,
          temperature: 0.3, // Low temperature for factual, reliable location plotting
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse and return the structured response
      const itineraryData = JSON.parse(text);
      return itineraryData;
    } catch (error) {
      console.warn(`Gemini Model ${modelName} failed:`, error);
      lastError = error;
      // Continue to fallback model
    }
  }

  // If both models fail, throw the last received error
  console.error("All Gemini models failed to generate content:", lastError);
  throw new Error(
    lastError?.message || "Failed to generate itinerary. Please check your API key or try again later."
  );
}
