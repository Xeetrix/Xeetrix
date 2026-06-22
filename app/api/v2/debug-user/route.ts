import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getV2OwnerIdentity } from '@/lib/shaikh-os-v2';

const USER_NOT_FOUND_TEXT = ['User', ' not found'].join('');
const REPO_ROOT = process.cwd();
const IGNORED_DIRECTORIES = new Set(['.git', '.next', 'node_modules', 'dist', 'build', 'coverage']);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const owner = getV2OwnerIdentity();
  const matches = await findExactStringMatches(REPO_ROOT, USER_NOT_FOUND_TEXT);
  const exactErrorSource = matches.length
    ? matches.map((match) => `${match.file}:${match.line}`).join('\n')
    : `No occurrences of exact string "${USER_NOT_FOUND_TEXT}" found in repository.`;

  return NextResponse.json({
    ok: true,
    owner_id_used: owner.owner_id,
    has_auth_dependency: owner.depends_on_auth_session || owner.depends_on_profiles_table,
    user_lookup_file: 'lib/shaikh-os-v2.ts',
    user_lookup_error: exactErrorSource,
    exact_error_source: exactErrorSource,
    env_runtime: 'production',
  });
}

async function findExactStringMatches(root: string, needle: string) {
  const matches: Array<{ file: string; line: number }> = [];
  await walk(root, async (filePath) => {
    const content = await readSafeTextFile(filePath);
    if (content === null || !content.includes(needle)) return;

    content.split(/\r?\n/).forEach((line, index) => {
      if (line.includes(needle)) {
        matches.push({ file: toRepoRelativePath(filePath), line: index + 1 });
      }
    });
  });
  return matches.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

async function walk(directory: string, visitFile: (filePath: string) => Promise<void>) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    if (entry.name.startsWith('.') && entry.name !== '.env.example' && entry.name !== '.github') return;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) return;
      await walk(entryPath, visitFile);
      return;
    }
    if (entry.isFile()) await visitFile(entryPath);
  }));
}

async function readSafeTextFile(filePath: string) {
  try {
    const content = await readFile(filePath, 'utf8');
    return content.includes('\u0000') ? null : content;
  } catch {
    return null;
  }
}

function toRepoRelativePath(filePath: string) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}
