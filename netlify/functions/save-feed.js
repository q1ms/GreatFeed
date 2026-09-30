import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, layout, images } = data;

    const feedId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    // No need for connectLambda; the context is automatic in this mode.
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });

    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const blobKey = `${feedId}/image-${i}.jpg`;
      await store.set(blobKey, buffer);
      imageUrls.push(`/.netlify/functions/get-image?feed=${feedId}&i=${i}`);
    }

    const meta = {
      id: feedId,
      name: name || "Untitled feed",
      layout,
      images: imageUrls,
      createdAt: new Date().toISOString(),
    };

    await store.setJSON(`${feedId}/meta.json`, meta);

    return new Response(JSON.stringify({ success: true, feedId }), {
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