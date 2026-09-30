# GridFeed

> Turn any 1080×1350 image — or one long continuous design — into a scrollable 3‑column Instagram‑style feed. Save feeds to the cloud and share them with a link.

GridFeed is a browser‑based tool for previewing how a set of posts (or one long sliced design) will look as a continuous Instagram grid. Feeds are stored in the cloud via Netlify Blobs, so you can revisit them later or send a link to anyone.

---

## ✨ Features

- **Two upload modes**
  - **Individual posts** — drop in one or more `1080 × 1350` PNG/JPG files. Non‑conforming sizes are skipped and reported.
  - **One long image** — upload a single tall design. The width must divide evenly by `1080`, the height evenly by `1350`. The image is sliced into perfectly aligned tiles automatically.
- **Live 3‑column feed** — every post is rendered at a true `4:5` aspect ratio so continuous designs stay seamless.
- **Lightbox viewer** — tap any tile to open it full‑screen with keyboard navigation (`←` / `→` / `Esc`) and a download button.
- **Cloud storage** — feeds are saved to Netlify Blobs (free tier, no credit card required).
- **Dashboard** — browse, open, rename, share, or delete any saved feed.
- **One‑click sharing** — every feed gets a permanent URL (`/#feed=<id>`) that anyone can open.
- **Fully client‑side slicing** — image splitting happens in the browser with `<canvas>`, so uploads are fast and the backend only receives compressed output.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (single `index.html`) |
| Hosting | [Netlify](https://netlify.com) — static site |
| Backend | [Netlify Functions](https://docs.netlify.com/functions/overview/) (Node.js, ESM) |
| Storage | [Netlify Blobs](https://docs.netlify.com/blobs/overview/) |
| Build tool | None — Netlify serves the static `site/` folder directly |

No frameworks, no bundler, no build step. Just push and deploy.

---

## 📁 Project Structure

```
gridfeed/
├── netlify/
│   └── functions/
│       ├── save-feed.js      # POST  — store a new feed
│       ├── get-feed.js       # GET   — retrieve a feed by ID
│       ├── list-feeds.js     # GET   — list all feeds
│       └── delete-feed.js    # DELETE— remove a feed
├── site/
│   └── index.html            # The entire frontend app
├── netlify.toml              # Netlify build & dev config
├── package.json              # Dependencies (@netlify/blobs)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A free [Netlify](https://netlify.com) account
- A [GitHub](https://github.com) (or GitLab / Bitbucket) account

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/gridfeed.git
cd gridfeed
```

### 2. Install dependencies

```bash
npm install
```

This installs `@netlify/blobs`, the only runtime dependency.

### 3. Run locally (optional)

```bash
npm install -g netlify-cli
netlify dev
```

Your app will be available at `http://localhost:8888`. The Netlify CLI emulates both the static site and the serverless functions, so Blob storage works end‑to‑end without deploying.

---

## 🌐 Deploy to Netlify (Git Integration)

This is the recommended deployment path — every `git push` triggers an automatic redeploy.

### Step 1 — Push your project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/gridfeed.git
git push -u origin main
```

### Step 2 — Connect the repo to Netlify

1. Log in to the [Netlify dashboard](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Choose your Git provider (GitHub, GitLab, or Bitbucket).
4. Authorize Netlify if this is your first time, then select the **gridfeed** repository.

### Step 3 — Confirm build settings

Netlify reads `netlify.toml` automatically. You should see:

| Setting | Value |
|---|---|
| **Branch to deploy** | `main` |
| **Build command** | *(leave empty)* |
| **Publish directory** | `site` |
| **Functions directory** | `netlify/functions` |

If those values are pre‑filled, just click **Deploy site**. If not, enter them manually and deploy.

### Step 4 — Done

Netlify builds and deploys in under a minute. You'll get a URL like:

```
https://your-site-name.netlify.app
```

From now on, **every push to `main` automatically redeploys the site.** No further action needed.

### Step 5 — (Optional) Add a custom domain

In the Netlify dashboard, go to **Site settings** → **Domain management** → **Add a domain**. Follow the DNS instructions for your registrar.

---

## 🔌 API Reference

All endpoints are Netlify Functions under `/.netlify/functions/`.

### `POST /.netlify/functions/save-feed`

Save a new feed.

**Request body (JSON):**
```json
{
  "name": "My summer grid",
  "layout": { "cols": 3, "rows": 2 },
  "images": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."]
}
```

**Response:**
```json
{ "success": true, "feedId": "lz8k3a7f2q" }
```

---

### `GET /.netlify/functions/get-feed?id=<feedId>`

Retrieve a single feed's metadata.

**Response:**
```json
{
  "id": "lz8k3a7f2q",
  "name": "My summer grid",
  "layout": { "cols": 3, "rows": 2 },
  "images": [
    "/.netlify/blobs/lz8k3a7f2q/image-0.jpg",
    "/.netlify/blobs/lz8k3a7f2q/image-1.jpg"
  ],
  "createdAt": "2026-09-30T03:00:00.000Z"
}
```

---

### `GET /.netlify/functions/list-feeds`

List all saved feeds, sorted newest first.

**Response:** an array of feed metadata objects (same shape as `get-feed`).

---

### `DELETE /.netlify/functions/delete-feed?id=<feedId>`

Delete a feed and all of its images.

**Response:**
```json
{ "success": true }
```

---

## 🗂️ How It Works

1. **Upload** — The user drops images into the frontend.
   - *Single mode*: each file is validated against `1080 × 1350`.
   - *Long mode*: the image is validated against multiples of `1080` × `1350`, then sliced on a `<canvas>` into individual `1080 × 1350` tiles.
2. **Preview** — The feed view renders every tile at a `4:5` aspect ratio in a 3‑column grid.
3. **Save** — The frontend converts each tile to base64 and `POST`s everything to `save-feed`.
4. **Store** — The Netlify Function writes each image to `gridfeed-storage/<feedId>/image-N.jpg` and a `meta.json` alongside it.
5. **Share** — Sharing simply means sending `https://your-site.netlify.app/#feed=<feedId>`. The frontend reads the hash on load and calls `get-feed` to render the feed.
6. **Dashboard** — `list-feeds` enumerates all feeds, `delete-feed` removes one.

---

## ⚠️ Free Tier Notes

- **Netlify credit system** — the free plan gives **300 credits/month**. Roughly: ~15 GB bandwidth or ~20 production deploys. Fine for personal use; be mindful if a feed goes viral.
- **Blob size limit** — each individual blob (one image) must be **≤ 5 MB**. The frontend compresses shared images well below this.
- **No authentication** — anyone with the site URL can create, view, or delete feeds. If you make this public, add auth (Netlify Identity or Supabase Auth) before sharing the link widely.

---

## 🛠️ Customization

A few constants at the top of `site/index.html` are worth tweaking:

| Constant | Default | Meaning |
|---|---|---|
| `TILE_W` / `TILE_H` | `1080` / `1350` | The required post size. Change both to support a different aspect ratio. |
| `MAX_TILES` | `150` | Maximum number of posts a single long image can produce. |
| `SHARE_W` | `480` | Width the images are compressed to before saving. Lower = smaller uploads. |
| `SHARE_Q` | `0.72` | JPEG quality for compressed uploads. |
| `THUMB_TILE_W` | `80` | Width of each tile in the composite dashboard thumbnail. |

---

## 🗺️ Roadmap

- [ ] User accounts & private feeds
- [ ] Drag‑to‑reorder posts after upload
- [ ] Export the whole grid as a single PNG preview
- [ ] Custom grid widths (2‑column, 4‑column, …)
- [ ] Dark mode

---

## 📜 License

MIT — do whatever you want, no warranty.

---

## 🙏 Acknowledgements

Built with [Netlify Functions](https://docs.netlify.com/functions/overview/) and [Netlify Blobs](https://docs.netlify.com/blobs/overview/).