require('dotenv').config();
const express = require('express');
const cors = require('cors');

const Orchestrator = require('./orchestrator/Orchestrator');
const BusinessAgent = require('./agents/BusinessAgent');
const GrantAgent = require('./agents/GrantAgent');
const ContractAgent = require('./agents/ContractAgent');
const PersonalAgent = require('./agents/PersonalAgent');
const { saveConversation, getHistory } = require('./utils/db');
const { createTask, logActivity } = require('./utils/tools');
const { spawnSubAgent } = require('./utils/subAgent');
const { checkEligibility, draftLOI, runComplianceCheck } = require('./utils/grantTools');
const { parseRFP, buildComplianceMatrix, flagGaps } = require('./utils/contractTools');
const { setContext, getContext, getAllContext } = require('./utils/context');

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new Orchestrator();
orchestrator.registerAgent('business', new BusinessAgent());
orchestrator.registerAgent('grant', new GrantAgent());
orchestrator.registerAgent('contract', new ContractAgent());
orchestrator.registerAgent('personal', new PersonalAgent());

app.post('/chat', async (req, res) => {
  const { message, projectId = 'default' } = req.body;
  try {
    const classification = await orchestrator.classifyTask(message);
    const agentId = classification.agentType;
    const history = await getHistory(agentId);
    const projectContext = await getAllContext(projectId);
    const contextSummary = projectContext.length > 0
      ? '\n\nProject Context:\n' + projectContext.map(c => `${c.key}: ${c.value}`).join('\n')
      : '';
    const enrichedMessage = message + contextSummary;
    const result = await orchestrator.routeTask(enrichedMessage, history);
    await saveConversation(agentId, message, result.reply);
    await logActivity('chat', `${agentId} agent responded to: ${message.substring(0, 50)}`);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/context/set', async (req, res) => {
  const { projectId, key, value, agentId } = req.body;
  try {
    const result = await setContext(projectId, key, value, agentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/context/get', async (req, res) => {
  const { projectId, key } = req.body;
  try {
    const result = await getContext(projectId, key);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/context/all', async (req, res) => {
  const { projectId } = req.body;
  try {
    const result = await getAllContext(projectId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/task', async (req, res) => {
  const { title, assignee, dueDate } = req.body;
  try {
    const result = await createTask(title, assignee, dueDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/research', async (req, res) => {
  const { topic } = req.body;
  try {
    const result = await spawnSubAgent('research', topic);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/grant/eligibility', async (req, res) => {
  const { orgProfile, requirements } = req.body;
  try {
    const result = await checkEligibility(orgProfile, requirements);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/grant/draft-loi', async (req, res) => {
  const { grantName, orgName, focus, requirements } = req.body;
  try {
    const result = await draftLOI(grantName, orgName, focus, requirements);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/grant/compliance', async (req, res) => {
  const { draft, requirements } = req.body;
  try {
    const result = await runComplianceCheck(draft, requirements);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/contract/parse-rfp', async (req, res) => {
  const { rfpText } = req.body;
  try {
    const result = await parseRFP(rfpText);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/contract/compliance-matrix', async (req, res) => {
  const { requirements } = req.body;
  try {
    const result = await buildComplianceMatrix(requirements);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/contract/flag-gaps', async (req, res) => {
  const { matrix } = req.body;
  try {
    const result = await flagGaps(matrix);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
