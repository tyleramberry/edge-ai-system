require('dotenv').config();
const { getKnowledge } = require('../utils/knowledgeBase');

class AgentBase {
  constructor(agentId, systemPrompt, mcpServers = []) {
    this.agentId = agentId;
    this.systemPrompt = systemPrompt;
    this.memoryLimit = 10;
    this.mcpServers = mcpServers;
  }

  async process(userMessage, history = []) {
    const messages = [
      ...history.slice(-this.memoryLimit),
      { role: 'user', content: userMessage }
    ];

    try {
      // Load knowledge base for this agent
      const knowledge = await getKnowledge(this.agentId);
      let knowledgeContext = '';
      if (knowledge.length > 0) {
        knowledgeContext = '\n\n## Your Knowledge Base\n';
        knowledge.forEach(k => {
          knowledgeContext += `\n### ${k.title}\n${k.content}\n`;
        });
      }

      const enrichedSystemPrompt = this.systemPrompt + knowledgeContext;

      const requestBody = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: enrichedSystemPrompt,
        messages
      };

      if (this.mcpServers.length > 0) {
        requestBody.mcp_servers = this.mcpServers;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'mcp-client-2025-04-04'
        },
        body: JSON.stringify(requestBody)
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

      const textBlock = data.content.find(block => block.type === 'text');
      return textBlock ? textBlock.text : 'Task completed.';

    } catch (error) {
      console.error(`Agent ${this.agentId} error:`, error.message);
      throw error;
    }
  }
}

module.exports = AgentBase;
