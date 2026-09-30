import { connectLambda, getStore } from "@netlify/blobs";

export async function handler(event) {
  connectLambda(event);
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, layout, images } = data; // images is an array of base64 strings

    const feedId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });

    const imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i].replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const blobKey = `${feedId}/image-${i}.jpg`;
      await store.set(blobKey, buffer);
      // The public URL for the blob (requires Netlify's blob serving to be enabled)
      imageUrls.push(`/.netlify/blobs/${feedId}/image-${i}.jpg`);
    }

    const meta = {
      id: feedId,
      name: name || "Untitled feed",
      layout,
      images: imageUrls,
      createdAt: new Date().toISOString(),
    };

    await store.setJSON(`${feedId}/meta.json`, meta);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, feedId }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}