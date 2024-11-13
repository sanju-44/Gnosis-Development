require('dotenv').config();
const env = require('hardhat');
const { ethers } = require("hardhat");

const owner1 = process.env.PUBLIC_ACCOUNT_1;
const owner2 = process.env.PUBLIC_ACCOUNT_2; 
const owner3 = process.env.PUBLIC_ACCOUNT_3;
const owner4 = "0x488087413eb8E0f0C00a1f9FB5Cfe4Ed14fD7cce";

const OWNERS = [owner1, owner2, owner3, owner4];
const THRESHOLD = 2;

const GnosisSafeMasterCopyAddress = "0x36F86745986cB49C0e8cB38f14e948bb82d8d1A8"
const GnosisSafeProxyFactoryCopyAddress = "0x8b24df6da67319eE9638a798660547D67a29f4ce"

async function main() {
  // Step 1: load the GnosisSafe mastercopy address for sepolia network
  const GnosisSafe = await ethers.getContractAt("Safe", GnosisSafeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: load the GnosisSafeProxyFactory masterrcopy a address for sepolia network
  const GnosisSafeProxyFactory = await ethers.getContractAt("SafeProxyFactory", GnosisSafeProxyFactoryCopyAddress);
  console.log("Interacting with deployed GnosisSafeProxyFactory at:", GnosisSafeProxyFactory.address);

  const to = ethers.constants.AddressZero; // No delegate call in this case
  const data = "0x"; // Empty data payload
  const fallbackHandler = ethers.constants.AddressZero; // No fallback handler
  const paymentToken = ethers.constants.AddressZero; // ETH as the payment token
  const payment = 0; // No payment involved
  const paymentReceiver = ethers.constants.AddressZero;

  console.log("checkkk:::::", ethers.BigNumber.from(Math.floor(Math.random() * 1000000)))

  // Step 3: Encode the setup function call
  const setupData = GnosisSafe.interface.encodeFunctionData("setup", [
    OWNERS,
    THRESHOLD,
    to,
    data,
    fallbackHandler,
    paymentToken,
    payment,
    paymentReceiver
  ]);

  // Step 4: Deploy the Gnosis Safe Proxy
  const tx = await GnosisSafeProxyFactory.createProxyWithNonce(GnosisSafeMasterCopyAddress, setupData, ethers.BigNumber.from(Math.floor(Math.random() * 1000000)));
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

// ***** already deployed gnosis safe on sepolia *****
// sep:0x958246bA1A45D353525CDDB606CfB22fC20A0748
