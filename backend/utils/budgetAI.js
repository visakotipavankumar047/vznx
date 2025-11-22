const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function suggestProjectBudget(projectData) {
  try {
    const { name, status, notes, teamSize = 5, projectLead } = projectData;

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro" });

    const prompt = `You are a financial advisor for an architecture firm. Based on the following project details, suggest a realistic budget allocation.

Project Name: ${name}
Status: ${status}
Notes: ${notes || "No additional notes"}
Team Size: ${teamSize} members
Project Lead Role: ${projectLead?.role || "Not assigned"}

Industry standards for architecture projects:
- Labor: 60-70% of budget
- Materials: 20-30% of budget
- Overhead: 10% of budget

Based on the project details, provide:
1. Total recommended budget (in USD)
2. Budget breakdown for labor, materials, and overhead
3. Brief justification

Respond in JSON format:
{
  "totalBudget": <number>,
  "breakdown": {
    "labor": <number>,
    "materials": <number>,
    "overhead": <number>
  },
  "justification": "<string>"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const budgetSuggestion = JSON.parse(jsonMatch[0]);

    console.log("[Budget AI] Suggested budget:", budgetSuggestion);

    return {
      success: true,
      ...budgetSuggestion,
    };
  } catch (error) {
    console.error("[Budget AI Error]", error.message);

    const fallbackBudget = calculateFallbackBudget(projectData);
    return {
      success: false,
      ...fallbackBudget,
      justification: "AI unavailable. Using standard industry estimates.",
    };
  }
}

function calculateFallbackBudget(projectData) {
  const { teamSize = 5 } = projectData;

  const avgSalaryPerMember = 8000;
  const projectDurationMonths = 3;

  const laborCost = teamSize * avgSalaryPerMember * projectDurationMonths;
  const totalBudget = laborCost / 0.65;

  const breakdown = {
    labor: Math.round(totalBudget * 0.65),
    materials: Math.round(totalBudget * 0.25),
    overhead: Math.round(totalBudget * 0.1),
  };

  const actualTotal =
    breakdown.labor + breakdown.materials + breakdown.overhead;

  return {
    totalBudget: actualTotal,
    breakdown,
  };
}

module.exports = {
  suggestProjectBudget,
};
