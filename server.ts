import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import handler from "./api/checkout_dotmax.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares to parse bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API paths
  app.all("/api/checkout_dotmax", async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  });

  // Vite middleware for state-dependent asset serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
