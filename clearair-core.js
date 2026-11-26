export function aqiBand(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return ["Unavailable", "loading"];
  if (n <= 50) return ["Good", "good"];
  if (n <= 100) return ["Moderate", "moderate"];
  if (n <= 150) return ["Unhealthy for sensitive groups", "moderate"];
  if (n <= 200) return ["Unhealthy", "unhealthy"];
  if (n <= 300) return ["Very unhealthy", "high"];
  return ["Hazardous", "high"];
}
export function formatPollutant(value) {
  const n = Number(value);
  return value !== null && value !== undefined && value !== "" && Number.isFinite(n) ? n.toFixed(1) : "—";
}
export function sanitizeRecommendations(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 6).map(item => ({
    title: String(item?.title || "Suggested action").trim().slice(0, 120),
    why: String(item?.why || "").trim().slice(0, 500),
    impact: String(item?.impact || "").trim().slice(0, 500)
  })).filter(item => item.title && (item.why || item.impact));
}
export function buildLocalPlan({ air, household, budget, commute }) {
  const n = Number(air?.us_aqi), high = Number.isFinite(n) && n > 100, very = Number.isFinite(n) && n > 150;
  const items = [{
    title: high ? "Move strenuous activity indoors today" : "Check the air trend before exercise",
    why: high ? "The current US AQI estimate is " + Math.round(n) + ". Reduce prolonged or heavy outdoor exertion; sensitive groups should be especially cautious." : "Current US AQI estimate: " + (Number.isFinite(n) ? Math.round(n) : "unavailable") + ". Recheck later because conditions can change.",
    impact: "Choosing a cleaner time or reducing exertion can reduce polluted-air inhalation, but does not clean outdoor air."
  }, {
    title: high ? "Ventilate only when outdoor air improves" : "Ventilate when outdoor air is cleaner",
    why: "Close windows during pollution peaks. If available, run a correctly sized HEPA purifier in the room used most.",
    impact: "Can reduce indoor particles; performance depends on room size, filter condition and airflow."
  }, budget === "low" ? {
    title: "Start with no-cost indoor steps", why: "Damp-wipe floors, avoid incense and candles, and use kitchen exhaust while cooking.",
    impact: "Reduces re-suspended dust and avoids adding avoidable indoor combustion pollution."
  } : {
    title: "Consider filtration for your main living space", why: "Compare a true HEPA purifier's clean-air delivery rate with room size and ongoing filter costs.",
    impact: "A suitable purifier can lower airborne particles indoors; it does not remove every gas."
  }];
  const travel = {transit:"Continue using public transport and walk away from busy roads where practical.",car:"Combine errands, avoid idling and share trips when practical.","two-wheeler":"Combine journeys and consider transit or car-pooling for longer trips.",walk:"Choose quieter side streets; shorten or reschedule strenuous outdoor trips when pollution is elevated.",mixed:"Keep travel flexible and combine errands to avoid unnecessary journeys."};
  items.push({title:"Make your commute lower-emission and lower-exposure",why:travel[commute]||travel.mixed,impact:"Fewer vehicle trips reduce fuel use and emissions; route choice can also change personal exposure near traffic."});
  if (household === "sensitive") items.push({title:"Use a cautious family activity plan",why:"Children, older adults and people with heart or lung conditions may be more affected. Follow local health advice and seek clinical guidance for symptoms.",impact:"Reducing time and exertion in polluted air can lower exposure; this is not individual medical advice."});
  if (very) items.push({title:"Check local public-health alerts",why:"The modelled AQI is very high. Follow local authority advice and avoid outdoor exertion.",impact:"Local alerts account for conditions that a regional model grid may not capture."});
  return sanitizeRecommendations(items);
}
