require('dotenv').config();
const { ethers } = require("hardhat");

// default hardhat signers
const owner1 = process.env.PUBLIC_ACCOUNT_1;
const owner2 = process.env.PUBLIC_ACCOUNT_2; 
const owner3 = process.env.PUBLIC_ACCOUNT_3;
const owner4 = "0x488087413eb8E0f0C00a1f9FB5Cfe4Ed14fD7cce";

const OWNERS = [owner1, owner2, owner3, owner4];
const THRESHOLD = 2;

// GnosisSafe(1.4.1) MasterCopy addresses for sepolia
const GnosisSafeMasterCopyAddress = "0x41675C099F32341bf84BFc5382aF534df5C7461a";
// XXXXXXXXX check before working XXXXXXXXXX
// const GnosisSafeProxyAddress = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";


async function main() {
  // Step 1: load the GnosisSafe mastercopy address for localhost network
  const GnosisSafe = await ethers.getContractAt("Safe", GnosisSafeMasterCopyAddress);
  console.log("GnosisSafe MasterCopy Address:", GnosisSafe.address);

  // Step 2: deploy GnosisSafeProxy
  const SafeProxy = await ethers.getContractFactory("SafeProxy");
  const GnosisSafeProxy = await SafeProxy.deploy(GnosisSafeMasterCopyAddress);
  await GnosisSafeProxy.deployed();
  console.log("GnosisSafeProxy deployed at:", GnosisSafeProxy.address);

  // step 2: load the GnosisSafeProxy contract
  // const GnosisSafeProxy = await ethers.getContractAt("GnosisSafeProxy", GnosisSafeProxyAddress);
  // console.log("GnosisSafeProxy Address:", GnosisSafeProxy.address);

  const to = ethers.constants.AddressZero; // No delegate call in this case
  const data = "0x"; // Empty data payload
  const fallbackHandler = ethers.constants.AddressZero; // No fallback handler
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
    fallbackHandler,
    paymentToken,
    payment,
    paymentReceiver
  );

  // const execTransactionCall = await setUpCall.data

  console.log("GnosisSafeProxy setup:", setUpCall);
  console.log("GnosisSafeProxy deployed at:", GnosisSafeProxy.address)

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
