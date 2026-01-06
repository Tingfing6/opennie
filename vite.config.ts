import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      // AI API 代理配置
      "/api/v1/ai": {
        target: "http://47.98.234.55:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
