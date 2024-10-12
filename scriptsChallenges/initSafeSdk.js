// scripts/initSafeSdk.js
const { ethers } = require("hardhat");
const { SafeFactory } = require("@gnosis.pm/safe-core-sdk");

const safeAbi = require("../artifacts/contracts/GnosisSafe.sol/GnosisSafe.json").abi;
const proxyFactoryAbi = require("../artifacts/contracts/GnosisSafeProxyFactory.sol/GnosisSafeProxyFactory.json").abi;
const multiSendAbi = require("../artifacts/contracts/MultiSend.sol/MultiSend.json").abi;

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy the contracts
  const deploymentResult = await hre.run("deploy");

  const { safeContract, proxyFactoryContract, multiSendContract } = deploymentResult;

  // Initialize the Safe SDK with deployed contract information
  const ethAdapter = new ethers.providers.JsonRpcProvider();
  const chainId = (await ethAdapter.getNetwork()).chainId;

  const safeFactory = await SafeFactory.create({
    ethAdapter: deployer,
    contractNetworks: {
      [chainId]: {
        multiSendAddress: multiSendContract.address,
        multiSendAbi: multiSendAbi,

        safeMasterCopyAddress: safeContract.address,
        safeMasterCopyAbi: safeAbi,

        safeProxyFactoryAbi: proxyFactoryAbi,
        safeProxyFactoryAddress: proxyFactoryContract.address,
      },
    },
  });

  console.log("SafeFactory initialized successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
