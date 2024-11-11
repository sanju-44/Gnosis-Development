// cant able to use 

import "dotenv/config";
import { createSafeClient } from '@safe-global/sdk-starter-kit'

const SIGNER_ADDRESS = process.env.PUBLIC_ACCOUNT_1;
const SIGNER_PRIVATE_KEY = process.PUBLIC_ACCOUNT_1_KEY;
const RPC_URL = process.env.YOUR_RPC_PROVIDER;

// update with actual safe wallet address
const deployedSafeAddress = "0x342CF22cb2A61Dcc0f21125D36824cEC8066BeE0";

// if wallet is already created
const safeClient = await createSafeClient(
    {
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
        safeAddress: deployedSafeAddress
    }
)

console.log("wallet owners:::::", await safeClient.getOwners());
console.log("wallet threshold:::::", await safeClient.getThreshold())

// change threshold 
// const transaction = await safeClient.createRemoveOwnerTransaction(
//     {
//         ownerAddress: '0x67763E259Ef0AD351AB01a638f5785606fE1aC8d',
//         threshold: 1
//     }
// )
// const transaction = await safeClient.createAddOwnerTransaction(
//     {
//         ownerAddress: '0x67763E259Ef0AD351AB01a638f5785606fE1aC8d',
//         threshold: 2
//     }
// )
// console.log("txResult:::::", transaction)

console.log("pendingTransactions1:::::", await safeClient.getPendingTransactions());

// const txResultt = await safeClient.send({
//         transactions: [transaction]
//     }
// )
// console.log("txResult:::::", txResultt)

// XXXXXX--- to get all pending transaction ---XXXXXX
console.log("pendingTransactions1:::::", await safeClient.getPendingTransactions());

// // to use change the signer private key and give the exact safeTxHash
// const txResult = await safeClient.confirm({
//         safeTxHash: '0x44f40c15956cb3c413f204cfa1840d1c6a97793e9ebe6e6ad1a3e8181977efb7'
//     }
// )

// console.log("txResult:::::", txResult)

// console.log("wallet address:::::", await safeClient.getAddress());
// console.log("nonce:::::", await safeClient.getNonce());
// console.log("threshold:::::", await safeClient.getThreshold());
// console.log("owners:::::", await safeClient.getOwners());
// console.log("isDeployed:::::", await safeClient.isDeployed());