async function parseRFP(rfpText) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are an RFP parser. Extract all key information from this RFP text.\n\nRFP Text:\n${rfpText}\n\nExtract and structure:\n1. Solicitation number\n2. Agency name\n3. Due date\n4. Contract type\n5. Estimated value\n6. All Section L requirements (instructions to offerors)\n7. All Section M requirements (evaluation criteria)\n8. Page limits\n9. Required attachments\n10. Key dates and deadlines\n\nBe thorough - missing a requirement can disqualify a proposal.`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

async function buildComplianceMatrix(requirements) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Build a compliance matrix from these RFP requirements.\n\nRequirements:\n${requirements}\n\nFor each requirement create a row with:\n- Requirement (brief description)\n- Source Section (L.1, M.2, etc)\n- Response Location (which proposal section addresses it)\n- Status (Complete / Gap / Partial)\n- Notes (what is needed)\n\nFormat as a clear markdown table. Flag any mandatory requirements that are gaps as CRITICAL.`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

async function flagGaps(matrix) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Review this compliance matrix and identify all gaps that must be resolved before submission.\n\nMatrix:\n${matrix}\n\nProvide:\n1. CRITICAL gaps - will disqualify proposal if missing\n2. MAJOR gaps - significantly weakens proposal\n3. MINOR gaps - should be addressed but not disqualifying\n\nFor each gap provide a specific recommendation to resolve it.`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

module.exports = { parseRFP, buildComplianceMatrix, flagGaps };
