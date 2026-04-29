module.exports = {
  apps: [
    {
      name: "portal-api",
      script: "npm",
      args: "start",
      cwd: "/home/weebus/sci700-innovation-portal-wireframe",
      interpreter: "none",
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
