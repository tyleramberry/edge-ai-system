const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addKnowledge(agentId, title, content, tags = '', accessLevel = 'business') {
  const { error } = await supabase
    .from('knowledge_base')
    .insert([{
      agent_id: agentId,
      title,
      content,
      tags,
      access_level: accessLevel,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Add knowledge error:', error.message);
    return { success: false, error: error.message };
  }

  console.log(`Knowledge added: [${agentId}] ${title}`);
  return { success: true };
}

async function getKnowledge(agentId, accessLevel = 'business') {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('title, content, tags')
    .eq('agent_id', agentId)
    .eq('access_level', accessLevel)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get knowledge error:', error.message);
    return [];
  }

  return data;
}

async function searchKnowledge(agentId, query, accessLevel = 'business') {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('title, content, tags')
    .eq('agent_id', agentId)
    .eq('access_level', accessLevel)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.ilike.%${query}%`)
    .limit(3);

  if (error) {
    console.error('Search knowledge error:', error.message);
    return [];
  }

  return data;
}

async function deleteKnowledge(id) {
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete knowledge error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

async function listAllKnowledge() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, agent_id, title, tags, access_level, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('List knowledge error:', error.message);
    return [];
  }

  return data;
}

module.exports = { addKnowledge, getKnowledge, searchKnowledge, deleteKnowledge, listAllKnowledge };
