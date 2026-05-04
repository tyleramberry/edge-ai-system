require('dotenv').config();

class AgentBase {
  constructor(agentId, systemPrompt) {
    this.agentId = agentId;
    this.systemPrompt = systemPrompt;
    this.memoryLimit = 10;
  }

  async process(userMessage, history = []) {
    const messages = [
      ...history.slice(-this.memoryLimit),
      { role: 'user', content: userMessage }
    ];

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
        system: this.systemPrompt,
        messages
      })
    });

    const data = await response.json();
    return data.content[0].text;
  }
}

module.exports = AgentBase;