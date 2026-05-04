require('dotenv').config();

class Orchestrator {
  constructor() {
    this.agents = {};
  }

  registerAgent(name, agent) {
    this.agents[name] = agent;
  }

  async classifyTask(message) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are a task router. Classify this message and return ONLY a JSON object with no extra text.

Message: "${message}"

Return this exact format:
{
  "agentType": "grant" or "contract" or "business" or "personal",
  "reason": "one sentence explanation"
}

Rules:
- grant = anything about grants, LOIs, funding opportunities, nonprofit funding
- contract = anything about RFPs, government contracts, solicitations, proposals
- personal = anything about scheduling, calendar, personal tasks, reminders
- business = everything else, general questions, routing, operations`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();

    try {
      return JSON.parse(text);
    } catch {
      return { agentType: 'business', reason: 'fallback' };
    }
  }

  async routeTask(message, history = []) {
    const classification = await this.classifyTask(message);
    const agentType = classification.agentType;
    const agent = this.agents[agentType] || this.agents['business'];

    console.log(`Routing to: ${agentType} — ${classification.reason}`);

    const reply = await agent.process(message, history);

    return {
      agent: agentType,
      reason: classification.reason,
      reply
    };
  }
}

module.exports = Orchestrator;