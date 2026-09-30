import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const feedId = new URL(request.url).searchParams.get("id");
  if (!feedId) {
    return new Response("Missing feed ID", { status: 400 });
  }

  try {
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });
    const meta = await store.get(`${feedId}/meta.json`, { type: "json" });

    if (!meta) {
      return new Response("Feed not found", { status: 404 });
    }

    return new Response(JSON.stringify(meta), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};