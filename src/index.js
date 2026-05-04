require('dotenv').config();
const express = require('express');
const cors = require('cors');

const Orchestrator = require('./orchestrator/Orchestrator');
const BusinessAgent = require('./agents/BusinessAgent');
const GrantAgent = require('./agents/GrantAgent');
const ContractAgent = require('./agents/ContractAgent');
const PersonalAgent = require('./agents/PersonalAgent');

const app = express();
app.use(cors());
app.use(express.json());

// Set up orchestrator with all 4 agents
const orchestrator = new Orchestrator();
orchestrator.registerAgent('business', new BusinessAgent());
orchestrator.registerAgent('grant', new GrantAgent());
orchestrator.registerAgent('contract', new ContractAgent());
orchestrator.registerAgent('personal', new PersonalAgent());

// Main chat route
app.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const result = await orchestrator.routeTask(message, history);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Keep the test route
app.post('/test', async (req, res) => {
  const { message } = req.body;
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
        max_tokens: 1000,
        messages: [{ role: 'user', content: message }]
      })
    });
    const data = await response.json();
    res.json({ success: true, reply: data.content[0].text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Agents registered: business, grant, contract, personal');
});