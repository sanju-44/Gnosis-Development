// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Deploy Gnosis Safe Master Copy
  const GnosisSafe = await hre.ethers.getContractFactory("GnosisSafe");
  const safeContract = await GnosisSafe.deploy();
  await safeContract.deployed();
  console.log("GnosisSafe deployed to:", safeContract.address);

  // Deploy Gnosis Safe Proxy Factory
  const GnosisSafeProxyFactory = await hre.ethers.getContractFactory("GnosisSafeProxyFactory");
  const proxyFactoryContract = await GnosisSafeProxyFactory.deploy();
  await proxyFactoryContract.deployed();
  console.log("GnosisSafeProxyFactory deployed to:", proxyFactoryContract.address);

  // Deploy MultiSend Contract
  const MultiSend = await hre.ethers.getContractFactory("MultiSend");
  const multiSendContract = await MultiSend.deploy();
  await multiSendContract.deployed();
  console.log("MultiSend deployed to:", multiSendContract.address);

  // Save the deployed addresses for SDK initialization
  return {
    safeContract,
    proxyFactoryContract,
    multiSendContract
  };
}

main()
  .then((result) => {
    console.log("Contracts deployed successfully!");
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
