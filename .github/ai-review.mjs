import { Octokit } from "@octokit/action";
import OpenAI from "openai";

const octokit = new Octokit();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const prNumber = Number(process.env.PR_NUMBER);
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 20,
  });

  const code = files
    .filter((f) => [".html", ".css", ".js"].some((ext) => f.filename.endsWith(ext)))
    .slice(0, 10)
    .map((f) => `File: ${f.filename}\n\n${f.patch || ""}`)
    .join("\n\n");

  if (!code.trim()) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body:
        "### 🤖 AI Code Review\n" +
        "I couldn’t find any HTML, CSS, or JS changes in this pull request.\n" +
        "\n> This feedback was generated automatically for learning purposes.",
    });
    return;
  }

  const prompt = `
You are a computer science teacher reviewing a student's assignment.
Provide clear, encouraging feedback on their HTML/CSS/JS code:
- Give a score (0–100)
- Mention structure, readability, and correctness
- Suggest 3 improvements
Keep it short and kind.

Student code changes:
${code}
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const review = result.choices[0].message.content;

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body:
      "### 🤖 AI Code Review\n" +
      review +
      "\n\n> This feedback was generated automatically for learning purposes.",
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});