require('dotenv').config();
const { ethers } = require("hardhat");

const owner1 = process.env.PUBLIC_ACCOUNT_1; // 0x72bA251b1FBC2d9268B93Aa74CD1cfcFC2C62BB8
const owner2 = process.env.PUBLIC_ACCOUNT_2; // 0x6eDCf3aE8aC36B18a4590D764eE88b429D48243d

const GnosisSafeMasterCopyAddress = process.env.SAFE_MASTER_COPY_ADDRESS

async function main() {
  // Step 1: load the GnosisSafe mastercopy address from sepolia network
  const GnosisSafe = await ethers.getContractAt("GnosisSafe", GnosisSafeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: Get the GnosisSafeProxyFactory contract instance and deploy it
  const GnosisSafeProxy = await ethers.getContractFactory("GnosisSafeProxyFactory");
  const GnosisSafeProxyFactory = await GnosisSafeProxy.deploy()
  console.log("Interacting with deployed GnosisSafeProxyFactory at:", GnosisSafeProxyFactory.address);

  const owners = [owner1, owner2];
  const threshold = 2; // Require 2 out of 2 owners to approve transactions
  const to = ethers.constants.AddressZero; // No delegate call in this case
  const data = "0x"; // Empty data payload
  const fallbackHandler = ethers.constants.AddressZero; // No fallback handler
  const paymentToken = ethers.constants.AddressZero; // ETH as the payment token
  const payment = 0; // No payment involved
  const paymentReceiver = ethers.constants.AddressZero;

  // Step 3: Encode the setup function call
  const setupData = GnosisSafe.interface.encodeFunctionData("setup", [
    owners,
    threshold,
    to,
    data,
    fallbackHandler,
    paymentToken,
    payment,
    paymentReceiver
  ]);

  // Step 4: Deploy the Gnosis Safe Proxy
  const tx = await GnosisSafeProxyFactory.createProxy(GnosisSafeMasterCopyAddress, setupData);
  const receipt = await tx.wait();

  // Step 5: Check events emitted by the transaction receipt
  const event = receipt.events.find(event => event.event === "ProxyCreation");
  const proxyAddress = event ? event.args.proxy : null;

  if (proxyAddress) {
      console.log("Gnosis Safe deployed at:", proxyAddress);
  } else {
      console.error("ProxyCreation event not found, unable to retrieve proxy address.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// already deployed gnosis safe on sepolia
// ***** 1 ***** work_with_these *****
// GnosisSafe MasterCopy Address: 0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552
// Interacting with deployed GnosisSafeProxyFactory at: 0x35ceCF4A0d34123b4EbaC30bC829842aAF86f38d
// Gnosis Safe deployed at: 0xEdB89B030518012aD583d6569Fe1E59A2628FA06