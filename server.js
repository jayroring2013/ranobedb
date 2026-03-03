const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");

const app = express();
app.use(cors({ origin: "*" }));

app.use("/api", async (req, res) => {
  const target = `https://ranobedb.org/api/v0${req.path}${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`;
  console.log("Proxying:", target);
  try {
    const response = await fetch(target, {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0" }
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/image", async (req, res) => {
  const target = `https://ranobedb.org/image${req.path}`;
  console.log("Proxying image:", target);
  try {
    const response = await fetch(target);
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Image error");
  }
});

app.get("/", (req, res) => res.json({ status: "ok", message: "RanobeDB proxy running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
