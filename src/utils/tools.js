const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createTask(title, assignee, dueDate) {
  const { error } = await supabase
    .from('tasks')
    .insert([{
      title,
      assignee,
      due_date: dueDate,
      status: 'open',
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Create task error:', error.message);
    return { success: false, error: error.message };
  }

  console.log(`Task created: ${title} → ${assignee}`);
  return { success: true, title, assignee, dueDate };
}

async function logActivity(action, details) {
  const { error } = await supabase
    .from('activity_log')
    .insert([{
      action,
      details,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Log activity error:', error.message);
    return { success: false };
  }

  console.log(`Activity logged: ${action}`);
  return { success: true };
}

module.exports = { createTask, logActivity };