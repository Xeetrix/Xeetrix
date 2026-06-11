const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const AGENT_API_URL = runtimeEnv.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_KEY =
  runtimeEnv.AGENT_API_SECRET ??
  runtimeEnv.X_AGENT_KEY ??
  runtimeEnv.AGENT_API_KEY ??
  runtimeEnv.XEETRIX_AGENT_KEY ??
  runtimeEnv['x-agent-key'];

type UnknownRecord = Record<string, unknown>;

export type AgentProject = {
  id: string;
  name: string;
  status: string;
  progress: number;
  description: string;
  next: string;
};

export type AgentTask = {
  id: string;
  title: string;
  project: string;
  due: string;
  priority: string;
};

async function requestAgentMemory<T>(path: string): Promise<T[]> {
  if (!AGENT_API_URL) {
    throw new Error('NEXT_PUBLIC_AGENT_API_URL is not configured.');
  }

  if (!AGENT_API_KEY) {
    throw new Error('AGENT_API_SECRET is not configured.');
  }

  const response = await fetch(new URL(path, AGENT_API_URL), {
    headers: {
      'x-agent-key': AGENT_API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Xeetrix Agent request failed: ${response.status}`);
  }

  const data = await response.json();
  return extractCollection(data) as T[];
}

export async function getAgentProjects(): Promise<AgentProject[]> {
  const projects = await requestAgentMemory<UnknownRecord>('/memory/projects');
  return projects.filter(isRecord).map(normalizeProject);
}

export async function getAgentTasks(): Promise<AgentTask[]> {
  const tasks = await requestAgentMemory<UnknownRecord>('/memory/tasks');
  return tasks.filter(isRecord).map(normalizeTask);
}

function extractCollection(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const candidates = [data.data, data.projects, data.tasks, data.items, data.results, data.memory];
  const collection = candidates.find(Array.isArray);
  if (collection) {
    return collection;
  }

  const nestedRecord = candidates.find(isRecord);
  if (nestedRecord) {
    return extractCollection(nestedRecord);
  }

  return [];
}

function normalizeProject(project: UnknownRecord, index: number): AgentProject {
  const name = asText(project.name) ?? asText(project.title) ?? asText(project.project) ?? 'নামহীন প্রজেক্ট';
  const progress = asProgress(
    project.progress ??
      project.progress_percent ??
      project.progressPercentage ??
      project.completion ??
      project.completion_percent,
  );

  return {
    id: asText(project.id) ?? asText(project._id) ?? asText(project.uuid) ?? `${name}-${index}`,
    name,
    status: asText(project.status) ?? asText(project.state) ?? asText(project.phase) ?? 'active',
    progress,
    description:
      asText(project.description) ?? asText(project.summary) ?? asText(project.notes) ?? 'এই প্রজেক্টের বিস্তারিত এখনো যোগ করা হয়নি।',
    next:
      asText(project.next) ??
      asText(project.next_action) ??
      asText(project.nextAction) ??
      asText(project.next_step) ??
      'পরবর্তী কাজ এখনো সেট করা হয়নি।',
  };
}

function normalizeTask(task: UnknownRecord, index: number): AgentTask {
  const title = asText(task.title) ?? asText(task.name) ?? asText(task.task) ?? 'নামহীন কাজ';
  const projectValue = task.projects ?? task.project;

  return {
    id: asText(task.id) ?? asText(task._id) ?? asText(task.uuid) ?? `${title}-${index}`,
    title,
    project:
      getTaskProject(projectValue) ??
      asText(task.project_name) ??
      asText(task.projectName) ??
      asText(task.context) ??
      'General',
    due: formatDue(
      task.due ?? task.due_at ?? task.dueAt ?? task.due_date ?? task.dueDate ?? task.time ?? task.scheduled_for,
    ),
    priority: normalizePriority(asText(task.priority) ?? asText(task.priority_label) ?? asText(task.urgency) ?? 'medium'),
  };
}

function getTaskProject(project: unknown): string | undefined {
  if (isRecord(project)) {
    return asText(project.name) ?? asText(project.title) ?? asText(project.id);
  }

  return asText(project);
}

function normalizePriority(priority: string): string {
  const value = priority.toLowerCase();
  if (value === 'high') return 'High';
  if (value === 'low') return 'Low';
  return 'Medium';
}

function asText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function asProgress(value: unknown): number {
  const numberValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : 0;
  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  const normalizedValue = numberValue <= 1 && numberValue > 0 ? numberValue * 100 : numberValue;
  return Math.min(100, Math.max(0, Math.round(normalizedValue)));
}

function formatDue(value: unknown): string {
  const textValue = asText(value);
  if (!textValue) {
    return 'সময় নেই';
  }

  const date = new Date(textValue);
  if (Number.isNaN(date.getTime())) {
    return textValue;
  }

  return new Intl.DateTimeFormat('bn-BD', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
