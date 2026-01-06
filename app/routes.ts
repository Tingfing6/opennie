import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("accounts", "routes/accounts.tsx"),
  route("budget-detail", "routes/budget-detail.tsx"),
  route("categories", "routes/categories.tsx"),
  route("financial-assets", "routes/financial-assets.tsx"),
  route("reports", "routes/reports.tsx"),
  route("ai-assistant", "routes/ai-assistant.tsx"),
  route("settings", "routes/settings.tsx"),
  // 通配符路由 - 必须放在最后
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
