const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
}

function getOAuthClient(tokens) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
}

async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code);
  await saveTokens(tokens);
  return tokens;
}

async function saveTokens(tokens) {
  // Delete existing tokens and insert fresh
  await supabase.from('google_tokens').delete().neq('id', 0);
  const { error } = await supabase.from('google_tokens').insert([{
    tokens,
    updated_at: new Date().toISOString()
  }]);
  if (error) console.error('Save tokens error:', error.message);
  else console.log('Google tokens saved to Supabase');
}

async function loadTokens() {
  const { data, error } = await supabase
    .from('google_tokens')
    .select('tokens')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.log('No saved Google tokens found');
    return null;
  }

  console.log('Google tokens loaded from Supabase');
  return data.tokens;
}

module.exports = { getAuthUrl, getOAuthClient, getTokensFromCode, oauth2Client, loadTokens };
