module.exports = {
  apps: [
    {
      name: "portal",
      script: "npm",
      args: "start",
      cwd: ".",
      interpreter: "none",
      env_file: ".env",
    },
  ],
};
