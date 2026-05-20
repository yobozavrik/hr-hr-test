import { spawn } from "bun";

console.log("🚀 Starting HR Recruiter Local Dev Services concurrently...");

const backend = spawn(["bun", "run", "dev:backend"], {
  stdout: "inherit",
  stderr: "inherit",
});

const web = spawn(["bun", "run", "dev:web"], {
  stdout: "inherit",
  stderr: "inherit",
});

// Handle graceful termination
const cleanup = () => {
  console.log("\n🛑 Stopping all dev services...");
  backend.kill();
  web.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Keep the process alive
setInterval(() => {}, 1000);
