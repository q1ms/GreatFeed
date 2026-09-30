import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  if (request.method !== "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const feedId = new URL(request.url).searchParams.get("id");
  if (!feedId) {
    return new Response("Missing feed ID", { status: 400 });
  }

  try {
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });
    const { blobs } = await store.list({ prefix: `${feedId}/` });

    await Promise.all(blobs.map((b) => store.delete(b.key)));

    return new Response(JSON.stringify({ success: true }), {
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