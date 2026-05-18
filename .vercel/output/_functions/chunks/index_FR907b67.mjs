import { c as createComponent } from './astro-component_DBUy7-Wx.mjs';
import 'piccolore';
import { k as createRenderInstruction, q as renderHead, r as renderComponent, s as renderTemplate } from './entrypoint_C8DFlFCn.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

function Dashboard({ clientId }) {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  useEffect(() => {
    fetchBlogs();
    const interval = setInterval(fetchBlogs, 1e4);
    return () => clearInterval(interval);
  }, [clientId]);
  const fetchBlogs = async () => {
    try {
      const resp = await fetch(`/api/blogs?client=${clientId}`);
      const data = await resp.json();
      setBlogs(data.blogs || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setLoading(false);
    }
  };
  const handleApprove = async (blog) => {
    setStatus("Approving...");
    try {
      const resp = await fetch(`/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: blog.id,
          client: clientId
        })
      });
      if (resp.ok) {
        setStatus("✅ Blog published!");
        setSelectedBlog(null);
        setTimeout(() => {
          fetchBlogs();
          setStatus("");
        }, 1e3);
      } else {
        setStatus("❌ Approval failed");
      }
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };
  const handleReject = async (blog) => {
    setStatus("Rejecting...");
    try {
      const resp = await fetch(`/api/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogId: blog.id,
          client: clientId
        })
      });
      if (resp.ok) {
        setStatus("✅ Blog rejected and marked for revision");
        setSelectedBlog(null);
        setTimeout(() => {
          fetchBlogs();
          setStatus("");
        }, 1e3);
      }
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };
  const pending = blogs.filter((b) => b.status === "pending");
  const published = blogs.filter((b) => b.status === "published");
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto mb-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2", children: "📝 Blog Dashboard" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-lg", children: "Review and approve your automatically generated blog posts" })
    ] }) }),
    status && /* @__PURE__ */ jsx("div", { className: `max-w-7xl mx-auto mb-6 p-4 rounded-lg font-semibold ${status.includes("✅") ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`, children: status }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto grid grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-lg border-2 border-indigo-100 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 p-6", children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-white", children: [
          "⏳ Waiting for Approval (",
          pending.length,
          ")"
        ] }) }),
        loading ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-gray-500", children: "Loading..." }) : pending.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-12 text-center text-gray-500", children: [
          /* @__PURE__ */ jsx("p", { className: "text-lg mb-2", children: "✨ No pending blogs" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Your new blog posts will appear here for review" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y", children: pending.map((blog) => /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setSelectedBlog(blog),
            className: `p-6 cursor-pointer transition-all hover:bg-indigo-50 border-l-4 ${selectedBlog?.id === blog.id ? "border-indigo-600 bg-indigo-50" : "border-transparent"}`,
            children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: blog.slug }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mb-3", children: [
                blog.content.substring(0, 100),
                "..."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500", children: [
                  "Generated: ",
                  new Date(blog.createdAt).toLocaleDateString()
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-indigo-600", children: "Click to preview →" })
              ] })
            ]
          },
          blog.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-lg border-2 border-purple-100 sticky top-8 overflow-hidden", children: selectedBlog ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-purple-600 to-pink-600 p-6", children: /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white", children: "Preview" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          selectedBlog.imageUrl && /* @__PURE__ */ jsx(
            "img",
            {
              src: selectedBlog.imageUrl,
              alt: "Blog header",
              className: "w-full h-48 object-cover rounded-lg mb-6 border border-gray-200"
            }
          ),
          /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold text-gray-800 mb-4", children: selectedBlog.slug }),
          /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none mb-6", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-sm leading-relaxed", children: [
            selectedBlog.content.substring(0, 200),
            "..."
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 mb-6 pb-6 border-b", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "📅 ",
              new Date(selectedBlog.createdAt).toLocaleDateString()
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              "📄 ",
              Math.ceil(selectedBlog.content.length / 5),
              " words"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleApprove(selectedBlog),
                className: "w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md",
                children: "✅ Approve & Publish"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleReject(selectedBlog),
                className: "w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md",
                children: "📝 Request Changes"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedBlog(null),
                className: "w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all",
                children: "Close"
              }
            )
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-gray-500", children: /* @__PURE__ */ jsx("p", { className: "text-lg mb-2", children: "👈 Select a blog to preview" }) }) }) })
    ] }),
    published.length > 0 && /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto mt-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-lg border-2 border-green-100 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-green-600 to-emerald-600 p-6", children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-white", children: [
        "✅ Published (",
        published.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "divide-y", children: published.slice(-5).map((blog) => /* @__PURE__ */ jsx("div", { className: "p-6 hover:bg-green-50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-800", children: blog.slug }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
            "Published: ",
            new Date(blog.publishedAt).toLocaleDateString()
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-green-600 font-bold", children: "✓ Live" })
      ] }) }, blog.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto mt-12 text-center text-gray-600 text-sm", children: /* @__PURE__ */ jsx("p", { children: "Auto-refreshing every 10 seconds • Powered by AI + n8n" }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const clientId = Astro2.url.searchParams.get("client") || "default";
  return renderTemplate`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Blog Approval Dashboard</title>${renderScript($$result, "C:/Software Development/Projects/Internal/Website Move/blog-dashboard/src/pages/index.astro?astro&type=script&index=0&lang.ts")}${renderHead()}</head> <body class="bg-gray-50" data-astro-cid-j7pv25f6> ${renderComponent($$result, "Dashboard", Dashboard, { "clientId": clientId, "data-astro-cid-j7pv25f6": true })} </body></html>`;
}, "C:/Software Development/Projects/Internal/Website Move/blog-dashboard/src/pages/index.astro", void 0);

const $$file = "C:/Software Development/Projects/Internal/Website Move/blog-dashboard/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
