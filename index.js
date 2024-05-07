const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer ");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post("/api/download-instagram-reel", async (req, res) => {
  try {
    const { reelUrl } = req.body;
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.goto(reelUrl, { waitUntil: "networkidle2" });

    const videoUrl = await page.evaluate(() => {
      const videoElement = document.querySelector("video[src]");
      return videoElement ? videoElement.src : null;
    });

    const videoTitle = await page.evaluate(() => {
      const titleElement = document.querySelector(
        "h2._aacl._aaco._aacu._aacx._aad7._aade"
      );
      return titleElement ? titleElement.innerText : null;
    });

    await browser.close();

    if (videoUrl) {
      res.json({ videoUrl, videoTitle });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    console.error("Error fetching Instagram reel data:", error);
    res.status(500).json({
      error: "Error fetching Instagram reel data",
      details: error.message,
    });
  }
});

// Add more routes for other platforms here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
