# Blog Dashboard - Deployment & Integration Guide

## What is This?

A premium web dashboard where customers approve auto-generated blog posts before they're published. No technical knowledge required—one click to approve.

**Customer Experience:**
1. You submit blog topics
2. AI generates blog + image automatically
3. Customer gets link to dashboard
4. Customer clicks "Approve" → blog is live
5. History is visible on dashboard

## Deploy to Vercel (Free)

### Step 1: Push to GitHub

```bash
cd blog-dashboard
git remote add origin https://github.com/bigmikeginn/blog-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import from GitHub: `bigmikeginn/blog-dashboard`
4. Framework: Astro
5. Environment Variables (add these):
   - `N8N_APPROVAL_WEBHOOK` = Your n8n webhook URL for approvals
   - `N8N_REJECTION_WEBHOOK` = Your n8n webhook URL for rejections
   - `NOTIFICATION_WEBHOOK` = Email/Telegram webhook (optional)
   - `N8N_API_KEY` = Secret key for n8n to authenticate

6. Click Deploy

**You'll get a URL like:** `https://blog-dashboard.vercel.app`

## Environment Variables Needed

Add these to your Vercel project settings:

```
N8N_APPROVAL_WEBHOOK=https://n8n.jitsudo.ca/webhook/blog-approved
N8N_REJECTION_WEBHOOK=https://n8n.jitsudo.ca/webhook/blog-rejected
N8N_API_KEY=your-secret-api-key-here
NOTIFICATION_WEBHOOK=https://your-email-service.com/send
```

## How n8n Integrates

### n8n submits a pending blog:

```bash
POST https://blog-dashboard.vercel.app/api/submit
Headers: x-api-key: your-secret-api-key-here
Body: {
  "clientId": "jitsudo",
  "slug": "the-importance-of-kata",
  "content": "Full blog post markdown here...",
  "imageUrl": "https://cdn.example.com/image.png"
}
```

### Response:
```json
{
  "success": true,
  "dashboardUrl": "https://blog-dashboard.vercel.app/?client=jitsudo"
}
```

## n8n Workflow Integration

Add this node to your n8n blog workflow AFTER image generation, BEFORE GitHub commit:

### 1. Add HTTP Request Node: "Submit to Dashboard"

**Configuration:**
- **Method:** POST
- **URL:** `https://blog-dashboard.vercel.app/api/submit`
- **Authentication:** None
- **Headers:**
  - `x-api-key` = `{{ $env.N8N_API_KEY }}`
- **Body (JSON):**
  ```json
  {
    "clientId": "{{ $('Google Sheets Fetch').item.json.customer_id || 'default' }}",
    "slug": "{{ $('Code in JavaScript').item.json.slug }}",
    "content": "{{ $('Code in JavaScript').item.json.content }}",
    "imageUrl": "{{ $json.url }}"
  }
  ```

### 2. Add Wait Node: "Wait for Approval"

**Configuration:**
- **Wait Type:** Webhook (pauses until approval webhook is triggered)
- **Webhook URL:** n8n will provide this

### 3. GitHub nodes continue AFTER approval

The flow becomes:
```
Submit to Dashboard → Wait for Approval → GitHub Publish → Mark Published in Sheet
```

## Customer Usage

### Sharing with Customers

Send them a unique dashboard URL:

```
https://blog-dashboard.vercel.app/?client=their-business-name
```

They:
1. Bookmark the link
2. Check it when they get your notification email
3. Click "Approve & Publish" or "Request Changes"
4. Blog is live (or marked for revision)

### No Login Required

The URL itself is the authentication. Share one per customer, and their data is isolated.

## Data Storage

Blogs are stored in `.data/` directory as JSON files:
- `default-blogs.json` (for generic clients)
- `jitsudo-blogs.json` (for customer "jitsudo")
- `seo-sensei-client1-blogs.json` (for customer with ID)

Each file contains:
```json
[
  {
    "id": "1234567890",
    "slug": "blog-post-title",
    "content": "Full blog content...",
    "imageUrl": "https://cdn.example.com/image.png",
    "status": "pending|published|rejected",
    "createdAt": "2026-05-18T10:30:00Z",
    "publishedAt": "2026-05-18T10:35:00Z"
  }
]
```

## Email Notifications (Optional)

To send approval emails automatically, add a notification webhook:

**Example: Send via Make.com**
1. Create a Make.com scenario that sends an email
2. Set `NOTIFICATION_WEBHOOK` to that webhook URL
3. Email will include:
   - Blog preview
   - Dashboard link
   - Approval button

## Scaling to Multiple Customers

Each customer gets their own `clientId`:

```
https://blog-dashboard.vercel.app/?client=customer1
https://blog-dashboard.vercel.app/?client=customer2
https://blog-dashboard.vercel.app/?client=customer3
```

All data is isolated per clientId. No authentication needed.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows "No pending blogs" | Check n8n submitted the blog to `/api/submit` endpoint |
| Approve button doesn't work | Check `N8N_APPROVAL_WEBHOOK` environment variable is set |
| Blogs not publishing to GitHub | Verify n8n webhook is called after approval |
| Data disappears | Check `.data/` folder has read/write permissions on Vercel |

## Customization

**Change colors/branding:**
- Edit `src/components/Dashboard.jsx`
- Update Tailwind classes (blue → your brand color)
- Update logo text "📝 Blog Dashboard" → your branding

**Change approval flow:**
- Edit `/api/approve.js` to add custom logic
- Add approval email notifications
- Add revision notes field

**Add features:**
- Comments/notes on blogs
- Scheduling for future publish dates
- Multiple approvers
- Integration with other publishing platforms
