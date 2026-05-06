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

    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Claude API error for ${this.agentId}:`, errorData);
        throw new Error(`Claude API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.content || !data.content[0]) {
        throw new Error(`No content returned from Claude API for agent ${this.agentId}`);
      }

      return data.content[0].text;

    } catch (error) {
      console.error(`Agent ${this.agentId} error:`, error.message);
      throw error;
    }
  }
}

module.exports = AgentBase;
