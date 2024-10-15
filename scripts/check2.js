require("dotenv").config();
const { ethers } = require("ethers");
const Safe = require("@gnosis.pm/safe-core-sdk").default;
const EthersAdapter = require("@gnosis.pm/safe-ethers-lib").default;
const SafeServiceClient = require("@gnosis.pm/safe-service-client").default;

console.log("process.env.PUBLIC_ACCOUNT_1_KEY::::", process.env.PUBLIC_ACCOUNT_1_KEY)

async function main() {
  // Initialize ethers provider (for Sepolia network)
  const provider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.API_KEY}`);

  // Load your private key from environment variables
  const ownerPrivateKey = process.env.PUBLIC_ACCOUNT_1_KEY;
  const owner = new ethers.Wallet(ownerPrivateKey, provider);

  // Initialize Ethers adapter
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: owner,
  });

  // Replace with the Gnosis Safe address on Sepolia
  const safeAddress = "0xEdB89B030518012aD583d6569Fe1E59A2628FA06";

  // Initialize the Safe SDK
  const safeSdk = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  // Transaction details (example)
  const transactionData = {
    to: "0xEdB89B030518012aD583d6569Fe1E59A2628FA06", // Target address (Gnosis Safe contract address)
    value: "0", // 0 ETH
    data: "0x046f066614ce6d0910b5efceb71877330efeae2f2f0c843181b3521f2f2f1a02", // Example data
    operation: 0, // CALL
  };

  // Propose the transaction (it will be signed by this owner but wait for others)
  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: transactionData,
  });

  // Sign the transaction as the current owner
  const signedSafeTx = await safeSdk.signTransaction(safeTransaction);

  // Initialize the Gnosis Safe transaction service for Sepolia (replace with the Sepolia URL)
  const safeService = new SafeServiceClient("https://safe-transaction.sepolia.gnosis.io");

  // Propose the transaction to the Gnosis Safe
  await safeService.proposeTransaction({
    safeAddress: safeAddress,
    safeTransaction: signedSafeTx,
    safeTxHash: await safeSdk.getTransactionHash(safeTransaction),
    senderAddress: owner.address,
    senderSignature: signedSafeTx.signatures.get(owner.address).data,
  });

  console.log("Transaction proposed successfully and waiting for other owners' approvals.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
