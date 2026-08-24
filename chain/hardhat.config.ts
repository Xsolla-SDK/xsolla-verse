import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const networks: Record<string, object> = {
  localhost: {
    type: "http",
    url: "http://127.0.0.1:8545",
  },
  amoy: {
    type: "http",
    url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
    accounts: process.env.DEPLOYER_PRIVATE_KEY
      ? [process.env.DEPLOYER_PRIVATE_KEY]
      : [],
    chainId: 80002,
  },
};

if (process.env.POLYGON_RPC_URL) {
  networks.polygon = {
    type: "http",
    url: process.env.POLYGON_RPC_URL,
    accounts: process.env.DEPLOYER_PRIVATE_KEY
      ? [process.env.DEPLOYER_PRIVATE_KEY]
      : [],
    chainId: 137,
  };
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks,
});
