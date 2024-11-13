require('dotenv').config();
const { ethers } = require("hardhat");

// use these artifacts of these packages
// @gnosis.pm/safe-contracts/contracts/GnosisSafe.sol
// @gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol

// default hardhat signers
const owner1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const owner2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; 
const owner3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const owner4 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

const OWNERS = [owner1, owner2, owner3, owner4];
const THRESHOLD = 2;

// GnosisSafe MasterCopy addresses for localhost
const GnosisSafeMasterCopyAddress = "0x36F86745986cB49C0e8cB38f14e948bb82d8d1A8";
// XXXXXXXXX check before working XXXXXXXXXX
const GnosisSafeProxyAddress = "0x8b24df6da67319eE9638a798660547D67a29f4ce";
const fallbackHandlerAddress = "0xbbf7501834895288d450a5486c66031e13410F68";


async function main() {
  // Step 1: load the GnosisSafe mastercopy address for localhost network
  const GnosisSafe = await ethers.getContractAt("Safe", GnosisSafeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: deploy GnosisSafeProxy
  const GnosisSafeProxy = await ethers.getContractAt("SafeProxyFactory", GnosisSafeProxyAddress);
  console.log("GnosisSafeProxy deployed at:", GnosisSafeProxy.address);

  // step 2: load the GnosisSafeProxy contract
  // const GnosisSafeProxy = await ethers.getContractAt("GnosisSafeProxy", GnosisSafeProxyAddress);
  // console.log("GnosisSafeProxy Address:", GnosisSafeProxy.address);

  const to = ethers.constants.AddressZero; // No delegate call in this case
  const data = "0x"; // Empty data payload
  // const fallbackHandler = ethers.constants.AddressZero; // No fallback handler
  const paymentToken = ethers.constants.AddressZero; // ETH as the payment token
  const payment = 0; // No payment involved
  const paymentReceiver = ethers.constants.AddressZero;

  const GnosisSafeProxyWithInterface = await ethers.getContractAt("IGnosisSafe", GnosisSafeProxy.address);
  const GnosisSafeProxyWithInterfaceCall = GnosisSafeProxyWithInterface.attach(GnosisSafeProxy.address);
  const setUpCall = await GnosisSafeProxyWithInterfaceCall.setup(
    OWNERS,
    THRESHOLD,
    to,
    data,
    fallbackHandlerAddress,
    paymentToken,
    payment,
    paymentReceiver
  );

  // const execTransactionCall = await setUpCall.data

  console.log("GnosisSafeProxy setup:", setUpCall);
  console.log("GnosisSafeProxy deployed at:", GnosisSafeProxy.address);

  // // Step 4: Deploy the Gnosis Safe Proxy
  // const tx = await GnosisSafeProxy.createProxy(GnosisSafeMasterCopyAddress, setupData);
  // const receipt = await tx.wait();

  // // Step 5: Check events emitted by the transaction receipt
  // const event = receipt.events.find(event => event.event === "ProxyCreation");
  // const proxyAddress = event ? event.args.proxy : null;

  // if (proxyAddress) {
  //     console.log("Gnosis Safe deployed at:", proxyAddress);
  // } else {
  //     console.error("ProxyCreation event not found, unable to retrieve proxy address.");
  // }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// ***** already deployed gnosis safe on sepolia *****
// sep:0x958246bA1A45D353525CDDB606CfB22fC20A0748
