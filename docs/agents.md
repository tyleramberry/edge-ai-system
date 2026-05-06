# Edge AI Solutions — Agent System Documentation

## Overview
Four-agent AI system for grant writing and government contracting.
Built on Claude API with Express backend and Supabase database.

## Architecture
- **Orchestrator** — classifies incoming tasks and routes to correct agent
- **AgentBase** — base class all agents extend, handles Claude API calls and memory
- **Shared Context** — project-level context store shared across agents via Supabase

## Agents

### Business Assistant (business)
- **Role:** Internal operations, task routing, workflow coordination
- **Routes:** /chat (auto-routed)
- **Memory:** Loads last 10 conversations from Supabase
- **Tools:** createTask, logActivity, spawnSubAgent

### Grant Writing Specialist (grant)
- **Role:** Full grant lifecycle — eligibility, LOI drafting, compliance
- **Routes:** /chat (auto-routed), /grant/eligibility, /grant/draft-loi, /grant/compliance
- **Memory:** Loads last 10 conversations from Supabase
- **Tools:** checkEligibility, draftLOI, runComplianceCheck

### Government Contracting Specialist (contract)
- **Role:** RFP parsing, compliance matrices, gap identification
- **Routes:** /chat (auto-routed), /contract/parse-rfp, /contract/compliance-matrix, /contract/flag-gaps
- **Memory:** Loads last 10 conversations from Supabase
- **Tools:** parseRFP, buildComplianceMatrix, flagGaps

### Personal Agent (personal)
- **Role:** Personal tasks only — scheduling, reminders, research
- **Routes:** /chat (auto-routed)
- **Memory:** Loads last 10 conversations from Supabase
- **Data wall:** Cannot access any business data

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | /chat | Main chat route — auto-routes to correct agent |
| POST | /task | Create a task in Supabase |
| POST | /research | Spawn a research sub-agent |
| POST | /context/set | Set shared project context |
| POST | /context/get | Get a specific context value |
| POST | /context/all | Get all context for a project |
| POST | /grant/eligibility | Check grant eligibility |
| POST | /grant/draft-loi | Draft a Letter of Intent |
| POST | /grant/compliance | Run compliance check on a draft |
| POST | /contract/parse-rfp | Parse an RFP document |
| POST | /contract/compliance-matrix | Build a compliance matrix |
| POST | /contract/flag-gaps | Flag gaps in a proposal |
| POST | /test | Basic Claude API test |

## Database Tables
- **conversations** — all agent conversation history
- **tasks** — tasks created by the Business Agent
- **activity_log** — all agent activity logs
- **project_context** — shared project context across agents

## Known Limitations
- Document upload (PDF) not yet implemented — coming Day 10
- Personal Agent calendar/email integrations not yet connected — coming Day 9
- Frontend UI not yet built — coming Day 8

## Environment Variables Required
- ANTHROPIC_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- PORT (default 3000)
