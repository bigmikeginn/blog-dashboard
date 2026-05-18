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

async function POST({ request }) {
  try {
    const body = await request.json();
    const {
      clientId = 'default',
      slug,
      content,
      imageUrl,
      imageBase64
    } = body;

    // Validate required fields
    if (!slug || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: slug, content' }),
        { status: 400 }
      );
    }

    // Verify API key if provided
    const apiKey = request.headers.get('x-api-key');
    if (apiKey && apiKey !== process.env.N8N_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401 }
      );
    }

    const blogs = await getBlogs(clientId);

    // Create new blog entry
    const newBlog = {
      id: Date.now().toString(),
      slug,
      content,
      imageUrl: imageUrl || '',
      imageBase64: imageBase64 || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      publishedAt: null,
      rejectedAt: null
    };

    blogs.push(newBlog);
    await saveBlogs(clientId, blogs);

    // Send notification email (optional)
    if (process.env.NOTIFICATION_WEBHOOK) {
      try {
        await fetch(process.env.NOTIFICATION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'blog_ready_for_review',
            clientId,
            slug,
            dashboardUrl: `${request.url.origin}/?client=${clientId}`,
            contentPreview: content.substring(0, 200)
          })
        });
      } catch (err) {
        console.error('Error sending notification:', err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        blog: newBlog,
        dashboardUrl: `${new URL(request.url).origin}/?client=${clientId}`
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error('Submit error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
