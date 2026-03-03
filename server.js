const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app = express();
app.use(cors({ origin: "*" }));

app.use("/api", async (req, res) => {
  // Rebuild the full target URL cleanly
  const path        = req.path;                          // e.g. /v0/series
  const queryString = req.originalUrl.split("?")[1] || ""; // everything after ?
  const target      = `https://ranobedb.org/api${path}${queryString ? "?" + queryString : ""}`;

  console.log("→ Proxying:", target);

  try {
    const response = await fetch(target, {
      headers: {
        "Accept":     "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    });

    console.log("← Status:", response.status);
    const text = await response.text();
    console.log("← Body preview:", text.slice(0, 200));

    res.setHeader("Content-Type", "application/json");
    res.status(response.status).send(text);

  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use("/image", async (req, res) => {
  const target = `https://ranobedb.org/image${req.path}`;
  console.log("→ Image:", target);
  try {
    const response = await fetch(target);
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Image error");
  }
});

app.get("/", (req, res) => res.json({ 
  status: "ok", 
  test: "/api/v0/series?limit=1&rl=ja&sort=Start+date+desc" 
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy on port ${PORT}`));
