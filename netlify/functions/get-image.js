import { getStore } from "@netlify/blobs";

export default async (request, context) => {
  const url = new URL(request.url);
  const feedId = url.searchParams.get("feed");
  const index = url.searchParams.get("i");

  if (!feedId || index === null) {
    return new Response("Missing feed or index", { status: 400 });
  }

  try {
    const store = getStore({ name: "gridfeed-storage", consistency: "strong" });
    const blob = await store.get(`${feedId}/image-${index}.jpg`, { type: "arrayBuffer" });

    if (!blob) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error loading image", { status: 500 });
  }
};