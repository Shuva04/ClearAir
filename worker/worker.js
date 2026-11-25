const allowedOrigins = new Set(["https://shuva04.github.io", "http://localhost:8000", "http://127.0.0.1:8000"]);
function corsFor(request) {
  const origin = request.headers.get("Origin") || "";
  return { "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://shuva04.github.io", "Vary": "Origin", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  const cors = corsFor(request);
  if(request.method==="OPTIONS")return new Response(null,{headers:cors});
  if(url.pathname!=="/recommend"||request.method!=="POST")return Response.json({error:"Not found"},{status:404,headers:cors});
  if(!env.GEMINI_API_KEY)return Response.json({error:"AI service is not configured"},{status:503,headers:cors});
  let input;try{input=await request.json()}catch{return Response.json({error:"Invalid JSON"},{status:400,headers:cors})}
  const a=input.air||{},context={location:String(input.location||"Unknown").slice(0,120),pm2_5:Number.isFinite(Number(a.pm2_5))?Number(a.pm2_5):null,pm10:Number.isFinite(Number(a.pm10))?Number(a.pm10):null,us_aqi:Number.isFinite(Number(a.us_aqi))?Number(a.us_aqi):null,timestamp:String(a.time||"").slice(0,50),household:["general","sensitive"].includes(input.household)?input.household:"general",budget:["low","medium","flexible"].includes(input.budget)?input.budget:"low",commute:String(input.commute||"mixed").slice(0,40),baseline:Array.isArray(input.ruleBasedRecommendations)?input.ruleBasedRecommendations.slice(0,6):[]};
  const prompt="You are ClearAir, a careful community air-quality assistant. Use only supplied context; do not invent readings, forecasts, local alerts, diagnoses or guaranteed reductions. AQI is US AQI, not India's CPCB National AQI. Values are modelled estimates, not necessarily station measurements. Return JSON only: {\"recommendations\":[{\"title\":\"short action\",\"why\":\"practical reason\",\"impact\":\"realistic impact and limitation\"}]}. Give 4 to 6 concise actionable recommendations tailored to household, budget and commute. Prefer low-cost steps if requested. Separate personal exposure reduction from emissions reduction. Do not claim houseplants meaningfully clean room air. Do not advise sealing a home without ventilation. Do not prescribe medication. If sensitive household is selected, advise following local public-health guidance without diagnosing. Context: "+JSON.stringify(context);
  try{
   const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:0.35}})});
   if(!response.ok)return Response.json({error:"AI provider request failed"},{status:502,headers:cors});
   const body=await response.json(),raw=body.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||"",parsed=JSON.parse(raw);
   if(!Array.isArray(parsed.recommendations))throw Error("Unexpected response");
   const recommendations=parsed.recommendations.slice(0,6).map(x=>({title:String(x.title||"Suggested action").slice(0,120),why:String(x.why||"").slice(0,500),impact:String(x.impact||"").slice(0,500)}));
   return Response.json({recommendations},{headers:{...cors,"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"Could not generate recommendations. Please retry."},{status:502,headers:cors})}
 }
};