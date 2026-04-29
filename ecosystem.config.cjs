module.exports = {
  apps: [
    {
      name: "portal-api",
      script: "server/index.js",
      cwd: "/home/weebus/sci700-innovation-portal-wireframe",
      interpreter: "node",
      env_file: ".env",
    },
    {
      name: "portal-ui",
      script: "npx",
      args: "vite --host --port 5174",
      cwd: "/home/weebus/sci700-innovation-portal-wireframe",
      interpreter: "none",
    },
  ],
};
