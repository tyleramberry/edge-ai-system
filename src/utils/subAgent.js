require('dotenv').config();

async function spawnSubAgent(role, task) {
  console.log(`Spawning sub-agent: ${role} — ${task}`);

  const systemPrompt = role === 'research'
    ? `You are a Research Sub-Agent. Your only job is to answer the specific research question given to you as thoroughly and accurately as possible. Return a structured, well-organized response. Terminate after completing the research task.`
    : `You are a specialized Sub-Agent for: ${role}. Complete the task given to you thoroughly and return a structured response. Terminate after completing the task.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: task }]
    })
  });

  const data = await response.json();
  const result = data.content[0].text;

  console.log(`Sub-agent ${role} completed task`);
  return result;
}

module.exports = { spawnSubAgent };
