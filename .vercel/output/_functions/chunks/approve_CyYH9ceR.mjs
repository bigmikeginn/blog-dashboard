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

async function triggerN8nWebhook(blogData) {
  // This would be called to trigger the n8n publishing webhook
  // For now, we'll log it - in production, you'd call your n8n webhook URL
  const n8nWebhookUrl = process.env.N8N_APPROVAL_WEBHOOK || '';

  if (n8nWebhookUrl) {
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          blogId: blogData.id,
          slug: blogData.slug,
          content: blogData.content,
          imageUrl: blogData.imageUrl,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error triggering n8n webhook:', err);
    }
  }
}

async function POST({ request }) {
  try {
    const body = await request.json();
    const { blogId, client } = body;

    const blogs = await getBlogs(client);
    const blogIndex = blogs.findIndex(b => b.id === blogId);

    if (blogIndex === -1) {
      return new Response(JSON.stringify({ error: 'Blog not found' }), { status: 404 });
    }

    const blog = blogs[blogIndex];
    blog.status = 'published';
    blog.publishedAt = new Date().toISOString();

    await saveBlogs(client, blogs);
    await triggerN8nWebhook(blog);

    return new Response(JSON.stringify({ success: true, blog }), { status: 200 });
  } catch (err) {
    console.error('Approve error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
