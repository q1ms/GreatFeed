import { getStore } from "@netlify/blobs";

export async function handler(event) {
  const feedId = event.queryStringParameters?.id;
  if (!feedId) {
    return { statusCode: 400, body: "Missing feed ID" };
  }

  try {
    const store = getStore({ name: "gridfeed-storage" });
    const meta = await store.get(`${feedId}/meta.json`, { type: "json" });

    if (!meta) {
      return { statusCode: 404, body: "Feed not found" };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}