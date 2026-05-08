require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

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
const { getAuthUrl, getTokensFromCode, loadTokens } = require('./utils/googleAuth');
const { listDriveFiles, readDriveFile, listGmailMessages, listCalendarEvents, createCalendarEvent } = require('./utils/googleTools');
const { enrichWithGoogleContext } = require('./utils/contextEnricher');
const { addKnowledge, getKnowledge, searchKnowledge, deleteKnowledge, listAllKnowledge } = require('./utils/knowledgeBase');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests, please slow down.' }
});
app.use(limiter);

const orchestrator = new Orchestrator();
orchestrator.registerAgent('business', new BusinessAgent());
orchestrator.registerAgent('grant', new GrantAgent());
orchestrator.registerAgent('contract', new ContractAgent());
orchestrator.registerAgent('personal', new PersonalAgent());

let googleTokens = null;

// Load saved Google tokens on startup
(async () => {
  googleTokens = await loadTokens();
  if (googleTokens) console.log('Google tokens restored from Supabase');
})();

// ── Google Auth ────────────────────────────────────────────────────────────
app.get('/auth/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await getTokensFromCode(code);
    googleTokens = tokens;
    console.log('Google tokens received and stored');
    res.send(`
      <html>
        <body style="font-family: Arial; padding: 40px; background: #F7F6F3;">
          <h2 style="color: #2D4A2B;">Google Connected Successfully</h2>
          <p>Your Google account is now connected to Edge AI for Streak Advisors.</p>
          <p>You can close this tab and return to the app.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Authentication failed: ' + error.message);
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ connected: !!googleTokens });
});

// ── Google Tools ───────────────────────────────────────────────────────────
app.get('/google/drive/files', async (req, res) => {
  if (!googleTokens) return res.status(401).json({ success: false, error: 'Google not connected.' });
  try {
    const files = await listDriveFiles(googleTokens, req.query.q || '');
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/google/drive/file/:fileId', async (req, res) => {
  if (!googleTokens) return res.status(401).json({ success: false, error: 'Google not connected.' });
  try {
    const content = await readDriveFile(googleTokens, req.params.fileId);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/google/gmail/messages', async (req, res) => {
  if (!googleTokens) return res.status(401).json({ success: false, error: 'Google not connected.' });
  try {
    const messages = await listGmailMessages(googleTokens, req.query.q || '', 5);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/google/calendar/events', async (req, res) => {
  if (!googleTokens) return res.status(401).json({ success: false, error: 'Google not connected.' });
  try {
    const events = await listCalendarEvents(googleTokens);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/google/calendar/create', async (req, res) => {
  if (!googleTokens) return res.status(401).json({ success: false, error: 'Google not connected.' });
  const { title, startTime, endTime, description } = req.body;
  try {
    const event = await createCalendarEvent(googleTokens, title, startTime, endTime, description);
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Knowledge Base ─────────────────────────────────────────────────────────
app.post('/knowledge/add', async (req, res) => {
  const { agentId, title, content, tags, accessLevel } = req.body;
  if (!agentId || !title || !content) {
    return res.status(400).json({ success: false, error: 'agentId, title and content are required' });
  }
  try {
    const result = await addKnowledge(agentId, title, content, tags, accessLevel);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/knowledge/list', async (req, res) => {
  try {
    const items = await listAllKnowledge();
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/knowledge/:agentId', async (req, res) => {
  try {
    const items = await getKnowledge(req.params.agentId);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/knowledge/search', async (req, res) => {
  const { agentId, query } = req.body;
  try {
    const items = await searchKnowledge(agentId, query);
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/knowledge/:id', async (req, res) => {
  try {
    const result = await deleteKnowledge(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Core Chat ──────────────────────────────────────────────────────────────
app.post('/chat', async (req, res) => {
  const { message, projectId = 'default' } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Message is required' });
  try {
    const classification = await orchestrator.classifyTask(message);
    const agentId = classification.agentType;
    const history = await getHistory(agentId);
    const projectContext = await getAllContext(projectId);
    const contextSummary = projectContext.length > 0
      ? '\n\nProject Context:\n' + projectContext.map(c => `${c.key}: ${c.value}`).join('\n')
      : '';
    const googleContext = await enrichWithGoogleContext(agentId, googleTokens);
    const enrichedMessage = message + contextSummary + googleContext;
    const result = await orchestrator.routeTask(enrichedMessage, history);
    await saveConversation(agentId, message, result.reply);
    await logActivity('chat', `${agentId} agent responded to: ${message.substring(0, 50)}`);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ── Other Routes ───────────────────────────────────────────────────────────
app.post('/context/set', async (req, res) => {
  const { projectId, key, value, agentId } = req.body;
  if (!projectId || !key || !value) return res.status(400).json({ success: false, error: 'projectId, key and value are required' });
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
  if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
  try {
    const result = await createTask(title, assignee, dueDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/research', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ success: false, error: 'Topic is required' });
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
  console.log('Google Auth: visit http://localhost:3000/auth/google to connect');
  console.log('Knowledge Base: ready');
});
