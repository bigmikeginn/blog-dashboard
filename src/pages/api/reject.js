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
    if (!existsSync(filePath)) return [];
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveBlogs(clientId, blogs) {
  await ensureDataDir();
  const filePath = join(DATA_DIR, `${clientId}-blogs.json`);
  await writeFile(filePath, JSON.stringify(blogs, null, 2));
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { blogId, client } = body;

    const blogs = await getBlogs(client);
    const blogIndex = blogs.findIndex(b => b.id === blogId);

    if (blogIndex === -1) {
      return new Response(JSON.stringify({ error: 'Blog not found' }), { status: 404 });
    }

    const blog = blogs[blogIndex];
    blog.status = 'rejected';
    blog.rejectedAt = new Date().toISOString();

    await saveBlogs(client, blogs);

    // Optionally call n8n to mark the Google Sheet row back to "Draft" for revision
    const n8nWebhookUrl = process.env.N8N_REJECTION_WEBHOOK || '';
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reject',
            blogId: blog.id,
            slug: blog.slug
          })
        });
      } catch (err) {
        console.error('Error triggering rejection webhook:', err);
      }
    }

    return new Response(JSON.stringify({ success: true, blog }), { status: 200 });
  } catch (err) {
    console.error('Reject error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
