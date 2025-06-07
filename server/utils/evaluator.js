// server/utils/evaluator.js

function evaluateSession(messages) {
  const csrLines = messages.filter(m => m.sender === "csr").map(m => m.text.toLowerCase());
  const scoreBreakdown = {
    tone: 3,
    empathy: 3,
    resolution: 2,
    escalation: 1,
    clarity: 1,
  };

  let totalScore = 10;
  const strengths = [];
  const flags = [];

  const inappropriate = ["shut up", "what is your problem"];
  const empathetic = ["i understand", "i'm sorry", "i apologize"];
  const resolutionWords = ["refund", "replace", "resolve"];

  const usedInappropriate = csrLines.some(line => inappropriate.some(p => line.includes(p)));
  const usedEmpathy = csrLines.some(line => empathetic.some(p => line.includes(p)));
  const offeredResolution = csrLines.some(line => resolutionWords.some(p => line.includes(p)));

  if (usedInappropriate) {
    totalScore -= scoreBreakdown.tone;
    flags.push("Used unprofessional language.");
  } else {
    strengths.push("Used professional language.");
  }

  if (!usedEmpathy) {
    totalScore -= scoreBreakdown.empathy;
    flags.push("No empathy detected.");
  } else {
    strengths.push("Empathetic tone observed.");
  }

  if (!offeredResolution) {
    totalScore -= scoreBreakdown.resolution;
    flags.push("No resolution offered.");
  } else {
    strengths.push("Provided helpful resolution.");
  }

  return {
    score: Math.max(1, totalScore),
    strengths,
    flags,
    suggestions: [
      "Avoid unprofessional language.",
      "Always show empathy.",
      "Clearly provide a resolution.",
    ],
    metrics: {
      tone: usedInappropriate ? 1 : 4,
      empathy: usedEmpathy ? 4 : 1,
      resolution: offeredResolution ? 4 : 1,
      escalation: 3,
      clarity: 4,
      overall_score: Math.max(1, totalScore),
    }
  };
}

module.exports = { evaluateSession };
