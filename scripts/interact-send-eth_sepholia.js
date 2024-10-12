const { ethers } = require('hardhat');
const { SafeFactory } = require('@gnosis.pm/safe-core-sdk');
const { SafeServiceClient } = require('@gnosis.pm/safe-service-client');

async function main() {
  // Set up network provider (use the provider of the network you want to interact with)
  const provider = ethers.provider;

  // Owners who are involved in the Gnosis Safe (Example: signer accounts)
  const [owner] = await ethers.getSigners();

  // Gnosis Safe contract address
  const safeAddress = '0xYourGnosisSafeAddress';

  // Set up Gnosis Safe service client (replace with appropriate network URL)
  const txServiceUrl = 'https://safe-transaction.rinkeby.gnosis.io/';
  const safeService = new SafeServiceClient(txServiceUrl);

  // Set up Safe SDK instance
  const safeFactory = await SafeFactory.create({ ethAdapter: new ethers.providers.JsonRpcProvider(provider) });
  const safe = await safeFactory.connectSafe(safeAddress, owner);

  // Define the transaction details (recipient, value, data)
  const safeTransactionData = {
    to: '0xRecipientAddress', // Recipient of the transaction
    value: ethers.utils.parseEther('1.0'), // Transaction value (1 ETH in this example)
    data: '0x', // Any additional call data (optional)
    operation: 0 // Operation type: 0 for a call, 1 for a delegate call
  };

  // Create a Safe transaction
  const safeTransaction = await safe.createTransaction(safeTransactionData);

  // Get the transaction hash to sign
  const txHash = await safe.getTransactionHash(safeTransaction);

  // Sign the transaction hash by the owner (multi-sig requires multiple signatures)
  const signature = await safe.signTransactionHash(txHash);

  // Submit the transaction to the Gnosis Safe service (will show up in the UI for approval)
  await safeService.proposeTransaction({
    safeAddress: safeAddress,
    safeTransactionData: safeTransaction,
    signature: signature.data
  });

  console.log('Transaction has been proposed and is waiting for approvals in the Gnosis Safe UI.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
