# AI-Powered Travel Planner

A React and Vite web application that generates complete, day-by-day travel itineraries based on destination, duration, budget, companions, and user interests. The application integrates weather forecasts, mapping coordinates, accommodations, local cuisines, budget breakdowns, and print layout support.

## Features

- **Custom Itinerary Generation**: Uses Gemini API to build structured travel plans.
- **Interactive Map**: Plots hotels and daily attractions with coordinates on a Leaflet map.
- **Weather Widget**: Retrieves live weather forecasts using Open-Meteo API.
- **Print Support**: Formats the final itinerary into a clean, printable PDF page.
- **Theme Support**: Includes both dark and light modes.

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nandhuts2002/AI-Powered-Travel-Planner.git
   cd AI-Powered-Travel-Planner
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Configure your API key:
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   *Note: If you leave this blank, you will be prompted to enter the API key directly in the web interface.*

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure and Design

- **Structured JSON Prompts**: The app communicates with the `gemini-2.5-flash` model using JSON schemas to guarantee parseable responses.
- **Leaflet Integration**: Renders map pins and centers the map coordinates dynamically using a helper component.
- **Dynamic CSS Styling**: Uses CSS custom properties for styling and `@media print` rules to strip out control elements when printing or saving as PDF.
