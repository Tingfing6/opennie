import { createRequestHandler } from "@react-router/node";

export default async function handler(req, res) {
  // 动态导入构建文件
  let build;
  try {
    build = await import("../build/server/index.js");
  } catch (error) {
    console.error("Failed to import build:", error);
    return res.status(500).json({ error: "Failed to load application" });
  }

  const requestHandler = createRequestHandler({
    build,
    mode: process.env.NODE_ENV || "production",
  });

  return requestHandler(req, res);
}
