import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

function slugFromUrl(url) {
  return url.split("/").filter(Boolean).pop();
}

app.post("/fetch-blog", async (req, res) => {
  const slug = slugFromUrl(req.body.url);

  const r = await fetch(
    `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
        "accept-version": "2.0.0"
      }
    }
  );

  const data = await r.json();
  const item = data.items.find(i => i.slug === slug);

  if (!item) return res.status(404).json({ error: "Not found" });

  res.json({
    itemId: item.id,
    title: item.fieldData.name,
    content: item.fieldData["post-body"]
  });
});

app.post("/publish", async (req, res) => {
  const { itemId, title, content } = req.body;

  const r = await fetch(
    `https://api.webflow.com/v2/collections/${process.env.WEBFLOW_COLLECTION_ID}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.WEBFLOW_API_KEY}`,
        "Content-Type": "application/json",
        "accept-version": "2.0.0"
      },
      body: JSON.stringify({
        fieldData: {
          name: title,
          "post-body": content
        },
        isDraft: false
      })
    }
  );

  const data = await r.json();
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
