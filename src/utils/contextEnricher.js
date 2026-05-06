const { listGmailMessages, listDriveFiles, listCalendarEvents } = require('./googleTools');

async function enrichWithGoogleContext(agentId, googleTokens) {
  let context = '';

  if (!googleTokens) return context;

  try {
    // Always pull recent emails for business and grant agents
    if (['business', 'grant', 'contract'].includes(agentId)) {
      const messages = await listGmailMessages(googleTokens, '', 5);
      if (messages.length > 0) {
        context += '\n\nRecent Emails (last 5):\n';
        messages.forEach(m => {
          context += `- Subject: "${m.subject}" | From: ${m.from} | Date: ${m.date}\n  Preview: ${m.snippet.substring(0, 100)}\n`;
        });
      }
    }

    // Pull calendar for personal agent
    if (agentId === 'personal') {
      const events = await listCalendarEvents(googleTokens, 5);
      if (events.length > 0) {
        context += '\n\nUpcoming Calendar Events:\n';
        events.forEach(e => {
          context += `- ${e.summary} at ${e.start.dateTime || e.start.date}\n`;
        });
      }
    }

    // Pull recent Drive files for grant and contract agents
    if (['grant', 'contract'].includes(agentId)) {
      const files = await listDriveFiles(googleTokens, '');
      if (files.length > 0) {
        context += '\n\nRecent Google Drive Files:\n';
        files.slice(0, 5).forEach(f => {
          context += `- "${f.name}" (${f.mimeType.split('.').pop()}) — last modified ${f.modifiedTime.substring(0, 10)}\n`;
        });
      }
    }

  } catch (error) {
    console.log('Google context enrichment error:', error.message);
  }

  return context;
}

module.exports = { enrichWithGoogleContext };
