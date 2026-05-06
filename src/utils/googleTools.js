const { google } = require('googleapis');
const { getOAuthClient } = require('./googleAuth');

async function listDriveFiles(tokens, query = '') {
  try {
    const auth = getOAuthClient(tokens);
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.list({
      q: query || "mimeType != 'application/vnd.google-apps.folder'",
      pageSize: 10,
      fields: 'files(id, name, mimeType, modifiedTime, size)'
    });

    return response.data.files;
  } catch (error) {
    console.error('Drive list error:', error.message);
    throw error;
  }
}

async function readDriveFile(tokens, fileId) {
  try {
    const auth = getOAuthClient(tokens);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.export({
      fileId,
      mimeType: 'text/plain'
    });

    return response.data;
  } catch (error) {
    // Try get for non-Google files
    const auth = getOAuthClient(tokens);
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    });
    return response.data;
  }
}

async function listGmailMessages(tokens, query = '', maxResults = 5) {
  try {
    const auth = getOAuthClient(tokens);
    const gmail = google.gmail({ version: 'v1', auth });

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });

    if (!listResponse.data.messages) return [];

    const messages = await Promise.all(
      listResponse.data.messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date']
        });

        const headers = detail.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        const snippet = detail.data.snippet || '';

        return { id: msg.id, subject, from, date, snippet };
      })
    );

    return messages;
  } catch (error) {
    console.error('Gmail list error:', error.message);
    throw error;
  }
}

async function listCalendarEvents(tokens, maxResults = 10) {
  try {
    const auth = getOAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.data.items;
  } catch (error) {
    console.error('Calendar list error:', error.message);
    throw error;
  }
}

async function createCalendarEvent(tokens, title, startTime, endTime, description = '') {
  try {
    const auth = getOAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: title,
      description,
      start: { dateTime: startTime, timeZone: 'America/Denver' },
      end: { dateTime: endTime, timeZone: 'America/Denver' }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.data;
  } catch (error) {
    console.error('Calendar create error:', error.message);
    throw error;
  }
}

module.exports = { listDriveFiles, readDriveFile, listGmailMessages, listCalendarEvents, createCalendarEvent };
