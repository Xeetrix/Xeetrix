export type VercelDeploymentSummary = { configured: boolean; deployments: VercelDeployment[]; productionUrl: string | null; latestStatus: string; failedDeployments: VercelDeployment[]; error?: string | null };
type VercelDeployment = { uid: string; name: string; url: string; state: string; target?: string | null; createdAt?: number; ready?: number; inspectorUrl?: string };

function vercelToken() { return process.env.VERCEL_TOKEN; }
function projectQuery() { const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME; return projectId ? `&projectId=${encodeURIComponent(projectId)}` : ''; }
function teamQuery() { return process.env.VERCEL_TEAM_ID ? `&teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}` : ''; }

export async function getVercelDeploymentIntelligence(): Promise<VercelDeploymentSummary> {
  const token = vercelToken();
  if (!token) return { configured: false, deployments: [], productionUrl: null, latestStatus: 'Not configured', failedDeployments: [] };
  const response = await fetch(`https://api.vercel.com/v6/deployments?limit=12${projectQuery()}${teamQuery()}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json().catch(() => null) as { deployments?: VercelDeployment[]; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(data?.error?.message ?? 'Vercel deployments lookup failed');
  const deployments = data?.deployments ?? [];
  const production = deployments.find((deployment) => deployment.target === 'production' && deployment.state === 'READY') ?? deployments.find((deployment) => deployment.state === 'READY') ?? null;
  return { configured: true, deployments, productionUrl: production?.url ? `https://${production.url}` : null, latestStatus: deployments[0]?.state ?? 'No deployments', failedDeployments: deployments.filter((deployment) => deployment.state === 'ERROR' || deployment.state === 'CANCELED') };
}
