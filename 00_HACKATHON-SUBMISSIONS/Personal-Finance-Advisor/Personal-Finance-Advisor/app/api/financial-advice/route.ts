// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { salary, goals, monthlyExpenses, yearlyExpenses } = await req.json();

//     if (!salary || !goals) {
//       return NextResponse.json(
//         { error: "Salary and goals are required" },
//         { status: 400 }
//       );
//     }

//     const prompt = `
// You are a financial advisor. Based on the following details, give personalized financial advice:

// Salary: ${salary}
// Goals: ${goals}
// Monthly Expenses: ${JSON.stringify(monthlyExpenses)}
// Yearly Expenses: ${JSON.stringify(yearlyExpenses)}

// Give clear, practical advice in a friendly tone.
// `;

//     const response = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "llama3.2:1b",
//         prompt,
//         stream: false, // single response
//       }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to get response from Ollama");
//     }

//     const data = await response.json();

//     return NextResponse.json({
//       advice: data.response?.trim() || "The model did not return advice.",
//     });
//   } catch (error) {
//     console.error("Financial Advice API error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate financial advice" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

// 🧹 Remove markdown from model response
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1")     // italics
    .replace(/^\s*[-•]\s*/gm, "")    // bullet points
    .replace(/#+\s/g, "");           // headings
}

// 📝 Turn JSON input into readable sentences
function formatUserInput(
  salary: number,
  goals: string,
  monthlyExpenses: Record<string, boolean>,
  yearlyExpenses: Record<string, boolean>
): string {
  const capitalize = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  const monthlySelected = Object.keys(monthlyExpenses).filter((k) => monthlyExpenses[k]);
  const yearlySelected = Object.keys(yearlyExpenses).filter((k) => yearlyExpenses[k]);

  let sentence = `My monthly salary is $${salary.toLocaleString()} and my goal is "${goals}". `;

  if (monthlySelected.length > 0) {
    sentence += `For my monthly expenses, I am spending on ${monthlySelected
      .map(capitalize)
      .join(", ")}. `;
  } else {
    sentence += "I don’t have any monthly expenses selected. ";
  }

  if (yearlySelected.length > 0) {
    sentence += `For my yearly expenses, I am spending on ${yearlySelected
      .map(capitalize)
      .join(", ")}.`;
  } else {
    sentence += "I don’t have any yearly expenses selected.";
  }

  return sentence;
}

export async function POST(req: NextRequest) {
  try {
    const { salary, goals, monthlyExpenses, yearlyExpenses } = await req.json();

    if (!salary || !goals) {
      return NextResponse.json(
        { error: "Salary and goals are required" },
        { status: 400 }
      );
    }

    // ✅ Create a plain sentence (no JSON)
    const userSummary = formatUserInput(
      salary,
      goals,
      monthlyExpenses,
      yearlyExpenses
    );

    // ✅ Prompt now only contains plain text
    const prompt = `
You are a financial advisor. Based on the following details, give personalized financial advice without using markdown formatting:

${userSummary}

Give clear, practical advice in a friendly tone.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:1b",
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response from Ollama");
    }

    const data = await response.json();
    const cleanedAdvice = stripMarkdown(data.response?.trim() || "");

    return NextResponse.json({
      summary: userSummary, // 👈 return nice summary too if frontend needs it
      advice: cleanedAdvice || "The model did not return advice.",
    });
  } catch (error) {
    console.error("Financial Advice API error:", error);
    return NextResponse.json(
      { error: "Failed to generate financial advice" },
      { status: 500 }
    );
  }
}
