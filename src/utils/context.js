const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setContext(projectId, key, value, agentId) {
  console.log('Setting context:', { projectId, key, value, agentId });
  
  const { data, error } = await supabase
    .from('project_context')
    .upsert({
      project_id: projectId,
      key,
      value,
      agent_id: agentId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'project_id,key'
    })
    .select();

  if (error) {
    console.error('Set context error FULL:', JSON.stringify(error));
    return { success: false, error: error.message };
  }

  console.log('Context set successfully:', data);
  return { success: true };
}

async function getContext(projectId, key) {
  const { data, error } = await supabase
    .from('project_context')
    .select('value, agent_id, updated_at')
    .eq('project_id', projectId)
    .eq('key', key)
    .single();

  if (error) {
    console.error('Get context error:', error.message);
    return null;
  }

  return data;
}

async function getAllContext(projectId) {
  const { data, error } = await supabase
    .from('project_context')
    .select('key, value, agent_id, updated_at')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Get all context error:', error.message);
    return [];
  }

  return data;
}

module.exports = { setContext, getContext, getAllContext };
