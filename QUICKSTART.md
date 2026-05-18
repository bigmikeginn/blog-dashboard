# Blog Dashboard — Quick Start (5 Minutes)

## What You Just Built

A premium approval interface for your blog automation. Your customers will:
- Check a simple dashboard
- Click "Approve" on their blog
- Blog automatically publishes

No n8n UI, no GitHub knowledge, no confusion. Just approve or request changes.

## Deploy Now (2 minutes)

### 1. Push to GitHub

```bash
cd "C:\Software Development\Projects\Internal\Website Move\blog-dashboard"
git init
git add .
git commit -m "Initial blog dashboard setup"
git remote add origin https://github.com/bigmikeginn/blog-dashboard.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose `blog-dashboard` repo
5. Click "Deploy"

**That's it!** You'll get a URL like `https://blog-dashboard.vercel.app`

## Connect to n8n (3 minutes)

### Step 1: Add API Key to Environment

In your `.env` file (create one):
```
N8N_API_KEY=your-random-secret-key-here-12345abcde
```

Generate a random key: `openssl rand -hex 32`

### Step 2: Add to n8n Workflow

In your existing blog automation workflow (`szYuqRCb8MsdnGjN`):

**Insert this node AFTER "Download Image" node:**

1. Click "+" to add node
2. Search "HTTP Request"
3. Name it "Submit to Dashboard"
4. Configure:

```
Method: POST
URL: https://blog-dashboard.vercel.app/api/submit
Headers: x-api-key = {{ $env.N8N_API_KEY }}
Body (JSON):
{
  "clientId": "default",
  "slug": "{{ $('Code in JavaScript').item.json.slug }}",
  "content": "{{ $('Code in JavaScript').item.json.content }}",
  "imageUrl": "https://raw.githubusercontent.com/bigmikeginn/jitsudo-site/main/public/images/blog/{{ $('Code in JavaScript').item.json.slug }}.png"
}
```

5. Connect: "Download Image" → "Submit to Dashboard" → Continue to GitHub nodes

### Step 3: Add Approval Webhook

1. Add a "Wait" node after "Submit to Dashboard"
2. Configure it to wait for a webhook approval
3. n8n will provide a webhook URL—save it

### Step 4: Set Environment Variable on Vercel

Go to your Vercel project → Settings → Environment Variables

Add:
```
N8N_API_KEY=your-same-random-secret-key
```

## Share with a Customer

Give them this URL:
```
https://blog-dashboard.vercel.app/?client=their-business-name
```

They:
1. Bookmark it
2. Check when they get your notification
3. Click "Approve & Publish"
4. Blog goes live

## Test It

1. Manually add a row to your Google Sheet with Status="Draft"
2. Run the n8n workflow manually
3. Go to https://blog-dashboard.vercel.app/?client=default
4. You should see your blog waiting for approval
5. Click "Approve & Publish"
6. Blog should publish to GitHub

## Next Steps

- [ ] Deploy to Vercel (see above)
- [ ] Connect to n8n workflow (see above)
- [ ] Test with one blog post
- [ ] Share dashboard link with first customer
- [ ] Get customer feedback on approval workflow

## Troubleshooting

**"Dashboard shows no blogs"**
- Check n8n submitted the blog to `/api/submit` endpoint
- Check the `x-api-key` header matches your `N8N_API_KEY`

**"Approve button doesn't work"**
- Check Vercel logs: https://vercel.com → your project → Deployments
- Make sure n8n approval webhook is configured

**"Blog doesn't publish after approval"**
- Check n8n Wait node is configured correctly
- Verify the approval webhook URL in n8n matches

## Architecture

```
Your system:
  Google Sheets (drafts)
         ↓
    n8n Workflow
    ├─ Generate blog (Claude)
    ├─ Generate image (OpenAI)
    ├─ Submit to Dashboard API
    ├─ Wait for approval webhook
    └─ If approved: Publish to GitHub

Customer system:
  Email notification
         ↓
  Dashboard link: https://blog-dashboard.vercel.app/?client=customer
         ↓
  Click "Approve & Publish"
         ↓
  Webhook sent to n8n
         ↓
  Blog publishes automatically
```

## Customizing for Multiple Customers

Each customer gets their own dashboard URL with a unique ID:

```
Customer 1: https://blog-dashboard.vercel.app/?client=customer1
Customer 2: https://blog-dashboard.vercel.app/?client=customer2
Customer 3: https://blog-dashboard.vercel.app/?client=customer3
```

Data is completely isolated per `clientId`. No authentication needed—the URL IS the authentication.

## What's Stored Where

- **Dashboard UI:** Hosted on Vercel
- **Customer blogs:** Stored in Vercel's filesystem (`.data/` folder)
- **Published blogs:** Still go to GitHub as before
- **No database needed:** Just JSON files

## Scale Limits

- Free Vercel tier: Up to 100GB bandwidth/month
- Up to 50 concurrent function executions
- Perfect for 1-50 customers

If you outgrow it, migrate to a database (Supabase, MongoDB, etc.) and it takes 30 minutes.

---

**You're all set!** Your blog automation now has a professional approval workflow that requires ZERO technical knowledge from your customers. 🚀
