#!/usr/bin/env node
/**
 * One-command local stack for interviews / demos:
 * compile → Hardhat node → deploy → backend → frontend
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const net = require("net");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHAIN_DIR = path.join(ROOT, "chain");
const HARDHAT_CLI = path.join(ROOT, "node_modules", "hardhat", "dist", "src", "cli.js");
const NODE = process.execPath;
const NODE_DIR = path.dirname(NODE);
const children = [];
let shuttingDown = false;

function childEnv(extraEnv = {}) {
  return {
    ...process.env,
    ...extraEnv,
    FORCE_COLOR: "1",
    PATH: `${path.join(ROOT, "node_modules", ".bin")}${path.delimiter}${NODE_DIR}${path.delimiter}${process.env.PATH || ""}`,
  };
}

function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(NODE_DIR, "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(NODE_DIR, "npm"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.realpathSync(candidate);
    }
  }
  throw new Error(
    `npm was not found next to Node (${NODE}). Run "nvm use 22" in this terminal, then npm start.`
  );
}

function npmSync(args, cwd = ROOT) {
  runSync(NODE, [resolveNpmCli(), ...args], cwd);
}

function npmRun(args, extraEnv = {}, cwd = ROOT) {
  return run(NODE, [resolveNpmCli(), ...args], extraEnv, cwd);
}

function hardhatArgs(args) {
  return [HARDHAT_CLI, ...args];
}

function hardhatSync(args, cwd = CHAIN_DIR) {
  runSync(NODE, hardhatArgs(args), cwd);
}

function hardhatRun(args, extraEnv = {}, cwd = CHAIN_DIR) {
  return run(NODE, hardhatArgs(args), extraEnv, cwd);
}

const HARDHAT_ACCOUNT =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const HARDHAT_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function log(msg) {
  console.log(`\n[XsollaVerse] ${msg}`);
}

function run(command, args, extraEnv = {}, cwd = ROOT) {
  const child = spawn(command, args, {
    cwd,
    env: childEnv(extraEnv),
    stdio: "inherit",
    windowsHide: true,
  });
  children.push(child);
  child.on("error", (err) => {
    console.error(`[XsollaVerse] Failed to start ${command}: ${err.message}`);
  });
  child.on("exit", (code) => {
    if (shuttingDown || code === 0 || code === null) return;
    console.error(
      `[XsollaVerse] ${path.basename(command)} ${args.join(" ")} exited with code ${code}`
    );
  });
  return child;
}

function runSync(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    env: childEnv(),
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} ${args.join(" ")} failed (exit ${result.status})`);
  }
}

function portInUse(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });
}

function waitForPort(port, { timeoutMs = 120000, child } = {}) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const onExit = (code) => {
      reject(
        new Error(
          `Hardhat node exited before opening port ${port} (code ${code ?? "unknown"}). Check the logs above.`
        )
      );
    };
    if (child) {
      child.once("exit", onExit);
      child.once("error", (err) => {
        reject(new Error(`Hardhat node failed to start: ${err.message}`));
      });
    }

    const ping = () => {
      const socket = net.connect({ host: "127.0.0.1", port }, () => {
        socket.end();
        if (child) child.off("exit", onExit);
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          if (child) child.off("exit", onExit);
          reject(
            new Error(
              `Hardhat node did not become ready on port ${port}. Is another process blocking it?`
            )
          );
          return;
        }
        setTimeout(ping, 400);
      });
    };
    ping();
  });
}

function ensureEnv() {
  const dest = path.join(ROOT, "server", "config", "local.env");
  const example = path.join(ROOT, "server", "config", "local.env.example");
  if (!fs.existsSync(dest) && fs.existsSync(example)) {
    fs.copyFileSync(example, dest);
    log("Created server/config/local.env from example");
  }
}

function ensureInstall() {
  const clientDir = path.join(ROOT, "client");
  const viteBin = path.join(clientDir, "node_modules", ".bin", "vite");

  if (!fs.existsSync(HARDHAT_CLI)) {
    log("Installing root dependencies…");
    npmSync(["install"]);
  }
  if (!fs.existsSync(HARDHAT_CLI)) {
    throw new Error(
      `Hardhat is still missing at ${HARDHAT_CLI}. Run "npm install" in ${ROOT} and check it finished without errors (devDependencies must not be skipped).`
    );
  }
  if (!fs.existsSync(viteBin)) {
    log("Installing frontend dependencies…");
    npmSync(["install"], clientDir);
  }
}

function ensureChainContracts() {
  const srcDir = path.join(ROOT, "contracts");
  const destDir = path.join(CHAIN_DIR, "contracts");
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Solidity sources missing at ${srcDir}`);
  }

  try {
    const stat = fs.lstatSync(destDir);
    // Linux checkout: symlink. Windows git: often a text file named "contracts".
    if (stat.isSymbolicLink() || stat.isFile()) {
      fs.unlinkSync(destDir);
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith(".sol")) continue;
    fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name));
  }
}

function printBanner() {
  console.log(`
============================================================
  XsollaVerse is running

  App:     http://localhost:3000
  Story:   http://localhost:3000/story
  API:     http://127.0.0.1:5001
  Chain:   http://127.0.0.1:8545  (chainId 31337)

  Optional MetaMask (shop / wallet):
  Network   Hardhat Local
  RPC URL   http://127.0.0.1:8545
  Chain ID  31337
  Account   ${HARDHAT_ACCOUNT}
  Key       ${HARDHAT_KEY}

  Press Ctrl+C to stop the chain, backend, and frontend.
============================================================
`);
}

function killChild(child) {
  if (!child.pid) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/f", "/t"]);
    } else {
      try {
        process.kill(child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  } catch {
    // already gone
  }
}

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log("Stopping all processes…");
  for (const child of children) {
    killChild(child);
  }
  setTimeout(() => process.exit(0), 1200);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function main() {
  log("Starting local stack (chain + contracts + backend + frontend)");
  ensureEnv();
  ensureInstall();
  ensureChainContracts();

  log("Compiling contracts…");
  hardhatSync(["compile"]);

  let chainChild = null;
  if (await portInUse(8545)) {
    log("Port 8545 is already in use — reusing that chain");
  } else {
    log("Starting Hardhat node on 127.0.0.1:8545…");
    chainChild = hardhatRun(["node", "--hostname", "127.0.0.1", "--port", "8545"]);
    await waitForPort(8545, { child: chainChild });
    log("Hardhat node is ready");
  }

  log("Deploying contracts…");
  hardhatSync(["run", "scripts/deploy.js", "--network", "localhost"]);

  log("Starting backend…");
  const backendChild = run(NODE, [path.join(ROOT, "server.js")], { PORT: "5001" });
  await waitForPort(5001, { child: backendChild });
  log("Backend is ready on http://127.0.0.1:5001");

  log("Starting frontend…");
  npmRun(
    ["start"],
    { BROWSER: process.env.BROWSER || "none" },
    path.join(ROOT, "client")
  );

  printBanner();
}

main().catch((err) => {
  console.error(`[XsollaVerse] ${err.message}`);
  shutdown();
  setTimeout(() => process.exit(1), 300);
});
