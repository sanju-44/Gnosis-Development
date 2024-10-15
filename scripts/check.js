require("dotenv").config();
const { ethers } = require("hardhat");
const Safe = require("@gnosis.pm/safe-core-sdk").default;
// const { EthersAdapter } = require("@gnosis.pm/safe-ethers-adapters");
const EthersAdapter = require("@gnosis.pm/safe-ethers-adapters");


async function main() {
  const provider = ethers.provider;

  // Create a signer (one of the Safe owners)
  const wallet1 = new ethers.Wallet(process.env.PUBLIC_ACCOUNT_1_KEY, provider);

  // The Safe address
  const safeAddress = "0xEdB89B030518012aD583d6569Fe1E59A2628FA06"; // Replace with your Safe address

  // Transaction parameters
  const to = "0xEdB89B030518012aD583d6569Fe1E59A2628FA06"; // Recipient (Safe itself for this example)
  const value = 0; // No Ether is being sent
  const data = "0x694e80c30000000000000000000000000000000000000000000000000000000000000001"; // Example data payload
  const operation = 0; // Operation type (0 = CALL)
  const safeTxGas = 0; // Safe transaction gas
  const baseGas = 0; // Base gas
  const gasPrice = 0; // Gas price
  const gasToken = ethers.constants.AddressZero; // Use ETH (address 0x0)
  const refundReceiver = ethers.constants.AddressZero; // No refund receiver

  // Create the Ethers Adapter for Safe SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: wallet1
  })

  // Load the Safe SDK for the specific Safe
  const safe = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  // Create the transaction object (but don't execute yet)
  const safeTransactionData = {
    to,
    value,
    data,
    operation,
    safeTxGas,
    baseGas,
    gasPrice,
    gasToken,
    refundReceiver,
  };
  console.log("safeTransactionData:::::", safeTransactionData)

  // Generate the transaction hash (for this owner's approval)
  const transactionHash = await safe.getTransactionHash(safeTransactionData);
  console.log("transactionHash:::::", transactionHash)

  // // Sign the transaction hash (just for this owner)
  // const signature = await wallet1.signMessage(ethers.utils.arrayify(transactionHash));

  // // Submit the transaction for other owners to sign and execute later
  // const txResponse = await safe.proposeTransaction({
  //   safeTransactionData,
  //   signature,
  // });

  // console.log("Transaction submitted. Waiting for other approvals.");
  // console.log("Transaction hash:", transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
