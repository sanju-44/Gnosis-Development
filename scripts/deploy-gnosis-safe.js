require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  const safeMasterCopyAddress = process.env.SAFE_MASTER_COPY_ADDRESS;
  const safeProxyFactoryAddress = process.env.SAFE_PROXY_FACTORY_ADDRESS;
  const owner1 = process.env.ACCOUNT_1;
  const owner2 = process.env.ACCOUNT_2;

  // Step 1: Get the GnosisSafe contract instance
  const GnosisSafe = await ethers.getContractAt("GnosisSafe", safeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: Get the GnosisSafeProxyFactory contract instance
  const GnosisSafeProxyFactory = await ethers.getContractAt("GnosisSafeProxyFactory", safeProxyFactoryAddress);
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
  const tx = await GnosisSafeProxyFactory.createProxy(safeMasterCopyAddress, setupData);
  const receipt = await tx.wait();

  // Step 5: Check events emitted by the transaction receipt
  const event = receipt.events.find(event => event.event === "ProxyCreation");
  const proxyAddress = event ? event.args.proxy : null;

  if (proxyAddress) {
      console.log("Gnosis Safe Proxy deployed at:", proxyAddress);
  } else {
      console.error("ProxyCreation event not found, unable to retrieve proxy address.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
