# Shaikh OS Agent Runtime Architecture

## Canonical runtime flow

Shaikh OS uses a single source of truth for command planning: `agent_action_plans`.
The runtime pipeline is:

```text
command
→ observation
→ reasoning
→ action_plan
→ execution
→ memory
→ audit
```

## Canonical tables

| Stage | Canonical table | Purpose |
| --- | --- | --- |
| command | `agent_command_events` | Append-only command timeline and audit events. |
| observation | `agent_observations` | Raw input from manual commands, Google sources, or future sources. |
| reasoning | `agent_reasoning_logs` | Understanding, retrieved context, confidence, and reasoning snapshots. |
| action_plan | `agent_action_plans` | The canonical production plan table and only runtime plan persistence target. |
| execution | `agent_tool_calls`, `agent_action_plans.execution_result` | Tool/execution trace plus final result attached to the canonical plan. |
| memory | `agent_memories`, `agent_entities`, `agent_facts`, `agent_goals`, `agent_lessons` | Long-lived memory and learned context. |
| audit | `agent_system_audits`, `agent_improvement_proposals`, `agent_execution_events`, `agent_feedback` | System improvement, review, feedback, and operational audit records. |

## Consolidation decision

`agent_action_plans` is the only runtime/action-plan table used by application code. The stale duplicate runtime-plan table has been removed from active migrations and runtime helpers to prevent schema drift.

Runtime compatibility is handled in code by mapping the legacy server-plan shape:

- `command_id`
- `raw_command`
- `plan`
- `brain`
- `status`
- `confidence`
- `requires_confirmation`
- `execution_result`

into the canonical action-plan shape:

- `command_id`
- `raw_command`
- `action_type`
- `target_table`
- `payload.plan`
- `payload.brain`
- `payload.execution_result`
- `explanation`
- `confidence`
- `requires_confirmation`
- `status`

Reads normalize canonical rows back to the server-plan interface expected by confirmation/execution code while preserving the canonical database table as the persistence boundary.

## Stale duplicate architecture audit

- Runtime: consolidated on `agent_action_plans`; no application path writes to a duplicate runtime-plan table.
- Action: `agent_action_plans` owns proposed, confirmed, executed, cancelled, clarification, and failed plan states.
- Memory: `agent_memories` is the canonical saved task/note/context memory store; specialized context remains in entities, facts, goals, and lessons.
- Execution: execution results are attached to `agent_action_plans.execution_result`; detailed tool traces use `agent_tool_calls.plan_id` referencing `agent_action_plans.id`.
- Observation: `agent_observations` remains the canonical raw-input table; command events provide the timeline.
- Audit: `agent_command_events` and improvement/audit tables remain append-only review surfaces, not alternate runtime plan sources.

## Runtime invariants

1. New plans must be inserted into `agent_action_plans` only.
2. Runtime helpers must use the canonical `plans` memory kind mapping to `agent_action_plans`.
3. Confirmation and cancellation must load and update `agent_action_plans` by `id`.
4. Execution status must be written back to `agent_action_plans.status` and `agent_action_plans.execution_result`.
5. Audit/event tables may describe the plan lifecycle but must not become authoritative plan stores.
