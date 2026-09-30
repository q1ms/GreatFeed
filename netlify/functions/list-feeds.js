import { connectLambda, getStore } from "@netlify/blobs";

export async function handler(event) {
  connectLambda(event);
  try {
    const store = getStore({ name: "gridfeed-storage" });
    const { blobs } = await store.list({ prefix: "", delimiter: "/" });

    const feedIds = blobs
      .map((b) => b.key)
      .filter((key) => key.endsWith("/meta.json"))
      .map((key) => key.split("/")[0]);

    const feeds = await Promise.all(
      feedIds.map(async (id) => {
        const meta = await store.get(`${id}/meta.json`, { type: "json" });
        return meta;
      })
    );

    // Sort by createdAt descending
    feeds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feeds),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}