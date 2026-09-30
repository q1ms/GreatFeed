import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  try {
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });
    // List all keys, then filter for meta.json files.
    const { blobs } = await store.list({ prefix: "" });
    const feedIds = blobs
      .map((b) => b.key)
      .filter((key) => key.endsWith("/meta.json"))
      .map((key) => key.split("/")[0]);

    const feeds = await Promise.all(
      feedIds.map(async (id) => {
        return await store.get(`${id}/meta.json`, { type: "json" });
      })
    );

    feeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify(feeds), {
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