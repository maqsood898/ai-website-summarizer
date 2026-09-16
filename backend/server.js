const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const OpenAI = require("openai");
require("dotenv").config();
const { HttpsProxyAgent } = require("https-proxy-agent");

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.post("/api/fetch-content", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required"
      });
    }

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(response.data);

    $("script, style, noscript, nav, footer, header").remove();

    const text = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "No readable content found"
      });
    }

    res.json({
      success: true,
      text: text.slice(0, 12000)
    });

  } catch (error) {
  console.error("Fetch Error:", error.message);

  let message = "Unable to fetch webpage.";

  if (error.code === "ENOTFOUND") {
    message = "The website address could not be found. Please check the URL.";
  } else if (error.code === "ECONNABORTED") {
    message = "The website took too long to respond.";
  } else if (error.response) {
    message = `The website returned an error (${error.response.status}).`;
  }

  res.status(500).json({
    success: false,
    message
  });
}
});


app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful website summarizer. Summarize the provided webpage content clearly and concisely. Focus only on the important information."
        },
        {
          role: "user",
          content:
            `Summarize this webpage in 5-7 concise bullet points:\n\n${text}`
        }
      ],
      max_tokens: 400
    });

    const summary = completion.choices[0].message.content;

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI service is currently unavailable. Please check the API configuration and try again."
    });
  }
});


app.get("/", (req, res) => {
  res.json({
    message: "AI Website Summarizer API is running"
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});