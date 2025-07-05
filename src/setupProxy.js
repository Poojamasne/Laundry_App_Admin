const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://46.202.166.150:8081",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/admin", // Rewrites /api to /admin
      },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJVU0VSX0lEIjoyMCwic3ViIjoiOTk5OTk5OTk5OSIsImlhdCI6MTc1MDk4OTgyNywiZXhwIjoxNzUxNTk0NjI3fQ.Yedqum0c0bQDU2Kij14_O9GDNzgb4D9Sgq6A8qSG0SA"
        );
      },
      secure: false,
      logLevel: "debug",
    })
  );
};
