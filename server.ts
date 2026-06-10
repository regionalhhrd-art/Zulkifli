import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DATA_FILE_PATH = path.join(process.cwd(), "pretest-data.json");

// Middleware to parse JSON bodies with high limit for photos
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve API routes first
app.get("/api/data", (req, res) => {
  try {
    // Prevent caching on the browser side completely for the database API
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");

    if (fs.existsSync(DATA_FILE_PATH)) {
      const rawData = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsed = JSON.parse(rawData);
      return res.json({ status: "success", data: parsed });
    } else {
      // File does not exist yet (first-time deployment)
      return res.json({ status: "empty", message: "No central database file found yet." });
    }
  } catch (error: any) {
    console.error("API error reading data:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/save", (req, res) => {
  try {
    const { csvData, jabatanList, questions, submissions } = req.body;
    
    // Create payload
    const payload = {
      jabatanList: jabatanList || [],
      questions: questions || [],
      submissions: submissions || []
    };

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(payload, null, 2), "utf8");
    return res.json({ status: "success", message: "Central database updated successfully." });
  } catch (error: any) {
    console.error("API error writing data:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Separate endpoint to append a user single exam submission
app.post("/api/submit", (req, res) => {
  try {
    const { submission } = req.body;
    if (!submission) {
      return res.status(400).json({ status: "error", message: "Submission data required." });
    }

    let payload: any = { jabatanList: [], questions: [], submissions: [] };
    if (fs.existsSync(DATA_FILE_PATH)) {
      const rawData = fs.readFileSync(DATA_FILE_PATH, "utf8");
      payload = JSON.parse(rawData);
    }

    if (!payload.submissions) {
      payload.submissions = [];
    }

    // Guard against duplicate submissions if needed, and insert/append
    payload.submissions.unshift(submission);

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(payload, null, 2), "utf8");
    return res.json({ status: "success", message: "Exam result saved to server successfully." });
  } catch (error: any) {
    console.error("API error during submission save:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
