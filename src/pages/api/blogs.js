import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), '.data');

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function getBlogs(clientId) {
  try {
    await ensureDataDir();
    const filePath = join(DATA_DIR, `${clientId}-blogs.json`);

    if (!existsSync(filePath)) {
      return [];
    }

    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading blogs:', err);
    return [];
  }
}

export async function GET({ url }) {
  const clientId = url.searchParams.get('client') || 'default';
  const blogs = await getBlogs(clientId);

  return new Response(JSON.stringify({ blogs }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
