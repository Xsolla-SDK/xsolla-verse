import hre from "hardhat";

let env;

export async function loadTestEnv() {
  if (env) return env;
  const chai = await import("chai");
  const { ethers } = await hre.network.getOrCreate();
  env = { expect: chai.expect, ethers, hre };
  return env;
}
