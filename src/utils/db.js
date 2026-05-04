const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function saveConversation(agentId, userMessage, agentResponse) {
  const { error } = await supabase
    .from('conversations')
    .insert([{
      agent_id: agentId,
      user_message: userMessage,
      agent_response: agentResponse,
      created_at: new Date().toISOString()
    }]);

  if (error) console.error('Supabase save error:', error.message);
}

async function getHistory(agentId, limit = 10) {
  const { data, error } = await supabase
    .from('conversations')
    .select('user_message, agent_response')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase fetch error:', error.message);
    return [];
  }

  // Reverse so oldest is first, format for Claude messages array
  return data.reverse().flatMap(row => [
    { role: 'user', content: row.user_message },
    { role: 'assistant', content: row.agent_response }
  ]);
}

module.exports = { saveConversation, getHistory };