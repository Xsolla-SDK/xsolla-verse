let env;

async function loadTestEnv() {
  if (env) return env;
  const chai = await import("chai");
  const hreMod = await import("hardhat");
  const hre = hreMod.default ?? hreMod;
  const { ethers } = await hre.network.getOrCreate();
  env = { expect: chai.expect, ethers, hre };
  return env;
}

module.exports = { loadTestEnv };
