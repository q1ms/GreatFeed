import { getStore } from "@netlify/blobs";

export async function handler(event) {
  if (event.httpMethod !== "DELETE") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const feedId = event.queryStringParameters?.id;
  if (!feedId) {
    return { statusCode: 400, body: "Missing feed ID" };
  }

  try {
    const store = getStore({ name: "gridfeed-storage" });
    const { blobs } = await store.list({ prefix: `${feedId}/` });

    await Promise.all(blobs.map((b) => store.delete(b.key)));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}