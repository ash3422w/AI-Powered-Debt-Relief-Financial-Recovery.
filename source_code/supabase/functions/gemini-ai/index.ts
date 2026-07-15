import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface RouteBody {
  action?: "settlement" | "letter" | "health" | "chat";
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return json({ error: "Gemini API key not configured on the server." }, 500);
  }

  try {
    const body: RouteBody = await req.json();
    const action = body.action;

    if (action === "settlement") {
      return await handleSettlement(body);
    } else if (action === "letter") {
      return await handleLetter(body);
    } else if (action === "health") {
      return await handleHealth(body);
    } else if (action === "chat") {
      return await handleChat(body);
    }
    return json({ error: "Unknown action. Use settlement | letter | health | chat." }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Edge function error";
    return json({ error: message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const payload: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("\n") ??
    "";
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

function extractJson(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  // Strip ```json ... ``` fences
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  // Find the first { ... matching } block
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned);
}

// ---------------- Settlement Recommendation ----------------
async function handleSettlement(body: RouteBody): Promise<Response> {
  const input = {
    outstanding_amount: Number(body.outstanding_amount ?? 0),
    monthly_income: Number(body.monthly_income ?? 0),
    monthly_expenses: Number(body.monthly_expenses ?? 0),
    emi: Number(body.emi ?? 0),
    overdue_duration: Number(body.overdue_duration ?? 0),
    interest_rate: Number(body.interest_rate ?? 0),
    loan_type: String(body.loan_type ?? "Personal"),
  };

  const prompt = `You are a senior debt-settlement analyst. Analyze this borrower's situation and return a JSON object ONLY (no prose, no markdown fences):

{
  "settlement_percentage": <number 0-100, percent of outstanding the lender may accept>,
  "settlement_amount": <number, recommended one-time settlement offer>,
  "debt_stress_level": <"Low" | "Moderate" | "High" | "Critical">,
  "financial_health_score": <number 0-100>,
  "repayment_strategy": <2-3 sentence strategy>,
  "negotiation_points": [<4-6 short bullet strings the borrower can use in negotiation>],
  "priority_score": <number 0-100, urgency of settling now>,
  "risk_analysis": <2-3 sentence risk assessment>,
  "advice": <3-4 sentence actionable advice>,
  "recommendation": <1-2 sentence executive summary>
}

Borrower data:
- Loan type: ${input.loan_type}
- Outstanding amount: $${input.outstanding_amount}
- Monthly income: $${input.monthly_income}
- Monthly expenses: $${input.monthly_expenses}
- Monthly EMI: $${input.emi}
- Overdue duration (months): ${input.overdue_duration}
- Interest rate: ${input.interest_rate}%

Be realistic, conservative, and specific. Return ONLY the JSON object.`;

  const raw = await callGemini(prompt);
  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(raw);
  } catch {
    return json({
      settlement_percentage: 0,
      settlement_amount: 0,
      debt_stress_level: "Unknown",
      financial_health_score: 0,
      repayment_strategy: raw,
      negotiation_points: [],
      priority_score: 0,
      risk_analysis: "",
      advice: "",
      recommendation: raw,
    });
  }
  return json(parsed);
}

// ---------------- Negotiation Letter ----------------
async function handleLetter(body: RouteBody): Promise<Response> {
  const input = {
    loan_name: String(body.loan_name ?? ""),
    bank_name: String(body.bank_name ?? ""),
    outstanding_amount: Number(body.outstanding_amount ?? 0),
    financial_condition: String(body.financial_condition ?? ""),
    monthly_income: Number(body.monthly_income ?? 0),
    reason: String(body.reason ?? ""),
    borrower_name: String(body.borrower_name ?? "Borrower"),
  };

  const prompt = `You are a professional financial negotiator. Generate THREE documents for a debt settlement request and return them as a JSON object ONLY (no prose, no markdown fences):

{
  "negotiation_letter": <full formal settlement negotiation letter, addressed to the lender, 3-4 paragraphs>,
  "settlement_email": <a concise professional email version, subject line + body>,
  "lender_letter": <a formal hardship letter for the lender's settlement department>,
  "negotiation_strategy": <3-4 sentence strategy summary for the borrower>
}

Borrower: ${input.borrower_name}
Loan: ${input.loan_name} from ${input.bank_name}
Outstanding amount: $${input.outstanding_amount}
Monthly income: $${input.monthly_income}
Financial condition: ${input.financial_condition}
Reason for settlement: ${input.reason}

Use [Borrower Name], [Bank Name], [Date], [Loan Number] placeholders where appropriate. Professional, respectful tone. Return ONLY the JSON object.`;

  const raw = await callGemini(prompt);
  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(raw);
  } catch {
    parsed = {
      negotiation_letter: raw,
      settlement_email: raw,
      lender_letter: raw,
      negotiation_strategy: "",
    };
  }
  return json(parsed);
}

// ---------------- Financial Health Analysis ----------------
async function handleHealth(body: RouteBody): Promise<Response> {
  const input = {
    monthly_income: Number(body.monthly_income ?? 0),
    monthly_expenses: Number(body.monthly_expenses ?? 0),
    savings: Number(body.savings ?? 0),
    emi: Number(body.emi ?? 0),
    total_outstanding: Number(body.total_outstanding ?? 0),
  };

  const prompt = `You are a personal-finance advisor. Analyze this financial snapshot and return a JSON object ONLY (no prose, no markdown fences):

{
  "suggestions": [<4-6 short financial tips>],
  "debt_reduction_advice": [<4-6 short debt reduction steps>],
  "budget_suggestions": [<4-6 short budget optimization suggestions>],
  "summary": <2-3 sentence overall assessment>
}

Financial snapshot:
- Monthly income: $${input.monthly_income}
- Monthly expenses: $${input.monthly_expenses}
- Savings: $${input.savings}
- Monthly EMI: $${input.emi}
- Total outstanding debt: $${input.total_outstanding}

Be specific and actionable. Return ONLY the JSON object.`;

  const raw = await callGemini(prompt);
  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(raw);
  } catch {
    parsed = {
      suggestions: [],
      debt_reduction_advice: [],
      budget_suggestions: [],
      summary: raw,
    };
  }
  return json(parsed);
}

// ---------------- AI Chat Assistant ----------------
async function handleChat(body: RouteBody): Promise<Response> {
  const message = String(body.message ?? "");
  const history = Array.isArray(body.history) ? body.history : [];

  const systemInstruction =
    "You are DebtRelief AI Assistant, a helpful, concise financial advisor specialized in debt relief, loan settlement, and personal financial recovery. Keep answers under 180 words, practical, and empathetic. Never give licensed financial-planner guarantees — recommend professional advice for major decisions.";

  const historyText = history
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = historyText
    ? `Conversation so far:\n${historyText}\n\nUser: ${message}`
    : `User: ${message}`;

  const raw = await callGemini(prompt, systemInstruction);
  return json({ reply: raw });
}
