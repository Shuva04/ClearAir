# ClearAir — Smog-aware living

ClearAir is a responsive air-quality companion for families and communities. It combines live modelled air-quality data, city search, household preferences and practical recommendations.

## Features
- Live PM2.5, PM10, ozone and **US AQI** from Open-Meteo Air Quality API.
- City search through Open-Meteo Geocoding and optional browser geolocation.
- Personalised rules-based recommendations using current readings, household priorities, budget and transport.
- Optional Gemini 2.5 Flash recommendations through a Cloudflare Worker. The API key stays server-side.
- Clear explanation of personal exposure versus community emissions impacts.
- Daily checklist and selected city saved in browser localStorage.
- Responsive, dependency-free static frontend.

## Run locally
Open index.html in a browser or serve this folder with a static web server. Geolocation generally requires HTTPS or localhost.

## Data notes
The AQI displayed is **US AQI**, not India's CPCB National Air Quality Index. PM values and AQI are modelled estimates on a grid and may differ from nearby monitoring stations. Current values are not a guarantee of personal exposure. The app displays the timestamp supplied by the API.

Sources:
- Open-Meteo Air Quality API: https://open-meteo.com/en/docs/air-quality-api
- Open-Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api

## Enable Gemini AI (optional)
The app works without an AI key using its local personalised recommendation engine. To enable generated recommendations securely:

1. Create a Cloudflare account and install Wrangler: npm install -g wrangler
2. From the worker folder, run wrangler login.
3. Run wrangler secret put GEMINI_API_KEY and paste your Google AI Studio Gemini API key. Never put this key in index.html, GitHub or a public client-side setting.
4. Deploy the Worker: wrangler deploy.
5. Copy the deployed Worker URL, for example https://clearair-ai.your-subdomain.workers.dev.
6. Open the website with #ai=https://your-worker-url appended to the URL and reload. Replace the example with your actual Worker URL. The endpoint is stored in this browser's local storage.

The Worker accepts POST requests at /recommend, validates and limits input, asks Gemini for structured JSON and returns recommendation fields. CORS is permissive for this demo. For production, restrict Access-Control-Allow-Origin to your deployed website domain and add rate limiting.

## Publish with GitHub Pages
A GitHub Actions workflow is included at .github/workflows/pages.yml.
1. Open repository Settings → Pages.
2. Under Build and deployment, set Source to GitHub Actions.
3. Open the Actions tab and confirm the Deploy ClearAir to GitHub Pages workflow completes successfully (it runs on pushes to main).
4. Expected website URL: https://shuva04.github.io/ClearAir/

GitHub Pages is not automatically enabled by a repository file; the one-time Pages source selection in Settings is required.

## Safety and limitations
ClearAir is educational, not medical advice. Follow local public-health guidance, especially during severe pollution events. A particulate respirator does not remove pollutant gases. Do not make medical decisions based only on this app. A modelled AQI grid value is not a station reading.
