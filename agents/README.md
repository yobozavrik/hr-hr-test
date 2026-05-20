# Autonomous AI Recruitment Agents Directory

This directory contains the system prompts, skills configuration, operational instructions, and working principles for all autonomous AI agents in the HR Recruiter platform.

## Directory Structure

Under each agent's subdirectory, you will find:
1. `prompt.md` - The primary system prompt defining the agent's identity, tone, and operational boundaries.
2. `instructions.md` - Detailed workflows, logic rules, data schemas, and edge case guidelines.
3. `skills.json` - Declaration of tools and programmatic capabilities equipped by this agent.

## Agents List

| Agent Folder | Agent Name | Specialization / Role |
| :--- | :--- | :--- |
| [`marta/`](file:///d:/operator_v2.2-main/hr/agents/marta) | Марта (Marta) | Sourcing & Boolean Search |
| [`artur/`](file:///d:/operator_v2.2-main/hr/agents/artur) | Артур (Artur) | Semantic Screening & CV Matcher |
| [`sofia/`](file:///d:/operator_v2.2-main/hr/agents/sofia) | Софія (Sofia) | Outreach Coordinator & Communications |
| [`danilo/`](file:///d:/operator_v2.2-main/hr/agents/danilo) | Данило (Danilo) | Salary Market & Demand Analyst |
| [`maksym/`](file:///d:/operator_v2.2-main/hr/agents/maksym) | Максим (Maksym) | Financial Controller & Hiring Budgets |
| [`olena/`](file:///d:/operator_v2.2-main/hr/agents/olena) | Олена (Olena) | Competitor Intelligence & Threat Analyst |

## Integration

The backend and frontend use these definitions to define agent behaviors, simulate cognitive loops, and map background task executors to database logs.
