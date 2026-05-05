async function checkEligibility(orgProfile, requirements) {
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
      messages: [{
        role: 'user',
        content: `You are an eligibility screener. Given this organization profile and grant requirements, determine if the organization is eligible.\n\nOrganization Profile:\n${orgProfile}\n\nGrant Requirements:\n${requirements}\n\nReturn a structured assessment with:\n- Overall eligibility: ELIGIBLE / INELIGIBLE / UNCERTAIN\n- Met requirements (list)\n- Unmet requirements (list)\n- Risks to flag (list)`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

async function draftLOI(grantName, orgName, focus, requirements) {
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
        content: `Draft a professional Letter of Intent for the following grant opportunity.\n\nGrant Name: ${grantName}\nOrganization: ${orgName}\nProject Focus: ${focus}\nKey Requirements: ${requirements}\n\nStructure the LOI with these sections:\n1. Introduction & Organization Overview\n2. Statement of Need\n3. Project Description & Goals\n4. Expected Outcomes & Impact\n5. Closing & Next Steps\n\nWrite in a compelling, professional tone. Be specific about measurable outcomes.`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

async function runComplianceCheck(draft, requirements) {
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
        content: `You are a grant compliance checker. Review this draft against the requirements list and identify any gaps.\n\nDraft:\n${draft}\n\nRequirements:\n${requirements}\n\nFor each requirement state:\n- CHECKMARK MET - with brief explanation\n- MISSING - with recommendation to fix\n- PARTIAL - with what needs to be strengthened`
      }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}

module.exports = { checkEligibility, draftLOI, runComplianceCheck };
